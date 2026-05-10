import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Globe2, MapPinned, Search, Sparkles } from 'lucide-react';

import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Input from '../../components/Input.jsx';
import PageHeader from '../../components/PageHeader.jsx';
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
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-(--app-color-primary) border-t-transparent" />
        </div>
      ) : cities.length === 0 ? (
        <Card className="p-10 text-center">
          <MapPinned size={30} className="mx-auto text-(--app-color-text-muted)" />
          <h2 className="mt-4 text-lg font-bold text-(--app-color-text)">No matching cities</h2>
          <p className="mt-2 text-sm text-(--app-color-text-muted)">Try a broader search term or clear the cost filter.</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cities.map((city) => (
            <Card key={city.id} className="overflow-hidden p-0">
              <div
                className="relative h-44 bg-cover bg-center"
                style={city.imageUrl ? { backgroundImage: `linear-gradient(rgba(17,17,17,0.2), rgba(17,17,17,0.55)), url(${city.imageUrl})` } : { background: 'linear-gradient(135deg, #c9d6ff 0%, #e2e2e2 100%)' }}
              >
                <div className="flex h-full items-start justify-between p-4 text-white">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${COST_STYLES[city.costIndex] || 'bg-white/20 text-white'}`}>
                    {city.costIndex}
                  </span>
                  <span className="rounded-full bg-black/20 px-3 py-1 text-[10px] font-semibold backdrop-blur">
                    {city.popularity} popularity
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className="text-xl font-black">{city.name}</h3>
                  <p className="text-sm text-white/80">{city.country}</p>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <p className="text-sm leading-6 text-(--app-color-text-muted)">{city.description || 'A destination worth exploring.'}</p>

                <div className="flex items-center justify-between rounded-2xl bg-(--app-color-surface-elevated) px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 text-(--app-color-text-muted)"><Building2 size={14} /> Country</span>
                  <span className="font-semibold text-(--app-color-text)">{city.country}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-(--app-color-surface-elevated) px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 text-(--app-color-text-muted)"><Globe2 size={14} /> Cost profile</span>
                  <span className="font-semibold text-(--app-color-text)">{COST_LABELS[city.costIndex] || city.costIndex}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-(--app-color-surface-elevated) px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 text-(--app-color-text-muted)"><Sparkles size={14} /> Popularity</span>
                  <span className="font-semibold text-(--app-color-text)">{city.popularity}</span>
                </div>

                <Button variant="secondary" fullWidth onClick={() => navigate(`/trips/new?destination=${encodeURIComponent(city.name)}`)}>
                  Plan this trip
                  <ArrowRight size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}