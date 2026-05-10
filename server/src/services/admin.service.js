import { count, eq, sql, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { users, trips, stops, cities } from '../db/schema/index.js';

/**
 * Phase 6: Admin Analytics
 * Aggregates platform-wide data for the Admin Dashboard.
 */
export async function getPlatformStats() {
  const db = getDb();

  const [userCount] = await db.select({ value: count() }).from(users);
  const [tripCount] = await db.select({ value: count() }).from(trips);
  
  // Popular cities based on trip stops
  const popularCities = await db
    .select({
      name: cities.name,
      count: count(stops.id)
    })
    .from(stops)
    .innerJoin(cities, eq(stops.cityId, cities.id))
    .groupBy(cities.name)
    .orderBy(desc(count(stops.id)))
    .limit(5);

  // User growth (simplified - count per month)
  const growth = await db.execute(sql`
    SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(id) as count
    FROM users
    GROUP BY month, date_trunc('month', created_at)
    ORDER BY date_trunc('month', created_at) DESC
    LIMIT 6
  `);

  return {
    summary: [
      { label: 'Total Explorers', value: userCount.value, change: '+12%', trend: 'up' },
      { label: 'Active Itineraries', value: tripCount.value, change: '+18%', trend: 'up' },
      { label: 'Global Destinations', value: popularCities.length, change: '+5%', trend: 'up' },
    ],
    popularCities,
    userGrowth: growth.rows || []
  };
}
