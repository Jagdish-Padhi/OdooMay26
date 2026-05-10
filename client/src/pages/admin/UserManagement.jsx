import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Shield, UserX, UserCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';

const ROLE_COLORS = {
  admin: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  user: 'bg-slate-50 text-slate-700 border-slate-100',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}&search=${query}`);
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.pages);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [page, query]);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm font-medium focus:border-(--app-color-primary) focus:ring-4 focus:ring-(--app-color-primary-soft)"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="h-11">
            <Filter size={18} />
            Filters
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0 border-(--app-color-border)">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Explorer</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Plan</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Joined</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-6 h-16 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No explorers found matching your criteria.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-(--app-color-primary-soft) flex items-center justify-center font-bold text-(--app-color-primary) text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-(--app-color-text)">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${ROLE_COLORS[user.role]}`}>
                        {user.role === 'admin' ? <Shield size={10} /> : null}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${user.plan === 'pro' ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'admin' ? (
                          <button 
                            onClick={() => handleUpdateRole(user.id, 'user')}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Demote to User"
                          >
                            <ShieldAlert size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateRole(user.id, 'admin')}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Promote to Admin"
                          >
                            <Shield size={16} />
                          </button>
                        )}
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <UserX size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/30">
          <p className="text-xs font-medium text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="h-8 text-[10px] font-bold uppercase"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              className="h-8 text-[10px] font-bold uppercase"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
