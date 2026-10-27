export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'hr_admin' | 'manager' | 'employee';
  department: string;
  position: string;
  managerId?: {
    _id: string;
    name: string;
    email: string;
    position?: string;
    department?: string;
  } | null;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

export interface AttendanceRecord {
  _id: string;
  user: string | UserProfile;
  date: string;
  clockIn: string;
  clockOut?: string | null;
  durationMinutes: number;
  status: 'present' | 'half_day' | 'late' | 'absent';
  notes?: string;
  createdAt: string;
}

export interface LeaveRecord {
  _id: string;
  user: UserProfile;
  leaveType: 'annual' | 'sick' | 'casual' | 'unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
    position?: string;
  } | null;
  reviewNote?: string;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface AnnouncementItem {
  _id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  targetRole: 'all' | 'manager' | 'employee';
  createdBy: {
    _id: string;
    name: string;
    email: string;
    position?: string;
    avatar?: string;
  };
  readBy: string[];
  isRead?: boolean;
  createdAt: string;
}

export interface TrainingItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  capacity: number;
  startDate: string;
  endDate: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    position?: string;
  };
  enrolledEmployees: Array<{
    user: UserProfile;
    enrolledAt: string;
    status: 'enrolled' | 'in_progress' | 'completed';
  }>;
  isEnrolled?: boolean;
  enrolledCount?: number;
  isFull?: boolean;
  createdAt: string;
}

export interface DashboardData {
  role: 'hr_admin' | 'manager' | 'employee';
  metrics: Record<string, number>;
  departmentDistribution?: Array<{ department: string; count: number }>;
  recentAnnouncements?: AnnouncementItem[];
  teamMembers?: UserProfile[];
  myAttendance?: AttendanceRecord | null;
  todayAttendance?: AttendanceRecord | null;
}

export interface TestResultItem {
  step: number;
  title: string;
  passed: boolean;
  message: string;
  details?: Record<string, any>;
  durationMs: number;
}

export interface E2ETestResponse {
  success: boolean;
  allPassed: boolean;
  totalTests: number;
  passedTests: number;
  results: TestResultItem[];
}

const API_BASE = '/api';

export function getToken(): string | null {
  return localStorage.getItem('staffsync_token');
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem('staffsync_token', token);
  } else {
    localStorage.removeItem('staffsync_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with HTTP status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request<{ success: boolean; user: UserProfile }>('/auth/me'),

  getDemoUsers: () =>
    request<{ success: boolean; users: Array<Pick<UserProfile, '_id' | 'name' | 'email' | 'role' | 'department' | 'position' | 'avatar'>> }>(
      '/auth/demo-users'
    ),

  // Dashboard
  getDashboard: () => request<{ success: boolean } & DashboardData>('/dashboard/stats'),

  // Employees
  getEmployees: () =>
    request<{ success: boolean; count: number; data: UserProfile[] }>('/employees'),

  getEmployeeById: (id: string) =>
    request<{ success: boolean; data: UserProfile }>(`/employees/${id}`),

  createEmployee: (payload: {
    name: string;
    email: string;
    password: string;
    role: 'hr_admin' | 'manager' | 'employee';
    department: string;
    position: string;
    managerId?: string | null;
    phone?: string;
  }) =>
    request<{ success: boolean; message: string; data: UserProfile }>('/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Attendance
  clockIn: () =>
    request<{ success: boolean; message: string; data: AttendanceRecord }>('/attendance/clock-in', {
      method: 'POST',
    }),

  clockOut: () =>
    request<{ success: boolean; message: string; data: AttendanceRecord }>('/attendance/clock-out', {
      method: 'POST',
    }),

  getMyAttendance: () =>
    request<{
      success: boolean;
      today: AttendanceRecord | null;
      history: AttendanceRecord[];
    }>('/attendance/my'),

  getAttendanceOverview: () =>
    request<{
      success: boolean;
      date: string;
      count: number;
      data: AttendanceRecord[];
    }>('/attendance/overview'),

  // Leaves
  getLeaves: () =>
    request<{ success: boolean; count: number; data: LeaveRecord[] }>('/leaves'),

  submitLeave: (payload: {
    leaveType: 'annual' | 'sick' | 'casual' | 'unpaid';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }) =>
    request<{ success: boolean; message: string; data: LeaveRecord }>('/leaves', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  reviewLeave: (id: string, payload: { status: 'approved' | 'rejected'; reviewNote?: string }) =>
    request<{ success: boolean; message: string; data: LeaveRecord }>(`/leaves/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Announcements
  getAnnouncements: () =>
    request<{ success: boolean; count: number; data: AnnouncementItem[] }>('/announcements'),

  createAnnouncement: (payload: {
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
    targetRole: 'all' | 'manager' | 'employee';
  }) =>
    request<{ success: boolean; message: string; data: AnnouncementItem }>('/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  markAnnouncementRead: (id: string) =>
    request<{ success: boolean; message: string; data: AnnouncementItem }>(`/announcements/${id}/read`, {
      method: 'PUT',
    }),

  // Trainings
  getTrainings: () =>
    request<{ success: boolean; count: number; data: TrainingItem[] }>('/trainings'),

  createTraining: (payload: {
    title: string;
    description: string;
    category: string;
    instructor: string;
    capacity: number;
    startDate: string;
    endDate: string;
  }) =>
    request<{ success: boolean; message: string; data: TrainingItem }>('/trainings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  enrollTraining: (id: string) =>
    request<{ success: boolean; message: string; data: TrainingItem }>(`/trainings/${id}/enroll`, {
      method: 'POST',
    }),

  // Verification & Seed Tools
  runE2ETests: () => request<E2ETestResponse>('/e2e-test', { method: 'POST' }),

  resetSeedData: () =>
    request<{ success: boolean; message: string }>('/seed/reset', { method: 'POST' }),
};
