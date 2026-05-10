import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Compass, LayoutDashboard, LogOut,
  MapPinned, Menu, PlusCircle, Search,
  Sparkles, User as UserIcon, X, CheckSquare, FileText, DollarSign, Archive,
  PanelLeftClose, PanelLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';

const userNavigationItems = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Trips', path: '/trips', icon: MapPinned },
  { label: 'AI Planner', path: '/dashboard/ai-planner', icon: Sparkles },
  { label: 'Budget', path: '/dashboard/budget', icon: DollarSign },
  { label: 'Packing List', path: '/dashboard/packing', icon: CheckSquare },
  { label: 'Trip Notes', path: '/dashboard/notes', icon: FileText },
  { label: 'Discover', path: '/discover', icon: Compass },
  { label: 'Profile', path: '/dashboard/profile', icon: UserIcon },
];

const adminNavigationItems = [
  { label: 'Admin Control', path: '/dashboard/admin', icon: BarChart3 },
  { label: 'Profile', path: '/dashboard/profile', icon: UserIcon },
];

function SidebarContent({ onNavigate, isCollapsed, onToggle }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const user      = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    clearAuth();
    toast.success('Logged out.');
    navigate('/login');
  };

  const currentNavigation = user?.role === 'admin' ? adminNavigationItems : userNavigationItems;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5">
        {!isCollapsed && (
          <Link to="/" onClick={onNavigate} className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Traveloop" className="h-14 w-14 object-contain transition-transform group-hover:scale-105" />
            <div className="flex items-baseline gap-0.5">
              <span className="text-(--app-color-text) text-xl font-black uppercase tracking-tighter">Trave</span>
              <span className="text-xl font-black uppercase tracking-tighter text-(--app-color-accent)">Loop</span>
            </div>
          </Link>
        )}
        <button 
          onClick={onToggle}
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {currentNavigation.map(({ label, path, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            onClick={onNavigate}
            title={isCollapsed ? label : ''}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              location.pathname === path
                ? 'bg-(--app-color-primary-soft) text-(--app-color-primary)'
                : 'text-(--app-color-text-muted) hover:bg-(--app-color-surface-elevated) hover:text-(--app-color-text)'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      <div className={`border-t border-(--app-color-border) p-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
        {!isCollapsed ? (
          <div className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2 bg-slate-50/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--app-color-primary-soft) text-xs font-black text-(--app-color-primary)">
              {user?.name?.[0]?.toUpperCase() ?? 'T'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">{user?.name}</p>
            </div>
          </div>
        ) : (
           <div className="h-8 w-8 rounded-full bg-(--app-color-primary-soft) flex items-center justify-center text-(--app-color-primary) text-[10px] font-black mb-4">
             {user?.name?.[0]?.toUpperCase()}
           </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 ${isCollapsed ? 'justify-center' : 'w-full'}`}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isFlushMode = location.pathname.includes('/builder') || location.pathname.includes('/ai-planner');

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-(--app-color-border) bg-white/90 backdrop-blur-xl transition-all duration-300 lg:flex ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent 
          onNavigate={() => {}} 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)} 
        />
      </aside>

      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-(--app-color-border) bg-white/95 px-4 backdrop-blur lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Traveloop" className="h-8 w-8 object-contain" />
          <span className="text-base font-black uppercase tracking-tight text-slate-900">Traveloop</span>
        </Link>
        <button onClick={() => setDrawerOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
          <Menu size={20} />
        </button>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-2xl">
            <button onClick={() => setDrawerOpen(false)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} isCollapsed={false} onToggle={() => {}} />
          </aside>
        </div>
      )}

      <main className={`min-w-0 flex-1 transition-all duration-300 ${isFlushMode ? 'bg-white' : ''}`}>
        <div className="h-14 lg:hidden" />
        <div className={isFlushMode ? 'h-full w-full' : 'px-4 py-6 sm:px-6 lg:px-8 lg:py-8 mx-auto max-w-7xl'}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}