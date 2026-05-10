import { getDb } from '../index.js';
import { cities } from '../schema/index.js';

const SEED_CITIES = [
  { name: 'Paris', country: 'France', costIndex: 'high', popularity: 98, description: 'City of Light', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
  { name: 'Tokyo', country: 'Japan', costIndex: 'high', popularity: 97, description: 'Futuristic meets traditional', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
  { name: 'Bangkok', country: 'Thailand', costIndex: 'low', popularity: 90, description: 'Street food paradise', imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400' },
  { name: 'Rome', country: 'Italy', costIndex: 'medium', popularity: 93, description: 'Eternal city', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400' },
  { name: 'New York', country: 'USA', costIndex: 'high', popularity: 96, description: 'The city that never sleeps', imageUrl: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=400' },
  { name: 'Bali', country: 'Indonesia', costIndex: 'low', popularity: 91, description: 'Island of the Gods', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  { name: 'Barcelona', country: 'Spain', costIndex: 'medium', popularity: 89, description: 'Gaudi & beaches', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400' },
  { name: 'Istanbul', country: 'Turkey', costIndex: 'medium', popularity: 87, description: 'Where East meets West', imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400' },
  { name: 'Dubai', country: 'UAE', costIndex: 'high', popularity: 92, description: 'City of superlatives', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
  { name: 'Singapore', country: 'Singapore', costIndex: 'high', popularity: 88, description: 'Lion City', imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400' },
  { name: 'Amsterdam', country: 'Netherlands', costIndex: 'high', popularity: 85, description: 'City of canals', imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400' },
  { name: 'Lisbon', country: 'Portugal', costIndex: 'medium', popularity: 83, description: 'City of seven hills', imageUrl: 'https://images.unsplash.com/photo-1520168371-2e187a7ac7f4?w=400' },
  { name: 'Prague', country: 'Czech Republic', costIndex: 'low', popularity: 82, description: 'City of a hundred spires', imageUrl: 'https://images.unsplash.com/photo-1519923834699-ef0b7ded3c5a?w=400' },
  { name: 'Mumbai', country: 'India', costIndex: 'low', popularity: 80, description: 'City of dreams', imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400' },
  { name: 'Kyoto', country: 'Japan', costIndex: 'medium', popularity: 86, description: 'Ancient imperial capital', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400' },
];

export async function seedCities() {
  const db = getDb();
  await db.insert(cities).values(SEED_CITIES).onConflictDoNothing();
  console.log('Cities seeded!');
}