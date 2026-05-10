import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  CirclePlus,
  GripVertical,
  MapPin,
  MapPinned,
  Plus,
  Route,
  Search,
  Sparkles,
  Trash2,
  CalendarDays as CalendarViewIcon,
  List,
  Layers3,
  ChevronRight,
  Map as MapIcon,
  CheckCircle2,
  Settings2,
  ArrowRight,
  Navigation2
} from 'lucide-react';
import { CircleMarker, MapContainer, Popup, Polyline, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Input from '../../components/Input.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { StopSkeleton } from '../../components/skeletons/StopSkeleton.jsx';
import { citiesService } from '../../services/cities.service.js';
import { tripsService } from '../../services/trips.service.js';
import { stopsService } from '../../services/stops.service.js';
import { activitiesService } from '../../services/activities.service.js';

function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function toIsoDate(value) {
  if (!value) return null;
  return new Date(`${value}T12:00:00`).toISOString();
}

async function geocodeCity(cityName, countryName) {
  const query = [cityName, countryName].filter(Boolean).join(', ');
  if (!query) return null;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!Array.isArray(data) || !data[0]) return null;
    return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
  } catch { return null; }
}

export default function ItineraryBuilderPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [leftWidth, setLeftWidth] = useState(55); // percentage
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [selectedStopId, setSelectedStopId] = useState('');
  const [coordinatesByStop, setCoordinatesByStop] = useState({});
  const [activityIdeas, setActivityIdeas] = useState([]);
  const [searchingActivities, setSearchingActivities] = useState(false);

  const isResizing = useRef(false);

  useEffect(() => {
    async function load() {
      try {
        const [t, s] = await Promise.all([tripsService.getOne(tripId), stopsService.getAll(tripId)]);
        setTrip(t.data.data);
        const stopsData = s.data.data || [];
        setStops(stopsData);
        if (stopsData[0]) setSelectedStopId(stopsData[0].stop.id);
      } catch (e) { toast.error('Failed to load itinerary.'); }
      finally { setLoading(false); }
    }
    load();
  }, [tripId]);

  useEffect(() => {
    if (cityQuery.trim().length < 2) { setCityResults([]); return; }
    const timer = setTimeout(() => {
      citiesService.search({ q: cityQuery.trim(), limit: 5 }).then(r => setCityResults(r.data.data || []));
    }, 300);
    return () => clearTimeout(timer);
  }, [cityQuery]);

  useEffect(() => {
    async function loadCoords() {
      const pairs = await Promise.all(stops.map(async (e) => {
        if (!e.city) return null;
        const c = await geocodeCity(e.city.name, e.city.country);
        return c ? [e.stop.id, c] : null;
      }));
      setCoordinatesByStop(Object.fromEntries(pairs.filter(Boolean)));
    }
    if (stops.length > 0) loadCoords();
  }, [stops]);

  const mapPoints = useMemo(() => stops.map(e => coordinatesByStop[e.stop.id]).filter(Boolean), [coordinatesByStop, stops]);
  const center = mapPoints[0] || { lat: 20, lng: 0 };

  const startResizing = () => { isResizing.current = true; };
  const stopResizing = () => { isResizing.current = false; };
  const resize = (e) => {
    if (!isResizing.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 30 && newWidth < 80) setLeftWidth(newWidth);
  };

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, []);

  const handleAddStop = async (city) => {
    try {
      const r = await stopsService.create(tripId, { cityId: city.id });
      setStops(curr => [...curr, { stop: r.data.data, city, activities: [] }]);
      setSelectedStopId(r.data.data.id);
      setCityQuery('');
      setCityResults([]);
      toast.success(`${city.name} added.`);
    } catch { toast.error('Error.'); }
  };

  const handleDateChange = async (stopId, field, val) => {
    const iso = toIsoDate(val);
    setStops(curr => curr.map(e => e.stop.id === stopId ? { ...e, stop: { ...e.stop, [field]: iso } } : e));
    await stopsService.update(tripId, stopId, { [field]: iso });
  };

  const handleDeleteStop = async (id) => {
    await stopsService.remove(tripId, id);
    setStops(curr => curr.filter(e => e.stop.id !== id));
  };

  if (loading) return <div className="p-12 h-screen flex items-center justify-center bg-white"><StopSkeleton count={3} /></div>;

  return (
    <div className="flex h-[calc(100vh-56px)] lg:h-screen overflow-hidden bg-white select-none">
      
      {/* ── Fixed Step Indicator ── */}
      <div className="w-20 flex flex-col items-center py-8 bg-slate-50 border-r border-slate-100 shrink-0">
        {[1, 2, 3].map(s => (
          <button 
            key={s}
            onClick={() => setActiveStep(s)}
            className={`mb-10 flex flex-col items-center transition-all ${activeStep === s ? 'text-(--app-color-primary)' : 'text-slate-300'}`}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${activeStep === s ? 'bg-(--app-color-primary) text-white shadow-lg' : 'bg-white border border-slate-200'}`}>
              {s}
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-widest">Step {s}</span>
          </button>
        ))}
        <div className="mt-auto">
           <button onClick={() => navigate('/trips')} className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
             <ChevronLeft size={18} />
           </button>
        </div>
      </div>

      {/* ── Left Workspace (Resizable) ── */}
      <div 
        className="flex flex-col min-w-0 h-full relative" 
        style={{ width: `${leftWidth}%` }}
      >
        <div className="h-16 px-6 flex items-center justify-between bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-(--app-color-primary-soft) flex items-center justify-center text-(--app-color-primary)">
               <Settings2 size={16} />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">{trip?.name}</h1>
              <p className="text-xs font-bold text-slate-400">Step {activeStep} <span className="mx-1">•</span> {activeStep === 1 ? 'Discovery' : activeStep === 2 ? 'Planning' : 'Intelligence'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex gap-1.5">
                {[1, 2, 3].map(s => <div key={s} className={`h-1.5 w-6 rounded-full transition-all ${activeStep >= s ? 'bg-(--app-color-primary)' : 'bg-slate-100'}`} />)}
             </div>
             <Button as={Link} to={`/trips/${tripId}/view`} variant="secondary" size="xs" className="rounded-lg text-xs uppercase font-black">Finish</Button>
          </div>
        </div>

        <div className="flex-1 p-8 bg-slate-50/20 overflow-hidden flex flex-col">
          <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full overflow-hidden">
            
            {activeStep === 1 && (
              <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                  <h2 className="text-base font-black text-slate-900 uppercase mb-4 tracking-tight">Step 1: Add Destinations</h2>
                  <div className="relative">
                    <Input 
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      placeholder="Search a global city..."
                      className="text-sm py-4 rounded-xl border-slate-200"
                      icon={Search}
                    />
                    {cityResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden">
                        {cityResults.map(city => (
                          <button key={city.id} onClick={() => handleAddStop(city)} className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 group transition-all">
                            <div className="text-left"><p className="font-bold text-slate-900 text-sm">{city.name}</p><p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{city.country}</p></div>
                            <Plus size={16} className="text-slate-300 group-hover:text-(--app-color-primary)" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 px-1">Planned Stops ({stops.length})</h3>
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 scrollbar-hide">
                    {stops.map((e, i) => (
                      <div key={e.stop.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-xs group">
                        <span className="h-8 w-8 rounded-lg bg-(--app-color-primary) text-white flex items-center justify-center text-xs font-black">{i + 1}</span>
                        <div className="flex-1 truncate"><p className="font-bold text-slate-900 text-sm leading-none mb-1 truncate">{e.city?.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{e.city?.country}</p></div>
                        <button onClick={() => handleDeleteStop(e.stop.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    {stops.length === 0 && <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 uppercase font-bold">Search above to add stops</div>}
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="flex flex-col h-full space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Step 2: Set Dates</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Assign arrival and departure dates for each destination.</p>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                   {stops.length === 0 ? (
                     <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Awaiting destination inputs</p>
                     </div>
                   ) : stops.map((e, i) => (
                     <div key={e.stop.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-(--app-color-primary) text-white flex items-center justify-center text-xs font-black">{i + 1}</div>
                           <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{e.city?.name}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Check-in</label>
                            <input 
                              type="date" 
                              value={toDateInput(e.stop.arrivalDate)} 
                              onChange={(ev) => handleDateChange(e.stop.id, 'arrivalDate', ev.target.value)} 
                              className="w-full bg-slate-50 border-none rounded-xl h-10 px-4 text-xs focus:ring-1 focus:ring-(--app-color-primary) transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Check-out</label>
                            <input 
                              type="date" 
                              value={toDateInput(e.stop.departureDate)} 
                              onChange={(ev) => handleDateChange(e.stop.id, 'departureDate', ev.target.value)} 
                              className="w-full bg-slate-50 border-none rounded-xl h-10 px-4 text-xs focus:ring-1 focus:ring-(--app-color-primary) transition-all"
                            />
                          </div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="flex flex-col h-full space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Step 3: AI Discovery</h2>
                  <Button onClick={async () => {
                      const stop = stops.find(x => x.stop.id === selectedStopId);
                      if (!stop) return;
                      setSearchingActivities(true);
                      try {
                        const r = await activitiesService.searchIdeas({ city: stop.city.name });
                        setActivityIdeas(r.data.data || []);
                      } catch { toast.error('Query failed.'); }
                      finally { setSearchingActivities(false); }
                   }} loading={searchingActivities} size="sm" fullWidth className="mt-4 rounded-xl h-10 text-xs uppercase font-black">Discover Experiences</Button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 scrollbar-hide">
                   {stops.map(e => (
                     <button key={e.stop.id} onClick={() => setSelectedStopId(e.stop.id)} className={`shrink-0 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${selectedStopId === e.stop.id ? 'bg-(--app-color-primary) text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}>{e.city?.name}</button>
                   ))}
                </div>
                <div className="flex-1 overflow-y-auto grid sm:grid-cols-2 gap-3 pr-2 scrollbar-hide">
                   {activityIdeas.map((idea, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white border border-slate-100 flex items-center justify-between gap-3 hover:border-(--app-color-primary-soft) hover:shadow-sm transition-all">
                        <div className="min-w-0"><p className="font-bold text-slate-900 text-sm truncate leading-none mb-1">{idea.name}</p><p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{idea.type} • {idea.duration}</p></div>
                        <button onClick={async () => { await activitiesService.create(tripId, selectedStopId, idea); toast.success('Added.'); }} className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 hover:text-(--app-color-primary) transition-all"><Plus size={16} /></button>
                      </div>
                   ))}
                </div>
              </div>
            )}

          </div>

          <button onClick={() => activeStep < 3 && setActiveStep(s => s + 1)} className={`absolute bottom-6 right-6 flex items-center gap-2.5 bg-(--app-color-primary) text-white pl-6 pr-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${activeStep === 3 ? 'opacity-0 pointer-events-none' : 'hover:scale-105 active:scale-95'}`}>
            Next <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center"><ArrowRight size={14} /></div>
          </button>
        </div>

        {/* ── Resizer Handle (Visible Slider) ── */}
        <div 
          onMouseDown={startResizing}
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize bg-slate-100 hover:bg-(--app-color-primary-soft) transition-colors z-50 group flex items-center justify-center border-r border-slate-200"
        >
          <div className="h-20 w-1.5 bg-slate-200 group-hover:bg-(--app-color-primary) rounded-full flex flex-col items-center justify-center gap-1 shadow-sm transition-all group-active:scale-y-125">
             <div className="w-0.5 h-0.5 bg-white rounded-full" />
             <div className="w-0.5 h-0.5 bg-white rounded-full" />
             <div className="w-0.5 h-0.5 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Map Context (Right View) ── */}
      <div className="hidden lg:block h-full relative shrink-0 bg-slate-100" style={{ flex: 1 }}>
        <MapContainer center={[center.lat, center.lng]} zoom={4} zoomControl={false} scrollWheelZoom className="h-full w-full grayscale-[0.6]">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mapPoints.length > 1 && <Polyline positions={mapPoints.map(p => [p.lat, p.lng])} className="neon-path" pathOptions={{ color: '#714B67', weight: 2 }} />}
          {stops.map(e => {
            const c = coordinatesByStop[e.stop.id];
            if (!c) return null;
            return (
              <CircleMarker key={e.stop.id} center={[c.lat, c.lng]} radius={5} pathOptions={{ color: '#714B67', fillColor: '#714B67', fillOpacity: 1, weight: 1.5 }}>
                <Popup className="custom-popup"><div className="p-3"><p className="font-black text-slate-900 text-sm mb-0.5">{e.city?.name}</p><p className="text-[10px] text-slate-400 uppercase font-bold">{e.city?.country}</p></div></Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
        <div className="absolute top-6 right-6">
           <div className="bg-white/90 backdrop-blur-md p-5 px-7 rounded-2xl border border-white shadow-xl flex flex-col items-end min-w-[150px]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Route Status</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stops.length} Stops</p>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash-animation { to { stroke-dashoffset: -20; } }
        .neon-path { stroke-dasharray: 6, 10; animation: dash-animation 1.2s linear infinite; filter: drop-shadow(0 0 2px rgba(113, 75, 103, 0.3)); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 1rem; border: none; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); }
        .custom-popup .leaflet-popup-content { margin: 0; }
        .custom-popup .leaflet-popup-tip-container { display: none; }
      `}} />
    </div>
  );
}