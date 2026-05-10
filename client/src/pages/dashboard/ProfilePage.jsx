import { useState } from 'react';
import { User, Mail, Bell, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../store/auth.store';
import api from '../../services/api';

export default function ProfilePage() {
  const { user, setAuth, logout } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    notifyOnHighPriority: user?.notifyOnHighPriority ?? true,
    notifyDigest: user?.notifyDigest ?? false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put('/users/profile', formData);
      setAuth({ user: res.data.user });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <PageHeader 
        title="Profile & Settings" 
        subtitle="Manage your personal information and preferences."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
        <div className="space-y-8">
          {/* Personal Information */}
          <Card className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--app-color-primary-soft) text-(--app-color-primary)">
                <User size={20} />
              </div>
              <h3 className="text-lg font-bold text-(--app-color-text)">Personal Information</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Doe"
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-(--app-color-text-muted)">
                    Email Address
                  </label>
                  <div className="flex h-12 items-center rounded-xl border border-(--app-color-border) bg-(--app-color-surface-elevated) px-4 text-sm text-(--app-color-text-muted)">
                    <Mail size={16} className="mr-2" />
                    {user?.email}
                    <div className="ml-auto">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    </div>
                  </div>
                  <p className="text-[10px] text-(--app-color-text-muted)">Email cannot be changed.</p>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="pt-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--app-color-canvas-glow) text-(--app-color-accent)">
                    <Bell size={20} />
                  </div>
                  <h3 className="text-base font-bold text-(--app-color-text)">Notification Preferences</h3>
                </div>

                <div className="space-y-4 rounded-2xl border border-(--app-color-border) p-6">
                  <label className="flex cursor-pointer items-start gap-4">
                    <input
                      type="checkbox"
                      name="notifyOnHighPriority"
                      checked={formData.notifyOnHighPriority}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-(--app-color-border) text-(--app-color-primary) focus:ring-(--app-color-primary)"
                    />
                    <div>
                      <p className="text-sm font-bold text-(--app-color-text)">High Priority Alerts</p>
                      <p className="text-xs text-(--app-color-text-muted)">Get notified immediately for urgent trip changes or flight updates.</p>
                    </div>
                  </label>

                  <div className="h-px bg-(--app-color-border)/50" />

                  <label className="flex cursor-pointer items-start gap-4">
                    <input
                      type="checkbox"
                      name="notifyDigest"
                      checked={formData.notifyDigest}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-(--app-color-border) text-(--app-color-primary) focus:ring-(--app-color-primary)"
                    />
                    <div>
                      <p className="text-sm font-bold text-(--app-color-text)">Weekly Travel Digest</p>
                      <p className="text-xs text-(--app-color-text-muted)">A summary of your upcoming trips and travel stats every Monday.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" loading={isSubmitting} className="px-10">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Account Security */}
          <Card className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-bold text-(--app-color-text)">Security</h3>
            </div>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold text-(--app-color-text)">Password</p>
                <p className="text-xs text-(--app-color-text-muted)">Change your account password to keep your data safe.</p>
              </div>
              <Button variant="secondary" size="sm">Change Password</Button>
            </div>
          </Card>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="w-full lg:w-64">
          <div className="sticky top-24 space-y-4">
            <Card className="overflow-hidden p-0">
              <div className="bg-gradient-to-br from-(--app-color-primary) to-(--app-color-accent) p-6 text-white text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-2xl font-black uppercase tracking-widest">
                  {user?.name?.[0]}
                </div>
                <h4 className="font-bold">{user?.name}</h4>
                <p className="text-xs text-white/70">
                  {user?.role === 'admin' ? 'SYSTEM ADMIN' : `${user?.plan?.toUpperCase()} PLAN`}
                </p>
              </div>
              <div className="p-4">
                <Button 
                  variant="tertiary" 
                  onClick={logout} 
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Sign Out
                </Button>
              </div>
            </Card>

            <div className="rounded-2xl border border-(--app-color-border) bg-(--app-color-surface-elevated) p-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-(--app-color-text-muted)">Joined TraveLoop</p>
              <p className="mt-1 text-sm font-black text-(--app-color-text)">
                {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
