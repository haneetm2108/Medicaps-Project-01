import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  History,
  Users,
  Timer,
  Play,
  Square,
  Sparkles,
} from 'lucide-react';
import { UserProfile, AttendanceRecord, api } from '../api/client';

interface AttendanceViewProps {
  currentUser: UserProfile;
  todayRecord: AttendanceRecord | null;
  history: AttendanceRecord[];
  onClockIn: () => void;
  onClockOut: () => void;
  onRefresh: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  currentUser,
  todayRecord,
  history,
  onClockIn,
  onClockOut,
  onRefresh,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [teamRecords, setTeamRecords] = useState<AttendanceRecord[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTab === 'team' && ['manager', 'hr_admin'].includes(currentUser.role)) {
      setLoadingTeam(true);
      api
        .getAttendanceOverview()
        .then((res) => setTeamRecords(res.data))
        .catch(console.error)
        .finally(() => setLoadingTeam(false));
    }
  }, [activeTab, currentUser.role]);

  const formatHours = (mins: number) => {
    if (!mins) return '0 hrs';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'half_day':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'late':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Real-time Clock */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Timer className="w-4 h-4" />
            <span>StaffSync Attendance Tracker</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentTime.toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Punch In/Out Action Card */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {todayRecord ? (
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">
                  {todayRecord.clockOut ? 'Clocked Out for Today' : 'Shift Active'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Clock In:{' '}
                  {new Date(todayRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {todayRecord.clockOut && (
                    <>
                      {' '}
                      &middot; Out:{' '}
                      {new Date(todayRecord.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </>
                  )}
                </div>
              </div>

              {!todayRecord.clockOut && (
                <button
                  onClick={onClockOut}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Clock Out</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onClockIn}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all transform active:scale-95 flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Clock In for Today</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs if Manager or HR */}
      {['manager', 'hr_admin'].includes(currentUser.role) && (
        <div className="flex space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'my'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>My Attendance History</span>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'team'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>
              {currentUser.role === 'hr_admin' ? 'Company Attendance Today' : 'Team Attendance Today'}
            </span>
          </button>
        </div>
      )}

      {/* Active Tab View */}
      {activeTab === 'my' ? (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent Attendance Logs (Last 30 Days)
              </h3>
            </div>
            <span className="text-xs text-slate-400">{history.length} Entries Recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Clock In</th>
                  <th className="py-3 px-4">Clock Out</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{record.date}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {record.clockOut
                        ? new Date(record.clockOut).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : <span className="text-amber-600 font-semibold italic">Active shift</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {record.durationMinutes > 0 ? formatHours(record.durationMinutes) : '--'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${getStatusBadge(
                          record.status
                        )}`}
                      >
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}

                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No attendance records found yet. Click 'Clock In' above to record today's session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Team / Company Today Tab */
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Today's Roster Check-ins ({new Date().toISOString().split('T')[0]})
              </h3>
            </div>
            <button
              onClick={() => {
                setLoadingTeam(true);
                api
                  .getAttendanceOverview()
                  .then((res) => setTeamRecords(res.data))
                  .finally(() => setLoadingTeam(false));
              }}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Refresh Roster
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-4">Team Member</th>
                  <th className="py-3 px-4">Department & Position</th>
                  <th className="py-3 px-4">Clock In Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamRecords.map((item) => {
                  const emp = item.user as UserProfile;
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                            <img
                              src={
                                emp?.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                  emp?.name || 'User'
                                )}`
                              }
                              alt={emp?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{emp?.name || 'Unknown'}</div>
                            <div className="text-[11px] text-slate-400">{emp?.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{emp?.position}</div>
                        <div className="text-[11px] text-slate-400">{emp?.department}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-mono">
                        {new Date(item.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {item.durationMinutes > 0 ? formatHours(item.durationMinutes) : 'In progress'}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {teamRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {loadingTeam ? 'Loading roster check-ins...' : 'No check-ins recorded for today yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
