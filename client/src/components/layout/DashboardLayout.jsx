import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Compass, LayoutDashboard, LogOut,
  MapPinned, Menu, PlusCircle, Search,
  Sparkles, User as UserIcon, X, CheckSquare, FileText, DollarSign, Archive
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';

const navigationItems = [
  { label: 'Activities',     path: '/discover/activities',    icon: Search },
  { label: 'Profile',        path: '/dashboard/profile',      icon: UserIcon },
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Trips', path: '/trips', icon: MapPinned },
  { label: 'New Trip', path: '/trips/new', icon: PlusCircle },
  { label: 'Discover', path: '/discover', icon: Compass },
  { label: 'Profile', path: '/dashboard/profile', icon: UserIcon },
  { label: 'AI Assistant', path: '/dashboard/ai-planner', icon: Sparkles },
  { label: 'Budget', path: '/dashboard/budget', icon: DollarSign },
  { label: 'Reports Gallery', path: '/dashboard/reports', icon: Archive },
  { label: 'Packing List', path: '/dashboard/packing', icon: CheckSquare },
  { label: 'Trip Notes', path: '/dashboard/notes', icon: FileText },
  { label: 'Admin', path: '/dashboard/admin', icon: BarChart3 },
];

function SidebarContent({ onNavigate }) {
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

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-3 px-6 py-5 group"
      >
        <img src="/logo.png" alt="Traveloop" className="h-10 w-10 object-contain transition-transform group-hover:scale-110" />
        <div className="flex items-baseline gap-0.5">
          <span className="text-(--app-color-text) text-lg font-black uppercase tracking-tight">Trave</span>
          <span className="text-lg font-black uppercase tracking-tight text-(--app-color-accent)">Loop</span>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {navigationItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-(--app-color-primary-soft) text-(--app-color-primary)'
                  : 'text-(--app-color-text-muted) hover:bg-(--app-color-surface-elevated) hover:text-(--app-color-text)'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-(--app-color-border) p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--app-color-primary-soft) text-xs font-black text-(--app-color-primary)">
            {user?.name?.[0]?.toUpperCase() ?? 'T'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-(--app-color-text)">{user?.name}</p>
            <p className="truncate text-xs text-(--app-color-text-muted)">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--app-gradient-shell)' }}>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-(--app-color-border) bg-white/90 backdrop-blur lg:flex">
        <SidebarContent onNavigate={() => {}} />
      </aside>

      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-(--app-color-border) bg-white/95 px-4 backdrop-blur lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Traveloop" className="h-8 w-8 object-contain" />
          <span className="text-base font-black uppercase tracking-tight text-(--app-color-text)">Traveloop</span>
        </Link>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-(--app-color-text-muted) hover:bg-(--app-color-surface-elevated)"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
      </div>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-2xl">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-(--app-color-text-muted) hover:bg-slate-100"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>

            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <div className="h-14 lg:hidden" />

        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}