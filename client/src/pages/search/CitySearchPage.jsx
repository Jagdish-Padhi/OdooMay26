import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Globe2, MapPinned, Search, Sparkles } from 'lucide-react';

import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Input from '../../components/Input.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { TripCardSkeleton } from '../../components/skeletons/TripCardSkeleton.jsx';
import { NoCityResultsState } from '../../components/EmptyStates.jsx';
import { citiesService } from '../../services/cities.service.js';

const COST_LABELS = {
  low: 'Budget-friendly',
  medium: 'Balanced',
  high: 'Premium',
};

const COST_STYLES = {
  low: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-rose-50 text-rose-700',
};

export default function CitySearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [costIndex, setCostIndex] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    citiesService
      .search({ q: query.trim() || undefined, costIndex: costIndex || undefined, limit: 24 })
      .then((response) => {
        if (alive) setCities(response.data.data);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [query, costIndex]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <PageHeader
        title="Discover Cities"
        subtitle="Search destinations by city, country, and cost profile before you create a new trip."
        action={(
          <Button onClick={() => navigate('/trips/new')}>
            <Sparkles size={16} />
            Plan a trip
          </Button>
        )}
      />

      <Card className="p-6 md:p-7">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Input
            label="Search cities"
            placeholder="Try Paris, Japan, or beach destinations"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            icon={Search}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-(--app-color-text)">Cost index</label>
            <div className="flex h-10 flex-wrap gap-2">
              {['', 'low', 'medium', 'high'].map((value) => {
                const active = costIndex === value;
                return (
                  <button
                    key={value || 'all'}
                    type="button"
                    onClick={() => setCostIndex(value)}
                    className={`rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${active ? 'border-(--app-color-primary) bg-(--app-color-primary-soft) text-(--app-color-primary)' : 'border-(--app-color-border) text-(--app-color-text-muted) hover:bg-(--app-color-surface-elevated)'}`}
                  >
                    {value ? COST_LABELS[value] : 'All'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => <TripCardSkeleton key={i} />)}
        </div>
      ) : cities.length === 0 ? (
        <NoCityResultsState query={query} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {cities.map((city) => (
            <Card key={city.id} className="group overflow-hidden p-0 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
              <div
                className="relative h-48 overflow-hidden"
              >
                {/* Background Image with Zoom effect */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={city.imageUrl ? { backgroundImage: `linear-gradient(rgba(17,17,17,0.1), rgba(17,17,17,0.4)), url(${city.imageUrl})` } : { background: 'linear-gradient(135deg, #c9d6ff 0%, #e2e2e2 100%)' }}
                />
                
                <div className="relative flex h-full items-start justify-between p-5 text-white">
                  <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${COST_STYLES[city.costIndex] || 'bg-white/20 text-white'}`}>
                    {city.costIndex}
                  </span>
                  <span className="rounded-full bg-black/20 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md border border-white/5">
                    {city.popularity} popularity
                  </span>
                </div>
                
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="text-xl font-black uppercase tracking-tight">{city.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPinned size={12} className="text-white/60" />
                    <p className="text-xs font-bold uppercase tracking-widest text-white/80">{city.country}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <p className="text-sm leading-relaxed text-slate-500 line-clamp-2 min-h-[2.5rem] italic">
                  {city.description || 'A destination worth exploring and discovering new experiences.'}
                </p>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-4 py-2.5 text-xs border border-slate-100/50">
                    <span className="flex items-center gap-2 font-black uppercase tracking-widest text-slate-400"><Globe2 size={12} /> Cost Profile</span>
                    <span className="font-black text-slate-900 uppercase tracking-tight">{COST_LABELS[city.costIndex] || city.costIndex}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-4 py-2.5 text-xs border border-slate-100/50">
                    <span className="flex items-center gap-2 font-black uppercase tracking-widest text-slate-400"><Sparkles size={12} /> Rating</span>
                    <span className="font-black text-slate-900 uppercase tracking-tight">{city.popularity}/100</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/trips/new?destination=${encodeURIComponent(city.name)}`)}
                  className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-[10px] font-black uppercase tracking-[0.2em] !text-white transition-all hover:bg-(--app-color-primary) hover:shadow-lg active:scale-95"
                >
                  Plan this trip
                  <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1 !text-white" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}