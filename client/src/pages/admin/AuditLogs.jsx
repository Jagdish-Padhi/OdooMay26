import { useState, useEffect } from 'react';
import { ScrollText, User, Activity, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ACTION_COLORS = {
  UPDATE_ROLE: 'text-blue-600 bg-blue-50',
  UPDATE_STATUS: 'text-amber-600 bg-amber-50',
  RESOLVE_REPORT: 'text-emerald-600 bg-emerald-50',
  DELETE_TRIP: 'text-rose-600 bg-rose-50',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">System Audit Logs</h3>
        <button 
          onClick={fetchLogs}
          className="text-xs font-bold uppercase tracking-widest text-(--app-color-primary) hover:underline"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-(--app-color-border) bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-6 py-4">Admin</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Entity</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="px-6 py-4"><div className="h-4 w-full bg-slate-100 rounded-lg" /></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-24 text-center">
                  <ScrollText className="mx-auto mb-4 text-slate-200" size={48} />
                  <p className="font-bold text-slate-400">No logs found</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={14} />
                      </div>
                      <span className="font-bold text-slate-700">{log.adminName || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'}`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 capitalize">{log.entityType}</span>
                      <span className="text-[10px] font-mono text-slate-400">{log.entityId?.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs text-[11px] text-slate-500 leading-relaxed">
                      {log.metadata ? (
                        <pre className="whitespace-pre-wrap font-sans">
                          {Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </pre>
                      ) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock size={12} />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
