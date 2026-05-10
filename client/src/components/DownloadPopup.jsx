import { 
  FileDown, 
  CheckCircle2, 
  X, 
  Minimize2, 
  Maximize2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDownloadStore from '../store/download.store';
import Button from './Button';

/**
 * Professional Download Popup Component
 * Handles centered progress view and background download feedback.
 */
export default function DownloadPopup() {
  const { 
    isDownloading, 
    progress, 
    isMinimized, 
    isCompleted, 
    reportName,
    minimize,
    maximize,
    reset 
  } = useDownloadStore();

  const navigate = useNavigate();

  const handleView = () => {
    reset();
    navigate('/dashboard/reports');
  };

  if (!isDownloading && !isCompleted) return null;

  // Minimized State (Floating Bubble)
  if (isMinimized && isDownloading) {
    return (
      <div 
        onClick={maximize}
        className="fixed bottom-8 right-8 z-[100] flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 shadow-2xl border border-(--app-color-primary)/20 animate-in slide-in-from-bottom-4"
      >
        <div className="relative">
          <Loader2 className="animate-spin text-(--app-color-primary)" size={20} />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">
            {Math.min(progress, 99)}%
          </span>
        </div>
        <p className="text-xs font-bold">Generating Report...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-[400px] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-50 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--app-color-primary-soft) text-(--app-color-primary)">
              {isCompleted ? <CheckCircle2 size={20} /> : <FileDown size={20} />}
            </div>
            <div>
              <h3 className="text-sm font-bold">{isCompleted ? 'Download Ready' : 'Preparing Report'}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-(--app-color-text-muted)">{reportName || 'Trip Summary'}</p>
            </div>
          </div>
          {!isCompleted && (
            <button onClick={minimize} className="text-slate-400 hover:text-slate-600 transition-colors">
              <Minimize2 size={18} />
            </button>
          )}
          {isCompleted && (
            <button onClick={reset} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {isCompleted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-(--app-color-primary-soft) text-(--app-color-primary)">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <p className="font-bold">Generation Complete</p>
                <p className="mt-1 text-sm text-(--app-color-text-muted)">Your professional grade PDF report is ready for viewing.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button fullWidth onClick={handleView}>
                  <ExternalLink size={18} />
                  View Report
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black text-(--app-color-primary)">{Math.min(progress, 100)}%</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Processing Data</span>
              </div>
              
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div 
                  className="h-full bg-gradient-to-r from-(--app-color-primary) to-(--app-color-accent) transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-center text-xs leading-relaxed text-slate-500">
                Optimizing images, calculating dynamic budget indices, and compiling itinerary data...
              </p>

              <div className="pt-2">
                <Button variant="secondary" fullWidth onClick={minimize}>
                  Continue in Background
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
