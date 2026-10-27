import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  BellRing,
  GraduationCap,
  FlaskConical,
  Sparkles,
} from 'lucide-react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { AttendanceView } from './components/AttendanceView';
import { LeavesView } from './components/LeavesView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { TrainingView } from './components/TrainingView';
import { E2ETestView } from './components/E2ETestView';
import { LoginModal } from './components/LoginModal';
import {
  api,
  getToken,
  setToken,
  UserProfile,
  DashboardData,
  AttendanceRecord,
  LeaveRecord,
  AnnouncementItem,
  TrainingItem,
} from './api/client';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [demoUsers, setDemoUsers] = useState<Array<Pick<UserProfile, '_id' | 'name' | 'email' | 'role' | 'department' | 'position' | 'avatar'>>>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [bannerAlert, setBannerAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Core Datasets
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [trainings, setTrainings] = useState<TrainingItem[]>([]);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setBannerAlert({ message, type });
    setTimeout(() => setBannerAlert(null), 3500);
  };

  // Fetch full application dataset for current session
  const loadAppData = useCallback(async () => {
    try {
      const [
        meRes,
        demoRes,
        dashRes,
        empRes,
        attRes,
        leaveRes,
        annRes,
        trainRes,
      ] = await Promise.all([
        api.getMe(),
        api.getDemoUsers(),
        api.getDashboard().catch(() => null),
        api.getEmployees().catch(() => ({ data: [] })),
        api.getMyAttendance().catch(() => ({ today: null, history: [] })),
        api.getLeaves().catch(() => ({ data: [] })),
        api.getAnnouncements().catch(() => ({ data: [] })),
        api.getTrainings().catch(() => ({ data: [] })),
      ]);

      setCurrentUser(meRes.user);
      setDemoUsers(demoRes.users || []);
      if (dashRes) setDashboardData(dashRes);
      setEmployees(empRes.data || []);
      setTodayAttendance(attRes.today || null);
      setAttendanceHistory(attRes.history || []);
      setLeaves(leaveRes.data || []);
      setAnnouncements(annRes.data || []);
      setTrainings(trainRes.data || []);
    } catch (err: any) {
      console.warn('Authentication or data fetch error:', err.message);
      // If token expired or invalid, clear and prompt login
      if (err.message.includes('token') || err.message.includes('401') || err.message.includes('denied')) {
        setToken(null);
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Boot
  useEffect(() => {
    const existingToken = getToken();
    if (existingToken) {
      loadAppData();
    } else {
      // Auto-login as HR Admin for initial instant preview
      api
        .login({ email: 'hr@staffsync.io', password: 'Password123!' })
        .then((res) => {
          setToken(res.token);
          loadAppData();
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [loadAppData]);

  // Switch role simulator handler
  const handleSwitchUser = async (targetEmail: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email: targetEmail, password: 'Password123!' });
      setToken(res.token);
      showAlert(`Switched identity to ${res.user.name} (${res.user.role.replace('_', ' ')})`);
      await loadAppData();
    } catch (err: any) {
      showAlert(`Switch failed: ${err.message}`, 'error');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    showAlert('Signed out of session');
  };

  // Clock In handler
  const handleClockIn = async () => {
    try {
      const res = await api.clockIn();
      showAlert(res.message);
      loadAppData();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // Clock Out handler
  const handleClockOut = async () => {
    try {
      const res = await api.clockOut();
      showAlert(res.message);
      loadAppData();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        <p className="text-xs font-mono text-slate-400">Connecting to StaffSync backend & MongoDB...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginModal
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          loadAppData();
        }}
      />
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Directory', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leaves', label: 'Leaves', icon: CalendarCheck },
    { id: 'announcements', label: 'Announcements', icon: BellRing },
    { id: 'training', label: 'Training', icon: GraduationCap },
    { id: 'e2e-test', label: 'E2E Test Suite', icon: FlaskConical, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Alert */}
      {bannerAlert && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
            bannerAlert.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-rose-600 text-white border-rose-500'
          }`}
        >
          <span>{bannerAlert.message}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        demoUsers={demoUsers}
        announcements={announcements}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onRefresh={loadAppData}
        onOpenAnnouncements={() => setActiveTab('announcements')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Navigation Sub-header / Tabs */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? item.highlight
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-900 text-white shadow-xs'
                      : item.highlight
                      ? 'text-indigo-600 hover:bg-indigo-50 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            data={dashboardData}
            onNavigate={(tab) => setActiveTab(tab)}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeesView
            currentUser={currentUser}
            employees={employees}
            onRefresh={loadAppData}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView
            currentUser={currentUser}
            todayRecord={todayAttendance}
            history={attendanceHistory}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onRefresh={loadAppData}
          />
        )}

        {activeTab === 'leaves' && (
          <LeavesView
            currentUser={currentUser}
            leaves={leaves}
            onRefresh={loadAppData}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsView
            currentUser={currentUser}
            announcements={announcements}
            onRefresh={loadAppData}
          />
        )}

        {activeTab === 'training' && (
          <TrainingView
            currentUser={currentUser}
            trainings={trainings}
            onRefresh={loadAppData}
          />
        )}

        {activeTab === 'e2e-test' && <E2ETestView onRefreshApp={loadAppData} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">StaffSync HRMS Enterprise</span>
            <span>&middot;</span>
            <span>Node.js / Express / MongoDB Persistence</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Role-Based Access Control</span>
            <span>&middot;</span>
            <span>Port 3000 Full-Stack SPA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
