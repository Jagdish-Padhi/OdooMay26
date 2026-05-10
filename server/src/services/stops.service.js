import { and, asc, eq, inArray } from 'drizzle-orm';

import { getDb } from '../db/index.js';
import { activities, cities, stops } from '../db/schema/index.js';

function groupActivitiesByStop(activityRows) {
  const map = new Map();

  for (const activity of activityRows) {
    const items = map.get(activity.stopId) ?? [];
    items.push(activity);
    map.set(activity.stopId, items);
  }

  return map;
}

export async function getStopsByTrip(tripId) {
  const db = getDb();
  const stopRows = await db
    .select({ stop: stops, city: cities })
    .from(stops)
    .leftJoin(cities, eq(stops.cityId, cities.id))
    .where(eq(stops.tripId, tripId))
    .orderBy(asc(stops.order), asc(stops.createdAt));

  if (!stopRows.length) return [];

  const stopIds = stopRows.map(({ stop }) => stop.id);
  const activityRows = await db
    .select()
    .from(activities)
    .where(inArray(activities.stopId, stopIds))
    .orderBy(asc(activities.order), asc(activities.createdAt));

  const activitiesByStop = groupActivitiesByStop(activityRows);

  return stopRows.map(({ stop, city }) => ({
    stop,
    city,
    activities: activitiesByStop.get(stop.id) ?? [],
  }));
}

export async function addStop(tripId, data) {
  const db = getDb();
  const existingStops = await db.select({ id: stops.id }).from(stops).where(eq(stops.tripId, tripId));
  const order = data.order ?? existingStops.length + 1;

  const [stop] = await db
    .insert(stops)
    .values({
      tripId,
      cityId: data.cityId,
      arrivalDate: data.arrivalDate ?? null,
      departureDate: data.departureDate ?? null,
      order,
    })
    .returning();

  return stop;
}

export async function updateStop(tripId, stopId, data) {
  const db = getDb();
  const [updated] = await db
    .update(stops)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(stops.id, stopId), eq(stops.tripId, tripId)))
    .returning();

  return updated || null;
}

export async function deleteStop(tripId, stopId) {
  const db = getDb();
  const [deleted] = await db
    .delete(stops)
    .where(and(eq(stops.id, stopId), eq(stops.tripId, tripId)))
    .returning();

  return deleted || null;
}

export async function reorderStops(tripId, orderedIds) {
  const db = getDb();

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(stops)
        .set({ order: index + 1, updatedAt: new Date() })
        .where(and(eq(stops.id, id), eq(stops.tripId, tripId)))
    )
  );
}