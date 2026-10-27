import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  BookOpen,
  Award,
} from 'lucide-react';
import { UserProfile, TrainingItem, api } from '../api/client';

interface TrainingViewProps {
  currentUser: UserProfile;
  trainings: TrainingItem[];
  onRefresh: () => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  currentUser,
  trainings,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [enrollLoadingId, setEnrollLoadingId] = useState<string | null>(null);
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Software Engineering',
    instructor: '',
    capacity: 10,
    startDate: '',
    endDate: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const canCreate = ['manager', 'hr_admin'].includes(currentUser.role);

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    try {
      await api.createTraining({
        ...formData,
        capacity: Number(formData.capacity),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });

      setFormSuccess('Training curriculum registered successfully.');
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess(null);
        setFormData({
          title: '',
          description: '',
          category: 'Software Engineering',
          instructor: '',
          capacity: 10,
          startDate: '',
          endDate: '',
        });
        onRefresh();
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create training');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEnroll = async (id: string) => {
    setEnrollLoadingId(id);
    setEnrollMessage(null);

    try {
      const res = await api.enrollTraining(id);
      setEnrollMessage(res.message);
      onRefresh();
    } catch (err: any) {
      setEnrollMessage(err.message || 'Enrollment failed');
    } finally {
      setEnrollLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Learning & Professional Development
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {trainings.length} Programs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal engineering cohorts, leadership modules, and technical masterclasses.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Training Program</span>
          </button>
        )}
      </div>

      {enrollMessage && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-medium text-indigo-900 flex items-center justify-between">
          <span>{enrollMessage}</span>
          <button onClick={() => setEnrollMessage(null)} className="text-indigo-400 hover:text-indigo-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Training Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {trainings.map((item) => {
          const enrolledCount = item.enrolledCount ?? item.enrolledEmployees?.length ?? 0;
          const capacity = item.capacity;
          const pct = Math.min(100, Math.round((enrolledCount / capacity) * 100));
          const isFull = item.isFull || enrolledCount >= capacity;
          const isEnrolled = item.isEnrolled;

          return (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    {item.category}
                  </span>
                  <div className="text-xs text-slate-500 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {enrolledCount}/{capacity} seats
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        isFull ? 'bg-rose-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Instructor:</span>
                    <strong className="text-slate-800">{item.instructor}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Timeline:</span>
                    <span className="font-mono text-[11px] text-slate-700">
                      {new Date(item.startDate).toLocaleDateString()} -{' '}
                      {new Date(item.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                {isEnrolled ? (
                  <div className="w-full py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Enrolled in Cohort</span>
                  </div>
                ) : isFull ? (
                  <button
                    disabled
                    className="w-full py-2 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl cursor-not-allowed"
                  >
                    Cohort Fully Booked
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(item._id)}
                    disabled={enrollLoadingId === item._id}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{enrollLoadingId === item._id ? 'Enrolling...' : 'Enroll in Course'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {trainings.length === 0 && (
          <div className="col-span-3 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            No training courses available yet.
          </div>
        )}
      </div>

      {/* Create Training Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Publish Training Course</h3>
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

            <form onSubmit={handleCreateTraining} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus & Raft in Go"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Cloud Architecture">Cloud Architecture</option>
                    <option value="Data Science & ML">Data Science & ML</option>
                    <option value="Leadership & Strategy">Leadership & Strategy</option>
                    <option value="Product Design">Product Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor / Lead *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jordan Bell, Principal Architect"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Syllabus *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize prerequisites, learning milestones, and outcomes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {formLoading ? 'Publishing...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
