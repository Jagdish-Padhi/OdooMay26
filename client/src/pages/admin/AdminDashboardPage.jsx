import { useEffect, useMemo, useState } from 'react';
import { 
  Users, 
  Map, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  MoreVertical,
  Activity,
  Globe,
  MapPinned,
  CheckCircle2,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import api from '../../services/api.js';
import { AdminSkeleton } from '../../components/skeletons/AdminSkeleton.jsx';

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to fetch admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return stats?.recentUsers || [];
    return (stats?.recentUsers || []).filter((user) =>
      [user.name, user.email, user.plan].some((value) => String(value || '').toLowerCase().includes(query)),
    );
  }, [stats?.recentUsers, userSearch]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        <AdminSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <PageHeader 
        title="Platform Oversight" 
        subtitle="Real-time monitoring of global traveler engagement and trip trends."
      />

      {/* Top Stats */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats?.summary.map((stat, idx) => (
          <Card key={idx} className="p-8 group hover:border-(--app-color-primary) transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">{stat.label}</p>
                <p className="mt-2 text-4xl font-black text-(--app-color-text)">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${idx === 0 ? 'bg-blue-50 text-blue-600' : idx === 1 ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {idx === 0 ? <Users size={24} /> : idx === 1 ? <Map size={24} /> : <Globe size={24} />}
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className={`flex items-center gap-0.5 text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">vs last month</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* User Growth Chart */}
        <Card className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-lg font-bold">Explorer Onboarding</h3>
            <div className="flex gap-2">
              <button className="rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">7 Days</button>
              <button className="rounded-lg bg-(--app-color-primary) px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">30 Days</button>
            </div>
          </div>
          
          <div className="flex h-64 items-end gap-3 px-4">
            {stats?.userGrowth.map((g, i) => (
              <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
                <div 
                  className="w-full rounded-t-lg bg-(--app-color-primary-soft) transition-all group-hover:bg-(--app-color-primary)" 
                  style={{ height: `${(g.count / Math.max(...stats.userGrowth.map(x => x.count))) * 100}%` }}
                />
                <span className="text-[10px] font-bold uppercase text-slate-400">{g.month}</span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-[8px] font-bold text-white opacity-0 group-hover:opacity-100">
                  {g.count} users
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Popular Destinations */}
        <Card className="p-8">
          <h3 className="mb-6 text-lg font-bold">Trending Hotspots</h3>
          <div className="space-y-4">
            {stats?.popularCities.map((city, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-400 text-xs">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{city.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{city.country} · {city.count} trips</p>
                </div>
                <div className="h-2 w-16 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-(--app-color-accent)" 
                    style={{ width: `${(city.count / stats.popularCities[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <Card className="p-8">
          <h3 className="mb-6 text-lg font-bold">Popular Activities</h3>
          <div className="space-y-4">
            {stats?.popularActivities?.map((activity, idx) => (
              <div key={`${activity.name}-${idx}`} className="flex items-center gap-4 rounded-2xl border border-(--app-color-border) px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--app-color-primary-soft) text-(--app-color-primary)">
                  <Star size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-(--app-color-text)">{activity.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{activity.type} · {activity.count} saves</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="mb-6 text-lg font-bold">Recent Signups</h3>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Filter users..."
              className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-xs font-medium focus:border-(--app-color-primary) focus:ring-4 focus:ring-(--app-color-primary-soft)"
            />
          </div>
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-2xl border border-(--app-color-border) px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-(--app-color-text)">{user.name}</p>
                  <p className="truncate text-xs text-(--app-color-text-muted)">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${user.plan === 'pro' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {user.plan}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
}
