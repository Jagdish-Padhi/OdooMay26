import { and, asc, eq } from 'drizzle-orm';

import { getDb } from '../db/index.js';
import { activities } from '../db/schema/index.js';

export async function getActivitiesByStop(stopId) {
  const db = getDb();
  return db
    .select()
    .from(activities)
    .where(eq(activities.stopId, stopId))
    .orderBy(asc(activities.order), asc(activities.createdAt));
}

export async function addActivity(stopId, data) {
  const db = getDb();
  const existingActivities = await db.select({ id: activities.id }).from(activities).where(eq(activities.stopId, stopId));
  const order = data.order ?? existingActivities.length + 1;

  const [activity] = await db
    .insert(activities)
    .values({
      stopId,
      name: data.name,
      type: data.type ?? 'other',
      cost: data.cost ?? 0,
      duration: data.duration ?? null,
      notes: data.notes ?? null,
      startTime: data.startTime ?? null,
      endTime: data.endTime ?? null,
      order,
    })
    .returning();

  return activity;
}

export async function updateActivity(stopId, activityId, data) {
  const db = getDb();
  const [updated] = await db
    .update(activities)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(activities.id, activityId), eq(activities.stopId, stopId)))
    .returning();

  return updated || null;
}

export async function deleteActivity(stopId, activityId) {
  const db = getDb();
  const [deleted] = await db
    .delete(activities)
    .where(and(eq(activities.id, activityId), eq(activities.stopId, stopId)))
    .returning();

  return deleted || null;
}

export async function reorderActivities(stopId, orderedIds) {
  const db = getDb();

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(activities)
        .set({ order: index + 1, updatedAt: new Date() })
        .where(and(eq(activities.id, id), eq(activities.stopId, stopId)))
    )
  );
}