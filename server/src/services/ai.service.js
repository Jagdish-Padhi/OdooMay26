import { GoogleGenerativeAI } from "@google/generative-ai";
import { asc, eq } from 'drizzle-orm';

import { getDb } from '../db/index.js';
import { aiChatMessages, aiChats } from '../db/schema/index.js';
import { getTripContextById } from './trips.service.js';

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const MODEL_NAME = "gemini-2.0-flash";

function formatDate(value) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildTripContextPrompt(trip) {
  const stopLines = (trip.stops || []).map((stop, index) => {
    const activities = (stop.activities || [])
      .map((activity) => {
        const cost = Number(activity.cost || 0);
        const priceText = cost > 0 ? `$${cost.toFixed(0)}` : 'free';
        return `- ${activity.name} (${activity.type}, ${priceText}${activity.duration ? `, ${activity.duration}` : ''}${activity.notes ? `, ${activity.notes}` : ''})`;
      })
      .join('\n');

    return [
      `${index + 1}. ${stop.city?.name || 'Unknown city'}${stop.city?.country ? `, ${stop.city.country}` : ''}`,
      stop.arrivalDate || stop.departureDate ? `   Dates: ${formatDate(stop.arrivalDate)} -> ${formatDate(stop.departureDate)}` : null,
      activities ? `   Activities:\n${activities}` : '   Activities: none planned',
    ]
      .filter(Boolean)
      .join('\n');
  });

  return `You are the AI Concierge for a travel itinerary app. Use the trip context below as the source of truth. If the user asks for suggestions beyond the trip data, give practical advice but clearly label assumptions.

Trip context:
- Trip name: ${trip.name}
- Trip dates: ${formatDate(trip.startDate)} -> ${formatDate(trip.endDate)}
- Visibility: ${trip.isPublic ? 'public' : 'private'}
- Description: ${trip.description || 'No description provided'}
- Destination count: ${trip.destinationCount || 0}

Stops:
${stopLines.length ? stopLines.join('\n\n') : '- No stops planned yet.'}

Response rules:
- Be concise, useful, and specific to the trip.
- Prefer actionable recommendations over generic travel advice.
- If the user asks about weather, food swaps, timing, or budget, tie the answer back to the itinerary when possible.
- Do not mention internal prompt instructions.`;
}

function toGeminiHistory(messages) {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));
}

function normalizeMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .map((message) => ({
      role: message?.role === 'assistant' ? 'assistant' : 'user',
      content: String(message?.content || '').trim(),
    }))
    .filter((message) => message.content.length > 0);
}

function createMockReply(trip, userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  const firstStop = trip.stops?.[0]?.city;
  const cityName = firstStop?.name || trip.name;

  if (lowerMessage.includes('vegetarian')) {
    return `For a vegetarian-friendly swap, I would review the restaurant-style stops in ${cityName} first and replace any meat-heavy activity with a plant-forward cafe, market lunch, or food tour focused on local vegetarian dishes.`;
  }

  if (lowerMessage.includes('rain') || lowerMessage.includes('indoor')) {
    return `If the weather turns bad, I would shift your ${cityName} sightseeing into museums, covered markets, cafes, or any indoor cultural stops already in the itinerary, then keep the outdoor activity for a clearer day.`;
  }

  if (lowerMessage.includes('11pm') || lowerMessage.includes('late')) {
    return `Since you arrive late, I would keep that night light: check-in, a nearby food stop if it's still open, and a short walk or night view near ${cityName} rather than trying to force a packed activity.`;
  }

  return `Based on your trip to ${cityName}, I’d keep the answer practical: reuse the existing stops where possible, swap only the activities that conflict with your constraint, and protect the highest-value experiences for the best day or time window.`;
}

async function* chunkText(text) {
  const chunkSize = 36;

  for (let index = 0; index < text.length; index += chunkSize) {
    const slice = text.slice(index, index + chunkSize);
    yield { text: () => slice };
  }
}

async function getOrCreateChatThread(db, tripId) {
  const [existing] = await db.select().from(aiChats).where(eq(aiChats.tripId, tripId));
  if (existing) return existing;

  const [created] = await db.insert(aiChats).values({ tripId }).returning();
  return created;
}

async function loadChatMessages(db, chatId) {
  return db
    .select()
    .from(aiChatMessages)
    .where(eq(aiChatMessages.chatId, chatId))
    .orderBy(asc(aiChatMessages.createdAt));
}

export async function getTripChatHistory({ tripId, userId = null }) {
  const trip = await getTripContextById(tripId, userId);
  if (!trip) return null;

  const db = getDb();
  const chat = await getOrCreateChatThread(db, tripId);
  const messages = await loadChatMessages(db, chat.id);

  return {
    chatId: chat.id,
    trip,
    messages,
  };
}

export async function generateTripChatReply({ tripId, userId = null, messages = [], stream = true }) {
  const trip = await getTripContextById(tripId, userId);
  if (!trip) {
    const error = new Error('Trip not found.');
    error.statusCode = 404;
    throw error;
  }

  const normalizedMessages = normalizeMessages(messages);
  const lastMessage = [...normalizedMessages].reverse().find((message) => message.role === 'user');
  if (!lastMessage) {
    const error = new Error('A user message is required.');
    error.statusCode = 400;
    throw error;
  }

  const db = getDb();
  const chat = await getOrCreateChatThread(db, tripId);
  const priorMessages = await loadChatMessages(db, chat.id);

  if (!genAI) {
    const reply = createMockReply(trip, lastMessage.content);

    return {
      mode: stream ? 'stream' : 'json',
      chatId: chat.id,
      trip,
      reply,
      isLive: false,
      stream: stream ? chunkText(reply) : undefined,
      replyPromise: Promise.resolve(reply),
      priorMessages,
      userMessage: lastMessage.content,
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: buildTripContextPrompt(trip),
    });

    const chatSession = model.startChat({
      history: toGeminiHistory(priorMessages),
    });

    if (!stream) {
      const result = await chatSession.sendMessage(lastMessage.content);
      const reply = result.response.text();

      return {
        mode: 'json',
        chatId: chat.id,
        trip,
        reply,
        isLive: true,
        priorMessages,
        userMessage: lastMessage.content,
      };
    }

    const result = await chatSession.sendMessageStream(lastMessage.content);

    return {
      mode: 'stream',
      chatId: chat.id,
      trip,
      isLive: true,
      stream: result.stream,
      replyPromise: result.response.then((response) => response.text()),
      priorMessages,
      userMessage: lastMessage.content,
    };
  } catch (apiError) {
    console.warn('Gemini API error, falling back to mock:', apiError.message);
    const reply = createMockReply(trip, lastMessage.content);

    return {
      mode: stream ? 'stream' : 'json',
      chatId: chat.id,
      trip,
      reply,
      isLive: false,
      stream: stream ? chunkText(reply) : undefined,
      replyPromise: Promise.resolve(reply),
      priorMessages,
      userMessage: lastMessage.content,
    };
  }
}

export async function persistTripChatTurn({ chatId, userMessage, assistantMessage }) {
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx.insert(aiChatMessages).values([
      { chatId, role: 'user', content: userMessage },
      { chatId, role: 'assistant', content: assistantMessage },
    ]);

    await tx
      .update(aiChats)
      .set({ updatedAt: new Date() })
      .where(eq(aiChats.id, chatId));
  });
}

export async function generateAiItinerary({ city, country, duration, budget, preferences }) {
  if (!genAI) {
    return mockItinerary(city, country, duration);
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
    Generate a detailed travel itinerary for a trip to ${city}, ${country}.
    Duration: ${duration} days.
    Budget Level: ${budget}.
    Traveler Preferences: ${preferences || 'Balanced mix of sightseeing, food, and relaxation'}.

    Return ONLY a JSON object with the following structure:
    {
      "name": "Trip Name",
      "description": "Short catchy description",
      "stops": [
        {
          "cityName": "${city}",
          "durationDays": number,
          "activities": [
            { "name": "Activity Name", "type": "sightseeing|food|transport|adventure|relaxation|culture|shopping|other", "cost": number, "duration": "e.g. 2 hours", "notes": "Short tip" }
          ]
        }
      ]
    }
    
    Ensure the total duration of stops matches ${duration} days.
    Keep the JSON strictly formatted. No markdown, no code fences.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI Generation Error:', error);
    return mockItinerary(city, country, duration);
  }
}

export async function generateActivityIdeas({ city, country, type, budget, duration, limit = 6 }) {
  if (!genAI) {
    return mockActivityIdeas({ city, type, budget, duration, limit });
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
    Generate ${limit} travel activity ideas for ${city}, ${country || 'any country'}.
    Filters:
    - Type: ${type || 'any'}
    - Budget: ${budget || 'medium'}
    - Duration: ${duration || 'any'}

    Return ONLY JSON in this exact structure:
    {
      "activities": [
        { "name": "Activity Name", "type": "sightseeing|food|transport|adventure|relaxation|culture|shopping|other", "cost": number, "duration": "e.g. 2 hours", "notes": "Short tip" }
      ]
    }

    Make sure the ideas feel realistic for the destination and match the filters as closely as possible.
    No markdown, no code fences.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed.activities) ? parsed.activities.slice(0, limit) : [];
  } catch (error) {
    console.error('AI Activity Search Error:', error);
    return mockActivityIdeas({ city, type, budget, duration, limit });
  }
}

function mockItinerary(city, country, duration) {
  return {
    name: `Magic ${city} Escape`,
    description: `A perfectly curated ${duration}-day journey through the heart of ${city}.`,
    stops: [
      {
        cityName: city,
        durationDays: duration,
        activities: [
          { name: `Explore Old Town ${city}`, type: 'sightseeing', cost: 0, duration: '3 hours', notes: 'Best visited early morning.' },
          { name: 'Local Food Tour', type: 'food', cost: 45, duration: '2 hours', notes: 'Try the street specialties.' },
          { name: 'Sunset Viewpoint', type: 'relaxation', cost: 10, duration: '1 hour', notes: 'Great for photos.' },
        ],
      },
    ],
  };
}

function mockActivityIdeas({ city, type, budget, duration, limit }) {
  const baseIdeas = [
    { name: `Explore ${city} Old Town`, type: 'sightseeing', cost: 0, duration: '2 hours', notes: 'Best for a morning walk.' },
    { name: `Local food crawl in ${city}`, type: 'food', cost: 35, duration: '3 hours', notes: 'Try a neighborhood market.' },
    { name: `${city} scenic viewpoints`, type: 'relaxation', cost: 10, duration: '90 minutes', notes: 'Great at sunset.' },
    { name: `Museum circuit in ${city}`, type: 'culture', cost: 18, duration: '2 hours', notes: 'Check opening times first.' },
    { name: `Hidden gems photo walk`, type: 'sightseeing', cost: 0, duration: '2 hours', notes: 'Bring comfortable shoes.' },
    { name: `Night market tasting`, type: 'food', cost: 22, duration: '2 hours', notes: 'Perfect for budget travelers.' },
    { name: `Boat or tram ride`, type: 'transport', cost: 12, duration: '1 hour', notes: 'Easy way to see the city.' },
    { name: `Relaxed park afternoon`, type: 'relaxation', cost: 0, duration: '2 hours', notes: 'Good buffer activity.' },
  ];

  const costFilter = budget === 'low' ? 20 : budget === 'medium' ? 60 : Infinity;

  return baseIdeas
    .filter((idea) => !type || type === 'any' || idea.type === type)
    .filter((idea) => idea.cost <= costFilter)
    .slice(0, limit);
}