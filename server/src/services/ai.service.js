import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const MODEL_NAME = "gemini-1.5-flash";

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