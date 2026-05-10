import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ArrowRight, PlaneTakeoff } from 'lucide-react';
import useTripsStore from '../store/trips.store.js';
import Card from './Card.jsx';

export default function TripSelector({ onSelect, title, subtitle }) {
  const navigate = useNavigate();
  const trips = useTripsStore((state) => state.trips);
  const loading = useTripsStore((state) => state.loading);
  const fetchTrips = useTripsStore((state) => state.fetchTrips);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
          <PlaneTakeoff size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No trips found</h3>
        <p className="mt-2 text-sm text-slate-500">Create your first trip to start planning.</p>
        <button
          onClick={() => navigate('/trips/new')}
          className="mt-6 text-sm font-black uppercase tracking-widest text-(--app-color-primary) hover:underline"
        >
          Create a Trip
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title || 'Select a Trip'}</h2>
        <p className="text-sm text-slate-400 font-medium">{subtitle || 'Choose a journey to manage its details.'}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {trips.map((trip) => (
          <button
            key={trip.id}
            onClick={() => onSelect(trip.id)}
            className="group flex flex-col items-start rounded-2xl border border-slate-100 bg-white p-5 text-left transition-all hover:border-(--app-color-primary) hover:shadow-md"
          >
            <div className="mb-3 flex w-full items-center justify-between">
              <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {trip.status}
              </span>
              <ArrowRight className="text-slate-200 transition-colors group-hover:text-(--app-color-primary)" size={16} />
            </div>
            
            <h4 className="line-clamp-1 text-base font-black text-slate-900 uppercase tracking-tight">{trip.name}</h4>
            
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <CalendarDays size={12} />
              <span>{new Date(trip.startDate).toLocaleDateString()}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
