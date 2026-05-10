import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { stops, activities, cities } from '../db/schema/index.js';

// Cost multipliers per city cost index (USD per day per person)
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
