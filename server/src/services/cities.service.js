import { and, desc, eq, ilike, or } from 'drizzle-orm';

import { getDb } from '../db/index.js';
import { cities } from '../db/schema/index.js';

export async function searchCities({ q = '', costIndex = '', limit = 20 } = {}) {
  const db = getDb();
  const conditions = [];
  const searchTerm = String(q || '').trim();
  const normalizedLimit = Math.max(1, Math.min(50, Number(limit) || 20));

  if (searchTerm) {
    const pattern = `%${searchTerm}%`;
    conditions.push(or(ilike(cities.name, pattern), ilike(cities.country, pattern)));
  }

  if (costIndex) {
    conditions.push(eq(cities.costIndex, costIndex));
  }

  let query = db.select().from(cities);

  if (conditions.length) {
    query = query.where(and(...conditions));
  }

  return query
    .orderBy(desc(cities.popularity), desc(cities.createdAt))
    .limit(normalizedLimit);
}