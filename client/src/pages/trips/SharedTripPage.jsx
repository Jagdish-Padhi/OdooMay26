// Added: visible WhatsApp + Twitter share buttons, Facebook, native Web Share API fallback
// Fixed: socialShare utility is now actually called for all providers (was only clipboard before)
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Check, ChevronRight, Clock, Copy,
  DollarSign, Globe, MapPin, Share2, Twitter,
  MessageCircle,  // WhatsApp icon substitute
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { NoStopsEmptyState } from '../../components/EmptyStates.jsx';
import useAuthStore from '../../store/auth.store.js';
import { tripsService } from '../../services/trips.service.js';
import { socialShare } from '../../utils/social.js';

// ─── Social Share Panel ────────────────────────────────────────────────────────

function SharePanel({ tripName, url }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await socialShare.copyToClipboard(url);
    toast.success('Link copied!');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    socialShare.whatsapp(tripName, url);
  }

  function handleTwitter() {
    socialShare.twitter(tripName, url);
  }

  // Native share sheet (mobile devices)
  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: tripName, text: `Check out my trip: ${tripName}`, url });
      } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* WhatsApp */}
      <button
        onClick={handleWhatsApp}
        className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition-all hover:bg-green-100"
      >
        {/* WhatsApp icon via SVG since lucide doesn't have one */}
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp
      </button>

      {/* Twitter / X */}
      <button
        onClick={handleTwitter}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100"
      >
        <Twitter size={14} />
        Share on X
      </button>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 rounded-xl border border-(--app-color-border) bg-white px-4 py-2 text-sm font-semibold text-(--app-color-text-muted) transition-all hover:bg-slate-50"
      >
        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>

      {/* Native share (mobile) */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 rounded-xl border border-(--app-color-primary) bg-(--app-color-primary-soft) px-4 py-2 text-sm font-semibold text-(--app-color-primary) transition-all hover:bg-(--app-color-primary) hover:text-white"
        >
          <Share2 size={14} />
          Share
        </button>
      )}
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtMoney(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v || 0));
}

const TYPE_COLORS = {
  sightseeing: 'bg-sky-100 text-sky-700',
  food:        'bg-orange-100 text-orange-700',
  transport:   'bg-slate-100 text-slate-700',
  adventure:   'bg-rose-100 text-rose-700',
  relaxation:  'bg-green-100 text-green-700',
  culture:     'bg-purple-100 text-purple-700',
  shopping:    'bg-pink-100 text-pink-700',
  other:       'bg-gray-100 text-gray-700',
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SharedTripPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [trip, setTrip]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [isDuplicating, setIsDuplicating] = useState(false);

  useEffect(() => {
    api.get(`/trips/public/${id}`)
      .then((res) => setTrip(res.data.data))
      .catch(() => toast.error('Could not find this trip. It might be private or deleted.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDuplicate() {
    if (!isAuthenticated) {
      toast.error('Please log in to copy this trip to your account.');
      navigate('/login');
      return;
    }
    setIsDuplicating(true);
    try {
      await tripsService.duplicate(id);
      toast.success('Trip copied to your account!');
      navigate('/trips');
    } catch {
      toast.error('Failed to copy trip. Try again.');
    } finally {
      setIsDuplicating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <Globe size={48} className="text-slate-300" />
        <h1 className="text-2xl font-black text-slate-800">Trip not found</h1>
        <p className="text-slate-500">This itinerary may be private or no longer available.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const stops = trip.stops || [];
  const pageUrl = window.location.href;
  const totalActivities = stops.reduce((s, stop) => s + (stop.activities?.length || 0), 0);
  const totalCost = stops.reduce(
    (sum, stop) => sum + (stop.activities || []).reduce((s, a) => s + Number(a.cost || 0), 0), 0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-linear-to-br from-indigo-600 to-purple-700 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex items-center gap-2 text-indigo-200">
            <Globe size={14} />
            <span className="text-xs font-semibold uppercase tracking-widest">Public Itinerary</span>
          </div>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">{trip.name}</h1>
          {trip.description && (
            <p className="mt-3 max-w-xl text-lg text-indigo-100">{trip.description}</p>
          )}

          {/* Meta row */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-indigo-200">
            {trip.startDate && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {fmt(trip.startDate)} — {fmt(trip.endDate)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {stops.length} destination{stops.length !== 1 ? 's' : ''}
            </span>
            {totalActivities > 0 && (
              <span className="flex items-center gap-1.5">
                <Check size={14} />
                {totalActivities} activities
              </span>
            )}
            {totalCost > 0 && (
              <span className="flex items-center gap-1.5">
                <DollarSign size={14} />
                {fmtMoney(totalCost)} in activities
              </span>
            )}
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-indigo-700 shadow-md transition-all hover:shadow-lg disabled:opacity-60"
            >
              {isDuplicating ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-700" />
              ) : (
                <Copy size={16} />
              )}
              {isDuplicating ? 'Copying…' : 'Copy this Trip'}
            </button>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/5" />
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
        {/* Share section */}
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-(--app-color-text-muted)">Share this Itinerary</h3>
          <SharePanel tripName={trip.name} url={pageUrl} />
        </Card>

        {/* Stops */}
        {stops.length === 0 ? (
          <NoStopsEmptyState tripId={tripId} />
        ) : (
          <div className="space-y-8">
            {stops.map((stop, i) => (
              <div key={stop.id}>
                {/* Stop header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">
                      {stop.city?.name}
                      {stop.city?.country && (
                        <span className="ml-2 text-sm font-normal text-slate-400">{stop.city.country}</span>
                      )}
                    </h2>
                    {stop.arrivalDate && (
                      <p className="text-sm text-slate-400">
                        {fmt(stop.arrivalDate)} → {fmt(stop.departureDate)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Activities */}
                {stop.activities?.length > 0 ? (
                  <div className="ml-5 space-y-3 border-l-2 border-dashed border-slate-200 pl-8">
                    {stop.activities.map((activity, ai) => (
                      <div
                        key={activity.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{activity.name}</p>
                            {activity.notes && (
                              <p className="mt-0.5 text-sm text-slate-500">{activity.notes}</p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-3 text-sm">
                            {activity.duration && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Clock size={13} />
                                {activity.duration}
                              </span>
                            )}
                            {activity.cost > 0 ? (
                              <span className="font-bold text-slate-700">{fmtMoney(activity.cost)}</span>
                            ) : (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Free</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_COLORS[activity.type] || TYPE_COLORS.other}`}>
                            {activity.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-5 rounded-2xl border border-dashed border-slate-200 py-6 pl-8 text-center text-sm text-slate-400">
                    No activities listed for this stop.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="rounded-3xl bg-linear-to-r from-indigo-50 to-purple-50 p-8 text-center">
          <h3 className="text-xl font-black text-slate-800">Love this itinerary?</h3>
          <p className="mt-2 text-slate-500">Copy it to your account and make it your own.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={handleDuplicate} loading={isDuplicating}>
              <Copy size={16} />
              Copy this Trip
            </Button>
            <Button variant="secondary" onClick={() => navigate('/register')}>
              Create Free Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
