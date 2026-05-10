/**
 * LandingPage — TEMPLATE
 *
 * TODO: Replace every piece of text marked with a TODO comment.
 * The structure (hero, features, CTA) is intentionally generic —
 * keep what's useful for your PS, trim the rest.
 */
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';
import ProductStory from '../../components/landing/ProductStory';

// ...
import { 
  Plane, 
  Wallet, 
  Map as MapIcon, 
  Clock, 
  Briefcase, 
  Users, 
  ArrowRight,
  Shield,
  Zap,
  Globe,
  BellRing,
  Copy,
  Check
} from 'lucide-react';

const FEATURES = [
  { icon: <Plane className="text-teal-600" />, title: 'Smart Itineraries', desc: 'Craft personalized multi-city journeys with ease using our intuitive planner.' },
  { icon: <Wallet className="text-teal-600" />, title: 'Budget Control', desc: 'Keep track of every dollar. Get real-time cost estimations for your entire trip.' },
  { icon: <MapIcon className="text-teal-600" />, title: 'Interactive Maps', desc: 'Visualize your route and stops on a beautiful, integrated map interface.' },
  { icon: <Clock className="text-teal-600" />, title: 'Daily Timelines',  desc: 'Organize your days with precision. Sync activities, transport, and rest.' },
  { icon: <Briefcase className="text-teal-600" />, title: 'Smart Checklists',  desc: 'Never forget an essential. Use curated packing lists for any destination.' },
  { icon: <Users className="text-teal-600" />, title: 'Collaboration',   desc: 'Plan together. Share your itineraries with friends and family in real-time.' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--app-gradient-shell)' }}>
      {/* Aurora background blobs */}
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-16">
        <Link to="/" className="flex items-center gap-3 logo-brand group">
          <img src="/logo.png" alt="TravLoop" className="h-12 w-12 object-contain transition-transform group-hover:scale-110" />
          <div className="flex items-baseline gap-0.5">
            <span className="text-(--app-color-text) text-lg font-black uppercase tracking-widest">Trave</span>
            <span className="logo-shield text-lg font-black uppercase tracking-widest text-(--app-color-accent)">Loop</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-(--app-color-text) hover:bg-white/60 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="rounded-xl bg-(--app-color-primary) px-5 py-2 text-sm font-bold !text-white shadow-md hover:bg-(--app-color-primary-hover) transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 flex min-h-[calc(100vh-80px)] items-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Left: Content */}
          <div className="text-left py-10 lg:py-0">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-none bg-(--app-color-primary) px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur shadow-lg">
              The Ultimate Travel Planner
            </div>

            <h1 className="mb-6 text-5xl font-black leading-[1.1] tracking-tighter text-(--app-color-text) lg:text-7xl">
              Plan Your Next<br />
              <span className="text-(--app-color-primary)">Epic Adventure.</span>
            </h1>

            <p className="mb-10 max-w-xl text-lg leading-relaxed text-(--app-color-text-muted)">
              The all-in-one platform to plan multi-city trips, manage budgets, 
              and discover hidden gems around the world.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to="/register" className="flex items-center justify-center rounded-2xl bg-(--app-color-primary) px-8 py-4 text-base font-bold !text-white shadow-xl hover:bg-(--app-color-primary-hover) transition-all hover:scale-105">
                Start Planning Now
              </Link>
              <Link to="/login" className="flex items-center justify-center rounded-2xl border border-(--app-color-border) bg-white/70 px-8 py-4 text-base font-semibold text-(--app-color-text) backdrop-blur hover:bg-white transition-colors">
                Sign In
              </Link>
            </div>
          </div>

          {/* Right: Visual Container / Mockup */}
          <div className="relative py-10 lg:py-0">
            <div className="relative overflow-hidden rounded-[3rem] border border-(--app-color-border)/30 bg-white p-2 shadow-2xl transition-transform hover:scale-[1.01]">
              <div className="h-[460px] w-full rounded-[2.5rem] relative overflow-hidden">
                <ProductStory />
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-(--app-color-accent)/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-(--app-color-primary)/10 blur-3xl" />
          </div>
        </div>
      </section>



      {/* ── Features grid ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        {/* TODO: Replace section heading */}
        <h2 className="mb-4 text-center text-3xl font-black tracking-tight text-(--app-color-text)">
          Travel Smarter, Not Harder
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-(--app-color-text-muted)">
          Stop juggling spreadsheets and notes. Get everything in one place.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat, i) => (
            <div
              key={feat.title}
              className="group relative overflow-hidden rounded-3xl border border-(--app-color-border)/50 bg-white p-8 transition-all hover:border-(--app-color-accent)/30 hover:shadow-2xl hover:-translate-y-1"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-(--app-color-canvas-glow) transition-transform group-hover:scale-110">
                {feat.icon}
              </div>
              <h3 className="mb-3 text-lg font-bold text-(--app-color-text)">{feat.title}</h3>
              <p className="text-sm leading-relaxed text-(--app-color-text-muted)">{feat.desc}</p>
              
              {/* Subtle accent line on hover */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-(--app-color-primary) to-(--app-color-accent) transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Intuitive by Design Bento Section ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-(--app-color-text) lg:text-5xl">
            Intuitive by Design
          </h2>
          <p className="mx-auto max-w-xl text-(--app-color-text-muted)">
            Every tool within TraveLoop is crafted for speed, precision, and aesthetic pleasure.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[700px]">
          {/* Column 1: Automated Budgeting */}
          <div className="md:col-span-5 rounded-[2.5rem] border border-(--app-color-border)/50 bg-white p-10 flex flex-col justify-between overflow-hidden relative group hover:shadow-2xl transition-all">
            <div className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-(--app-color-primary-soft) flex items-center justify-center text-(--app-color-primary)">
                <Wallet size={32} />
              </div>
              <h3 className="text-2xl font-black text-(--app-color-text)">Automated Budgeting</h3>
              <p className="text-(--app-color-text-muted)">Real-time cost breakdowns for every aspect of your journey.</p>
            </div>
            
            <div className="mt-12 space-y-6">
              <div className="flex items-end gap-3 h-48">
                <div className="flex-1 bg-(--app-color-primary)/20 rounded-t-xl h-[40%] hover:bg-(--app-color-primary) transition-all cursor-pointer" />
                <div className="flex-1 bg-(--app-color-primary)/40 rounded-t-xl h-[85%] hover:bg-(--app-color-primary) transition-all cursor-pointer" />
                <div className="flex-1 bg-(--app-color-primary)/10 rounded-t-xl h-[25%] hover:bg-(--app-color-primary) transition-all cursor-pointer" />
                <div className="flex-1 bg-(--app-color-primary)/60 rounded-t-xl h-[60%] hover:bg-(--app-color-primary) transition-all cursor-pointer" />
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-(--app-color-text-muted) pt-2">
                <span>Transport</span>
                <span>Stay</span>
                <span>Dining</span>
                <span>Misc</span>
              </div>
            </div>
          </div>

          {/* Column 2 Center */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Dynamic City Discovery */}
            <div className="flex-1 rounded-[2.5rem] overflow-hidden relative group">
              <img 
                src="/images/paris_destination.jpg" 
                alt="Paris" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-(--app-color-primary)/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                  <h4 className="text-white text-xl font-bold">Paris, FR</h4>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Luxury Destination</p>
                </div>
                <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-full text-[10px] font-bold">$$$</span>
              </div>
            </div>
            
            {/* Collaborative Itineraries */}
            <div className="flex-1 rounded-[2.5rem] border border-(--app-color-border)/50 bg-white p-8 flex flex-col justify-between group hover:shadow-xl transition-all">
              <div className="space-y-2">
                <h4 className="text-xl font-black text-(--app-color-text)">Public View</h4>
                <p className="text-sm text-(--app-color-text-muted)">Share your plans with clients or friends effortlessly.</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 bg-slate-50 border border-(--app-color-border) px-4 py-2.5 rounded-xl text-xs truncate text-(--app-color-text-muted)">
                  traveloop.com/itinerary/luxury-alps
                </div>
                <button className="p-2.5 border border-(--app-color-primary) text-(--app-color-primary) rounded-xl hover:bg-(--app-color-primary) hover:!text-white transition-colors">
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Column 3: Premium Tools */}
          <div className="md:col-span-3 rounded-[2.5rem] border border-(--app-color-border)/50 bg-white p-8 flex flex-col gap-8 hover:shadow-xl transition-all">
            <h3 className="text-xl font-black text-(--app-color-text)">Planning Tools</h3>
            
            {/* Budget Alert Widget */}
            <div className="bg-red-50 p-5 rounded-3xl border border-red-100 space-y-3">
              <div className="flex justify-between items-start">
                <BellRing className="text-red-500" size={20} />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Alert</span>
              </div>
              <p className="text-sm font-bold text-red-900">Budget Over: Transport</p>
              <p className="text-[10px] text-red-700 leading-relaxed">Flight costs to London exceed limit by $240.</p>
              <div className="h-1.5 w-full bg-red-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-full" />
              </div>
            </div>

            {/* Checklist Widget */}
            <div className="flex-1 flex flex-col">
              <p className="text-[10px] font-bold text-(--app-color-text-muted) mb-4 uppercase tracking-widest">Packing List</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-sm text-(--app-color-text-muted) line-through">Passport & Visa</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-(--app-color-border)" />
                  <span className="text-sm text-(--app-color-text)">Digital Itinerary</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-(--app-color-border)" />
                  <span className="text-sm text-(--app-color-text)">Luxury Watch Set</span>
                </div>
              </div>
              <button className="mt-auto w-full py-3 border border-(--app-color-border) rounded-2xl text-[10px] font-bold uppercase tracking-widest text-(--app-color-primary) hover:bg-(--app-color-primary-soft) transition-all">
                Manage Widgets
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 py-16 text-center">
        {/* TODO: Replace CTA text */}
        <h2 className="mb-4 text-3xl font-black text-(--app-color-text)">Ready for your next trip?</h2>
        <p className="mb-8 text-(--app-color-text-muted)">Join Traveloop today and start exploring.</p>
        <Link to="/register" className="rounded-2xl bg-(--app-color-primary) px-10 py-4 text-base font-bold !text-white shadow-xl hover:bg-(--app-color-primary-hover) transition-all hover:scale-105">
          Start Now
        </Link>
      </section>

      <Footer />
    </div>
  );
}

