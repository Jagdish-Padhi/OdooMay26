import { useState, useEffect } from 'react';
import { 
  Users, 
  Map, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  MoreVertical,
  Activity,
  Globe
} from 'lucide-react';

import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import api from '../../services/api.js';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <PageHeader 
        title="Platform Oversight" 
        subtitle="Real-time monitoring of global traveler engagement and trip trends."
      />

      {/* Top Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        {/* User Growth Chart Placeholder */}
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{city.count} Recent Trips</p>
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

      {/* User Management Table Shell */}
      <Card className="overflow-hidden border-none shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-8 bg-white">
          <h3 className="text-lg font-bold">Recent Signups</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter users..."
              className="h-10 rounded-xl border border-slate-200 pl-10 pr-4 text-xs font-medium focus:border-(--app-color-primary) focus:ring-4 focus:ring-(--app-color-primary-soft)"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="px-8 py-4">Explorer</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Joined</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200" />
                      <div>
                        <p className="text-sm font-bold text-(--app-color-text)">Explorer #{i}</p>
                        <p className="text-xs text-(--app-color-text-muted)">explorer{i}@example.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                      <Activity size={10} /> Active
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500 font-medium">May {10-i}, 2026</td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-slate-300 hover:text-slate-600 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
