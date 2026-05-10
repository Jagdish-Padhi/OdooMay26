import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Route, 
  Search, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  MousePointer2, 
  Send, 
  Sparkles, 
  Map as MapIcon,
  Share2
} from 'lucide-react';

const SlidePanel = ({ children, active, index, stage }) => {
  const position = active ? 'translate-x-0 opacity-100 scale-100' : (index > stage ? 'translate-x-full opacity-0 scale-95' : '-translate-x-full opacity-0 scale-95');
  
  return (
    <div className={`absolute inset-0 flex flex-col justify-center px-12 transition-all duration-1000 ease-in-out ${position}`}>
      {children}
    </div>
  );
};

export default function ProductStory() {
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const STAGES = [
    { label: 'Dream', icon: Search, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Plan', icon: Sparkles, color: 'text-(--app-color-primary)', bg: 'bg-(--app-color-primary-soft)' },
    { label: 'Map', icon: MapIcon, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Go', icon: Send, color: 'text-(--app-color-primary)', bg: 'bg-(--app-color-primary-soft)' }
  ];

  return (
    <div className="relative h-full w-full bg-white font-sans">
      
      {/* ── Background Dynamic Glows (Thematic) ── */}
      <div className="absolute inset-0 transition-colors duration-1000 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[120px] opacity-[0.1] transition-all duration-1000 ${STAGES[stage].bg}`} />
        <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: 'radial-gradient(var(--app-color-border) 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </div>

      {/* ── Top Indicator (Sleek) ── */}
      <div className="absolute top-12 left-12 right-12 z-20 flex justify-between items-center">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all duration-700 ${stage === i ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'}`} />
          ))}
        </div>
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Step 0{stage + 1}</div>
      </div>

      {/* ── Main Sliding Stage ── */}
      <div className="relative z-10 h-full w-full">
        
        {/* Step 1: Dream */}
        <SlidePanel active={stage === 0} index={0} stage={stage}>
          <div className="space-y-6 pt-4">
            <h4 className="text-2xl font-black text-slate-900 leading-[1.2] tracking-tighter">Dream of your next<br /><span className="text-sky-600 underline decoration-sky-100 decoration-4 underline-offset-4">destination.</span></h4>
            <div className="group relative p-6 rounded-[1.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/10 transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                  <MapPin size={20} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-1.5 w-24 bg-slate-100 rounded-full" />
                  <div className="h-1 w-16 bg-slate-50 rounded-full" />
                </div>
                <MousePointer2 className="text-slate-900 animate-bounce" size={20} fill="currentColor" />
              </div>
            </div>
          </div>
        </SlidePanel>

        {/* Step 2: Plan */}
        <SlidePanel active={stage === 1} index={1} stage={stage}>
          <div className="space-y-6 pt-4">
            <h4 className="text-2xl font-black text-slate-900 leading-[1.2] tracking-tighter">AI architects the<br /><span className="text-(--app-color-primary) underline decoration-(--app-color-primary-soft) decoration-4 underline-offset-4">perfect itinerary.</span></h4>
            <div className="p-6 rounded-[1.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/10 flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
              <Sparkles size={48} className="text-(--app-color-primary) animate-pulse relative z-10" />
              <div className="flex gap-1.5 relative z-10">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-1 w-8 bg-(--app-color-primary-soft) rounded-full overflow-hidden">
                    <div className="h-full bg-(--app-color-primary)/30 animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SlidePanel>

        {/* Step 3: Map */}
        <SlidePanel active={stage === 2} index={2} stage={stage}>
          <div className="space-y-6 pt-4">
            <h4 className="text-2xl font-black text-slate-900 leading-[1.2] tracking-tighter">Fine-tune visually<br /><span className="text-sky-600 underline decoration-sky-100 decoration-4 underline-offset-4">on the map.</span></h4>
            <div className="relative h-44 rounded-[1.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/10 overflow-hidden group">
               <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
               <div className="relative h-full w-full flex items-center justify-center">
                  <Route className="text-sky-600 opacity-20 group-hover:opacity-40 transition-opacity" size={64} strokeWidth={1.5} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-12 -translate-y-12 h-3 w-3 bg-sky-500 rounded-full shadow-lg shadow-sky-500/20 animate-ping" />
                  <div className="absolute top-1/2 left-1/2 translate-x-12 translate-y-8 h-2 w-2 bg-slate-300 rounded-full" />
               </div>
            </div>
          </div>
        </SlidePanel>

        {/* Step 4: Go */}
        <SlidePanel active={stage === 3} index={3} stage={stage}>
          <div className="space-y-6 pt-4">
            <h4 className="text-2xl font-black text-slate-900 leading-[1.2] tracking-tighter">Ready to start<br /><span className="text-(--app-color-primary) underline decoration-(--app-color-primary-soft) decoration-4 underline-offset-4">your adventure.</span></h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-6 rounded-[1.5rem] bg-slate-900 flex flex-col items-center justify-center gap-3 shadow-xl transition-transform hover:scale-[1.05]">
                 <CheckCircle2 className="text-emerald-400" size={32} />
                 <div className="h-1 w-12 bg-white/20 rounded-full" />
              </div>
              <div className="p-6 rounded-[1.5rem] border border-slate-100 bg-white flex flex-col items-center justify-center gap-3 shadow-lg">
                 <Share2 className="text-(--app-color-primary)" size={24} />
                 <div className="h-1 w-10 bg-slate-100 rounded-full" />
              </div>
            </div>
          </div>
        </SlidePanel>

      </div>

      {/* ── Bottom Nav Pill (Thematic) ── */}
      <div className="absolute bottom-10 left-12 right-12 flex items-center justify-between p-1 bg-slate-50 border border-slate-100 rounded-2xl">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const active = stage === i;
          return (
            <button 
              key={i}
              onClick={() => setStage(i)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-500 ${active ? 'bg-white shadow-sm' : 'hover:bg-slate-100'}`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${active ? s.color : 'text-slate-300'}`}>
                <Icon size={16} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-slate-900' : 'text-slate-300'}`}>{s.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
