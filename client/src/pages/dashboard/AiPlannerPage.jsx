import { useState } from 'react';
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

export default function AiPlannerPage() {
  const [formData, setFormData] = useState({
    city: '',
    duration: '3',
    budget: 'medium',
    preferences: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setResult(null);
    
    try {
      const res = await api.post('/ai/plan', formData);
      setResult(res.data.data);
      toast.success('Magic Itinerary Generated!');
    } catch (err) {
      toast.error('AI is currently busy. Try again in a moment.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <PageHeader 
        title="AI Trip Planner" 
        subtitle="Let our intelligence craft your perfect journey in seconds."
      />

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* Settings Panel */}
        <div className="space-y-6">
          <Card className="p-8">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-(--app-color-text-muted)">Planning Parameters</h3>
            <form onSubmit={handleGenerate} className="space-y-6">
              <Input 
                label="Destination" 
                placeholder="Where are you going?"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                required
                icon={MapPin}
              />

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Duration (Days)</label>
                <div className="flex gap-2">
                  {['3', '5', '7', '10'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormData({...formData, duration: d})}
                      className={`flex-1 rounded-xl border py-2 text-sm font-bold transition-all ${
                        formData.duration === d 
                          ? 'border-(--app-color-primary) bg-(--app-color-primary-soft) text-(--app-color-primary)' 
                          : 'border-(--app-color-border) hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Budget Level</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setFormData({...formData, budget: b})}
                      className={`flex-1 rounded-xl border py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                        formData.budget === b 
                          ? 'border-(--app-color-accent) bg-(--app-color-accent-soft) text-(--app-color-accent)' 
                          : 'border-(--app-color-border) hover:bg-slate-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Preferences (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. I love hidden gems and local seafood."
                  value={formData.preferences}
                  onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                  className="w-full rounded-2xl border border-(--app-color-border) p-4 text-sm focus:border-(--app-color-primary) focus:ring-4 focus:ring-(--app-color-primary-soft)"
                />
              </div>

              <Button type="submit" fullWidth loading={isGenerating} className="h-14 text-lg">
                <Sparkles size={20} />
                Generate Itinerary
              </Button>
            </form>
          </Card>

          <div className="rounded-2xl bg-indigo-50 p-6 text-indigo-900">
            <div className="flex gap-3">
              <Info className="shrink-0" size={18} />
              <p className="text-xs leading-relaxed">
                Our AI considers local popularity, cost indices, and travel distance to ensure a realistic and enjoyable experience.
              </p>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="min-h-[600px]">
          {isGenerating ? (
            <div className="flex h-full flex-col items-center justify-center space-y-6 rounded-[2.5rem] border-4 border-dashed border-(--app-color-border)/40 bg-white/40 p-12 text-center">
              <div className="relative">
                <div className="h-20 w-20 animate-spin rounded-full border-4 border-(--app-color-primary) border-t-transparent" />
                <Sparkles className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-(--app-color-accent) animate-pulse" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Consulting the Oracles...</h3>
                <p className="mt-2 text-sm text-(--app-color-text-muted)">Analyzing thousands of travel data points for {formData.city}.</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <Card className="p-8 bg-gradient-to-br from-(--app-color-primary) to-indigo-900 text-white border-none shadow-2xl">
                <h3 className="text-3xl font-black">{result.name}</h3>
                <p className="mt-2 text-white/80">{result.description}</p>
                <div className="mt-8 flex gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Stops</span>
                    <span className="text-xl font-black">{result.stops.length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Activities</span>
                    <span className="text-xl font-black">
                      {result.stops.reduce((acc, s) => acc + s.activities.length, 0)}
                    </span>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                {result.stops.map((stop, sIdx) => (
                  <div key={sIdx} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--app-color-accent) text-white font-black text-xs">
                        {sIdx + 1}
                      </div>
                      <h4 className="text-lg font-bold">{stop.cityName} ({stop.durationDays} Days)</h4>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      {stop.activities.map((act, aIdx) => (
                        <div key={aIdx} className="group relative flex items-start gap-4 rounded-2xl border border-(--app-color-border) bg-white p-4 transition-all hover:border-(--app-color-primary) hover:shadow-md">
                          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-(--app-color-text)">{act.name}</p>
                            <div className="mt-1 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              <span className="flex items-center gap-1"><DollarSign size={10} /> {act.cost > 0 ? act.cost : 'Free'}</span>
                              <span>•</span>
                              <span>{act.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <Button className="h-14 px-10 rounded-2xl shadow-xl hover:scale-105 active:scale-95">
                  Save Itinerary to My Trips
                  <ArrowRight size={20} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed border-(--app-color-border)/40 bg-white/40 p-12 text-center opacity-40">
              <Sparkles size={64} strokeWidth={1} />
              <p className="mt-4 text-xl font-bold text-(--app-color-text)">Your Itinerary Will Appear Here</p>
              <p className="max-w-xs text-sm">Fill in the details and click generate to see the magic happen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
