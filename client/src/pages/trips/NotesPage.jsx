import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  MoreVertical,
  Trash2,
  Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '', tripName: '', stopName: '' });

  // Mock data for demo
  useEffect(() => {
    setNotes([
      { 
        id: '1', 
        title: 'Hidden Cafe in Kyoto', 
        content: 'Found this amazing place called "Kurasu" near the station. Best pour-over ever. Must visit again.',
        tripName: 'Spring in Japan',
        stopName: 'Kyoto',
        createdAt: new Date().toISOString()
      },
      { 
        id: '2', 
        title: 'Train Tickets Info', 
        content: 'JR Pass needs to be exchanged at the airport. Keep the physical voucher safe!',
        tripName: 'Spring in Japan',
        stopName: 'Tokyo',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  }, []);

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveNote = () => {
    if (!currentNote.title || !currentNote.content) return;
    
    const newNote = {
      ...currentNote,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setNotes([newNote, ...notes]);
    setIsModalOpen(false);
    setCurrentNote({ title: '', content: '', tripName: '', stopName: '' });
    toast.success('Note saved to journal');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    toast.success('Note deleted');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader 
          title="Trip Journal" 
          subtitle="Capture moments, save discoveries, and keep important logs."
          className="mb-0"
        />
        <Button onClick={() => setIsModalOpen(true)} className="sm:w-auto">
          <Plus size={20} />
          New Note
        </Button>
      </div>

      {/* Search & Stats */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 w-full rounded-[1.25rem] border border-(--app-color-border) bg-white pl-12 pr-6 text-sm font-medium transition-all focus:border-(--app-color-primary) focus:ring-4 focus:ring-(--app-color-primary-soft)"
          />
        </div>
        <div className="flex items-center gap-4 rounded-[1.25rem] border border-(--app-color-border) bg-white px-6 py-4">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-(--app-color-text-muted)">Total Entries</p>
            <p className="text-lg font-black text-(--app-color-primary)">{notes.length}</p>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map(note => (
          <Card key={note.id} className="group relative flex flex-col p-6 transition-all hover:shadow-xl hover:-translate-y-1 border-none bg-white">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--app-color-primary-soft) text-(--app-color-primary)">
                <FileText size={20} />
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="p-1 text-slate-400 hover:text-(--app-color-primary)"><Edit3 size={16} /></button>
                <button onClick={() => deleteNote(note.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>

            <h3 className="mb-2 text-lg font-bold text-(--app-color-text) line-clamp-1">{note.title}</h3>
            <p className="mb-6 flex-1 text-sm leading-relaxed text-(--app-color-text-muted) line-clamp-3">
              {note.content}
            </p>

            <div className="mt-auto space-y-2 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <MapPin size={12} className="text-(--app-color-accent)" />
                {note.tripName} • {note.stopName}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <Calendar size={12} />
                {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </Card>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-40">
            <FileText size={64} strokeWidth={1} />
            <p className="mt-4 text-lg font-bold">No entries found</p>
            <p className="text-sm">Capture your travel thoughts by creating a new note.</p>
          </div>
        )}
      </div>

      {/* New Note Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add to Journal"
      >
        <div className="space-y-6">
          <Input 
            label="Entry Title" 
            placeholder="e.g. Best Gelato in Rome"
            value={currentNote.title}
            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">Content</label>
            <textarea 
              rows={5}
              placeholder="What happened? What did you discover?"
              value={currentNote.content}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
              className="w-full rounded-2xl border border-(--app-color-border) p-4 text-sm focus:border-(--app-color-primary) focus:ring-4 focus:ring-(--app-color-primary-soft)"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input 
              label="Trip" 
              placeholder="e.g. Europe 2026"
              value={currentNote.tripName}
              onChange={(e) => setCurrentNote({ ...currentNote, tripName: e.target.value })}
            />
            <Input 
              label="Location (Optional)" 
              placeholder="e.g. Rome"
              value={currentNote.stopName}
              onChange={(e) => setCurrentNote({ ...currentNote, stopName: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNote}>Save Entry</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
