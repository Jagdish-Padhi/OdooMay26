import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Info,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api.js';
import useTripsStore from '../../store/trips.store.js';

export default function AiPlannerPage() {
  const navigate = useNavigate();
  const createTrip = useTripsStore(s => s.createTrip);
  
  const [formData, setFormData] = useState({
    city: '',
    duration: '3',
    budget: 'medium',
    preferences: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setResult(null);
    
    try {
      const res = await api.post('/ai/plan', formData);
      setResult(res.data.data);
      toast.success('Itinerary Generated!');
    } catch (err) {
      toast.error('AI is currently busy. Try again in a moment.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      // Convert AI result to Trip Schema
      const payload = {
        name: result.name,
        description: result.description,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * parseInt(formData.duration)).toISOString(),
        isPublic: false
      };
      
      await createTrip(payload);
      toast.success('Itinerary saved to your trips!');
      navigate('/trips');
    } catch (err) {
      toast.error('Failed to save itinerary.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)] lg:h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex w-full">

        {/* ── Left: Sticky Settings Panel ── */}
        <div className="w-[380px] shrink-0 border-r border-slate-100 bg-white flex flex-col h-full overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-(--app-color-primary-soft) flex items-center justify-center text-(--app-color-primary)">
                <Sparkles size={18} />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">AI Trip Planner</h1>
                <p className="text-xs text-slate-400 font-medium">Intelligent itinerary generation</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Destination</label>
                <Input 
                  placeholder="Where are you going?"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                  icon={MapPin}
                  className="text-sm rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Duration (Days)</label>
                <div className="flex gap-2">
                  {['3', '5', '7', '10'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormData({...formData, duration: d})}
                      className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition-all ${
                        formData.duration === d 
                          ? 'border-(--app-color-primary) bg-(--app-color-primary-soft) text-(--app-color-primary)' 
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Budget Level</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setFormData({...formData, budget: b})}
                      className={`flex-1 rounded-xl border py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                        formData.budget === b 
                          ? 'border-(--app-color-primary) bg-(--app-color-primary-soft) text-(--app-color-primary)' 
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Preferences (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. I love hidden gems and local seafood."
                  value={formData.preferences}
                  onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                  className="w-full rounded-xl border border-slate-100 p-4 text-sm bg-slate-50/50 focus:border-(--app-color-primary) focus:ring-1 focus:ring-(--app-color-primary) outline-none transition-all resize-none"
                />
              </div>

              <Button type="submit" fullWidth loading={isGenerating} className="h-12 rounded-xl text-sm font-black uppercase tracking-widest">
                <Sparkles size={16} />
                Generate Itinerary
              </Button>
            </form>

            <div className="rounded-xl bg-slate-50 p-4 flex gap-3 items-start">
              <Info className="shrink-0 text-slate-400 mt-0.5" size={14} />
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                Our AI considers local popularity, cost indices, and travel distance to ensure a realistic experience.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: Results Panel ── */}
        <div className="flex-1 h-full overflow-y-auto bg-slate-50/30">
          {isGenerating ? (
            <div className="flex h-full flex-col items-center justify-center space-y-6 p-12 text-center">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-(--app-color-primary) border-t-transparent" />
                <Sparkles className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-(--app-color-primary) animate-pulse" size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">Processing Request</h3>
                <p className="mt-1 text-xs text-slate-400 font-medium">Analyzing data points for {formData.city}...</p>
              </div>
            </div>
          ) : result ? (
            <div className="p-8 space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
              {/* Result Header */}
              <div className="p-6 rounded-2xl bg-linear-to-br from-(--app-color-primary) to-[#4a2d44] text-white shadow-xl">
                <h3 className="text-xl font-black">{result.name}</h3>
                <p className="mt-1 text-sm text-white/70">{result.description}</p>
                <div className="mt-5 flex gap-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Stops</span>
                    <span className="text-xl font-black mt-0.5">{result.stops.length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Activities</span>
                    <span className="text-xl font-black mt-0.5">
                      {result.stops.reduce((acc, s) => acc + s.activities.length, 0)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Duration</span>
                    <span className="text-xl font-black mt-0.5">{formData.duration}D</span>
                  </div>
                </div>
              </div>

              {/* Stops */}
              <div className="space-y-5">
                {result.stops.map((stop, sIdx) => (
                  <div key={sIdx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--app-color-primary) text-white font-black text-xs">
                        {sIdx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{stop.cityName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stop.durationDays} Days</p>
                      </div>
                    </div>
                    
                    <div className="p-5 grid gap-3 sm:grid-cols-2">
                      {stop.activities.map((act, aIdx) => (
                        <div key={aIdx} className="flex items-start gap-3 rounded-xl bg-slate-50/50 border border-slate-50 p-4 hover:bg-white hover:border-slate-100 hover:shadow-sm transition-all">
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                            <CheckCircle2 size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 leading-tight">{act.name}</p>
                            <div className="mt-1.5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              <span className="flex items-center gap-1"><DollarSign size={10} /> {act.cost > 0 ? act.cost : 'Free'}</span>
                              <span>•</span>
                              <span>{act.duration}</span>
                            </div>
                            {act.notes && <p className="mt-1 text-[10px] text-slate-400 italic">{act.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save CTA */}
              <div className="flex justify-center pt-4 pb-8">
                <Button 
                  onClick={handleSaveTrip} 
                  loading={isSaving}
                  className="h-12 px-8 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all font-black text-sm uppercase tracking-widest"
                >
                  Save to My Trips
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-12 text-center">
              <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
                <Sparkles size={32} className="text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-base font-black text-slate-900 uppercase tracking-tight">Awaiting Parameters</p>
              <p className="mt-2 max-w-xs text-xs text-slate-400 font-medium leading-relaxed">Fill in the planning panel on the left and click generate to see your AI-crafted itinerary.</p>
            </div>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}
