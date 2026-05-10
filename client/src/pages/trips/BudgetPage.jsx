import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, BarChart3, Bike, Briefcase, CalendarDays, Home, Utensils, TrendingUp, DollarSign, PieChart as PieIcon, Hotel, Car, Ticket, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../../components/Card.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import Button from '../../components/Button.jsx';
import { FormSkeleton } from '../../components/skeletons/FormSkeleton.jsx';
import { tripsService } from '../../services/trips.service.js';
import { stopsService } from '../../services/stops.service.js';
import useDownloadStore from '../../store/download.store.js';

const BREAKDOWN_META = {
  accommodation: { label: 'Accommodation', icon: Home, color: 'bg-indigo-500' },
  food: { label: 'Food & Dining', icon: Utensils, color: 'bg-orange-500' },
  transport: { label: 'Transportation', icon: Bike, color: 'bg-sky-500' },
  activities: { label: 'Activities', icon: Briefcase, color: 'bg-emerald-500' },
};

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function BudgetPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(Boolean(tripId));
  const [budgetData, setBudgetData] = useState(null);
  const startDownload = useDownloadStore(s => s.startDownload);
  
  useEffect(() => {
    let alive = true;

    async function load() {
      if (!tripId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [tripResponse, budgetResponse, stopsResponse] = await Promise.all([
          tripsService.getOne(tripId),
          tripsService.getBudget(tripId),
          stopsService.getAll(tripId),
        ]);

        if (!alive) return;

        setTrip(tripResponse.data.data);
        setBudget(budgetResponse.data.data);
        setStops(stopsResponse.data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load budget.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [tripId]);

  const stats = useMemo(() => {
    if (!budget) return [];

    return [
      { label: 'Total Estimate', value: formatMoney(budget.total), icon: BarChart3, tone: 'text-emerald-600 bg-emerald-50' },
      { label: 'Per Day', value: formatMoney(budget.perDay), icon: CalendarDays, tone: 'text-blue-600 bg-blue-50' },
      { label: 'Destinations', value: String(stops.length), icon: ArrowRight, tone: 'text-purple-600 bg-purple-50' },
    ];
  }, [budget, stops.length]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-12">
        <FormSkeleton />
      </div>
    );
  }

  if (!tripId) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-12">
        <PageHeader
          title="Financial Planning"
          subtitle="Open a specific trip to see the budget engine in action."
        />
        <Card className="p-8 text-center">
          <p className="text-sm text-(--app-color-text-muted)">Budget calculations are trip-specific. Open a trip from the Trips page or the itinerary builder.</p>
        </Card>
      </div>
    );
  }

  if (!budget || !trip) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <PageHeader
        title={`${trip.name} Budget`}
        subtitle="Automatic budget estimations based on city cost index, stay length, and planned activities."
      />

      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.tone}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-(--app-color-text-muted)">{stat.label}</p>
                <p className="text-2xl font-black text-(--app-color-text)">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-xl font-bold text-(--app-color-text)">Cost Breakdown</h3>
            <BarChart3 className="text-slate-300" size={24} />
          </div>

          <div className="space-y-8">
            {Object.entries(BREAKDOWN_META).map(([key, meta]) => {
              const value = Number(budget.breakdown?.[key] || 0);
              const percentage = budget.total > 0 ? (value / budget.total) * 100 : 0;
              return (
                <div key={key} className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${meta.color}`} />
                      <span className="text-sm font-bold text-(--app-color-text)">{meta.label}</span>
                    </div>
                    <span className="text-sm font-black text-(--app-color-text)">{formatMoney(value)}</span>
                  </div>
                  <ProgressBar value={percentage} className="h-3 rounded-full" />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="mb-6 text-lg font-bold text-(--app-color-text)">By City</h3>
          <div className="space-y-4">
            {budget.stops?.map((stop) => (
              <div key={stop.stopId} className="flex items-center justify-between gap-4 rounded-2xl border border-(--app-color-border) px-4 py-3">
                <div>
                  <p className="font-semibold text-(--app-color-text)">{stop.cityName}</p>
                  <p className="text-xs text-(--app-color-text-muted)">{stop.days} day{stop.days === 1 ? '' : 's'} · {String(stop.costIndex).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-(--app-color-text)">{formatMoney(stop.accommodation + stop.food + stop.transport)}</p>
                  <p className="text-[10px] uppercase tracking-widest text-(--app-color-text-muted)">city subtotal</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-(--app-color-primary) to-(--app-color-accent) p-8 text-white">
          <h4 className="mb-2 text-lg font-bold">Ready to travel?</h4>
          <p className="mb-6 text-sm text-white/80">Export this budget as a CSV or PDF for your travel group.</p>
          <Button 
            variant="tertiary" 
            className="w-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => startDownload('Full Budget Report')}
          >
            Download Report
          </Button>
        </Card>
      </div>
    </div>
  );
}