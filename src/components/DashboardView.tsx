import React from 'react';
import {
  Users,
  Clock,
  CalendarCheck,
  GraduationCap,
  BellRing,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Briefcase,
  Shield,
  Layers,
} from 'lucide-react';
import { UserProfile, DashboardData, AnnouncementItem } from '../api/client';

interface DashboardViewProps {
  currentUser: UserProfile;
  data: DashboardData | null;
  onNavigate: (tab: string) => void;
  onClockIn: () => void;
  onClockOut: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  data,
  onNavigate,
  onClockIn,
  onClockOut,
}) => {
  if (!data) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const role = currentUser.role;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              <span>
                {role === 'hr_admin'
                  ? 'HR Administration Console'
                  : role === 'manager'
                  ? 'Team Engineering Management'
                  : 'Employee Self-Service Workspace'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {role === 'hr_admin'
                ? 'Overview of organizational workforce headcount, real-time attendance, and company-wide approval queues.'
                : role === 'manager'
                ? `Direct oversight of your team in ${currentUser.department}. Monitor team attendance and process leave authorizations.`
                : 'Manage your daily work attendance, submit paid leave requests, and enroll in company professional development courses.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {role === 'hr_admin' && (
              <>
                <button
                  onClick={() => onNavigate('employees')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Manage Employees</span>
                </button>
                <button
                  onClick={() => onNavigate('announcements')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Post Notice</span>
                </button>
              </>
            )}

            {role === 'manager' && (
              <>
                <button
                  onClick={() => onNavigate('leaves')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Review Team Leaves</span>
                </button>
                <button
                  onClick={() => onNavigate('training')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Create Course</span>
                </button>
              </>
            )}

            {role === 'employee' && (
              <>
                <button
                  onClick={() => onNavigate('leaves')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Request Leave</span>
                </button>
                <button
                  onClick={() => onNavigate('attendance')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Attendance Clock</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Decorative background flair */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {role === 'hr_admin' && (
          <>
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Employees</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {data.metrics.totalEmployees ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <span className="text-emerald-600 font-medium">100% active</span> across organization
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Present Today</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {data.metrics.todayAttendance ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <span className="text-indigo-600 font-semibold">{data.metrics.attendanceRate}%</span> attendance
                rate today
              </div>
            </div>

            <div
              onClick={() => onNavigate('leaves')}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Leaves</span>
                <CalendarCheck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
                {data.metrics.pendingLeaves ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Requires review</span>
                <span className="text-indigo-600 font-medium group-hover:underline">Review &rarr;</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Training</span>
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {data.metrics.totalTrainings ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <span>Company cohorts</span>
              </div>
            </div>
          </>
        )}

        {role === 'manager' && (
          <>
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Direct Reports</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {data.metrics.teamSize ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2">Assigned under your supervision</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Team Clock-ins</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {data.metrics.teamTodayAttendance ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                <span className="font-semibold text-emerald-600">{data.metrics.teamAttendanceRate}%</span> team
                present today
              </div>
            </div>

            <div
              onClick={() => onNavigate('leaves')}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-300 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Team Approvals</span>
                <CalendarCheck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
                {data.metrics.teamPendingLeaves ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Pending manager decision</span>
                <span className="text-indigo-600 font-medium group-hover:underline">Action queue &rarr;</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Team On Leave</span>
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {data.metrics.teamActiveLeaves ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2">Approved leave today</div>
            </div>
          </>
        )}

        {role === 'employee' && (
          <>
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Days Attended</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {data.metrics.daysAttended ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2">Total verified attendance shifts</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Approved Leaves</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {data.metrics.approvedLeaves ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2">Reviewed and approved by manager</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Leaves</span>
                <CalendarCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
                {data.metrics.pendingLeaves ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2">Awaiting supervisor review</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Trainings</span>
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {data.metrics.enrolledTrainings ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2">Active cohort enrollments</div>
            </div>
          </>
        )}
      </div>

      {/* Secondary Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Role specifics */}
        <div className="lg:col-span-2 space-y-6">
          {/* HR Admin: Department Distribution */}
          {role === 'hr_admin' && data.departmentDistribution && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Department Workforce Distribution</h3>
                </div>
                <span className="text-xs text-slate-400">Total: {data.metrics.totalEmployees} employees</span>
              </div>

              <div className="space-y-3">
                {data.departmentDistribution.map((dept) => {
                  const pct =
                    data.metrics.totalEmployees > 0
                      ? Math.round((dept.count / data.metrics.totalEmployees) * 100)
                      : 0;
                  return (
                    <div key={dept.department}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">{dept.department}</span>
                        <span className="text-slate-500">
                          {dept.count} members ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manager: Team Roster Snapshot */}
          {role === 'manager' && data.teamMembers && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Direct Reports Roster</h3>
                </div>
                <button
                  onClick={() => onNavigate('employees')}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  View all in directory &rarr;
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {data.teamMembers.map((member) => (
                  <div key={member._id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={
                            member.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`
                          }
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{member.name}</div>
                        <div className="text-[11px] text-slate-500">{member.position}</div>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {member.department}
                    </span>
                  </div>
                ))}
                {data.teamMembers.length === 0 && (
                  <p className="text-xs text-slate-400 py-3 text-center">No direct reports currently assigned.</p>
                )}
              </div>
            </div>
          )}

          {/* Employee: Today's Shift & Punch Action Card */}
          {role === 'employee' && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Today's Work Shift Attendance</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">{new Date().toLocaleDateString()}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  {data.todayAttendance ? (
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                          {data.todayAttendance.clockOut ? 'Shift Completed' : 'Currently Clocked In'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Clocked In:{' '}
                        <strong className="text-slate-800">
                          {new Date(data.todayAttendance.clockIn).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </strong>
                        {data.todayAttendance.clockOut && (
                          <>
                            {' '}
                            &middot; Clocked Out:{' '}
                            <strong className="text-slate-800">
                              {new Date(data.todayAttendance.clockOut).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </strong>{' '}
                            ({(data.todayAttendance.durationMinutes / 60).toFixed(1)} hrs)
                          </>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Shift Not Started
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        You have not recorded attendance for today yet.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {!data.todayAttendance && (
                    <button
                      onClick={onClockIn}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Clock In Now</span>
                    </button>
                  )}

                  {data.todayAttendance && !data.todayAttendance.clockOut && (
                    <button
                      onClick={onClockOut}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Clock Out</span>
                    </button>
                  )}

                  <button
                    onClick={() => onNavigate('attendance')}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    View History &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 span): System Feed & Quick Links */}
        <div className="space-y-6">
          {/* Real-time Announcements Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BellRing className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Latest Company Bulletins</h3>
              </div>
              <button
                onClick={() => onNavigate('announcements')}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                View all &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {data.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
                data.recentAnnouncements.map((ann) => (
                  <div key={ann._id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{ann.title}</span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold border ${
                          ann.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{ann.content}</p>
                    <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                      <span>By {ann.createdBy?.name || 'HR Admin'}</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No announcements posted</p>
              )}
            </div>
          </div>

          {/* Quick Architecture Verification Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100/80 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs mb-1">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Full-Stack Verification</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              StaffSync runs with real MongoDB persistence, JWT role authentication, and strict RBAC.
            </p>
            <button
              onClick={() => onNavigate('e2e-test')}
              className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Launch E2E Test Suite (8 Workflows)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
