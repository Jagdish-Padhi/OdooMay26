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
} from 'lucide-react';
import { CircleMarker, MapContainer, Popup, Polyline, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Input from '../../components/Input.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { citiesService } from '../../services/cities.service.js';
import { tripsService } from '../../services/trips.service.js';
import { stopsService } from '../../services/stops.service.js';
import { activitiesService } from '../../services/activities.service.js';

const ACTIVITY_TYPES = ['sightseeing', 'food', 'transport', 'adventure', 'relaxation', 'culture', 'shopping', 'other'];
const BUDGET_LEVELS = ['low', 'medium', 'high'];

function moveItem(items, fromIndex, toIndex) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function toIsoDate(value) {
  if (!value) return null;
  return new Date(`${value}T12:00:00`).toISOString();
}

async function geocodeCity(cityName, countryName) {
  const query = [cityName, countryName].filter(Boolean).join(', ');
  if (!query) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { Accept: 'application/json' } },
    );
    const data = await response.json();
    if (!Array.isArray(data) || !data[0]) return null;
    return {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
    };
  } catch {
    return null;
  }
}

export default function ItineraryBuilderPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const dragRef = useRef(null);

  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');

  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [selectedStopId, setSelectedStopId] = useState('');

  const [activityQuery, setActivityQuery] = useState({
    city: '',
    country: '',
    type: '',
    budget: 'medium',
    duration: '',
    limit: 6,
  });
  const [activityIdeas, setActivityIdeas] = useState([]);
  const [searchingActivities, setSearchingActivities] = useState(false);

  const [coordinatesByStop, setCoordinatesByStop] = useState({});

  useEffect(() => {
    let alive = true;

    async function loadTrip() {
      setLoading(true);
      try {
        const [tripResponse, stopsResponse] = await Promise.all([
          tripsService.getOne(tripId),
          stopsService.getAll(tripId),
        ]);

        if (!alive) return;

        setTrip(tripResponse.data.data);
        setStops(stopsResponse.data.data || []);

        const firstStop = stopsResponse.data.data?.[0]?.stop?.id || '';
        setSelectedStopId(firstStop);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load itinerary.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadTrip();

    return () => {
      alive = false;
    };
  }, [tripId]);

  useEffect(() => {
    let alive = true;

    if (cityQuery.trim().length < 2) {
      setCityResults([]);
      return undefined;
    }

    const timer = setTimeout(() => {
      citiesService
        .search({ q: cityQuery.trim(), limit: 8 })
        .then((response) => {
          if (alive) setCityResults(response.data.data || []);
        })
        .catch(() => {
          if (alive) setCityResults([]);
        });
    }, 250);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [cityQuery]);

  useEffect(() => {
    const activeStop = stops.find((entry) => entry.stop.id === selectedStopId);
    if (!activeStop?.city) return;

    setActivityQuery((current) => ({
      ...current,
      city: activeStop.city.name,
      country: activeStop.city.country,
    }));
  }, [selectedStopId, stops]);

  useEffect(() => {
    let cancelled = false;

    async function loadCoordinates() {
      const pairs = await Promise.all(
        stops.map(async (entry) => {
          if (!entry.city) return null;
          const coords = await geocodeCity(entry.city.name, entry.city.country);
          if (!coords) return null;
          return [entry.stop.id, coords];
        }),
      );

      if (!cancelled) {
        setCoordinatesByStop(Object.fromEntries(pairs.filter(Boolean)));
      }
    }

    if (stops.length > 0) {
      loadCoordinates();
    } else {
      setCoordinatesByStop({});
    }

    return () => {
      cancelled = true;
    };
  }, [stops]);

  const selectedStop = useMemo(
    () => stops.find((entry) => entry.stop.id === selectedStopId) || stops[0] || null,
    [stops, selectedStopId],
  );

  const totalActivities = useMemo(
    () => stops.reduce((count, entry) => count + entry.activities.length, 0),
    [stops],
  );

  const totalActivityCost = useMemo(
    () =>
      stops.reduce(
        (sum, entry) =>
          sum + entry.activities.reduce((stopSum, activity) => stopSum + Number(activity.cost || 0), 0),
        0,
      ),
    [stops],
  );

  const mapPoints = useMemo(
    () => stops.map((entry) => coordinatesByStop[entry.stop.id]).filter(Boolean),
    [coordinatesByStop, stops],
  );

  const center = mapPoints[0] || { lat: 20, lng: 0 };

  async function handleAddStop(city) {
    try {
      const stopResponse = await stopsService.create(tripId, { cityId: city.id });
      const stop = stopResponse.data.data;
      setStops((current) => [...current, { stop, city, activities: [] }]);
      setSelectedStopId(stop.id);
      setCityQuery('');
      setCityResults([]);
      toast.success(`${city.name} added to your trip.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add stop.');
    }
  }

  async function handleStopDateChange(stopId, field, value) {
    const payload = { [field]: toIsoDate(value) };

    setStops((current) =>
      current.map((entry) =>
        entry.stop.id === stopId
          ? { ...entry, stop: { ...entry.stop, [field]: payload[field] } }
          : entry,
      ),
    );

    try {
      await stopsService.update(tripId, stopId, payload);
    } catch {
      toast.error('Failed to save stop dates.');
    }
  }

  async function handleDeleteStop(stopId) {
    try {
      await stopsService.remove(tripId, stopId);
      setStops((current) => {
        const remainingStops = current.filter((entry) => entry.stop.id !== stopId);
        if (selectedStopId === stopId) {
          setSelectedStopId(remainingStops[0]?.stop.id || '');
        }
        return remainingStops;
      });
      toast.success('Stop removed.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove stop.');
    }
  }

  async function persistStopOrder(nextStops) {
    setStops(nextStops);
    try {
      await stopsService.reorder(tripId, nextStops.map((entry) => entry.stop.id));
    } catch {
      toast.error('Failed to save stop order.');
    }
  }

  function handleStopDragStart(index) {
    dragRef.current = { type: 'stop', index };
  }

  function handleStopDrop(index) {
    const dragState = dragRef.current;
    dragRef.current = null;

    if (!dragState || dragState.type !== 'stop' || dragState.index === index) return;

    const nextStops = moveItem(stops, dragState.index, index);
    persistStopOrder(nextStops);
  }

  function handleActivityDragStart(stopId, index) {
    dragRef.current = { type: 'activity', stopId, index };
  }

  function handleActivityDrop(stopId, index) {
    const dragState = dragRef.current;
    dragRef.current = null;

    if (!dragState || dragState.type !== 'activity' || dragState.stopId !== stopId || dragState.index === index) {
      return;
    }

    const nextStops = stops.map((entry) => {
      if (entry.stop.id !== stopId) return entry;
      const nextActivities = moveItem(entry.activities, dragState.index, index);
      void activitiesService.reorder(tripId, stopId, nextActivities.map((activity) => activity.id));
      return { ...entry, activities: nextActivities };
    });

    setStops(nextStops);
  }

  async function handleAddActivity(activity) {
    if (!selectedStop) {
      toast.error('Pick a stop first.');
      return;
    }

    try {
      const createdResponse = await activitiesService.create(tripId, selectedStop.stop.id, activity);
      const created = createdResponse.data.data;
      setStops((current) =>
        current.map((entry) =>
          entry.stop.id === selectedStop.stop.id
            ? { ...entry, activities: [...entry.activities, created] }
            : entry,
        ),
      );
      toast.success('Activity added to the stop.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add activity.');
    }
  }

  async function handleUpdateActivity(stopId, activityId, field, value) {
    const payload = { [field]: value };

    if (field === 'cost') payload[field] = value === '' ? 0 : Number(value);
    if (field === 'startTime' || field === 'endTime') payload[field] = value ? new Date(value).toISOString() : null;

    setStops((current) =>
      current.map((entry) =>
        entry.stop.id === stopId
          ? {
              ...entry,
              activities: entry.activities.map((activity) =>
                activity.id === activityId
                  ? {
                      ...activity,
                      [field]: payload[field],
                    }
                  : activity,
              ),
            }
          : entry,
      ),
    );

    try {
      await activitiesService.update(tripId, stopId, activityId, payload);
    } catch {
      toast.error('Failed to save activity changes.');
    }
  }

  async function handleDeleteActivity(stopId, activityId) {
    try {
      await activitiesService.remove(tripId, stopId, activityId);
      setStops((current) =>
        current.map((entry) =>
          entry.stop.id === stopId
            ? { ...entry, activities: entry.activities.filter((activity) => activity.id !== activityId) }
            : entry,
        ),
      );
      toast.success('Activity removed.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove activity.');
    }
  }

  async function handleSearchActivities(event) {
    event.preventDefault();

    const stop = selectedStop;
    const city = activityQuery.city || stop?.city?.name || trip?.name || 'Everywhere';

    setSearchingActivities(true);
    try {
      const response = await activitiesService.searchIdeas({
        city,
        country: activityQuery.country || stop?.city?.country || '',
        type: activityQuery.type || '',
        budget: activityQuery.budget,
        duration: activityQuery.duration || '',
        limit: activityQuery.limit,
      });

      setActivityIdeas(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to search activities.');
    } finally {
      setSearchingActivities(false);
    }
  }

  async function handleAddIdeaToStop(idea) {
    if (!selectedStop) {
      toast.error('Pick a stop first.');
      return;
    }

    await handleAddActivity({
      name: idea.name,
      type: idea.type,
      cost: idea.cost,
      duration: idea.duration,
      notes: idea.notes,
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-(--app-color-primary) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <PageHeader
        title={trip?.name || 'Itinerary Builder'}
        subtitle="Build your route, sort activities by day, and search ideas with live filters."
        action={(
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/trips')}>
              <ChevronLeft size={16} />
              Back to trips
            </Button>
            <Button variant={viewMode === 'list' ? 'primary' : 'secondary'} onClick={() => setViewMode('list')}>
              <List size={16} />
              List view
            </Button>
            <Button variant={viewMode === 'calendar' ? 'primary' : 'secondary'} onClick={() => setViewMode('calendar')}>
              <CalendarViewIcon size={16} />
              Calendar view
            </Button>
          </div>
        )}
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card
            title="Add destinations"
            subtitle="Search cities by country, popularity, and cost index."
            headerAction={<span className="text-sm font-medium text-(--app-color-text-muted)">{stops.length} stops</span>}
            className="p-0"
          >
            <div className="space-y-4 p-6">
              <Input
                label="Search cities"
                value={cityQuery}
                onChange={(event) => setCityQuery(event.target.value)}
                placeholder="Type a city or country"
                icon={Search}
              />

              {cityResults.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {cityResults.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleAddStop(city)}
                      className="flex items-center justify-between rounded-2xl border border-(--app-color-border) bg-(--app-color-surface-elevated) px-4 py-3 text-left transition-colors hover:border-(--app-color-primary) hover:bg-(--app-color-primary-soft)"
                    >
                      <div>
                        <p className="font-semibold text-(--app-color-text)">{city.name}</p>
                        <p className="text-sm text-(--app-color-text-muted)">{city.country}</p>
                      </div>
                      <div className="text-right text-xs font-semibold uppercase tracking-widest text-(--app-color-text-muted)">
                        <p>{city.costIndex}</p>
                        <p>{city.popularity} pop</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm text-(--app-color-text-muted)">
                <span className="flex items-center gap-2 rounded-full bg-(--app-color-primary-soft) px-3 py-1 text-(--app-color-primary)"><Route size={14} /> {stops.length} destinations</span>
                <span className="flex items-center gap-2 rounded-full bg-(--app-color-surface-elevated) px-3 py-1"><Sparkles size={14} /> {totalActivities} activities</span>
                <span className="flex items-center gap-2 rounded-full bg-(--app-color-surface-elevated) px-3 py-1"><CirclePlus size={14} /> ${totalActivityCost.toFixed(2)} planned activity cost</span>
              </div>
            </div>
          </Card>

          {viewMode === 'list' ? (
            <div className="space-y-4">
              {stops.map((entry, index) => (
                <Card
                  key={entry.stop.id}
                  className="p-0"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleStopDrop(index)}
                >
                  <div className="border-b border-(--app-color-border) bg-(--app-color-surface-elevated) px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          draggable
                          onDragStart={() => handleStopDragStart(index)}
                          className="mt-0.5 rounded-lg border border-(--app-color-border) bg-white p-2 text-(--app-color-text-muted)"
                          aria-label="Reorder stop"
                        >
                          <GripVertical size={16} />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-(--app-color-primary) px-2 py-0.5 text-xs font-bold text-white">{index + 1}</span>
                            <h3 className="text-lg font-bold text-(--app-color-text)">{entry.city?.name || 'Unknown city'}</h3>
                          </div>
                          <p className="mt-1 text-sm text-(--app-color-text-muted)">{entry.city?.country} · Cost index {entry.city?.costIndex || 'medium'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setSelectedStopId(entry.stop.id)}>
                          Focus
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteStop(entry.stop.id)} className="text-red-600 hover:bg-red-50">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Input
                        label="Arrival date"
                        type="date"
                        value={toDateInput(entry.stop.arrivalDate)}
                        onChange={(event) => handleStopDateChange(entry.stop.id, 'arrivalDate', event.target.value)}
                      />
                      <Input
                        label="Departure date"
                        type="date"
                        value={toDateInput(entry.stop.departureDate)}
                        onChange={(event) => handleStopDateChange(entry.stop.id, 'departureDate', event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 p-5">
                    {entry.activities.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-(--app-color-border) p-5 text-sm text-(--app-color-text-muted)">
                        No activities yet. Search ideas on the right, then add them here.
                      </div>
                    ) : (
                      entry.activities.map((activity, activityIndex) => (
                        <div
                          key={activity.id}
                          className="rounded-2xl border border-(--app-color-border) bg-white p-4"
                          draggable
                          onDragStart={() => handleActivityDragStart(entry.stop.id, activityIndex)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => handleActivityDrop(entry.stop.id, activityIndex)}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              className="mt-1 rounded-lg border border-(--app-color-border) bg-(--app-color-surface-elevated) p-2 text-(--app-color-text-muted)"
                              aria-label="Reorder activity"
                              draggable
                              onDragStart={() => handleActivityDragStart(entry.stop.id, activityIndex)}
                            >
                              <GripVertical size={14} />
                            </button>

                            <div className="grid flex-1 gap-3 md:grid-cols-2">
                              <Input
                                value={activity.name}
                                onChange={(event) => handleUpdateActivity(entry.stop.id, activity.id, 'name', event.target.value)}
                                placeholder="Activity name"
                              />

                              <label className="text-sm font-medium text-(--app-color-text)">
                                Type
                                <select
                                  value={activity.type}
                                  onChange={(event) => handleUpdateActivity(entry.stop.id, activity.id, 'type', event.target.value)}
                                  className="mt-2 w-full rounded-lg border border-(--app-color-border) bg-white px-3 py-2 text-sm"
                                >
                                  {ACTIVITY_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <Input
                                label="Cost"
                                type="number"
                                min="0"
                                step="0.01"
                                value={activity.cost}
                                onChange={(event) => handleUpdateActivity(entry.stop.id, activity.id, 'cost', event.target.value)}
                              />

                              <Input
                                label="Duration"
                                value={activity.duration || ''}
                                onChange={(event) => handleUpdateActivity(entry.stop.id, activity.id, 'duration', event.target.value)}
                                placeholder="2 hours"
                              />

                              <Input
                                label="Start time"
                                type="datetime-local"
                                value={toDateTimeLocal(activity.startTime)}
                                onChange={(event) => handleUpdateActivity(entry.stop.id, activity.id, 'startTime', event.target.value)}
                              />

                              <Input
                                label="End time"
                                type="datetime-local"
                                value={toDateTimeLocal(activity.endTime)}
                                onChange={(event) => handleUpdateActivity(entry.stop.id, activity.id, 'endTime', event.target.value)}
                              />
                            </div>

                            <Button variant="ghost" size="sm" onClick={() => handleDeleteActivity(entry.stop.id, activity.id)} className="text-red-600 hover:bg-red-50">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button variant="secondary" size="sm" onClick={() => setSelectedStopId(entry.stop.id)}>
                        <Layers3 size={14} />
                        Search ideas for this stop
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {stops.map((entry, index) => (
                <Card key={entry.stop.id} className="p-0">
                  <div className="border-b border-(--app-color-border) bg-linear-to-r from-(--app-color-primary-soft) to-white px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-(--app-color-primary)">Day {index + 1}</p>
                        <h3 className="mt-1 text-lg font-bold text-(--app-color-text)">{entry.city?.name || 'Unknown city'}</h3>
                        <p className="text-sm text-(--app-color-text-muted)">{entry.city?.country}</p>
                      </div>
                      <button
                        type="button"
                        draggable
                        onDragStart={() => handleStopDragStart(index)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleStopDrop(index)}
                        className="rounded-full border border-(--app-color-border) bg-white p-2 text-(--app-color-text-muted)"
                        aria-label="Reorder stop"
                      >
                        <GripVertical size={16} />
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-(--app-color-text-muted)">
                      {toDateInput(entry.stop.arrivalDate) || 'Open arrival'} → {toDateInput(entry.stop.departureDate) || 'Open departure'}
                    </p>
                  </div>

                  <div className="space-y-3 p-5">
                    {entry.activities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="rounded-2xl border border-(--app-color-border) bg-(--app-color-surface-elevated) px-4 py-3">
                        <p className="font-semibold text-(--app-color-text)">{activity.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-widest text-(--app-color-text-muted)">
                          {activity.type} · ${Number(activity.cost || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}

                    {entry.activities.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-(--app-color-border) px-4 py-6 text-center text-sm text-(--app-color-text-muted)">
                        Add activities to this day from the search panel.
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Card title="Route map" subtitle="Leaflet map preview of the stops you've added.">
            {mapPoints.length > 0 ? (
              <div className="h-96 overflow-hidden rounded-2xl border border-(--app-color-border)">
                <MapContainer center={[center.lat, center.lng]} zoom={4} scrollWheelZoom className="h-full w-full">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mapPoints.length > 1 && <Polyline positions={mapPoints.map((point) => [point.lat, point.lng])} pathOptions={{ color: '#0f766e', weight: 4 }} />}
                  {stops.map((entry) => {
                    const coords = coordinatesByStop[entry.stop.id];
                    if (!coords) return null;
                    return (
                      <CircleMarker
                        key={entry.stop.id}
                        center={[coords.lat, coords.lng]}
                        radius={10}
                        pathOptions={{ color: '#7c3aed', fillColor: '#0f766e', fillOpacity: 0.85 }}
                      >
                        <Popup>
                          <strong>{entry.city?.name}</strong>
                          <br />
                          {entry.city?.country}
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-(--app-color-border) text-sm text-(--app-color-text-muted)">
                <div className="text-center">
                  <MapPinned size={28} className="mx-auto mb-3" />
                  Add a few cities to see the trip path here.
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title="Activity search"
            subtitle="Generate activity ideas with filters for type, cost, and duration."
          >
            <form className="grid gap-4" onSubmit={handleSearchActivities}>
              <Input
                label="City"
                value={activityQuery.city}
                onChange={(event) => setActivityQuery((current) => ({ ...current, city: event.target.value }))}
                placeholder="Use the active stop or type one in"
              />

              <Input
                label="Country"
                value={activityQuery.country}
                onChange={(event) => setActivityQuery((current) => ({ ...current, country: event.target.value }))}
                placeholder="Optional"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-(--app-color-text)">
                  Type
                  <select
                    value={activityQuery.type}
                    onChange={(event) => setActivityQuery((current) => ({ ...current, type: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-(--app-color-border) bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Any</option>
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-(--app-color-text)">
                  Budget
                  <select
                    value={activityQuery.budget}
                    onChange={(event) => setActivityQuery((current) => ({ ...current, budget: event.target.value }))}
                    className="mt-2 w-full rounded-lg border border-(--app-color-border) bg-white px-3 py-2 text-sm"
                  >
                    {BUDGET_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <Input
                label="Duration"
                value={activityQuery.duration}
                onChange={(event) => setActivityQuery((current) => ({ ...current, duration: event.target.value }))}
                placeholder="2 hours, half day, evening, etc."
              />

              <Button type="submit" loading={searchingActivities} fullWidth>
                <Search size={16} />
                Search activity ideas
              </Button>
            </form>
          </Card>

          <Card title="Search results" subtitle="Add ideas to the selected stop.">
            <div className="space-y-3">
              {!selectedStop && (
                <div className="rounded-2xl border border-dashed border-(--app-color-border) px-4 py-6 text-center text-sm text-(--app-color-text-muted)">
                  Add a stop first, then search activities for it.
                </div>
              )}

              {activityIdeas.length === 0 && selectedStop && !searchingActivities && (
                <div className="rounded-2xl border border-dashed border-(--app-color-border) px-4 py-6 text-center text-sm text-(--app-color-text-muted)">
                  Run a search to see activity suggestions.
                </div>
              )}

              {activityIdeas.map((idea, index) => (
                <div key={`${idea.name}-${index}`} className="rounded-2xl border border-(--app-color-border) bg-(--app-color-surface-elevated) p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-(--app-color-text)">{idea.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-widest text-(--app-color-text-muted)">
                        {idea.type} · ${Number(idea.cost || 0).toFixed(2)} · {idea.duration}
                      </p>
                      {idea.notes && <p className="mt-2 text-sm text-(--app-color-text-muted)">{idea.notes}</p>}
                    </div>

                    <Button variant="secondary" size="sm" onClick={() => handleAddIdeaToStop(idea)} disabled={!selectedStop}>
                      <Plus size={14} />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Selected stop">
            {selectedStop ? (
              <div className="space-y-2 text-sm text-(--app-color-text-muted)">
                <p className="font-semibold text-(--app-color-text)">{selectedStop.city?.name}</p>
                <p>{selectedStop.city?.country}</p>
                <p>{selectedStop.activities.length} activities attached</p>
              </div>
            ) : (
              <p className="text-sm text-(--app-color-text-muted)">Choose a stop to focus the activity search.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}