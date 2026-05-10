import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * Phase 6: AI Intelligence
 * Uses Google Gemini to generate a structured itinerary.
 */
export async function generateAiItinerary({ city, country, duration, budget, preferences }) {
  if (!genAI) {
    // Fallback Mock for demo if no API key is provided
    return mockItinerary(city, country, duration);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
    Keep the JSON strictly formatted.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON if AI includes markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI Generation Error:', error);
    return mockItinerary(city, country, duration);
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
          { name: 'Sunset Viewpoint', type: 'relaxation', cost: 10, duration: '1 hour', notes: 'Great for photos.' }
        ]
      }
    ]
  };
}
