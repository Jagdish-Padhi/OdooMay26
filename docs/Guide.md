# Traveloop — Full End-to-End Build Guide

> **Stack**: React 18 + Vite + Tailwind v4 + Zustand + Axios (client) | Express v5 + Drizzle ORM + Neon PostgreSQL + JWT (server)

---

## 1. What's Already Built

| Layer | Done |
|---|---|
| DB Schemas | `users`, `trips`, `stops`, `activities`, `cities`, `notes`, `checklists` |
| Auth Backend | Register, Login, Refresh Token, Logout (`/api/auth/*`) |
| Auth Frontend | `LoginPage`, `RegisterPage`, `useAuthStore` (Zustand), `PrivateRoute` |
| Layout | `DashboardLayout`, `DashboardHomePage` skeleton |
| Components | Full UI kit — `Button`, `Card`, `Input`, `Modal`, `Table`, `Toast`, etc. |
| Routing | React Router v7 with protected routes |

**What remains**: All Traveloop-specific features — Trips CRUD, Stops, Activities, Budget, Packing, Notes, City/Activity Search, Public Sharing, Profile.

---

## 2. Project Structure to Build Toward

```
client/src/
  pages/
    trips/
      MyTripsPage.jsx          ← Screen 4
      CreateTripPage.jsx        ← Screen 3
      ItineraryBuilderPage.jsx  ← Screen 5
      ItineraryViewPage.jsx     ← Screen 6
      BudgetPage.jsx            ← Screen 9
      PackingPage.jsx           ← Screen 10
      NotesPage.jsx             ← Screen 13
      SharedTripPage.jsx        ← Screen 11 (public, no auth)
    search/
      CitySearchPage.jsx        ← Screen 7
      ActivitySearchPage.jsx    ← Screen 8
    profile/
      ProfilePage.jsx           ← Screen 12
    dashboard/
      DashboardHomePage.jsx     ← Screen 2 (already exists, extend it)
  services/
    trips.service.js
    stops.service.js
    activities.service.js
    cities.service.js
    checklist.service.js
    notes.service.js
  store/
    trips.store.js

server/src/
  controllers/
    trips.controller.js
    stops.controller.js
    activities.controller.js
    cities.controller.js
    checklist.controller.js
    notes.controller.js
    budget.controller.js
  routes/
    trips.route.js
    stops.route.js
    activities.route.js
    cities.route.js
    checklist.route.js
    notes.route.js
  services/
    trips.service.js
    stops.service.js
    activities.service.js
    cities.service.js
    checklist.service.js
    budget.service.js
```

---

## 3. Backend — Phase by Phase

### Phase 1: Trips CRUD

**`server/src/services/trips.service.js`**

```js
import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { trips } from '../db/schema/index.js';

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
```

**`server/src/controllers/trips.controller.js`**

```js
import * as tripService from '../services/trips.service.js';

export async function createTrip(req, res, next) {
  try {
    const trip = await tripService.createTrip(req.user.userId, req.body);
    res.status(201).json({ success: true, data: trip });
  } catch (err) { next(err); }
}

export async function getMyTrips(req, res, next) {
  try {
    const trips = await tripService.getTripsByUser(req.user.userId);
    res.json({ success: true, data: trips });
  } catch (err) { next(err); }
}

export async function getTrip(req, res, next) {
  try {
    const trip = await tripService.getTripById(req.params.id, req.user.userId);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, data: trip });
  } catch (err) { next(err); }
}

export async function getPublicTrip(req, res, next) {
  try {
    const trip = await tripService.getPublicTripById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, data: trip });
  } catch (err) { next(err); }
}

export async function updateTrip(req, res, next) {
  try {
    const trip = await tripService.updateTrip(req.params.id, req.user.userId, req.body);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, data: trip });
  } catch (err) { next(err); }
}

export async function deleteTrip(req, res, next) {
  try {
    const trip = await tripService.deleteTrip(req.params.id, req.user.userId);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, message: 'Trip deleted' });
  } catch (err) { next(err); }
}
```

**`server/src/routes/trips.route.js`**

```js
import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import * as tripsCtrl from '../controllers/trips.controller.js';

const router = Router();

// Public route — no auth needed
router.get('/public/:id', tripsCtrl.getPublicTrip);

// Protected routes
router.use(verifyToken);
router.get('/', tripsCtrl.getMyTrips);
router.post('/', tripsCtrl.createTrip);
router.get('/:id', tripsCtrl.getTrip);
router.put('/:id', tripsCtrl.updateTrip);
router.delete('/:id', tripsCtrl.deleteTrip);

export default router;
```

**Register in `server/src/routes/index.js`** — add:

```js
import tripsRoute from './trips.route.js';
// ...inside router setup:
router.use('/trips', tripsRoute);
```

---

### Phase 2: Stops CRUD

**`server/src/services/stops.service.js`**

```js
import { and, asc, eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { stops, cities } from '../db/schema/index.js';

export async function getStopsByTrip(tripId) {
  const db = getDb();
  return db
    .select({ stop: stops, city: cities })
    .from(stops)
    .leftJoin(cities, eq(stops.cityId, cities.id))
    .where(eq(stops.tripId, tripId))
    .orderBy(asc(stops.order));
}

export async function addStop(tripId, data) {
  const db = getDb();
  // Auto-set order to end of list
  const existing = await db.select().from(stops).where(eq(stops.tripId, tripId));
  const order = data.order ?? existing.length + 1;
  const [stop] = await db
    .insert(stops)
    .values({ tripId, ...data, order })
    .returning();
  return stop;
}

export async function updateStop(stopId, data) {
  const db = getDb();
  const [updated] = await db
    .update(stops)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(stops.id, stopId))
    .returning();
  return updated || null;
}

export async function deleteStop(stopId) {
  const db = getDb();
  const [deleted] = await db
    .delete(stops)
    .where(eq(stops.id, stopId))
    .returning();
  return deleted || null;
}

export async function reorderStops(tripId, orderedIds) {
  const db = getDb();
  // Update order for each stop
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(stops)
        .set({ order: index + 1, updatedAt: new Date() })
        .where(and(eq(stops.id, id), eq(stops.tripId, tripId)))
    )
  );
}
```

**`server/src/routes/stops.route.js`**

```js
import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { getDb } from '../db/index.js';
import { stops } from '../db/schema/index.js';
import * as stopsService from '../services/stops.service.js';
import { eq } from 'drizzle-orm';

const router = Router({ mergeParams: true }); // gets :tripId from parent
router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const data = await stopsService.getStopsByTrip(req.params.tripId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const stop = await stopsService.addStop(req.params.tripId, req.body);
    res.status(201).json({ success: true, data: stop });
  } catch (err) { next(err); }
});

router.put('/reorder', async (req, res, next) => {
  try {
    await stopsService.reorderStops(req.params.tripId, req.body.orderedIds);
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.put('/:stopId', async (req, res, next) => {
  try {
    const stop = await stopsService.updateStop(req.params.stopId, req.body);
    res.json({ success: true, data: stop });
  } catch (err) { next(err); }
});

router.delete('/:stopId', async (req, res, next) => {
  try {
    await stopsService.deleteStop(req.params.stopId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
```

**Register nested routes in `trips.route.js`:**

```js
import stopsRoute from './stops.route.js';
import activitiesRoute from './activities.route.js';

// Add BEFORE exports:
router.use('/:id/stops', stopsRoute);
router.use('/:id/stops/:stopId/activities', activitiesRoute);
```

---

### Phase 3: Activities CRUD

**`server/src/routes/activities.route.js`**

```js
import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { getDb } from '../db/index.js';
import { activities } from '../db/schema/index.js';
import { and, asc, eq } from 'drizzle-orm';

const router = Router({ mergeParams: true }); // gets :stopId from parent
router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const data = await db
      .select()
      .from(activities)
      .where(eq(activities.stopId, req.params.stopId))
      .orderBy(asc(activities.startTime));
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const db = getDb();
    const [activity] = await db
      .insert(activities)
      .values({ stopId: req.params.stopId, ...req.body })
      .returning();
    res.status(201).json({ success: true, data: activity });
  } catch (err) { next(err); }
});

router.put('/:activityId', async (req, res, next) => {
  try {
    const db = getDb();
    const [updated] = await db
      .update(activities)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(activities.id, req.params.activityId))
      .returning();
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

router.delete('/:activityId', async (req, res, next) => {
  try {
    const db = getDb();
    await db.delete(activities).where(eq(activities.id, req.params.activityId));
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
```

---

### Phase 4: Cities (Seed + Search)

**`server/src/db/seed/cities.seed.js`** — create this file:

```js
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
  // Use onConflictDoNothing to avoid duplicates on re-run
  await db.insert(cities).values(SEED_CITIES).onConflictDoNothing();
  console.log('Cities seeded!');
}
```

**Add seed script to `server/package.json`:**

```json
"db:seed": "node -e \"import('./src/db/seed/cities.seed.js').then(m => m.seedCities())\""
```

**`server/src/routes/cities.route.js`**

```js
import { Router } from 'express';
import { getDb } from '../db/index.js';
import { cities } from '../db/schema/index.js';
import { ilike, or, desc } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const { q, costIndex, limit = 20 } = req.query;

    let query = db.select().from(cities);

    if (q) {
      query = query.where(
        or(ilike(cities.name, `%${q}%`), ilike(cities.country, `%${q}%`))
      );
    }
    if (costIndex) {
      query = query.where(eq(cities.costIndex, costIndex));
    }

    const results = await query.orderBy(desc(cities.popularity)).limit(Number(limit));
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

export default router;
```

---

### Phase 5: Budget Computation

**`server/src/services/budget.service.js`**

```js
import { eq, sum } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { stops, activities, cities } from '../db/schema/index.js';

// Cost multipliers per city cost index (USD per day per person, rough estimate)
const DAILY_ESTIMATES = {
  low:    { accommodation: 25,  food: 15, transport: 10 },
  medium: { accommodation: 80,  food: 40, transport: 25 },
  high:   { accommodation: 180, food: 80, transport: 50 },
};

export async function computeBudget(tripId) {
  const db = getDb();

  // Get all stops with their cities
  const stopsWithCities = await db
    .select({ stop: stops, city: cities })
    .from(stops)
    .leftJoin(cities, eq(stops.cityId, cities.id))
    .where(eq(stops.tripId, tripId));

  // Get all activities for this trip
  const allActivities = await db
    .select({ activity: activities })
    .from(activities)
    .innerJoin(stops, eq(activities.stopId, stops.id))
    .where(eq(stops.tripId, tripId));

  let totalAccommodation = 0;
  let totalFood = 0;
  let totalTransport = 0;
  const stopBreakdowns = [];

  for (const { stop, city } of stopsWithCities) {
    const costKey = city?.costIndex ?? 'medium';
    const estimates = DAILY_ESTIMATES[costKey];

    // Days at this stop
    let days = 1;
    if (stop.arrivalDate && stop.departureDate) {
      const diff = new Date(stop.departureDate) - new Date(stop.arrivalDate);
      days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    const accommodation = estimates.accommodation * days;
    const food = estimates.food * days;
    const transport = estimates.transport * days;

    totalAccommodation += accommodation;
    totalFood += food;
    totalTransport += transport;

    stopBreakdowns.push({
      stopId: stop.id,
      cityName: city?.name ?? 'Unknown',
      days,
      costIndex: costKey,
      accommodation,
      food,
      transport,
    });
  }

  // Sum activity costs
  const activityCosts = allActivities.reduce(
    (acc, { activity }) => acc + parseFloat(activity.cost || 0),
    0
  );

  const total = totalAccommodation + totalFood + totalTransport + activityCosts;
  const totalDays = stopBreakdowns.reduce((a, s) => a + s.days, 0) || 1;

  return {
    total: +total.toFixed(2),
    perDay: +(total / totalDays).toFixed(2),
    breakdown: {
      accommodation: +totalAccommodation.toFixed(2),
      food: +totalFood.toFixed(2),
      transport: +totalTransport.toFixed(2),
      activities: +activityCosts.toFixed(2),
    },
    stops: stopBreakdowns,
  };
}
```

**Route — add to `trips.route.js`:**

```js
import { computeBudget } from '../services/budget.service.js';

// Inside router, after verifyToken middleware:
router.get('/:id/budget', async (req, res, next) => {
  try {
    const trip = await getTripById(req.params.id, req.user.userId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    const budget = await computeBudget(req.params.id);
    res.json({ success: true, data: budget });
  } catch (err) { next(err); }
});
```

---

### Phase 6: Packing Checklist

**`server/src/routes/checklist.route.js`**

```js
import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { getDb } from '../db/index.js';
import { checklists } from '../db/schema/index.js';
import { and, eq } from 'drizzle-orm';

const router = Router({ mergeParams: true });
router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const items = await db
      .select()
      .from(checklists)
      .where(eq(checklists.tripId, req.params.tripId));
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const db = getDb();
    const [item] = await db
      .insert(checklists)
      .values({ tripId: req.params.tripId, ...req.body })
      .returning();
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
});

router.put('/:itemId', async (req, res, next) => {
  try {
    const db = getDb();
    const [updated] = await db
      .update(checklists)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(checklists.id, req.params.itemId))
      .returning();
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

router.delete('/:itemId', async (req, res, next) => {
  try {
    const db = getDb();
    await db.delete(checklists).where(eq(checklists.id, req.params.itemId));
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Reset checklist (mark all unpacked)
router.post('/reset', async (req, res, next) => {
  try {
    const db = getDb();
    await db
      .update(checklists)
      .set({ isPacked: false, updatedAt: new Date() })
      .where(eq(checklists.tripId, req.params.tripId));
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
```

**Add to `trips.route.js`:**

```js
import checklistRoute from './checklist.route.js';
router.use('/:id/checklist', checklistRoute);
```

---

### Phase 7: Notes

**`server/src/routes/notes.route.js`**

```js
import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { getDb } from '../db/index.js';
import { notes } from '../db/schema/index.js';
import { and, desc, eq } from 'drizzle-orm';

const router = Router({ mergeParams: true });
router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const items = await db
      .select()
      .from(notes)
      .where(eq(notes.tripId, req.params.tripId))
      .orderBy(desc(notes.createdAt));
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const db = getDb();
    const [note] = await db
      .insert(notes)
      .values({ tripId: req.params.tripId, ...req.body })
      .returning();
    res.status(201).json({ success: true, data: note });
  } catch (err) { next(err); }
});

router.put('/:noteId', async (req, res, next) => {
  try {
    const db = getDb();
    const [updated] = await db
      .update(notes)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(notes.id, req.params.noteId))
      .returning();
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

router.delete('/:noteId', async (req, res, next) => {
  try {
    const db = getDb();
    await db.delete(notes).where(eq(notes.id, req.params.noteId));
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
```

**Add to `trips.route.js`:**

```js
import notesRoute from './notes.route.js';
router.use('/:id/notes', notesRoute);
```

---

### Final `server/src/routes/index.js`

```js
import { Router } from 'express';
import authRoute from './auth.route.js';
import healthRoute from './health.route.js';
import tripsRoute from './trips.route.js';
import citiesRoute from './cities.route.js';

const router = Router();

router.use('/health', healthRoute);
router.use('/auth', authRoute);
router.use('/trips', tripsRoute);
router.use('/cities', citiesRoute);

export default router;
```

---

## 4. Frontend Services Layer

**`client/src/services/trips.service.js`**

```js
import api from './api.js';

export const tripsService = {
  getAll:       ()         => api.get('/trips'),
  getOne:       (id)       => api.get(`/trips/${id}`),
  getPublic:    (id)       => api.get(`/trips/public/${id}`),
  create:       (data)     => api.post('/trips', data),
  update:       (id, data) => api.put(`/trips/${id}`, data),
  remove:       (id)       => api.delete(`/trips/${id}`),
  getBudget:    (id)       => api.get(`/trips/${id}/budget`),

  // Stops
  getStops:     (tripId)         => api.get(`/trips/${tripId}/stops`),
  addStop:      (tripId, data)   => api.post(`/trips/${tripId}/stops`, data),
  updateStop:   (tripId, stopId, data) => api.put(`/trips/${tripId}/stops/${stopId}`, data),
  deleteStop:   (tripId, stopId) => api.delete(`/trips/${tripId}/stops/${stopId}`),
  reorderStops: (tripId, ids)    => api.put(`/trips/${tripId}/stops/reorder`, { orderedIds: ids }),

  // Activities
  getActivities: (tripId, stopId)           => api.get(`/trips/${tripId}/stops/${stopId}/activities`),
  addActivity:   (tripId, stopId, data)     => api.post(`/trips/${tripId}/stops/${stopId}/activities`, data),
  updateActivity:(tripId, stopId, id, data) => api.put(`/trips/${tripId}/stops/${stopId}/activities/${id}`, data),
  deleteActivity:(tripId, stopId, id)       => api.delete(`/trips/${tripId}/stops/${stopId}/activities/${id}`),

  // Checklist
  getChecklist:    (tripId)       => api.get(`/trips/${tripId}/checklist`),
  addCheckItem:    (tripId, data) => api.post(`/trips/${tripId}/checklist`, data),
  updateCheckItem: (tripId, id, data) => api.put(`/trips/${tripId}/checklist/${id}`, data),
  deleteCheckItem: (tripId, id)   => api.delete(`/trips/${tripId}/checklist/${id}`),
  resetChecklist:  (tripId)       => api.post(`/trips/${tripId}/checklist/reset`),

  // Notes
  getNotes:    (tripId)       => api.get(`/trips/${tripId}/notes`),
  addNote:     (tripId, data) => api.post(`/trips/${tripId}/notes`, data),
  updateNote:  (tripId, id, data) => api.put(`/trips/${tripId}/notes/${id}`, data),
  deleteNote:  (tripId, id)   => api.delete(`/trips/${tripId}/notes/${id}`),
};

export const citiesService = {
  search: (params) => api.get('/cities', { params }),
};
```

---

## 5. Zustand Store

**`client/src/store/trips.store.js`**

```js
import { create } from 'zustand';
import { tripsService } from '../services/trips.service.js';
import toast from 'react-hot-toast';

const useTripsStore = create((set, get) => ({
  trips: [],
  currentTrip: null,
  stops: [],
  loading: false,
  budgetData: null,

  fetchTrips: async () => {
    set({ loading: true });
    try {
      const { data } = await tripsService.getAll();
      set({ trips: data.data });
    } catch { toast.error('Failed to load trips'); }
    finally { set({ loading: false }); }
  },

  fetchTrip: async (id) => {
    set({ loading: true });
    try {
      const [tripRes, stopsRes] = await Promise.all([
        tripsService.getOne(id),
        tripsService.getStops(id),
      ]);
      set({ currentTrip: tripRes.data.data, stops: stopsRes.data.data });
    } catch { toast.error('Failed to load trip'); }
    finally { set({ loading: false }); }
  },

  createTrip: async (data) => {
    const { data: res } = await tripsService.create(data);
    set((s) => ({ trips: [res.data, ...s.trips] }));
    return res.data;
  },

  updateTrip: async (id, data) => {
    const { data: res } = await tripsService.update(id, data);
    set((s) => ({
      trips: s.trips.map((t) => (t.id === id ? res.data : t)),
      currentTrip: s.currentTrip?.id === id ? res.data : s.currentTrip,
    }));
    return res.data;
  },

  deleteTrip: async (id) => {
    await tripsService.remove(id);
    set((s) => ({ trips: s.trips.filter((t) => t.id !== id) }));
  },

  fetchBudget: async (tripId) => {
    const { data } = await tripsService.getBudget(tripId);
    set({ budgetData: data.data });
    return data.data;
  },
}));

export default useTripsStore;
```

---

## 6. Frontend Pages

### Screen 4 — My Trips Page

**`client/src/pages/trips/MyTripsPage.jsx`**

```jsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, MapPin, Calendar, Trash2, Eye } from 'lucide-react';
import useTripsStore from '../../store/trips.store.js';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  planning:  'bg-blue-100 text-blue-700',
  ongoing:   'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
};

export default function MyTripsPage() {
  const navigate = useNavigate();
  const { trips, loading, fetchTrips, deleteTrip } = useTripsStore();

  useEffect(() => { fetchTrips(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteTrip(id);
      toast.success('Trip deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-500 mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} planned</p>
        </div>
        <Link
          to="/trips/new"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <PlusCircle size={18} /> New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MapPin size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg">No trips yet. Start planning!</p>
          <Link to="/trips/new" className="mt-4 inline-block text-emerald-500 hover:underline">
            Create your first trip →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {trip.coverPhoto ? (
                <img src={trip.coverPhoto} alt={trip.name} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                  <MapPin size={40} className="text-white opacity-60" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 truncate">{trip.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[trip.status]}`}>
                    {trip.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                  <Calendar size={12} />
                  <span>
                    {new Date(trip.startDate).toLocaleDateString()} –{' '}
                    {new Date(trip.endDate).toLocaleDateString()}
                  </span>
                </div>
                {trip.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{trip.description}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/trips/${trip.id}/builder`)}
                    className="flex-1 flex items-center justify-center gap-1 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id, trip.name)}
                    className="flex items-center justify-center gap-1 text-sm bg-red-50 hover:bg-red-100 text-red-500 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Screen 3 — Create Trip Page

**`client/src/pages/trips/CreateTripPage.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, FileText, Save } from 'lucide-react';
import useTripsStore from '../../store/trips.store.js';
import toast from 'react-hot-toast';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const createTrip = useTripsStore((s) => s.createTrip);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    coverPhoto: '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error('Name and dates are required');
      return;
    }
    setSaving(true);
    try {
      const trip = await createTrip({
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      toast.success('Trip created!');
      navigate(`/trips/${trip.id}/builder`);
    } catch { toast.error('Failed to create trip'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Plan a New Trip</h1>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name *</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Europe Summer 2025"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              type="date"
              value={form.startDate}
              onChange={set('startDate')}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
            <input
              type="date"
              value={form.endDate}
              min={form.startDate}
              onChange={set('endDate')}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={3}
            placeholder="What's this trip about?"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Photo URL (optional)</label>
          <input
            value={form.coverPhoto}
            onChange={set('coverPhoto')}
            placeholder="https://..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          {form.coverPhoto && (
            <img src={form.coverPhoto} alt="preview" className="mt-2 h-24 w-full object-cover rounded-lg" />
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          <Save size={18} /> {saving ? 'Creating...' : 'Create Trip'}
        </button>
      </div>
    </div>
  );
}
```

---

### Screen 5 — Itinerary Builder Page

**`client/src/pages/trips/ItineraryBuilderPage.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ChevronUp, ChevronDown, Activity, DollarSign, List, Clipboard, BookOpen, Share2 } from 'lucide-react';
import { tripsService, citiesService } from '../../services/trips.service.js';
import toast from 'react-hot-toast';
import AddActivityModal from './components/AddActivityModal.jsx';

export default function ItineraryBuilderPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [activityModal, setActivityModal] = useState(null); // { stopId }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tripsService.getOne(tripId),
      tripsService.getStops(tripId),
    ]).then(([tripRes, stopsRes]) => {
      setTrip(tripRes.data.data);
      // Fetch activities for each stop
      const rawStops = stopsRes.data.data;
      Promise.all(
        rawStops.map((s) =>
          tripsService.getActivities(tripId, s.stop.id)
            .then((r) => ({ ...s, activities: r.data.data }))
        )
      ).then(setStops);
    }).finally(() => setLoading(false));
  }, [tripId]);

  const searchCities = async (q) => {
    if (!q || q.length < 2) { setCityResults([]); return; }
    const { data } = await citiesService.search({ q, limit: 6 });
    setCityResults(data.data);
  };

  const addStop = async (city) => {
    const { data } = await tripsService.addStop(tripId, { cityId: city.id });
    setStops((prev) => [...prev, { stop: data.data, city, activities: [] }]);
    setCitySearch('');
    setCityResults([]);
    toast.success(`${city.name} added!`);
  };

  const removeStop = async (stopId) => {
    if (!confirm('Remove this stop?')) return;
    await tripsService.deleteStop(tripId, stopId);
    setStops((prev) => prev.filter((s) => s.stop.id !== stopId));
  };

  const addActivity = async (stopId, data) => {
    const { data: res } = await tripsService.addActivity(tripId, stopId, data);
    setStops((prev) =>
      prev.map((s) =>
        s.stop.id === stopId
          ? { ...s, activities: [...s.activities, res.data] }
          : s
      )
    );
  };

  const removeActivity = async (stopId, actId) => {
    await tripsService.deleteActivity(tripId, stopId, actId);
    setStops((prev) =>
      prev.map((s) =>
        s.stop.id === stopId
          ? { ...s, activities: s.activities.filter((a) => a.id !== actId) }
          : s
      )
    );
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Trip Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{trip?.name}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {stops.length} stop{stops.length !== 1 ? 's' : ''} · {stops.reduce((a, s) => a + s.activities.length, 0)} activities
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/trips/${tripId}/budget`} className="flex items-center gap-1 text-sm text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <DollarSign size={14} /> Budget
          </Link>
          <Link to={`/trips/${tripId}/packing`} className="flex items-center gap-1 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            <Clipboard size={14} /> Packing
          </Link>
          <Link to={`/trips/${tripId}/notes`} className="flex items-center gap-1 text-sm text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
            <BookOpen size={14} /> Notes
          </Link>
        </div>
      </div>

      {/* Add City Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <h2 className="font-medium text-gray-700 mb-3">Add a Stop</h2>
        <div className="relative">
          <input
            value={citySearch}
            onChange={(e) => { setCitySearch(e.target.value); searchCities(e.target.value); }}
            placeholder="Search cities..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          {cityResults.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {cityResults.map((city) => (
                <button
                  key={city.id}
                  onClick={() => addStop(city)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-emerald-50 text-left transition-colors"
                >
                  <span className="font-medium text-gray-800">{city.name}</span>
                  <span className="text-sm text-gray-400">{city.country} · <span className="capitalize">{city.costIndex}</span> cost</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stops List */}
      <div className="space-y-4">
        {stops.length === 0 && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            Search and add cities above to build your itinerary
          </div>
        )}
        {stops.map((s, idx) => (
          <div key={s.stop.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Stop Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-800">{s.city?.name}</p>
                  <p className="text-xs text-gray-400">{s.city?.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <input
                    type="date"
                    defaultValue={s.stop.arrivalDate?.split('T')[0]}
                    onBlur={(e) => tripsService.updateStop(tripId, s.stop.id, { arrivalDate: new Date(e.target.value).toISOString() })}
                    className="text-xs border border-gray-200 rounded px-2 py-1"
                    placeholder="Arrival"
                  />
                  <input
                    type="date"
                    defaultValue={s.stop.departureDate?.split('T')[0]}
                    onBlur={(e) => tripsService.updateStop(tripId, s.stop.id, { departureDate: new Date(e.target.value).toISOString() })}
                    className="text-xs border border-gray-200 rounded px-2 py-1"
                    placeholder="Departure"
                  />
                </div>
                <button onClick={() => removeStop(s.stop.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Activities */}
            <div className="px-4 py-3 space-y-2">
              {s.activities.map((act) => (
                <div key={act.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Activity size={13} className="text-emerald-500" />
                    <span className="font-medium">{act.name}</span>
                    <span className="text-xs text-gray-400 capitalize bg-gray-100 px-1.5 py-0.5 rounded">{act.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    {parseFloat(act.cost) > 0 && <span className="text-xs">${parseFloat(act.cost).toFixed(0)}</span>}
                    <button onClick={() => removeActivity(s.stop.id, act.id)} className="hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setActivityModal({ stopId: s.stop.id })}
                className="w-full flex items-center justify-center gap-1 text-sm text-emerald-600 hover:bg-emerald-50 py-2 rounded-lg border border-dashed border-emerald-300 transition-colors"
              >
                <Plus size={14} /> Add Activity
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Activity Modal */}
      {activityModal && (
        <AddActivityModal
          onClose={() => setActivityModal(null)}
          onAdd={(data) => { addActivity(activityModal.stopId, data); setActivityModal(null); }}
        />
      )}
    </div>
  );
}
```

---

### Screen 5 Sub-Component — Add Activity Modal

**`client/src/pages/trips/components/AddActivityModal.jsx`**

```jsx
import { useState } from 'react';
import { X } from 'lucide-react';

const TYPES = ['sightseeing','food','transport','adventure','relaxation','culture','shopping','other'];

export default function AddActivityModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', type: 'sightseeing', cost: '', duration: '', notes: '' });
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleAdd = () => {
    if (!form.name) return;
    onAdd({ ...form, cost: parseFloat(form.cost) || 0 });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-gray-800 text-lg">Add Activity</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input
            value={form.name}
            onChange={set('name')}
            placeholder="Activity name *"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
          />
          <select
            value={form.type}
            onChange={set('type')}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
          >
            {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={form.cost}
              onChange={set('cost')}
              placeholder="Cost ($)"
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
            />
            <input
              value={form.duration}
              onChange={set('duration')}
              placeholder="Duration (e.g. 2 hrs)"
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-emerald-400 outline-none"
          />
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Cancel
            </button>
            <button onClick={handleAdd} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium text-sm">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Screen 9 — Budget Page

**`client/src/pages/trips/BudgetPage.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tripsService } from '../../services/trips.service.js';
import { DollarSign, Home, UtensilsCrossed, Bus, Activity } from 'lucide-react';

const ICONS = {
  accommodation: <Home size={18} className="text-blue-500" />,
  food:          <UtensilsCrossed size={18} className="text-orange-500" />,
  transport:     <Bus size={18} className="text-purple-500" />,
  activities:    <Activity size={18} className="text-emerald-500" />,
};
const COLORS = {
  accommodation: 'bg-blue-400',
  food:          'bg-orange-400',
  transport:     'bg-purple-400',
  activities:    'bg-emerald-400',
};

export default function BudgetPage() {
  const { tripId } = useParams();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tripsService.getBudget(tripId)
      .then((r) => setBudget(r.data.data))
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;
  if (!budget) return null;

  const { total, perDay, breakdown } = budget;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Budget</h1>
      <p className="text-gray-400 text-sm mb-8">Estimated costs based on city cost index + activities</p>

      {/* Total */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-6 mb-6">
        <p className="text-sm opacity-80 mb-1">Total Estimated Cost</p>
        <p className="text-4xl font-bold">${total.toLocaleString()}</p>
        <p className="text-sm opacity-70 mt-1">${perDay}/day average</p>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Cost Breakdown</h2>
        <div className="space-y-4">
          {Object.entries(breakdown).map(([key, value]) => {
            const pct = total > 0 ? (value / total) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    {ICONS[key]}
                    <span className="capitalize text-gray-600">{key}</span>
                  </div>
                  <span className="font-semibold text-gray-800">${value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${COLORS[key]} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-stop breakdown */}
      {budget.stops?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">By City</h2>
          <div className="space-y-3">
            {budget.stops.map((s) => (
              <div key={s.stopId} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-700">{s.cityName}</p>
                  <p className="text-xs text-gray-400">{s.days} day{s.days > 1 ? 's' : ''} · <span className="capitalize">{s.costIndex}</span> cost</p>
                </div>
                <p className="font-semibold text-gray-800">
                  ${(s.accommodation + s.food + s.transport).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Screen 10 — Packing Checklist Page

**`client/src/pages/trips/PackingPage.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tripsService } from '../../services/trips.service.js';
import { Plus, RefreshCw, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CATS = ['clothing','documents','electronics','toiletries','essentials','other'];
const CAT_COLORS = {
  clothing:    'bg-pink-100 text-pink-700',
  documents:   'bg-yellow-100 text-yellow-700',
  electronics: 'bg-blue-100 text-blue-700',
  toiletries:  'bg-purple-100 text-purple-700',
  essentials:  'bg-green-100 text-green-700',
  other:       'bg-gray-100 text-gray-600',
};

export default function PackingPage() {
  const { tripId } = useParams();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newCat, setNewCat] = useState('essentials');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    tripsService.getChecklist(tripId).then((r) => setItems(r.data.data));
  }, [tripId]);

  const addItem = async () => {
    if (!newItem.trim()) return;
    const { data } = await tripsService.addCheckItem(tripId, { item: newItem.trim(), category: newCat });
    setItems((p) => [...p, data.data]);
    setNewItem('');
  };

  const toggle = async (id, current) => {
    const { data } = await tripsService.updateCheckItem(tripId, id, { isPacked: !current });
    setItems((p) => p.map((i) => (i.id === id ? data.data : i)));
  };

  const remove = async (id) => {
    await tripsService.deleteCheckItem(tripId, id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const reset = async () => {
    await tripsService.resetChecklist(tripId);
    setItems((p) => p.map((i) => ({ ...i, isPacked: false })));
    toast.success('Checklist reset');
  };

  const packed = items.filter((i) => i.isPacked).length;
  const displayed = filter === 'all' ? items : filter === 'packed' ? items.filter((i) => i.isPacked) : items.filter((i) => !i.isPacked);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Packing List</h1>
        <button onClick={reset} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <RefreshCw size={14} /> Reset
        </button>
      </div>
      <p className="text-gray-400 text-sm mb-6">{packed}/{items.length} packed</p>

      {/* Progress */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all"
          style={{ width: items.length ? `${(packed / items.length) * 100}%` : '0%' }}
        />
      </div>

      {/* Add Item */}
      <div className="flex gap-2 mb-6">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Add item..."
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
        />
        <select
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-sm capitalize"
        >
          {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={addItem} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">
          <Plus size={18} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {['all','unpacked','packed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${filter === f ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {displayed.map((item) => (
          <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.isPacked ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-white'}`}>
            <button onClick={() => toggle(item.id, item.isPacked)}>
              {item.isPacked
                ? <CheckCircle2 size={20} className="text-emerald-500" />
                : <Circle size={20} className="text-gray-300" />}
            </button>
            <span className={`flex-1 text-sm ${item.isPacked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {item.item}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${CAT_COLORS[item.category]}`}>
              {item.category}
            </span>
            <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {displayed.length === 0 && (
          <p className="text-center text-gray-400 py-8">No items here yet.</p>
        )}
      </div>
    </div>
  );
}
```

---

### Screen 13 — Notes / Journal Page

**`client/src/pages/trips/NotesPage.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tripsService } from '../../services/trips.service.js';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const { tripId } = useParams();
  const [notes, setNotes] = useState([]);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(null); // { id, content }

  useEffect(() => {
    tripsService.getNotes(tripId).then((r) => setNotes(r.data.data));
  }, [tripId]);

  const addNote = async () => {
    if (!draft.trim()) return;
    const { data } = await tripsService.addNote(tripId, { content: draft.trim() });
    setNotes((p) => [data.data, ...p]);
    setDraft('');
  };

  const saveEdit = async () => {
    const { data } = await tripsService.updateNote(tripId, editing.id, { content: editing.content });
    setNotes((p) => p.map((n) => (n.id === editing.id ? data.data : n)));
    setEditing(null);
  };

  const remove = async (id) => {
    await tripsService.deleteNote(tripId, id);
    setNotes((p) => p.filter((n) => n.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Trip Journal</h1>

      <div className="mb-6">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a note or reminder..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-emerald-400 outline-none"
        />
        <button
          onClick={addNote}
          className="mt-2 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Note
        </button>
      </div>

      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="bg-white border border-gray-200 rounded-xl p-4">
            {editing?.id === note.id ? (
              <div>
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg resize-none outline-none text-sm"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={saveEdit} className="flex items-center gap-1 text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg"><Check size={12} /> Save</button>
                  <button onClick={() => setEditing(null)} className="flex items-center gap-1 text-xs border border-gray-200 px-3 py-1.5 rounded-lg"><X size={12} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(note.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditing({ id: note.id, content: note.content })} className="text-gray-400 hover:text-emerald-500"><Pencil size={14} /></button>
                  <button onClick={() => remove(note.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {notes.length === 0 && <p className="text-center text-gray-400 py-8">No notes yet.</p>}
      </div>
    </div>
  );
}
```

---

### Screen 11 — Public Shared Trip Page

**`client/src/pages/trips/SharedTripPage.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tripsService } from '../../services/trips.service.js';
import { MapPin, Calendar, Copy, Check } from 'lucide-react';

export default function SharedTripPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    tripsService.getPublic(tripId)
      .then(async (r) => {
        setTrip(r.data.data);
        const stopsRes = await tripsService.getStops(tripId);
        const raw = stopsRes.data.data;
        const withActs = await Promise.all(
          raw.map((s) =>
            tripsService.getActivities(tripId, s.stop.id)
              .then((a) => ({ ...s, activities: a.data.data }))
          )
        );
        setStops(withActs);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [tripId]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;
  if (notFound) return <div className="text-center py-20 text-gray-400"><MapPin size={48} className="mx-auto mb-4 opacity-30" /><p>This trip is not public or doesn't exist.</p></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Trip Banner */}
      {trip.coverPhoto && <img src={trip.coverPhoto} alt={trip.name} className="w-full h-48 object-cover rounded-2xl mb-6" />}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
            <Calendar size={14} />
            <span>{new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</span>
          </div>
          {trip.description && <p className="text-gray-500 mt-2">{trip.description}</p>}
        </div>
        <button
          onClick={copyLink}
          className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Stops */}
      <div className="space-y-4">
        {stops.map((s, idx) => (
          <div key={s.stop.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border-b border-gray-100">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">{idx + 1}</span>
              <div>
                <p className="font-semibold text-gray-800">{s.city?.name}</p>
                <p className="text-xs text-gray-400">{s.city?.country}</p>
              </div>
            </div>
            {s.activities.length > 0 && (
              <div className="px-4 py-3 space-y-2">
                {s.activities.map((a) => (
                  <div key={a.id} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-700">{a.name}</span>
                    <span className="text-gray-400 text-xs capitalize">{a.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 7. Add Routes to `AppRoutes.jsx`

```jsx
// Add these imports:
import MyTripsPage from '../pages/trips/MyTripsPage.jsx';
import CreateTripPage from '../pages/trips/CreateTripPage.jsx';
import ItineraryBuilderPage from '../pages/trips/ItineraryBuilderPage.jsx';
import BudgetPage from '../pages/trips/BudgetPage.jsx';
import PackingPage from '../pages/trips/PackingPage.jsx';
import NotesPage from '../pages/trips/NotesPage.jsx';
import SharedTripPage from '../pages/trips/SharedTripPage.jsx';

// Inside the PrivateRoute > DashboardLayout block:
<Route path="/trips" element={<MyTripsPage />} />
<Route path="/trips/new" element={<CreateTripPage />} />
<Route path="/trips/:tripId/builder" element={<ItineraryBuilderPage />} />
<Route path="/trips/:tripId/budget" element={<BudgetPage />} />
<Route path="/trips/:tripId/packing" element={<PackingPage />} />
<Route path="/trips/:tripId/notes" element={<NotesPage />} />

// OUTSIDE PrivateRoute (public, no auth):
<Route path="/share/:tripId" element={<SharedTripPage />} />
```

---

## 8. Update Dashboard Home (Screen 2)

Extend `DashboardHomePage.jsx` to call the existing data:

```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, MapPin, TrendingUp } from 'lucide-react';
import useAuthStore from '../../store/auth.store.js';
import useTripsStore from '../../store/trips.store.js';

export default function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { trips, fetchTrips, loading } = useTripsStore();

  useEffect(() => { fetchTrips(); }, []);

  const upcoming = trips.filter((t) => t.status === 'planning' || t.status === 'ongoing').slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {user?.name?.split(' ')[0]} 👋
      </h1>
      <p className="text-gray-400 mt-1 mb-8">Ready to plan your next adventure?</p>

      <button
        onClick={() => navigate('/trips/new')}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold mb-8 transition-colors"
      >
        <PlusCircle size={20} /> Plan New Trip
      </button>

      {upcoming.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" /> Upcoming Trips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcoming.map((trip) => (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}/builder`)}
                className="cursor-pointer bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <MapPin size={16} className="text-emerald-500" />
                </div>
                <p className="font-semibold text-gray-800 truncate">{trip.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(trip.startDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 9. Sidebar Navigation — Add Trip Links

In `client/src/components/Sidebar.jsx`, add these nav items:

```jsx
const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'My Trips',  path: '/trips',     icon: <MapPin size={18} /> },
  { label: 'New Trip',  path: '/trips/new', icon: <PlusCircle size={18} /> },
];
```

---

## 10. Share Trip Feature (Toggle isPublic)

In `ItineraryBuilderPage.jsx`, add this button:

```jsx
const [isPublic, setIsPublic] = useState(trip?.isPublic || false);

const toggleShare = async () => {
  const newVal = !isPublic;
  await tripsService.update(tripId, { isPublic: newVal });
  setIsPublic(newVal);
  if (newVal) {
    await navigator.clipboard.writeText(`${window.location.origin}/share/${tripId}`);
    toast.success('Link copied to clipboard!');
  } else {
    toast.success('Trip is now private');
  }
};

// JSX:
<button
  onClick={toggleShare}
  className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
    isPublic ? 'bg-emerald-500 text-white border-emerald-500' : 'text-gray-600 border-gray-200 hover:bg-gray-50'
  }`}
>
  <Share2 size={14} /> {isPublic ? 'Shared' : 'Share'}
</button>
```

---

## 11. Environment Setup

**`server/.env`**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@host/traveloop
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
API_PREFIX=/api
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:3000/api
```

Verify `client/src/services/api.js` uses this env:
```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Auto-attach access token from Zustand store
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## 12. Database Migration

```bash
# From /server
npm run db:generate   # generates migration files
npm run db:migrate    # applies to Neon DB
npm run db:seed       # seeds cities (after creating seed file)
```

---

## 13. Build Order Checklist

Work through these in order to avoid blocked dependencies:

- [x] Auth (already done)
- [ ] **Step 1** — Add `trips.route.js` + `trips.service.js` → test with Postman
- [ ] **Step 2** — Add `stops.route.js` + `stops.service.js` → nest under trips
- [ ] **Step 3** — Add `activities.route.js` → nest under stops
- [ ] **Step 4** — Seed cities DB → add `cities.route.js`
- [ ] **Step 5** — Add `budget.service.js` + budget route
- [ ] **Step 6** — Add `checklist.route.js` + `notes.route.js`
- [ ] **Step 7** — Frontend: `trips.service.js` + `trips.store.js`
- [ ] **Step 8** — Frontend: `MyTripsPage` → `CreateTripPage` → `ItineraryBuilderPage`
- [ ] **Step 9** — Frontend: `BudgetPage` → `PackingPage` → `NotesPage`
- [ ] **Step 10** — Frontend: `SharedTripPage` (public route)
- [ ] **Step 11** — Wire up `AppRoutes.jsx` + `Sidebar.jsx`
- [ ] **Step 12** — Update `DashboardHomePage`
- [ ] **Step 13** — Test share/public link end-to-end