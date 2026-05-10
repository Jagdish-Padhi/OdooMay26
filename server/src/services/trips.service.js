import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { trips, stops, activities } from '../db/schema/index.js';

export async function createTrip(userId, data) {
  const db = getDb();
  const [trip] = await db
    .insert(trips)
    .values({ userId, ...data })
    .returning();
  return trip;
}

export async function getTripsByUser(userId) {
  const db = getDb();
  return db
    .select()
    .from(trips)
    .where(eq(trips.userId, userId))
    .orderBy(desc(trips.createdAt));
}

export async function getTripById(tripId, userId) {
  const db = getDb();
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)));
  return trip || null;
}

export async function getPublicTripById(tripId) {
  const db = getDb();
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.isPublic, true)));
  return trip || null;
}

/**
 * Phase 5 Core: Duplicate a trip for another user (or self)
 * Recursively copies Stops and Activities.
 */
export async function duplicateTrip(tripId, targetUserId) {
  const db = getDb();
  
  // 1. Get original trip
  const [original] = await db.select().from(trips).where(eq(trips.id, tripId));
  if (!original) throw new Error('Original trip not found');

  // 2. Insert new trip
  const [newTrip] = await db.insert(trips).values({
    ...original,
    id: undefined, // Let DB generate new UUID
    userId: targetUserId,
    name: `${original.name} (Copy)`,
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  // 3. Get original stops
  const originalStops = await db.select().from(stops).where(eq(stops.tripId, tripId));

  for (const stop of originalStops) {
    const originalStopId = stop.id;
    const [newStop] = await db.insert(stops).values({
      ...stop,
      id: undefined,
      tripId: newTrip.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 4. Get original activities for this stop
    const stopActivities = await db.select().from(activities).where(eq(activities.stopId, originalStopId));
    
    if (stopActivities.length > 0) {
      await db.insert(activities).values(
        stopActivities.map(act => ({
          ...act,
          id: undefined,
          stopId: newStop.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
    }
  }

  return newTrip;
}

export async function updateTrip(tripId, userId, data) {
  const db = getDb();
  const [updated] = await db
    .update(trips)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .returning();
  return updated || null;
}

export async function deleteTrip(tripId, userId) {
  const db = getDb();
  const [deleted] = await db
    .delete(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .returning();
  return deleted || null;
}
