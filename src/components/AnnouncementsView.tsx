import React, { useState } from 'react';
import {
  BellRing,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Radio,
  X,
  Megaphone,
  User,
  Clock,
  Eye,
} from 'lucide-react';
import { UserProfile, AnnouncementItem, api } from '../api/client';

interface AnnouncementsViewProps {
  currentUser: UserProfile;
  announcements: AnnouncementItem[];
  onRefresh: () => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  currentUser,
  announcements,
  onRefresh,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetRole: 'all' as 'all' | 'manager' | 'employee',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const filtered = announcements.filter((item) => {
    if (filterPriority === 'all') return true;
    return item.priority === filterPriority;
  });

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    try {
      await api.createAnnouncement(formData);
      setFormSuccess('Announcement broadcasted across the company portal.');
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess(null);
        setFormData({
          title: '',
          content: '',
          priority: 'medium',
          targetRole: 'all',
        });
        onRefresh();
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to post announcement');
    } finally {
      setFormLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markAnnouncementRead(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Company Notice Board</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {filtered.length} Notices
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal organizational bulletins, emergency alerts, and leadership announcements.
          </p>
        </div>

        {currentUser.role === 'hr_admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Announcement</span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <span className="text-xs text-slate-400 mr-2">Filter Priority:</span>
        {['all', 'high', 'medium', 'low'].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
              filterPriority === p
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item._id}
            className={`bg-white rounded-2xl p-5 border shadow-xs transition-all flex flex-col justify-between ${
              !item.isRead ? 'border-indigo-200 ring-1 ring-indigo-500/20' : 'border-slate-200/80'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${getPriorityBadge(
                      item.priority
                    )}`}
                  >
                    {item.priority} Priority
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Audience: {item.targetRole}
                  </span>
                </div>

                {!item.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(item._id)}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Mark as Read</span>
                  </button>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{item.content}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={
                      item.createdBy?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                        item.createdBy?.name || 'HR'
                      )}`
                    }
                    alt={item.createdBy?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span>
                  By <strong className="text-slate-700">{item.createdBy?.name || 'HR Team'}</strong>
                </span>
              </div>

              <div className="flex items-center space-x-1 font-mono text-[11px]">
                <Clock className="w-3 h-3" />
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            No announcements found for this filter.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Publish Notice</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Company Goals & Town Hall"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Urgent)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience *</label>
                  <select
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="all">All Organization (Global)</option>
                    <option value="manager">Managers Only</option>
                    <option value="employee">Staff / Employees Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the operational announcement, schedule, or policy update..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {formLoading ? 'Publishing...' : 'Broadcast Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
