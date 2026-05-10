// client/src/pages/search/ActivitySearchPage.jsx
// Screen 8: Activity Search — standalone page (separate from the itinerary builder panel)
// Browse & search activities by city/type/budget, then add directly to a trip stop

import { useEffect, useState } from 'react';
import {
  Search, Plus, Check, Utensils, Camera, Bus, Compass,
  Leaf, Landmark, ShoppingBag, MoreHorizontal, DollarSign,
  Clock, Sliders, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import { activitiesService } from '../../services/activities.service.js';
import { tripsService } from '../../services/trips.service.js';
import { stopsService } from '../../services/stops.service.js';

// ─── Config ───────────────────────────────────────────────────────────────────

const ACTIVITY_TYPES = [
  { id: 'any',         label: 'All',         icon: Sliders },
  { id: 'sightseeing', label: 'Sightseeing', icon: Camera },
  { id: 'food',        label: 'Food',        icon: Utensils },
  { id: 'adventure',   label: 'Adventure',   icon: Compass },
  { id: 'culture',     label: 'Culture',     icon: Landmark },
  { id: 'relaxation',  label: 'Relax',       icon: Leaf },
  { id: 'transport',   label: 'Transport',   icon: Bus },
  { id: 'shopping',    label: 'Shopping',    icon: ShoppingBag },
  { id: 'other',       label: 'Other',       icon: MoreHorizontal },
];

const BUDGET_LEVELS = [
  { id: 'any',    label: 'Any Budget' },
  { id: 'low',    label: 'Budget (< $20)' },
  { id: 'medium', label: 'Mid-range' },
  { id: 'high',   label: 'Splurge' },
];

const TYPE_COLORS = {
  sightseeing: 'bg-sky-100 text-sky-700',
  food:        'bg-orange-100 text-orange-700',
  transport:   'bg-slate-100 text-slate-700',
  adventure:   'bg-rose-100 text-rose-700',
  relaxation:  'bg-green-100 text-green-700',
  culture:     'bg-purple-100 text-purple-700',
  shopping:    'bg-pink-100 text-pink-700',
  other:       'bg-gray-100 text-gray-700',
};

function fmtMoney(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v || 0));
}

// ─── Activity Card ─────────────────────────────────────────────────────────────

function ActivityCard({ activity, onAdd, addedIds }) {
  const color = TYPE_COLORS[activity.type] || TYPE_COLORS.other;
  const isAdded = addedIds.has(`${activity.name}-${activity.type}`);

  return (
    <Card className="flex flex-col gap-3 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-bold text-(--app-color-text)">{activity.name}</h4>
          {activity.notes && (
            <p className="mt-1 text-sm text-(--app-color-text-muted) line-clamp-2">{activity.notes}</p>
          )}
        </div>
        <button
          onClick={() => onAdd(activity)}
          disabled={isAdded}
          className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            isAdded
              ? 'bg-green-100 text-green-600'
              : 'bg-(--app-color-primary-soft) text-(--app-color-primary) hover:bg-(--app-color-primary) hover:text-white'
          }`}
          title={isAdded ? 'Added' : 'Add to selected stop'}
        >
          {isAdded ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
          {activity.type}
        </span>
        {activity.duration && (
          <span className="flex items-center gap-1 text-xs text-(--app-color-text-muted)">
            <Clock size={11} />
            {activity.duration}
          </span>
        )}
        <span className="flex items-center gap-1 text-xs font-semibold text-(--app-color-text)">
          <DollarSign size={11} />
          {activity.cost === 0 ? (
            <span className="text-green-600">Free</span>
          ) : (
            fmtMoney(activity.cost)
          )}
        </span>
      </div>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ActivitySearchPage() {
  // Search state
  const [city, setCity]           = useState('');
  const [selectedType, setType]   = useState('any');
  const [selectedBudget, setBudget] = useState('any');
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Trip/Stop selector (so user can add found activities to a specific stop)
  const [trips, setTrips]         = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [stops, setStops]         = useState([]);
  const [selectedStopId, setSelectedStopId] = useState('');
  const [addedIds, setAddedIds]   = useState(new Set());

  // Load user trips on mount
  useEffect(() => {
    tripsService.getAll()
      .then((res) => setTrips(res.data.data || []))
      .catch(() => {});
  }, []);

  // Load stops when trip changes
  useEffect(() => {
    if (!selectedTripId) { setStops([]); setSelectedStopId(''); return; }
    stopsService.getAll(selectedTripId)
      .then((res) => {
        setStops(res.data.data || []);
        setSelectedStopId('');
      })
      .catch(() => {});
  }, [selectedTripId]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!city.trim()) { toast.error('Enter a city to search.'); return; }

    setSearching(true);
    setHasSearched(true);
    try {
      const res = await activitiesService.searchIdeas({
        city: city.trim(),
        type: selectedType === 'any' ? '' : selectedType,
        budget: selectedBudget === 'any' ? 'medium' : selectedBudget,
        limit: 12,
      });
      setResults(res.data.data || []);
      if ((res.data.data || []).length === 0) toast('No ideas found. Try a broader search.', { icon: '🔍' });
    } catch {
      toast.error('Search failed. Check your connection.');
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(activity) {
    if (!selectedStopId) {
      toast.error('Select a trip and stop first to add activities.');
      return;
    }

    try {
      await activitiesService.create(selectedTripId, selectedStopId, {
        name: activity.name,
        type: activity.type,
        cost: activity.cost || 0,
        duration: activity.duration || '',
        notes: activity.notes || '',
      });
      // Mark as added
      setAddedIds((prev) => new Set([...prev, `${activity.name}-${activity.type}`]));
      toast.success(`"${activity.name}" added to your stop!`);
    } catch {
      toast.error('Failed to add activity. Make sure a stop is selected.');
    }
  }

  const selectedStop = stops.find((s) => s.id === selectedStopId);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <PageHeader
        title="Activity Search"
        subtitle="Discover experiences for any city and add them directly to your trip stops."
      />

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* ── Left panel: Search controls ─────────────────────────── */}
        <div className="space-y-6">
          {/* Search form */}
          <Card className="p-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Search Filters</h3>
            <form onSubmit={handleSearch} className="space-y-5">
              <Input
                label="City"
                placeholder="e.g. Tokyo, Barcelona…"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                icon={Search}
                required
              />

              {/* Type chips */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Activity Type</p>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_TYPES.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setType(id)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedType === id
                          ? 'border-(--app-color-primary) bg-(--app-color-primary) text-white'
                          : 'border-(--app-color-border) hover:bg-slate-50 text-(--app-color-text-muted)'
                      }`}
                    >
                      <Icon size={12} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget select */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Budget</p>
                <div className="grid grid-cols-2 gap-2">
                  {BUDGET_LEVELS.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBudget(id)}
                      className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                        selectedBudget === id
                          ? 'border-(--app-color-primary) bg-(--app-color-primary-soft) text-(--app-color-primary)'
                          : 'border-(--app-color-border) hover:bg-slate-50 text-(--app-color-text-muted)'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" loading={searching} fullWidth>
                <Search size={15} />
                Find Activities
              </Button>
            </form>
          </Card>

          {/* Add-to-trip selector */}
          <Card className="p-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Add to Trip</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-(--app-color-text-muted)">Select Trip</label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full rounded-xl border border-(--app-color-border) bg-white px-3 py-2.5 text-sm"
                >
                  <option value="">— Choose a trip —</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {stops.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-(--app-color-text-muted)">Select Stop</label>
                  <select
                    value={selectedStopId}
                    onChange={(e) => setSelectedStopId(e.target.value)}
                    className="w-full rounded-xl border border-(--app-color-border) bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="">— Choose a stop —</option>
                    {stops.map((s) => (
                      <option key={s.id} value={s.id}>{s.city?.name || `Stop ${s.order}`}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedStop && (
                <div className="rounded-xl bg-(--app-color-primary-soft) px-4 py-3 text-sm">
                  <p className="font-semibold text-(--app-color-primary)">
                    Adding to: {selectedStop.city?.name}
                  </p>
                  <p className="text-xs text-(--app-color-text-muted)">Click + on any result card to add it here.</p>
                </div>
              )}

              {!selectedTripId && (
                <p className="text-xs text-(--app-color-text-muted)">Select a trip and stop to enable adding activities.</p>
              )}
            </div>
          </Card>
        </div>

        {/* ── Right panel: Results ─────────────────────────────────── */}
        <div className="space-y-4">
          {!hasSearched && (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-(--app-color-border) py-24">
              <Search className="mb-4 text-(--app-color-text-muted)" size={40} />
              <p className="text-lg font-bold text-(--app-color-text)">Search for activities</p>
              <p className="mt-1 text-sm text-(--app-color-text-muted)">
                Enter a city and hit &quot;Find Activities&quot; to explore ideas.
              </p>
            </div>
          )}

          {hasSearched && !searching && results.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-(--app-color-border) py-24">
              <X className="mb-4 text-(--app-color-text-muted)" size={40} />
              <p className="text-lg font-bold text-(--app-color-text)">No results</p>
              <p className="mt-1 text-sm text-(--app-color-text-muted)">Try a different city or broader filters.</p>
            </div>
          )}

          {searching && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          )}

          {!searching && results.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-(--app-color-text-muted)">
                  {results.length} ideas for <strong className="text-(--app-color-text)">{city}</strong>
                </p>
                <button
                  onClick={() => { setResults([]); setHasSearched(false); setAddedIds(new Set()); }}
                  className="text-xs text-(--app-color-text-muted) hover:text-(--app-color-text)"
                >
                  Clear
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map((activity, i) => (
                  <ActivityCard
                    key={`${activity.name}-${i}`}
                    activity={activity}
                    onAdd={handleAdd}
                    addedIds={addedIds}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}