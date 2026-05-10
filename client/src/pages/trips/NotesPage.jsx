import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, MapPin, PencilLine, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Input from '../../components/Input.jsx';
import Modal from '../../components/Modal.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { FormSkeleton } from '../../components/skeletons/FormSkeleton.jsx';
import { notesService } from '../../services/notes.service.js';
import { stopsService } from '../../services/stops.service.js';
import { tripsService } from '../../services/trips.service.js';

export default function NotesPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(Boolean(tripId));
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [draft, setDraft] = useState({ content: '', stopId: '' });
  const [selectedStopFilter, setSelectedStopFilter] = useState('all');

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!tripId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [tripResponse, stopsResponse, notesResponse] = await Promise.all([
          tripsService.getOne(tripId),
          stopsService.getAll(tripId),
          notesService.getAll(tripId),
        ]);

        if (!alive) return;

        setTrip(tripResponse.data.data);
        setStops(stopsResponse.data.data || []);
        setNotes(notesResponse.data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load notes.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [tripId]);

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notes.filter((note) => {
      const matchesText = !query || note.content.toLowerCase().includes(query);
      const matchesStop = selectedStopFilter === 'all' || note.stopId === selectedStopFilter;
      return matchesText && matchesStop;
    });
  }, [notes, searchQuery, selectedStopFilter]);

  function openCreateModal() {
    setDraft({ content: '', stopId: selectedStopFilter === 'all' ? '' : selectedStopFilter });
    setEditingNoteId(null);
    setIsModalOpen(true);
  }

  function openEditModal(note) {
    setDraft({ content: note.content, stopId: note.stopId || '' });
    setEditingNoteId(note.id);
    setIsModalOpen(true);
  }

  async function saveNote() {
    const content = draft.content.trim();
    if (!tripId || !content) return;

    try {
      if (editingNoteId) {
        const response = await notesService.update(tripId, editingNoteId, {
          content,
          stopId: draft.stopId || null,
        });
        const updated = response.data.data;
        setNotes((current) => current.map((note) => (note.id === editingNoteId ? updated : note)));
        toast.success('Note updated.');
      } else {
        const response = await notesService.create(tripId, {
          content,
          stopId: draft.stopId || null,
        });
        setNotes((current) => [response.data.data, ...current]);
        toast.success('Note saved.');
      }

      setIsModalOpen(false);
      setEditingNoteId(null);
      setDraft({ content: '', stopId: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save note.');
    }
  }

  async function deleteNote(noteId) {
    try {
      await notesService.remove(tripId, noteId);
      setNotes((current) => current.filter((note) => note.id !== noteId));
      toast.success('Note deleted.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete note.');
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
          title="Trip Journal"
          subtitle="Open a specific trip to capture notes tied to that itinerary."
        />
        <Card className="p-8 text-center">
          <p className="text-sm text-(--app-color-text-muted)">Trip notes are saved per trip, and can also be attached to a specific stop.</p>
        </Card>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={`${trip.name} Journal`}
          subtitle="Capture moments, save discoveries, and keep location-specific notes linked to your trip."
          className="mb-0"
        />
        <Button onClick={openCreateModal} className="sm:w-auto">
          <Plus size={18} />
          New Note
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-14 w-full rounded-[1.25rem] border border-(--app-color-border) bg-white pl-12 pr-6 text-sm font-medium transition-all focus:border-(--app-color-primary) focus:ring-4 focus:ring-(--app-color-primary-soft)"
          />
        </div>

        <label className="block rounded-[1.25rem] border border-(--app-color-border) bg-white px-4 py-3 text-sm font-medium text-(--app-color-text)">
          Stop filter
          <select
            value={selectedStopFilter}
            onChange={(event) => setSelectedStopFilter(event.target.value)}
            className="mt-2 w-full rounded-lg border border-(--app-color-border) bg-white px-3 py-2 text-sm"
          >
            <option value="all">All stops</option>
            {stops.map((stop) => (
              <option key={stop.stop.id} value={stop.stop.id}>
                {stop.city?.name || 'Unknown city'}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredNotes.map((note) => {
          const stop = stops.find((entry) => entry.stop.id === note.stopId);

          return (
            <Card key={note.id} className="group relative flex flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-xl border-none bg-white">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--app-color-primary-soft) text-(--app-color-primary)">
                  <CalendarDays size={18} />
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button type="button" onClick={() => openEditModal(note)} className="p-1 text-slate-400 hover:text-(--app-color-primary)">
                    <PencilLine size={16} />
                  </button>
                  <button type="button" onClick={() => deleteNote(note.id)} className="p-1 text-slate-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="mb-6 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-(--app-color-text)">{note.content}</p>

              <div className="mt-auto space-y-2 border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <MapPin size={12} className="text-(--app-color-accent)" />
                  {stop?.city?.name || 'Trip note'}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <CalendarDays size={12} />
                  {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </Card>
          );
        })}

        {filteredNotes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-40">
            <MapPin size={56} strokeWidth={1} />
            <p className="mt-4 text-lg font-bold">No notes found</p>
            <p className="text-sm">Capture your travel thoughts by creating a new note.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNoteId ? 'Edit Note' : 'Add to Journal'}
      >
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Content</label>
            <textarea
              rows={5}
              placeholder="What happened? What did you discover?"
              value={draft.content}
              onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
              className="w-full rounded-2xl border border-(--app-color-border) p-4 text-sm focus:border-(--app-color-primary) focus:ring-4 focus:ring-(--app-color-primary-soft)"
            />
          </div>

          <label className="block text-sm font-medium text-(--app-color-text)">
            Attach to stop
            <select
              value={draft.stopId}
              onChange={(event) => setDraft((current) => ({ ...current, stopId: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-(--app-color-border) bg-white px-3 py-2 text-sm"
            >
              <option value="">Trip-wide note</option>
              {stops.map((stop) => (
                <option key={stop.stop.id} value={stop.stop.id}>
                  {stop.city?.name || 'Unknown city'}
                </option>
              ))}
            </select>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={saveNote}>{editingNoteId ? 'Update Entry' : 'Save Entry'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}