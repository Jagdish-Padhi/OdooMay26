import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Circle, Plus, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Input from '../../components/Input.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ProgressBar from '../../components/ProgressBar.jsx';
import { FormSkeleton } from '../../components/skeletons/FormSkeleton.jsx';
import { checklistService } from '../../services/checklist.service.js';
import { tripsService } from '../../services/trips.service.js';

const CATEGORIES = ['clothing', 'documents', 'electronics', 'toiletries', 'essentials', 'other'];

const CATEGORY_LABELS = {
  clothing: 'Clothing',
  documents: 'Documents',
  electronics: 'Electronics',
  toiletries: 'Toiletries',
  essentials: 'Essentials',
  other: 'Other',
};

const CATEGORY_STYLES = {
  clothing: 'bg-blue-100 text-blue-700',
  documents: 'bg-purple-100 text-purple-700',
  electronics: 'bg-amber-100 text-amber-700',
  toiletries: 'bg-pink-100 text-pink-700',
  essentials: 'bg-emerald-100 text-emerald-700',
  other: 'bg-slate-100 text-slate-700',
};

export default function PackingPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(tripId));
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('essentials');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!tripId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [tripResponse, checklistResponse] = await Promise.all([
          tripsService.getOne(tripId),
          checklistService.getAll(tripId),
        ]);

        if (!alive) return;

        setTrip(tripResponse.data.data);
        setItems(checklistResponse.data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load checklist.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [tripId]);

  const packedCount = useMemo(() => items.filter((item) => item.isPacked).length, [items]);
  const progress = items.length ? (packedCount / items.length) * 100 : 0;

  const displayedItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'packed') return items.filter((item) => item.isPacked);
    return items.filter((item) => !item.isPacked);
  }, [filter, items]);

  async function handleAddItem(event) {
    event.preventDefault();
    const itemName = newItem.trim();
    if (!tripId || !itemName) return;

    try {
      const response = await checklistService.create(tripId, {
        item: itemName,
        category: newCategory,
      });

      setItems((current) => [...current, response.data.data]);
      setNewItem('');
      setNewCategory('essentials');
      toast.success('Item added.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add checklist item.');
    }
  }

  async function togglePacked(item) {
    try {
      const response = await checklistService.update(tripId, item.id, { isPacked: !item.isPacked });
      const updated = response.data.data;
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update item.');
    }
  }

  async function removeItem(itemId) {
    try {
      await checklistService.remove(tripId, itemId);
      setItems((current) => current.filter((entry) => entry.id !== itemId));
      toast.success('Item removed.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item.');
    }
  }

  async function resetChecklist() {
    try {
      await checklistService.reset(tripId);
      setItems((current) => current.map((entry) => ({ ...entry, isPacked: false })));
      toast.success('Checklist reset.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset checklist.');
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-12">
        <FormSkeleton />
      </div>
    );
  }

  if (!tripId) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-12">
        <PageHeader
          title="Packing Checklist"
          subtitle="Open a specific trip to manage its packing list."
        />
        <Card className="p-8 text-center">
          <p className="text-sm text-(--app-color-text-muted)">Packing items are trip-specific, so choose a trip from the Trips page or the itinerary builder.</p>
        </Card>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <PageHeader
        title={`${trip.name} Packing Checklist`}
        subtitle="Keep your trip essentials organized and track progress as you pack."
        action={(
          <Button variant="secondary" onClick={resetChecklist}>
            <RefreshCw size={16} />
            Reset
          </Button>
        )}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-(--app-color-text-muted)">Overall Progress</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-black text-(--app-color-primary)">{Math.round(progress)}%</span>
              <span className="text-sm font-medium text-(--app-color-text-muted)">{packedCount}/{items.length} Items</span>
            </div>
            <ProgressBar value={progress} className="h-3 rounded-full" />
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-(--app-color-text-muted)">Add New Item</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <Input
                placeholder="What do you need to pack?"
                value={newItem}
                onChange={(event) => setNewItem(event.target.value)}
              />

              <label className="block text-sm font-medium text-(--app-color-text)">
                Category
                <select
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-(--app-color-border) bg-white px-4 py-2 text-sm"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </label>

              <Button type="submit" fullWidth>
                <Plus size={16} />
                Add Item
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-(--app-color-text-muted)">Filters</h3>
            <div className="flex flex-wrap gap-2">
              {['all', 'packed', 'unpacked'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${filter === value ? 'bg-(--app-color-primary) text-white' : 'bg-(--app-color-surface-elevated) text-(--app-color-text-muted)'}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {displayedItems.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => togglePacked(item)} className="shrink-0">
                  {item.isPacked ? <CheckCircle2 className="text-(--app-color-primary)" size={22} /> : <Circle className="text-slate-300" size={22} />}
                </button>

                <div className="min-w-0 flex-1">
                  <p className={`truncate text-base font-semibold ${item.isPacked ? 'text-slate-400 line-through' : 'text-(--app-color-text)'}`}>{item.item}</p>
                  <p className="text-xs uppercase tracking-widest text-slate-400">{CATEGORY_LABELS[item.category] || item.category}</p>
                </div>

                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${CATEGORY_STYLES[item.category] || CATEGORY_STYLES.other}`}>
                  {CATEGORY_LABELS[item.category] || item.category}
                </span>

                <button type="button" onClick={() => removeItem(item.id)} className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}

          {displayedItems.length === 0 && (
            <Card className="p-10 text-center">
              <p className="text-sm text-(--app-color-text-muted)">No items match this filter yet.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}