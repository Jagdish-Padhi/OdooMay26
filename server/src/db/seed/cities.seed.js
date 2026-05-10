import { getDb } from '../index.js';
import { cities } from '../schema/index.js';

const SEED_CITIES = [
  { name: 'Paris', country: 'France', costIndex: 'high', popularity: 98, description: 'City of Light — art, fashion, and the Eiffel Tower', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
  { name: 'Rome', country: 'Italy', costIndex: 'medium', popularity: 93, description: 'Eternal city of ancient ruins and world-class cuisine', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400' },
  { name: 'Barcelona', country: 'Spain', costIndex: 'medium', popularity: 89, description: 'Gaudí architecture, beaches, and vibrant nightlife', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400' },
  { name: 'Amsterdam', country: 'Netherlands', costIndex: 'high', popularity: 85, description: 'Golden age canals, world-class museums, and cycling culture', imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400' },
  { name: 'Lisbon', country: 'Portugal', costIndex: 'medium', popularity: 83, description: 'Seven hills, pastel tiles, and Atlantic coast sunsets', imageUrl: 'https://images.unsplash.com/photo-1520168371-2e187a7ac7f4?w=400' },
  { name: 'Prague', country: 'Czech Republic', costIndex: 'low', popularity: 82, description: 'Medieval old town, stunning castle, and craft beer scene', imageUrl: 'https://images.unsplash.com/photo-1519923834699-ef0b7ded3c5a?w=400' },
  { name: 'Istanbul', country: 'Turkey', costIndex: 'medium', popularity: 87, description: 'Where East meets West across two continents', imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400' },
  { name: 'Vienna', country: 'Austria', costIndex: 'high', popularity: 84, description: 'Imperial palaces, coffee culture, and classical music', imageUrl: 'https://images.unsplash.com/photo-1516550893923-26e187a7ac7f?w=400' },
  { name: 'Athens', country: 'Greece', costIndex: 'medium', popularity: 80, description: 'Cradle of civilization and gateway to the Aegean islands', imageUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400' },
  { name: 'Santorini', country: 'Greece', costIndex: 'high', popularity: 88, description: 'Iconic white-washed cliffs above a volcanic caldera', imageUrl: 'https://images.unsplash.com/photo-1507501336603-6260ffd1e1db?w=400' },
  { name: 'Copenhagen', country: 'Denmark', costIndex: 'high', popularity: 78, description: 'Hygge, New Nordic cuisine, and beautiful waterfront canals', imageUrl: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400' },
  { name: 'Dubrovnik', country: 'Croatia', costIndex: 'medium', popularity: 79, description: 'Pearl of the Adriatic with stunning medieval walls', imageUrl: 'https://images.unsplash.com/photo-1555990538-c60a411f4bb1?w=400' },
  { name: 'Edinburgh', country: 'Scotland', costIndex: 'medium', popularity: 76, description: 'Historic castle, Arthur\'s Seat, and world-famous Fringe Festival', imageUrl: 'https://images.unsplash.com/photo-1583395838144-09a855a80dc8?w=400' },
  { name: 'Porto', country: 'Portugal', costIndex: 'low', popularity: 74, description: 'Port wine cellars, azulejo tiles, and riverside charm', imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400' },
  { name: 'Budapest', country: 'Hungary', costIndex: 'low', popularity: 77, description: 'Grand thermal baths, ruin bars, and the Danube at night', imageUrl: 'https://images.unsplash.com/photo-1568219557405-376e23e4f7cf?w=400' },
  { name: 'Zurich', country: 'Switzerland', costIndex: 'high', popularity: 73, description: 'Alpine gateway, luxury watches, and pristine lake views', imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400' },
  { name: 'Tokyo', country: 'Japan', costIndex: 'high', popularity: 97, description: 'Futuristic neon streets alongside ancient Shinto shrines', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
  { name: 'Kyoto', country: 'Japan', costIndex: 'medium', popularity: 86, description: 'Bamboo groves, geisha districts, and 1,600 Buddhist temples', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400' },
  { name: 'Osaka', country: 'Japan', costIndex: 'medium', popularity: 83, description: 'Japan\'s kitchen — street food capital and lively nightlife', imageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400' },
  { name: 'Bangkok', country: 'Thailand', costIndex: 'low', popularity: 90, description: 'Grand temples, floating markets, and legendary street food', imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400' },
  { name: 'Chiang Mai', country: 'Thailand', costIndex: 'low', popularity: 78, description: 'Night bazaars, elephant sanctuaries, and mountain temples', imageUrl: 'https://images.unsplash.com/photo-1598935888738-cd2622bcd437?w=400' },
  { name: 'Singapore', country: 'Singapore', costIndex: 'high', popularity: 88, description: 'Lion City — futuristic gardens, hawker centres, and MBS', imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400' },
  { name: 'Bali', country: 'Indonesia', costIndex: 'low', popularity: 91, description: 'Island of the Gods — rice terraces, surf, and temples', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  { name: 'Dubai', country: 'UAE', costIndex: 'high', popularity: 92, description: 'City of superlatives — Burj Khalifa, desert safaris, and luxury', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
  { name: 'Hong Kong', country: 'China', costIndex: 'high', popularity: 85, description: 'Iconic skyline, dim sum culture, and neon-lit street markets', imageUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400' },
  { name: 'Seoul', country: 'South Korea', costIndex: 'medium', popularity: 86, description: 'K-pop, ancient palaces, and world-class Korean BBQ', imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400' },
  { name: 'Hanoi', country: 'Vietnam', costIndex: 'low', popularity: 79, description: 'French colonial old quarter, street coffee, and pho', imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400' },
  { name: 'Ho Chi Minh', country: 'Vietnam', costIndex: 'low', popularity: 77, description: 'Energetic megacity with war history and amazing street food', imageUrl: 'https://images.unsplash.com/photo-1583417219049-2f63c86bdb60?w=400' },
  { name: 'Kathmandu', country: 'Nepal', costIndex: 'low', popularity: 72, description: 'Gateway to the Himalayas and ancient Hindu-Buddhist temples', imageUrl: 'https://images.unsplash.com/photo-1592385444424-6df0f8a1ab38?w=400' },
  { name: 'Mumbai', country: 'India', costIndex: 'low', popularity: 80, description: 'City of dreams — Bollywood, colonial buildings, and street food', imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400' },
  { name: 'Jaipur', country: 'India', costIndex: 'low', popularity: 74, description: 'Pink City of Rajasthan — palaces, forts, and vibrant bazaars', imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=400' },
  { name: 'Delhi', country: 'India', costIndex: 'low', popularity: 75, description: 'Old Delhi\'s chaos meets New Delhi\'s grand colonial boulevards', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400' },
  { name: 'New York', country: 'USA', costIndex: 'high', popularity: 96, description: 'The city that never sleeps — Times Square to Central Park', imageUrl: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=400' },
  { name: 'Los Angeles', country: 'USA', costIndex: 'high', popularity: 88, description: 'Hollywood, beaches, and year-round sunshine', imageUrl: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=400' },
  { name: 'San Francisco', country: 'USA', costIndex: 'high', popularity: 83, description: 'Golden Gate, cable cars, and tech culture by the Bay', imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400' },
  { name: 'Miami', country: 'USA', costIndex: 'high', popularity: 81, description: 'Art Deco beaches, Latin culture, and vibrant nightlife', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
  { name: 'Mexico City', country: 'Mexico', costIndex: 'low', popularity: 82, description: 'Ancient Aztec history, murals, and world-class taco culture', imageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400' },
  { name: 'Buenos Aires', country: 'Argentina', costIndex: 'low', popularity: 80, description: 'Paris of South America — tango, steak, and wide boulevards', imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=400' },
  { name: 'Rio de Janeiro', country: 'Brazil', costIndex: 'medium', popularity: 84, description: 'Christ the Redeemer, Copacabana, and samba-fueled carnivals', imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400' },
  { name: 'Cusco', country: 'Peru', costIndex: 'low', popularity: 76, description: 'Inca capital and the gateway to Machu Picchu', imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400' },
  { name: 'Cartagena', country: 'Colombia', costIndex: 'low', popularity: 73, description: 'Walled colonial city with colorful Caribbean architecture', imageUrl: 'https://images.unsplash.com/photo-1583997052103-b4f8af02e119?w=400' },
  { name: 'Cancún', country: 'Mexico', costIndex: 'medium', popularity: 79, description: 'White-sand beaches, cenotes, and Mayan ruins nearby', imageUrl: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=400' },
  { name: 'Chicago', country: 'USA', costIndex: 'high', popularity: 78, description: 'Deep-dish pizza, lakefront architecture, and jazz heritage', imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400' },
  { name: 'Cape Town', country: 'South Africa', costIndex: 'medium', popularity: 85, description: 'Table Mountain, penguin beaches, and stunning winelands', imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400' },
  { name: 'Marrakech', country: 'Morocco', costIndex: 'low', popularity: 81, description: 'Labyrinthine medina, spice souks, and desert gateway', imageUrl: 'https://images.unsplash.com/photo-1597211833712-5e41faa202ea?w=400' },
  { name: 'Cairo', country: 'Egypt', costIndex: 'low', popularity: 78, description: 'The Pyramids of Giza and the River Nile\'s timeless history', imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400' },
  { name: 'Nairobi', country: 'Kenya', costIndex: 'medium', popularity: 70, description: 'Safari capital of the world — gateway to the Maasai Mara', imageUrl: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=400' },
  { name: 'Tel Aviv', country: 'Israel', costIndex: 'high', popularity: 72, description: 'Beachside tech hub with incredible food and cultural scene', imageUrl: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=400' },
  { name: 'Sydney', country: 'Australia', costIndex: 'high', popularity: 90, description: 'Opera House, Bondi Beach, and the world\'s most scenic harbour', imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400' },
  { name: 'Melbourne', country: 'Australia', costIndex: 'high', popularity: 82, description: 'Laneways, coffee culture, and Australia\'s arts capital', imageUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=400' },
  { name: 'Auckland', country: 'New Zealand', costIndex: 'high', popularity: 74, description: 'City of Sails between two stunning harbours', imageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400' },
  { name: 'Queenstown', country: 'New Zealand', costIndex: 'high', popularity: 76, description: 'Adventure capital of the world — bungee, skiing, and fjords', imageUrl: 'https://images.unsplash.com/photo-1515536765-9b2a70c4b333?w=400' },
];

export async function seedCities() {
  const db = getDb();

  const result = await db
    .insert(cities)
    .values(SEED_CITIES)
    .onConflictDoNothing()
    .returning({ name: cities.name });

  console.log(`✅ Seeded ${result.length} new cities (${SEED_CITIES.length} total attempted).`);
}