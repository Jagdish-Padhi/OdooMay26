import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Compass, MapPin, PencilLine, Route, Plus, Trash2, Briefcase, DollarSign } from 'lucide-react';
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <div key={trip.id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
              {/* Premium Gradient Banner */}
              <div
                className="h-32 bg-linear-to-br from-(--app-color-primary) via-[#4a2d44] to-[#1e1b4b] relative shrink-0"
                style={trip.coverPhoto ? { backgroundImage: `linear-gradient(rgba(18,18,18,0.2), rgba(18,18,18,0.4)), url(${trip.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              >
                <div className="flex h-full items-start justify-between p-5">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md border border-white/10">
                    {trip.status}
                  </span>
                  <span className="rounded-full bg-black/20 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md border border-white/5">
                    {trip.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div className="flex flex-1 flex-col p-6 space-y-5">
                {/* Info Block */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight line-clamp-1">{trip.name}</h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
                    <CalendarDays size={12} className="text-(--app-color-primary)" />
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-slate-500 line-clamp-2 min-h-[2.5rem]">
                  {trip.description || 'Crafting the perfect itinerary for this journey.'}
                </p>

                {/* Stats Pill */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-4 py-3 border border-slate-100/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Stops</span>
                  <span className="text-sm font-black text-slate-900">{trip.destinationCount ?? 0}</span>
                </div>

                <div className="flex-1" />

                {/* Action Section */}
                <div className="space-y-3">
                  {/* Hero Button */}
                  <button 
                    onClick={() => navigate(`/trips/${trip.id}/builder`)}
                    className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-(--app-color-primary) to-[#4a2d44] p-4 text-white shadow-[0_8px_20px_rgba(107,33,168,0.2)] transition-all hover:shadow-[0_12px_25px_rgba(107,33,168,0.3)] hover:scale-[1.02] active:scale-95"
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      <Route size={16} className="transition-transform group-hover:rotate-12" />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Manage Itinerary</span>
                    </div>
                  </button>

                  {/* Module Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => navigate(`/trips/${trip.id}/budget`)}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-sm transition-all hover:border-(--app-color-primary-soft) hover:bg-slate-50 hover:shadow-md"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--app-color-primary-soft) text-(--app-color-primary)">
                        <DollarSign size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Budget</span>
                    </button>
                    <button 
                      onClick={() => navigate(`/trips/${trip.id}/packing`)}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-sm transition-all hover:border-(--app-color-primary-soft) hover:bg-slate-50 hover:shadow-md"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--app-color-primary-soft) text-(--app-color-primary)">
                        <Briefcase size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Packing</span>
                    </button>
                  </div>

                  {/* Utility Footer */}
                  <div className="flex items-center justify-between border-t border-slate-50 pt-4 px-1">
                    <button 
                      onClick={() => navigate(`/trips/new?tripId=${trip.id}`)}
                      className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-slate-900"
                    >
                      <PencilLine size={12} className="text-slate-300 transition-colors group-hover:text-(--app-color-primary)" />
                      Edit Details
                    </button>
                    <button 
                      onClick={() => handleDelete(trip)}
                      className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-red-600"
                    >
                      <Trash2 size={12} className="text-slate-200 transition-colors group-hover:text-red-500" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}