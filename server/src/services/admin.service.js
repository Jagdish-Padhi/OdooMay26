import { count, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { activities, cities, stops, trips, users } from '../db/schema/index.js';

/**
 * Phase 6: Admin Analytics
 * Aggregates platform-wide data for the Admin Dashboard.
 */
export async function getPlatformStats() {
  const db = getDb();

  const [userCount] = await db.select({ value: count() }).from(users);
  const [tripCount] = await db.select({ value: count() }).from(trips);
  const [activityCount] = await db.select({ value: count() }).from(activities);
  
  // Popular cities based on trip stops
  const popularCities = await db
    .select({
      name: cities.name,
      country: cities.country,
      count: count(stops.id)
    })
    .from(stops)
    .innerJoin(cities, eq(stops.cityId, cities.id))
    .groupBy(cities.name)
    .orderBy(desc(count(stops.id)))
    .limit(5);

  // Popular activities by usage
  const popularActivities = await db
    .select({
      name: activities.name,
      type: activities.type,
      count: count(activities.id),
    })
    .from(activities)
    .groupBy(activities.name, activities.type)
    .orderBy(desc(count(activities.id)))
    .limit(5);

  // Recent signups for the management table
  const recentUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      plan: users.plan,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(8);

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
      { label: 'Total Explorers', value: Number(userCount.value || 0), change: '+12%', trend: 'up' },
      { label: 'Active Itineraries', value: Number(tripCount.value || 0), change: '+18%', trend: 'up' },
      { label: 'Global Destinations', value: Number(popularCities.length || 0), change: '+5%', trend: 'up' },
      { label: 'Tracked Activities', value: Number(activityCount.value || 0), change: '+9%', trend: 'up' },
    ],
    popularCities,
    popularActivities,
    recentUsers,
    userGrowth: growth.rows ?? growth ?? [],
  };
}
