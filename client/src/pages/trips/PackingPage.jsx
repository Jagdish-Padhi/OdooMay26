import { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  ClipboardList, 
  Smartphone, 
  Shirt, 
  FileText, 
  Package,
  MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ProgressBar from '../../components/ProgressBar';

const CATEGORIES = [
  { id: 'clothing', label: 'Clothing', icon: Shirt, color: 'bg-blue-500' },
  { id: 'documents', label: 'Documents', icon: FileText, color: 'bg-purple-500' },
  { id: 'electronics', label: 'Electronics', icon: Smartphone, color: 'bg-amber-500' },
  { id: 'essentials', label: 'Essentials', icon: CheckSquare, color: 'bg-emerald-500' },
  { id: 'other', label: 'Other', icon: Package, color: 'bg-slate-500' },
];

export default function PackingListPage() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('essentials');
  const [isLoading, setIsLoading] = useState(false);

  // Mock initial items for demo if no trip selected
  useEffect(() => {
    setItems([
      { id: '1', item: 'Passport', category: 'documents', isPacked: true },
      { id: '2', item: 'Power Bank', category: 'electronics', isPacked: false },
      { id: '3', item: 'Sunscreen', category: 'essentials', isPacked: true },
    ]);
  }, []);

  const toggleItem = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isPacked: !item.isPacked } : item
    ));
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    const item = {
      id: Date.now().toString(),
      item: newItem,
      category: selectedCategory,
      isPacked: false
    };
    setItems([...items, item]);
    setNewItem('');
    toast.success('Item added');
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    toast.success('Item removed');
  };

  const packedCount = items.filter(i => i.isPacked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <PageHeader 
        title="Packing Checklist" 
        subtitle="Don't leave the essentials behind. Stay organized for your next trip."
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Progress & Add Item */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-(--app-color-text-muted)">Overall Progress</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-black text-(--app-color-primary)">{Math.round(progress)}%</span>
              <span className="text-sm font-medium text-(--app-color-text-muted)">{packedCount}/{totalCount} Items</span>
            </div>
            <ProgressBar value={progress} className="h-3 rounded-full" />
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-(--app-color-text-muted)">Add New Item</h3>
            <form onSubmit={addItem} className="space-y-4">
              <Input 
                placeholder="What to pack?"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-bold transition-all ${
                      selectedCategory === cat.id 
                        ? 'border-(--app-color-primary) bg-(--app-color-primary-soft) text-(--app-color-primary)' 
                        : 'border-(--app-color-border) hover:bg-slate-50'
                    }`}
                  >
                    <cat.icon size={14} />
                    {cat.label}
                  </button>
                ))}
              </div>
              <Button type="submit" fullWidth>
                <Plus size={18} />
                Add to List
              </Button>
            </form>
          </Card>
        </div>

        {/* List View */}
        <div className="space-y-6 lg:col-span-2">
          {CATEGORIES.map(cat => {
            const catItems = items.filter(i => i.category === cat.id);
            if (catItems.length === 0) return null;

            return (
              <Card key={cat.id} className="overflow-hidden p-0 border-none shadow-sm">
                <div className={`flex items-center gap-3 px-6 py-4 text-white ${cat.color}`}>
                  <cat.icon size={20} />
                  <h3 className="font-bold uppercase tracking-widest text-sm">{cat.label}</h3>
                  <span className="ml-auto text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    {catItems.filter(i => i.isPacked).length}/{catItems.length}
                  </span>
                </div>
                <div className="divide-y divide-(--app-color-border)/40 bg-white">
                  {catItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50 ${item.isPacked ? 'opacity-60' : ''}`}
                    >
                      <button 
                        onClick={() => toggleItem(item.id)}
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${
                          item.isPacked 
                            ? 'border-emerald-500 bg-emerald-500 text-white' 
                            : 'border-(--app-color-border) bg-white'
                        }`}
                      >
                        {item.isPacked && <CheckSquare size={14} />}
                      </button>
                      <span className={`text-sm font-medium ${item.isPacked ? 'line-through text-slate-400' : 'text-(--app-color-text)'}`}>
                        {item.item}
                      </span>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="ml-auto text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <ClipboardList size={64} strokeWidth={1} />
              <p className="mt-4 text-lg font-bold">Your list is empty</p>
              <p className="text-sm">Start adding items to stay organized.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
