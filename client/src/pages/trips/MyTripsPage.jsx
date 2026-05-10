import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Compass, MapPin, PencilLine, Route, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import PageHeader from '../../components/PageHeader.jsx';
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
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-(--app-color-primary) border-t-transparent" />
        </div>
      ) : trips.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--app-color-primary-soft) text-(--app-color-primary)">
            <MapPin size={24} />
          </div>
          <h2 className="text-xl font-bold text-(--app-color-text)">No trips yet</h2>
          <p className="mt-2 text-sm text-(--app-color-text-muted)">Start by creating your first trip, then build out the itinerary later.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => navigate('/trips/new')}>
              <Plus size={16} />
              Create trip
            </Button>
            <Button variant="secondary" onClick={() => navigate('/discover')}>
              Browse cities
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <Card key={trip.id} className="overflow-hidden p-0">
              <div
                className="h-40 bg-linear-to-br from-(--app-color-primary) via-[#8c5c84] to-(--app-color-accent)"
                style={trip.coverPhoto ? { backgroundImage: `linear-gradient(rgba(18,18,18,0.35), rgba(18,18,18,0.55)), url(${trip.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              >
                <div className="flex h-full items-start justify-between p-4 text-white">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur">
                    {trip.status}
                  </span>
                  <span className="rounded-full bg-black/20 px-3 py-1 text-[10px] font-semibold backdrop-blur">
                    {trip.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h3 className="text-lg font-bold text-(--app-color-text)">{trip.name}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-(--app-color-text-muted)">
                    <CalendarDays size={14} />
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </p>
                </div>

                {trip.description && <p className="text-sm leading-6 text-(--app-color-text-muted)">{trip.description}</p>}

                <div className="flex items-center justify-between rounded-2xl bg-(--app-color-surface-elevated) px-4 py-3 text-sm">
                  <span className="text-(--app-color-text-muted)">Destinations planned</span>
                  <span className="font-bold text-(--app-color-text)">{trip.destinationCount ?? 0}</span>
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate(`/trips/new?tripId=${trip.id}`)}>
                    <PencilLine size={15} />
                    Edit
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => navigate(`/trips/${trip.id}/builder`)}>
                    <Route size={15} />
                    Plan
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(trip)} className="text-red-600 hover:bg-red-50">
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}