/**
 * LandingPage — TEMPLATE
 *
 * TODO: Replace every piece of text marked with a TODO comment.
 * The structure (hero, features, CTA) is intentionally generic —
 * keep what's useful for your PS, trim the rest.
 */
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';

// TODO: Replace these with your real feature cards
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
  Globe
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
          <Link to="/register" className="rounded-xl bg-(--app-color-primary) px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-(--app-color-primary-hover) transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: Content */}
          <div className="text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--app-color-border) bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-(--app-color-primary) backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-(--app-color-primary)" />
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
              <Link to="/register" className="flex items-center justify-center gap-2 rounded-2xl bg-(--app-color-primary) px-8 py-4 text-base font-bold text-white shadow-xl hover:bg-(--app-color-primary-hover) transition-all hover:scale-105">
                Start Planning Now
                <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="flex items-center justify-center rounded-2xl border border-(--app-color-border) bg-white/70 px-8 py-4 text-base font-semibold text-(--app-color-text) backdrop-blur hover:bg-white transition-colors">
                Sign In
              </Link>
            </div>
          </div>

          {/* Right: Visual Container / Mockup */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-sm">
              <div className="aspect-[4/3] w-full rounded-[2rem] bg-gradient-to-br from-white/10 to-white/5 shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Plane size={64} strokeWidth={1} className="text-white" />
                    <span className="text-white text-xl font-black uppercase tracking-[0.5em]">Traveloop Story</span>
                  </div>
                </div>
                {/* Aurora effect inside mockup */}
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[80px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[80px]" />
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

      {/* ── Bottom CTA ── */}
      <section className="relative z-10 py-16 text-center">
        {/* TODO: Replace CTA text */}
        <h2 className="mb-4 text-3xl font-black text-(--app-color-text)">Ready for your next trip?</h2>
        <p className="mb-8 text-(--app-color-text-muted)">Join Traveloop today and start exploring.</p>
        <Link to="/register" className="rounded-2xl bg-(--app-color-primary) px-10 py-4 text-base font-bold text-white shadow-xl hover:bg-(--app-color-primary-hover) transition-all hover:scale-105">
          Start Now →
        </Link>
      </section>

      <Footer />
    </div>
  );
}

