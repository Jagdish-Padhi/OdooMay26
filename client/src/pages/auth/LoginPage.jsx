/**
 * LoginPage
 *
 * TODO items:
 *  - Replace logo.png in /public with your logo
 *  - Replace ALL text marked with TODO below
 *  - Update the feature list bullets to reflect your app's value props
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';

import Button from '../../components/Button';
import Container from '../../components/Container';
import Input from '../../components/Input';
import { useFormErrors } from '../../hooks/useFormErrors.js';
import api from '../../services/api.js';
import useAuthStore from '../../store/auth.store.js';

const initialForm = { email: '', password: '' };

// TODO: Replace these with your app's real feature highlights
const FEATURE_BULLETS = [
  'Multi-city Itineraries',
  'Real-time Budgeting',
  'Interactive Timelines',
  'Shared Travel Plans',
];

export default function LoginPage() {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTransitioning = useAuthStore((s) => s.setTransitioning);

  const { errors, validate, clearError } = useFormErrors({
    email: (v) => {
      if (!v.trim()) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
    },
    password: (v) => {
      if (!v) return 'Password is required.';
      if (v.length < 6) return 'Password must be at least 6 characters.';
    },
  });

  const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(formData)) return;
    setIsSubmitting(true);
    setTransitioning(true, true);
    try {
      const res = await api.post('/auth/login', formData);
      setAuth({ user: res.data.user, accessToken: res.data.accessToken });
      toast.success('Logged in successfully.');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Login failed.';
      toast.error(msg);
      setTransitioning(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="flex min-h-screen items-center justify-center py-4 lg:py-6">
      {!isSubmitting && (
        <div
          className="grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-(--app-color-border)/40 backdrop-blur-md lg:grid-cols-[1.1fr_0.9fr]"
          style={{ backgroundColor: 'var(--app-color-surface-glass)', boxShadow: 'var(--app-shadow-elevated)' }}
        >
          {/* ── Left branding panel ── */}
          <section
            className="relative flex flex-col items-center justify-center overflow-hidden p-8 text-center text-white lg:p-12"
            style={{ background: 'var(--app-gradient-auth-login)' }}
          >
            <div className="noise-overlay pointer-events-none opacity-20" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex flex-col items-center gap-6">
                {/* TODO: Replace /logo.png with your logo */}
                <img src="/logo.png" alt="TravLoop Logo" className="h-64 w-64 object-contain drop-shadow-2xl" />
                <div className="h-[3px] w-16 rounded-full bg-teal-500" />
              </div>
              <div className="mt-8">
                {/* TODO: Replace with your app tagline */}
                <h1 className="text-4xl font-black uppercase tracking-tighter italic lg:text-5xl text-white">
                  Dream, Plan, <br />
                  <span className="text-teal-500">Discover.</span>
                </h1>
                <p className="mx-auto mt-4 max-w-sm text-lg font-bold leading-tight text-white/70">
                  The only platform you need for personalized, collaborative travel itineraries.
                </p>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 px-4 text-left">
                {FEATURE_BULLETS.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
                      <Check size={12} strokeWidth={4} />
                    </div>

                    <span className="whitespace-nowrap text-xs font-black uppercase tracking-wider text-white/90">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-between px-10 text-[9px] font-black uppercase tracking-[0.3em] text-white/25">
              {/* TODO: Replace with your app name and year */}
              <p>© 2026 Traveloop</p>
              <p>Personalized Travel Planning</p>
            </div>
          </section>

          {/* ── Right form panel ── */}
          <section
            className="auth-form-slide flex flex-col justify-center p-8 lg:p-12"
            style={{ backgroundColor: 'var(--app-color-surface-glass)' }}
          >
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-8 text-center lg:text-left">
                {/* TODO: Replace headings */}
                <h2 className="text-3xl font-bold tracking-tight text-(--app-color-text)">Welcome back</h2>
                <p className="mt-1 text-sm text-(--app-color-text-muted)">Sign in to your dashboard</p>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* TODO: Adjust label/placeholder to match your entity (e.g. "Work Email") */}
                <Input 
                  label="Email" 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={(e) => { handleChange(e); clearError('email'); }} 
                  error={errors.email}
                  required 
                  placeholder="you@example.com" 
                  inputClassName="h-11 rounded-xl" 
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-(--app-color-text)">Password</label>
                    <Link to="/forgot-password" className="text-xs font-medium text-(--app-color-primary) hover:underline">Forgot password?</Link>
                  </div>
                  <Input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={(e) => { handleChange(e); clearError('password'); }} 
                    error={errors.password}
                    required 
                    placeholder="••••••••" 
                    inputClassName="h-11 rounded-xl" 
                  />
                </div>
                <div className="pt-1">
                  {/* TODO: Replace button label */}
                  <Button type="submit" className="h-11 w-full rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]" loading={isSubmitting} disabled={isSubmitting}>
                    Sign In
                  </Button>
                </div>
                <p className="mt-8 text-center text-xs text-(--app-color-text-muted)">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="font-black text-(--app-color-primary) hover:text-(--app-color-primary-hover)">
                    Create one
                  </Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      )}
    </Container>
  );
}
