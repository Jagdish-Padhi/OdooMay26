import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Compass, MapPin, PencilLine, Route, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { TripCardSkeleton } from '../../components/skeletons/TripCardSkeleton.jsx';
import { NoTripsEmptyState } from '../../components/EmptyStates.jsx';
import useTripsStore from '../../store/trips.store.js';

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export default function MyTripsPage() {
  const navigate = useNavigate();
  const trips = useTripsStore((state) => state.trips);
  const loading = useTripsStore((state) => state.loading);
  const fetchTrips = useTripsStore((state) => state.fetchTrips);
  const deleteTrip = useTripsStore((state) => state.deleteTrip);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDelete = async (trip) => {
    const confirmed = window.confirm(`Delete ${trip.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteTrip(trip.id);
      toast.success('Trip deleted.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete trip.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <PageHeader
        title="My Trips"
        subtitle="Create, update, and review your travel plans from one place."
        action={(
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/discover')}>
              <Compass size={16} />
              Discover cities
            </Button>
            <Button onClick={() => navigate('/trips/new')}>
              <Plus size={16} />
              New trip
            </Button>
          </div>
        )}
      />

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => <TripCardSkeleton key={i} />)}
        </div>
      ) : trips.length === 0 ? (
        <NoTripsEmptyState />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <div key={trip.id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-shadow">
              {/* Banner */}
              <div
                className="h-36 bg-linear-to-br from-(--app-color-primary) via-[#8c5c84] to-(--app-color-accent) relative shrink-0"
                style={trip.coverPhoto ? { backgroundImage: `linear-gradient(rgba(18,18,18,0.35), rgba(18,18,18,0.55)), url(${trip.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              >
                <div className="flex h-full items-start justify-between p-4 text-white">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
                    {trip.status}
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
                    {trip.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5 space-y-4">
                {/* Title + Date */}
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight line-clamp-1">{trip.name}</h3>
                  <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <CalendarDays size={13} />
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </p>
                </div>

                {/* Description — always occupies space, clamped to 2 lines */}
                <p className="text-sm leading-relaxed text-slate-500 line-clamp-2 min-h-[2.75rem]">
                  {trip.description || 'No description added yet.'}
                </p>

                {/* Stats Row */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
                  <span className="text-slate-400 text-xs font-medium">Destinations</span>
                  <span className="font-black text-slate-900">{trip.destinationCount ?? 0}</span>
                </div>

                {/* Spacer pushes actions to bottom */}
                <div className="flex-1" />

                {/* Actions — always pinned to bottom */}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1 rounded-xl" onClick={() => navigate(`/trips/${trip.id}/builder`)}>
                    <Route size={14} />
                    Itinerary
                  </Button>
                  <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => navigate(`/trips/new?tripId=${trip.id}`)}>
                    <PencilLine size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-xl text-red-500 hover:bg-red-50" onClick={() => handleDelete(trip)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}