import { useEffect, useState } from 'react';
import { 
  Users, 
  Map, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  Star,
  Flag,
  FileText,
  PieChart
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../../components/PageHeader.jsx';
import Card from '../../components/Card.jsx';
import api from '../../services/api.js';
import { AdminSkeleton } from '../../components/skeletons/AdminSkeleton.jsx';
import UserManagement from './UserManagement.jsx';
import ContentModeration from './ContentModeration.jsx';
import AuditLogs from './AuditLogs.jsx';

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
  const [activeTab, setActiveTab] = useState('overview');

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
    if (activeTab === 'overview') fetchStats();
    else setLoading(false);
  }, [activeTab]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'users', label: 'Explorers', icon: Users },
    { id: 'moderation', label: 'Moderation', icon: Flag },
    { id: 'logs', label: 'Audit Logs', icon: FileText },
  ];

  if (loading && activeTab === 'overview') {
    return (
      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        <AdminSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <PageHeader 
          title="Platform Oversight" 
          subtitle="Real-time monitoring of global traveler engagement and trip trends."
        />
        
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-(--app-color-primary) shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Stats */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats?.summary.map((stat, idx) => (
              <Card key={idx} className="p-8 group hover:border-(--app-color-primary) transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">{stat.label}</p>
                    <p className="mt-2 text-4xl font-black text-(--app-color-text)">{stat.value.toLocaleString()}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    idx === 0 ? 'bg-blue-50 text-blue-600' : 
                    idx === 1 ? 'bg-purple-50 text-purple-600' : 
                    idx === 2 ? 'bg-emerald-50 text-emerald-600' : 
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {idx === 0 ? <Users size={24} /> : 
                     idx === 1 ? <Map size={24} /> : 
                     idx === 2 ? <Globe size={24} /> : 
                     <Flag size={24} />}
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
                {stats?.userGrowth?.map((g, i) => (
                  <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
                    <div 
                      className="w-full rounded-t-lg bg-(--app-color-primary-soft) transition-all group-hover:bg-(--app-color-primary)" 
                      style={{ height: `${(g.count / Math.max(1, ...stats.userGrowth.map(x => x.count))) * 100}%` }}
                    />
                    <span className="text-[10px] font-bold uppercase text-slate-400">{g.month}</span>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-[8px] font-bold text-white opacity-0 group-hover:opacity-100 pointer-events-none">
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
                {stats?.popularCities?.map((city, idx) => (
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
                        style={{ width: `${(city.count / Math.max(1, ...stats.popularCities.map(c => c.count))) * 100}%` }}
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
              <div className="space-y-3">
                {stats?.recentUsers?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-2xl border border-(--app-color-border) px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-(--app-color-text)">{user.name}</p>
                      <p className="truncate text-xs text-(--app-color-text-muted)">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                        {user.role}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'moderation' && <ContentModeration />}
      {activeTab === 'logs' && <AuditLogs />}
    </div>
  );
}
