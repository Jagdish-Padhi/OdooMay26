import { useState, useEffect } from 'react';
import { Flag, AlertTriangle, CheckCircle2, XCircle, Clock, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../services/api';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
  reviewed: { label: 'Reviewed', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: CheckCircle2 },
  resolved: { label: 'Resolved', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 },
  dismissed: { label: 'Dismissed', color: 'bg-slate-50 text-slate-700 border-slate-100', icon: XCircle },
};

export default function ContentModeration() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports?status=${filter}`);
      setReports(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleUpdateReport = async (reportId, status, notes = '') => {
    try {
      await api.patch(`/admin/reports/${reportId}`, { status, adminNotes: notes });
      toast.success(`Report ${status}`);
      fetchReports();
    } catch (err) {
      toast.error('Failed to update report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          {['pending', 'reviewed', 'resolved', 'dismissed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filter === s ? 'bg-white text-(--app-color-primary) shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-40 w-full rounded-3xl bg-slate-100 animate-pulse" />
          ))
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200">
            <CheckCircle2 className="mb-4 text-emerald-500" size={48} />
            <p className="text-lg font-bold text-(--app-color-text)">Everything clear!</p>
            <p className="text-sm text-slate-400">No content reports are pending review at the moment.</p>
          </div>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="p-6 border-(--app-color-border)">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Flag size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">Report on {report.entityType}</h4>
                      <span className="text-xs text-slate-400 font-mono">#{report.entityId.slice(0, 8)}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 italic">&quot;{report.reason}&quot;</p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <Clock size={12} />
                        {new Date(report.createdAt).toLocaleString()}
                      </div>
                      <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-(--app-color-primary) hover:underline">
                        <ExternalLink size={12} />
                        View Content
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Config = STATUS_CONFIG[report.status];
                      return (
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${Config.color}`}>
                          <Config.icon size={12} />
                          {Config.label}
                        </span>
                      );
                    })()}
                  </div>
                  
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        className="h-9 px-4 text-[10px] font-bold uppercase border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => handleUpdateReport(report.id, 'resolved', 'Content deleted due to policy violation.')}
                      >
                        Delete Content
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="h-9 px-4 text-[10px] font-bold uppercase"
                        onClick={() => handleUpdateReport(report.id, 'dismissed', 'No violation found.')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
