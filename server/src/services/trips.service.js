import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import { getDb } from '../db/index.js';
import { stops, trips } from '../db/schema/index.js';

function mergeDestinationCounts(tripRows, countRows) {
  const countMap = new Map(countRows.map((row) => [row.tripId, row.destinationCount]));

  return tripRows.map((trip) => ({
    ...trip,
    destinationCount: countMap.get(trip.id) ?? 0,
  }));
}

async function attachDestinationCounts(tripRows) {
  if (!tripRows.length) return [];

  const db = getDb();
  const tripIds = tripRows.map((trip) => trip.id);
  const countRows = await db
    .select({
      tripId: stops.tripId,
      destinationCount: sql`count(${stops.id})`.mapWith(Number),
    })
    .from(stops)
    .where(inArray(stops.tripId, tripIds))
    .groupBy(stops.tripId);

  return mergeDestinationCounts(tripRows, countRows);
}

export async function createTrip(userId, data) {
  const db = getDb();
  const [trip] = await db
    .insert(trips)
    .values({
      userId,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description ?? null,
      coverPhoto: data.coverPhoto ?? null,
      isPublic: data.isPublic ?? false,
    })
    .returning();

  return trip;
}

export async function getTripsByUser(userId) {
  const db = getDb();
  const tripRows = await db
    .select()
    .from(trips)
    .where(eq(trips.userId, userId))
    .orderBy(desc(trips.createdAt));

  return attachDestinationCounts(tripRows);
}

export async function getTripById(tripId, userId) {
  const db = getDb();
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)));

  if (!trip) return null;

  const [enrichedTrip] = await attachDestinationCounts([trip]);
  return enrichedTrip ?? null;
}

export async function getPublicTripById(tripId) {
  const db = getDb();
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.isPublic, true)));

  if (!trip) return null;

  const [enrichedTrip] = await attachDestinationCounts([trip]);
  return enrichedTrip ?? null;
}

export async function updateTrip(tripId, userId, data) {
  const db = getDb();
  const [updated] = await db
    .update(trips)
    .set({
      ...data,
      updatedAt: new Date(),
    })
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