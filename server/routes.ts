import express from 'express';
import { login, getMe, listDemoUsers } from './controllers/authController';
import { createEmployee, getAllEmployees, getEmployeeById } from './controllers/employeeController';
import {
  clockIn,
  clockOut,
  getMyAttendance,
  getAttendanceOverview,
} from './controllers/attendanceController';
import { submitLeave, getLeaves, reviewLeave } from './controllers/leaveController';
import {
  createAnnouncement,
  getAnnouncements,
  markAsRead,
} from './controllers/announcementController';
import { createTraining, getTrainings, enrollTraining } from './controllers/trainingController';
import { getDashboardStats } from './controllers/dashboardController';
import { protect, authorize } from './middleware/auth';
import { runEndToEndTests } from './testRunner';
import { seedDatabase } from './seed';

const router = express.Router();

// Auth routes
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.get('/auth/demo-users', listDemoUsers);

// Dashboard routes
router.get('/dashboard/stats', protect, getDashboardStats);

// Employees routes
router.post('/employees', protect, authorize('hr_admin'), createEmployee);
router.get('/employees', protect, getAllEmployees);
router.get('/employees/:id', protect, getEmployeeById);

// Attendance routes
router.post('/attendance/clock-in', protect, clockIn);
router.post('/attendance/clock-out', protect, clockOut);
router.get('/attendance/my', protect, getMyAttendance);
router.get('/attendance/overview', protect, authorize('hr_admin', 'manager'), getAttendanceOverview);

// Leave routes
router.post('/leaves', protect, submitLeave);
router.get('/leaves', protect, getLeaves);
router.patch('/leaves/:id/review', protect, authorize('hr_admin', 'manager'), reviewLeave);

// Announcement routes
router.post('/announcements', protect, authorize('hr_admin'), createAnnouncement);
router.get('/announcements', protect, getAnnouncements);
router.put('/announcements/:id/read', protect, markAsRead);

// Training routes
router.post('/trainings', protect, authorize('hr_admin', 'manager'), createTraining);
router.get('/trainings', protect, getTrainings);
router.post('/trainings/:id/enroll', protect, enrollTraining);

// E2E Verification & Seed Utilities
router.post('/e2e-test', async (req, res, next) => {
  try {
    const results = await runEndToEndTests();
    res.json({ success: true, ...results });
  } catch (err) {
    next(err);
  }
});

router.get('/e2e-test', async (req, res, next) => {
  try {
    const results = await runEndToEndTests();
    res.json({ success: true, ...results });
  } catch (err) {
    next(err);
  }
});

router.post('/seed/reset', async (req, res, next) => {
  try {
    await seedDatabase(true);
    res.json({ success: true, message: 'Database reset and seeded with initial demo fixtures.' });
  } catch (err) {
    next(err);
  }
});

export default router;
