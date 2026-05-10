import { 
  FileText, 
  Download, 
  Share2, 
  Trash2, 
  Clock, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import useDownloadStore from '../../store/download.store';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const reports = useDownloadStore(s => s.reports);

  const handleShare = (name) => {
    navigator.clipboard.writeText(`https://traveloop.com/shared/report/${Math.random().toString(36).substr(2, 9)}`);
    toast.success(`${name} link copied to clipboard!`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <PageHeader 
        title="Report Gallery" 
        subtitle="Access all your professional travel reports, exports, and data summaries."
      />

      {reports.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold">No reports yet</h3>
          <p className="mt-2 text-sm text-(--app-color-text-muted)">Generate a budget or itinerary report to see it here.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="group overflow-hidden p-0 hover:border-(--app-color-primary) transition-all">
              <div className="flex flex-col sm:flex-row items-center sm:items-stretch">
                {/* Icon Section */}
                <div className="flex w-full sm:w-32 items-center justify-center bg-slate-50 p-6 text-(--app-color-primary) transition-colors group-hover:bg-(--app-color-primary-soft)">
                  <div className="relative">
                    <FileText size={40} strokeWidth={1.5} />
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[8px] font-black shadow-sm">
                      PDF
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-(--app-color-text)">{report.name}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(report.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">{report.size}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => toast.success('Starting download...')}>
                        <Download size={14} />
                        Download
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleShare(report.name)}>
                        <Share2 size={14} />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action Section */}
                <button className="flex w-full sm:w-16 items-center justify-center border-t sm:border-t-0 sm:border-l border-slate-100 hover:bg-slate-50 transition-colors">
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-(--app-color-primary)" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Analytics Tip */}
      <div className="rounded-[2rem] bg-gradient-to-r from-slate-900 to-indigo-950 p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <ExternalLink size={24} className="text-(--app-color-accent)" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Advanced Data Insights</h4>
            <p className="mt-1 text-sm text-white/60">
              Generated reports now include industry-standard cost indices and risk assessment metrics as of May 2026.
            </p>
          </div>
          <div className="md:ml-auto">
            <Button variant="tertiary" className="bg-white/10 text-white hover:bg-white/20 border-none">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
