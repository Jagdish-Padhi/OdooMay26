import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Compass, MapPin, Plus, Sparkles } from 'lucide-react';

import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { DashboardSkeleton } from '../../components/skeletons/DashboardSkeleton.jsx';
import { citiesService } from '../../services/cities.service.js';
import useTripsStore from '../../store/trips.store.js';
import useAuthStore from '../../store/auth.store.js';

const COST_LABELS = {
  low: 'Budget-friendly',
  medium: 'Balanced',
  high: 'Premium',
};


export default function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const trips = useTripsStore((state) => state.trips);
  const loading = useTripsStore((state) => state.loading);
  const fetchTrips = useTripsStore((state) => state.fetchTrips);
  const [featuredCities, setFeaturedCities] = useState([]);

  useEffect(() => {
    fetchTrips();
    citiesService
      .search({ limit: 6 })
      .then((response) => setFeaturedCities(response.data.data))
      .catch(() => setFeaturedCities([]));
  }, [fetchTrips]);

  const stats = useMemo(() => {
    const activeTrips = trips.filter((trip) => trip.status !== 'completed');
    const destinationCount = trips.reduce((total, trip) => total + (trip.destinationCount || 0), 0);
    const publicTrips = trips.filter((trip) => trip.isPublic).length;

    return [
      { label: 'Total Trips', value: String(trips.length), change: `${activeTrips.length} active`, trend: 'up', icon: Compass },
      { label: 'Destinations', value: String(destinationCount), change: `${publicTrips} shared`, trend: 'up', icon: MapPin },
      { label: 'Planning Stage', value: String(activeTrips.length), change: 'Trips in motion', trend: 'up', icon: CalendarDays },
      { label: 'Cities to Explore', value: String(featuredCities.length || 0), change: 'Suggested next', trend: 'neutral', icon: Sparkles },
    ];
  }, [trips, featuredCities.length]);

  const recentTrips = trips.slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name ?? 'Traveler'}`}
        subtitle="Plan the next trip, review saved itineraries, or jump into discovery."
        action={(
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate('/discover')}>
              Discover cities
            </Button>
            <Button onClick={() => navigate('/trips/new')}>
              <Plus size={16} />
              New trip
            </Button>
          </div>
        )}
      />

      {loading && trips.length === 0 ? <DashboardSkeleton /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            trend={stat.change}
            trendUp={stat.trend === 'up'}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card title="Recent trips" subtitle="The latest plans you can jump back into.">
          {recentTrips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-(--app-color-border) p-8 text-center">
              <p className="text-sm text-(--app-color-text-muted)">No trips yet. Create your first trip to unlock the dashboard.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTrips.map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => navigate(`/trips/new?tripId=${trip.id}`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-(--app-color-border) px-4 py-4 text-left transition-colors hover:bg-(--app-color-surface-elevated)"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-(--app-color-text)">{trip.name}</h3>
                      <span className="rounded-full bg-(--app-color-primary-soft) px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-(--app-color-primary)">
                        {trip.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-(--app-color-text-muted)">{trip.destinationCount || 0} destinations planned</p>
                  </div>
                  <ArrowRight size={16} className="text-(--app-color-text-muted)" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card title="Suggested cities" subtitle="Popular places to start your next plan.">
          <div className="space-y-3">
            {featuredCities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => navigate(`/trips/new?destination=${encodeURIComponent(city.name)}`)}
                className="flex w-full items-center justify-between rounded-2xl border border-(--app-color-border) px-4 py-3 text-left transition-colors hover:bg-(--app-color-surface-elevated)"
              >
                <div>
                  <p className="font-semibold text-(--app-color-text)">{city.name}</p>
                  <p className="text-xs text-(--app-color-text-muted)">{city.country} · {COST_LABELS[city.costIndex] || city.costIndex}</p>
                </div>
                <span className="rounded-full bg-(--app-color-surface-elevated) px-3 py-1 text-xs font-semibold text-(--app-color-text-muted)">{city.popularity}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
