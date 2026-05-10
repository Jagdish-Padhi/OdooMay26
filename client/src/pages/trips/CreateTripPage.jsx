import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, CopyPlus, Image, Info, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Input from '../../components/Input.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import useTripsStore from '../../store/trips.store.js';

function TripForm({ trip, destination, saving, onSubmit }) {
  const [form, setForm] = useState(() => ({
    name: trip?.name || (destination ? `Trip to ${destination}` : ''),
    startDate: (trip?.startDate && !isNaN(new Date(trip.startDate).getTime())) ? new Date(trip.startDate).toISOString().split('T')[0] : '',
    endDate: (trip?.endDate && !isNaN(new Date(trip.endDate).getTime())) ? new Date(trip.endDate).toISOString().split('T')[0] : '',
    description: trip?.description || '',
    coverPhoto: trip?.coverPhoto || '',
  }));

  const setField = (field) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6 rounded-2xl border border-(--app-color-border) bg-(--app-color-surface-elevated) p-4 text-sm text-(--app-color-text-muted)">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-(--app-color-primary-soft) p-2 text-(--app-color-primary)">
            <Sparkles size={14} />
          </div>
          <p>
            Keep this first version simple: name, dates, description, and a cover photo URL.
            You can turn the trip into a full itinerary later.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Input label="Trip name" value={form.name} onChange={setField('name')} placeholder="Summer in Italy" required />

        <div className="grid gap-6 md:grid-cols-2">
          <Input label="Start date" type="date" value={form.startDate} onChange={setField('startDate')} required icon={CalendarDays} />
          <Input label="End date" type="date" value={form.endDate} onChange={setField('endDate')} required icon={CalendarDays} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-(--app-color-text)">Description</label>
          <textarea
            value={form.description}
            onChange={setField('description')}
            rows={5}
            placeholder="Describe the trip vibe, goals, or must-see ideas."
            className="w-full rounded-lg border border-(--app-color-border) bg-white px-4 py-3 text-sm text-(--app-color-text) placeholder:text-(--app-color-text-muted) focus:border-(--app-color-primary) focus:outline-none focus:ring-2 focus:ring-(--app-color-primary)/20"
          />
        </div>

        <Input
          label="Cover photo URL"
          value={form.coverPhoto}
          onChange={setField('coverPhoto')}
          placeholder="https://images.unsplash.com/..."
          helperText="This project stores the cover as a URL, so paste an image link here."
          icon={Image}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-(--app-color-surface-elevated) px-4 py-3 text-sm text-(--app-color-text-muted)">
          <span className="flex items-center gap-2"><Info size={14} /> Leave fields blank if you are not ready to fill them yet.</span>
          <span className="flex items-center gap-2"><CopyPlus size={14} /> You can duplicate the trip later from the trip shell.</span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => onSubmit('cancel')} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(form)} loading={saving}>
            Save trip
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const destination = searchParams.get('destination') || '';

  const currentTrip = useTripsStore((state) => state.currentTrip);
  const loading = useTripsStore((state) => state.loading);
  const fetchTrip = useTripsStore((state) => state.fetchTrip);
  const clearCurrentTrip = useTripsStore((state) => state.clearCurrentTrip);
  const createTrip = useTripsStore((state) => state.createTrip);
  const updateTrip = useTripsStore((state) => state.updateTrip);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tripId) {
      clearCurrentTrip();
      return;
    }

    fetchTrip(tripId);
  }, [tripId, fetchTrip, clearCurrentTrip]);

  const toIso = (val) => {
    if (!val) return null;
    try {
      const d = new Date(val);
      return (d instanceof Date && !isNaN(d.getTime())) ? d.toISOString() : null;
    } catch (e) {
      console.error('Date conversion error:', e);
      return null;
    }
  };

  const handleSubmit = async (form) => {
    if (form === 'cancel') {
      navigate('/trips');
      return;
    }

    if (!form.name.trim() || !form.startDate || !form.endDate) {
      toast.error('Trip name and dates are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        startDate: toIso(form.startDate),
        endDate: toIso(form.endDate),
        description: form.description.trim() || null,
        coverPhoto: form.coverPhoto.trim() || null,
      };

      const trip = tripId ? await updateTrip(tripId, payload) : await createTrip(payload);
      toast.success(tripId ? 'Trip updated.' : 'Trip created.');
      navigate(`/trips/${trip.id}/builder`);
      return trip;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save trip.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  if (tripId && loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-(--app-color-primary) border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <PageHeader
        title={tripId ? 'Edit Trip' : 'Create Trip'}
        subtitle={tripId ? 'Update the shell for this trip before building the itinerary.' : 'Start with the core trip details and build the rest later.'}
      />

      <TripForm
        key={currentTrip?.id || tripId || 'new'}
        trip={currentTrip}
        destination={destination}
        saving={saving}
        onSubmit={handleSubmit}
      />
    </div>
  );
}