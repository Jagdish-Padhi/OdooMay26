/**
 * DashboardHomePage — TEMPLATE
 *
 * This is your main dashboard view after login.
 *
 * TODO:
 *  1. Replace the StatCard data with real metrics from your API
 *  2. Replace the "Recent Activity" table with your domain's data
 *  3. Add charts/widgets relevant to your PS
 *  4. Wire up API calls using the api service
 *
 * Pattern: fetch data in useEffect → store in local state → render.
 */
import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  CheckSquare, 
  Calendar,
  Clock,
  Plus
} from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import useAuthStore from '../../store/auth.store.js';

// TODO: Replace with real stats from your API
const MOCK_STATS = [
  { label: 'Total Trips',   value: '0', change: '+0%',  trend: 'up', icon: Briefcase },
  { label: 'Upcoming Stops', value: '0', change: '+0%',  trend: 'up', icon: MapPin },
  { label: 'Total Budget',   value: '$0', change: '0%',   trend: 'neutral', icon: DollarSign },
  { label: 'Packing Items',  value: '0', change: '-0%',  trend: 'down', icon: CheckSquare },
];

// TODO: Replace with real recent-activity data from your API
const MOCK_ACTIVITY = [
  { id: 1, label: 'Trip to Paris created',   time: 'Just now',   status: 'active' },
  { id: 2, label: 'Added Eiffel Tower to itinerary',   time: '5 mins ago', status: 'done' },
  { id: 3, label: 'Packing list updated', time: '1 hr ago',   status: 'done' },
];

const STATUS_STYLES = {
  active: 'bg-rose-50 text-rose-700 border-rose-100 font-bold px-2.5 py-0.5 rounded-full border text-[10px] uppercase tracking-wider',
  done: 'bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-2.5 py-0.5 rounded-full border text-[10px] uppercase tracking-wider',
  pending: 'bg-amber-50 text-amber-700 border-amber-100 font-bold px-2.5 py-0.5 rounded-full border text-[10px] uppercase tracking-wider',
};


export default function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);
  const [stats] = useState(MOCK_STATS);
  const [activity] = useState(MOCK_ACTIVITY);

  // TODO: Replace mock data with real API calls
  // useEffect(() => {
  //   async function load() {
  //     const res = await api.get('/dashboard/stats');
  //     setStats(res.data.stats);
  //   }
  //   load();
  // }, []);

  return (
    <div className="space-y-8">
      {/* TODO: Replace title/subtitle */}
      <PageHeader
        title={`Welcome back, ${user?.name ?? 'Traveler'}`}
        subtitle="Your journey starts here. Where are we going next?"
      />


      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} trend={s.change} trendUp={s.trend === 'up'} icon={s.icon} />
        ))}
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-(--app-color-border) bg-white p-6 shadow-sm">
        {/* TODO: Replace heading */}
        <h3 className="mb-4 text-base font-bold text-(--app-color-text)">Recent Activity</h3>
        <ul className="divide-y divide-(--app-color-border)">
          {activity.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3">
              <div>
                {/* TODO: Replace with real activity description */}
                <p className="text-sm font-medium text-(--app-color-text)">{item.label}</p>
                <p className="text-xs text-(--app-color-text-muted)">{item.time}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[item.status] || STATUS_STYLES.done}`}>
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* TODO: Add more widgets/charts/tables relevant to your PS here */}
    </div>
  );
}
