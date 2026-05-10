// client/src/pages/trips/ItineraryViewPage.jsx
// Screen 6: Itinerary View Screen — read-only timeline of the completed trip plan
// Features: day-wise layout, city headers, activity type badges, cost display, view toggle (list/timeline)

import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Calendar, DollarSign, Clock, ChevronRight,
  List, LayoutList, Pencil, Share2, CheckCircle2,
  Utensils, Camera, Bus, Compass, Leaf, Landmark,
  ShoppingBag, MoreHorizontal, ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import AiConciergeChat from '../../components/AiConciergeChat.jsx';
import { StopSkeleton } from '../../components/skeletons/StopSkeleton.jsx';
import { NoStopsEmptyState } from '../../components/EmptyStates.jsx';
import { tripsService } from '../../services/trips.service.js';
import { stopsService } from '../../services/stops.service.js';
import { activitiesService } from '../../services/activities.service.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTIVITY_META = {
  sightseeing: { label: 'Sightseeing', icon: Camera,       color: 'bg-sky-100 text-sky-700' },
  food:        { label: 'Food',        icon: Utensils,      color: 'bg-orange-100 text-orange-700' },
  transport:   { label: 'Transport',   icon: Bus,           color: 'bg-slate-100 text-slate-700' },
  adventure:   { label: 'Adventure',   icon: Compass,       color: 'bg-rose-100 text-rose-700' },
  relaxation:  { label: 'Relaxation',  icon: Leaf,          color: 'bg-green-100 text-green-700' },
  culture:     { label: 'Culture',     icon: Landmark,      color: 'bg-purple-100 text-purple-700' },
  shopping:    { label: 'Shopping',    icon: ShoppingBag,   color: 'bg-pink-100 text-pink-700' },
  other:       { label: 'Other',       icon: MoreHorizontal,color: 'bg-gray-100 text-gray-700' },
};

function ActivityBadge({ type }) {
  const meta = ACTIVITY_META[type] || ACTIVITY_META.other;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtMoney(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v || 0));
}

function daysBetween(start, end) {
  if (!start || !end) return 1;
  const diff = new Date(end) - new Date(start);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActivityRow({ activity, index }) {
  const meta = ACTIVITY_META[activity.type] || ACTIVITY_META.other;
  const Icon = meta.icon;
  return (
    <div className="flex gap-4 rounded-2xl border border-(--app-color-border) bg-(--app-color-surface-elevated) p-4 transition-shadow hover:shadow-sm">
      {/* Step indicator */}
      <div className="flex flex-col items-center gap-1">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${meta.color}`}>
          {index + 1}
        </div>
        <div className="w-px flex-1 bg-(--app-color-border)" />
      </div>
      {/* Content */}
      <div className="min-w-0 flex-1 pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-semibold text-(--app-color-text)">{activity.name}</p>
            {activity.notes && (
              <p className="mt-0.5 text-sm text-(--app-color-text-muted)">{activity.notes}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm text-(--app-color-text-muted)">
            {activity.duration && (
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {activity.duration}
              </span>
            )}
            {activity.cost > 0 && (
              <span className="flex items-center gap-1 font-semibold text-(--app-color-text)">
                <DollarSign size={13} />
                {fmtMoney(activity.cost)}
              </span>
            )}
            {activity.cost === 0 && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Free</span>
            )}
          </div>
        </div>
        <div className="mt-2">
          <ActivityBadge type={activity.type} />
        </div>
      </div>
    </div>
  );
}

function StopCard({ stop, stopIndex }) {
  const days = daysBetween(stop.arrivalDate, stop.departureDate);
  const activityCost = (stop.activities || []).reduce((sum, a) => sum + Number(a.cost || 0), 0);

  return (
    <div className="relative">
      {/* City header */}
      <div className="mb-4 flex items-center gap-3">
        {/* Timeline dot */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-(--app-color-primary) text-white shadow-sm">
          <MapPin size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-black text-(--app-color-text)">
            Stop {stopIndex + 1}: {stop.city?.name}
            {stop.city?.country && (
              <span className="ml-2 text-sm font-normal text-(--app-color-text-muted)">{stop.city.country}</span>
            )}
          </h3>
          <div className="flex flex-wrap gap-3 text-xs text-(--app-color-text-muted)">
            {stop.arrivalDate && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {fmt(stop.arrivalDate)} → {fmt(stop.departureDate)}
              </span>
            )}
            <span>{days} day{days !== 1 ? 's' : ''}</span>
            <span>{stop.activities?.length || 0} activities</span>
            {activityCost > 0 && (
              <span className="font-semibold text-(--app-color-text)">{fmtMoney(activityCost)} in activities</span>
            )}
          </div>
        </div>
      </div>

      {/* Activities */}
      {stop.activities?.length > 0 ? (
        <div className="ml-5 space-y-3 border-l-2 border-dashed border-(--app-color-border) pl-8">
          {stop.activities.map((activity, i) => (
            <ActivityRow key={activity.id} activity={activity} index={i} />
          ))}
        </div>
      ) : (
        <div className="ml-5 rounded-2xl border border-dashed border-(--app-color-border) py-6 pl-8 text-center text-sm text-(--app-color-text-muted)">
          No activities planned for this stop yet.
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ItineraryViewPage() {
  const { tripId } = useParams();

  const [trip, setTrip]   = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'list'

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [tripRes, stopsRes] = await Promise.all([
          tripsService.getOne(tripId),
          stopsService.getAll(tripId),
        ]);

        if (!alive) return;

        const rawStops = stopsRes.data.data || [];

        // Fetch activities for each stop in parallel
        const stopsWithActivities = await Promise.all(
          rawStops.map(async (stop) => {
            try {
              const actRes = await activitiesService.getAll(tripId, stop.id);
              return { ...stop, activities: actRes.data.data || [] };
            } catch {
              return { ...stop, activities: [] };
            }
          })
        );

        if (!alive) return;
        setTrip(tripRes.data.data);
        setStops(stopsWithActivities);
      } catch (err) {
        toast.error('Failed to load itinerary.');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [tripId]);

  const totalCost = useMemo(() => (
    stops.reduce((sum, stop) =>
      sum + (stop.activities || []).reduce((s, a) => s + Number(a.cost || 0), 0), 0)
  ), [stops]);

  const totalDays = useMemo(() => (
    stops.reduce((sum, stop) => sum + daysBetween(stop.arrivalDate, stop.departureDate), 0)
  ), [stops]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 pb-16">
        <StopSkeleton count={3} />
      </div>
    );
  }

  if (!trip) return null;

  const totalActivities = stops.reduce((s, stop) => s + (stop.activities?.length || 0), 0);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <AiConciergeChat tripId={tripId} tripName={trip.name} />
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Link
            to={`/trips/${tripId}/builder`}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-(--app-color-text-muted) hover:text-(--app-color-text)"
          >
            <ArrowLeft size={14} />
            Back to Builder
          </Link>
          <PageHeader
            title={trip.name}
            subtitle={trip.description || `${stops.length} stops · ${totalDays} days · ${totalActivities} activities`}
          />
        </div>
        <div className="flex gap-2">
          <Link to={`/trips/${tripId}/builder`}>
            <Button variant="secondary" size="sm">
              <Pencil size={14} />
              Edit
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const url = `${window.location.origin}/trips/public/${tripId}`;
              navigator.clipboard.writeText(url);
              toast.success('Share link copied!');
            }}
          >
            <Share2 size={14} />
            Share
          </Button>
        </div>
      </div>

      {/* Trip Summary Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Destinations', value: stops.length, icon: MapPin },
          { label: 'Total Days',   value: totalDays,    icon: Calendar },
          { label: 'Activities',   value: totalActivities, icon: CheckCircle2 },
          { label: 'Activity Cost', value: fmtMoney(totalCost), icon: DollarSign },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--app-color-primary-soft) text-(--app-color-primary)">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-(--app-color-text-muted)">{label}</p>
                <p className="text-lg font-black text-(--app-color-text)">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-(--app-color-text-muted)">View:</p>
        <div className="flex overflow-hidden rounded-xl border border-(--app-color-border)">
          {[
            { id: 'timeline', label: 'Timeline', icon: LayoutList },
            { id: 'list',     label: 'Compact',  icon: List },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-all ${
                viewMode === id
                  ? 'bg-(--app-color-primary) text-white'
                  : 'bg-white text-(--app-color-text-muted) hover:bg-slate-50'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stops */}
      {stops.length === 0 ? (
        <NoStopsEmptyState tripId={tripId} />
      ) : viewMode === 'timeline' ? (
        <div className="space-y-10">
          {stops.map((stop, i) => (
            <StopCard key={stop.id} stop={stop} stopIndex={i} />
          ))}
        </div>
      ) : (
        /* Compact list mode */
        <div className="space-y-4">
          {stops.map((stop, i) => (
            <Card key={stop.id} className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--app-color-primary) text-xs font-black text-white">
                  {i + 1}
                </span>
                <h3 className="font-bold text-(--app-color-text)">{stop.city?.name}</h3>
                <span className="text-sm text-(--app-color-text-muted)">{daysBetween(stop.arrivalDate, stop.departureDate)} days</span>
                {stop.arrivalDate && (
                  <span className="ml-auto text-sm text-(--app-color-text-muted)">
                    {fmt(stop.arrivalDate)}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {(stop.activities || []).map((a, ai) => (
                  <div key={a.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-(--app-color-text-muted)" />
                      <span className="text-(--app-color-text)">{a.name}</span>
                      <ActivityBadge type={a.type} />
                    </div>
                    <div className="flex items-center gap-3 text-(--app-color-text-muted)">
                      {a.duration && <span>{a.duration}</span>}
                      {a.cost > 0
                        ? <span className="font-semibold text-(--app-color-text)">{fmtMoney(a.cost)}</span>
                        : <span className="text-green-600">Free</span>
                      }
                    </div>
                  </div>
                ))}
                {!stop.activities?.length && (
                  <p className="text-sm text-(--app-color-text-muted)">No activities.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}