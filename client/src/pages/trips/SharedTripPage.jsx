import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Share2, 
  Copy, 
  Download, 
  Globe, 
  ArrowLeft,
  ChevronRight,
  Clock,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import Button from '../../components/Button';
import Card from '../../components/Card';
import useAuthStore from '../../store/auth.store.js';
import { socialShare } from '../../utils/social.js';

export default function SharedTripPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDuplicating, setIsDuplicating] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/trips/public/${id}`);
        setTrip(res.data.data);
      } catch (err) {
        toast.error('Could not find this trip. It might be private.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleDuplicate = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to copy this trip to your dashboard.');
      navigate('/login');
      return;
    }

    setIsDuplicating(true);
    try {
      const res = await api.post(`/trips/${id}/duplicate`);
      toast.success('Trip copied to your account!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to duplicate trip.');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleShare = () => {
    socialShare.copyToClipboard(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleWhatsAppShare = () => {
    socialShare.whatsapp(trip.name, window.location.href);
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-(--app-color-primary) border-t-transparent" />
    </div>
  );

  if (!trip) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <h1 className="text-2xl font-bold">Trip Not Found</h1>
      <p className="mt-2 text-slate-500">This trip is either private or doesn't exist.</p>
      <Button className="mt-6" onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <img 
          src={trip.coverUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600'} 
          className="h-full w-full object-cover"
          alt={trip.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl p-8 lg:p-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                  <Globe size={14} className="text-(--app-color-accent)" />
                  Public Itinerary
                </div>
                <h1 className="text-4xl font-black text-white lg:text-6xl">{trip.name}</h1>
                <div className="flex flex-wrap gap-6 text-sm font-medium text-white/90">
                  <div className="flex items-center gap-2"><Calendar size={18} className="text-(--app-color-accent)" /> 12 Days</div>
                  <div className="flex items-center gap-2"><MapPin size={18} className="text-(--app-color-accent)" /> 4 Destinations</div>
                  <div className="flex items-center gap-2"><DollarSign size={18} className="text-(--app-color-accent)" /> High Budget</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleDuplicate} loading={isDuplicating} className="bg-white text-black hover:bg-slate-100">
                  <Copy size={18} />
                  Copy to My Trips
                </Button>
                <Button onClick={handleShare} variant="secondary" className="bg-white/10 text-white backdrop-blur-md hover:bg-white/20 border-none">
                  <Share2 size={18} />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto mt-12 w-full max-w-6xl px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
          {/* Timeline Placeholder */}
          <section className="space-y-12">
            <div>
              <h2 className="mb-6 text-2xl font-black uppercase tracking-tight text-(--app-color-text)">Trip Overview</h2>
              <p className="text-lg leading-relaxed text-(--app-color-text-muted)">
                {trip.description || "No description provided for this amazing journey."}
              </p>
            </div>

            <div className="space-y-8">
              <h3 className="text-xl font-bold text-(--app-color-text)">Itinerary Stops</h3>
              {[1, 2, 3].map(i => (
                <div key={i} className="relative pl-12 before:absolute before:left-[11px] before:top-8 before:h-full before:w-[2px] before:bg-slate-200 last:before:hidden">
                  <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-(--app-color-primary) text-white ring-8 ring-white">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <Card className="p-6 transition-all hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-accent)">Stop {i}</p>
                        <h4 className="text-lg font-bold">Destination Name</h4>
                        <div className="mt-2 flex gap-4 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><Clock size={12} /> 3 Days</span>
                          <span className="flex items-center gap-1"><MapPin size={12} /> City, Country</span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-300" />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-8">
            <Card className="p-8 text-center bg-gradient-to-br from-indigo-900 to-(--app-color-primary) text-white border-none shadow-xl">
              <h4 className="text-xl font-bold mb-2">Want to customize this?</h4>
              <p className="text-sm text-white/70 mb-8 leading-relaxed">
                Copy this trip to your dashboard to edit dates, swap cities, and add your own activities.
              </p>
              <Button onClick={handleDuplicate} loading={isDuplicating} className="w-full bg-white text-indigo-900 hover:bg-slate-100">
                Clone Itinerary
              </Button>
            </Card>

            <div className="rounded-[2rem] border border-(--app-color-border) bg-white p-8">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">Export</h4>
              <Button variant="secondary" fullWidth className="justify-start gap-4">
                <Download size={18} />
                Download PDF
              </Button>
            </div>
          </aside>
        </div>
      </main>

      {/* Floating Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="fixed bottom-8 left-8 flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
      >
        <ArrowLeft size={18} />
        Back to Gallery
      </button>
    </div>
  );
}
