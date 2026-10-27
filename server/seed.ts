import { connectDB } from './db';
import { User } from './models/User';
import { Announcement } from './models/Announcement';
import { Training } from './models/Training';
import { Leave } from './models/Leave';
import { Attendance } from './models/Attendance';

export async function seedDatabase(forceClean = false) {
  await connectDB();

  const userCount = await User.countDocuments();
  if (userCount > 0 && !forceClean) {
    console.log('[Seed] Database already contains users. Skipping initial seed.');
    return;
  }

  console.log('[Seed] Seeding StaffSync initial database records...');

  if (forceClean) {
    await Promise.all([
      User.deleteMany({}),
      Announcement.deleteMany({}),
      Training.deleteMany({}),
      Leave.deleteMany({}),
      Attendance.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing collections.');
  }

  // 1. HR Administrator
  const hrAdmin = await User.create({
    name: 'Sarah Connor',
    email: 'hr@staffsync.io',
    password: 'Password123!',
    role: 'hr_admin',
    department: 'Human Resources',
    position: 'VP of People & Culture',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  });

  // 2. Manager
  const manager = await User.create({
    name: 'Marcus Vance',
    email: 'manager@staffsync.io',
    password: 'Password123!',
    role: 'manager',
    department: 'Engineering',
    position: 'Engineering Director',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  });

  // 3. Employees reporting to Marcus
  const employee1 = await User.create({
    name: 'David Kim',
    email: 'david@staffsync.io',
    password: 'Password123!',
    role: 'employee',
    department: 'Engineering',
    position: 'Senior Backend Engineer',
    managerId: manager._id,
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  const employee2 = await User.create({
    name: 'Elena Rostova',
    email: 'elena@staffsync.io',
    password: 'Password123!',
    role: 'employee',
    department: 'Engineering',
    position: 'Lead Frontend Engineer',
    managerId: manager._id,
    phone: '+1 (555) 567-8901',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  });

  const employee3 = await User.create({
    name: 'Aisha Patel',
    email: 'aisha@staffsync.io',
    password: 'Password123!',
    role: 'employee',
    department: 'Product',
    position: 'Product Designer',
    phone: '+1 (555) 678-9012',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
  });

  // 4. Announcements
  await Announcement.create([
    {
      title: 'Company All-Hands Meeting & Q4 Objectives',
      content:
        'Join the leadership team this Thursday at 3:00 PM UTC for a review of our quarterly goals, product releases, and open Q&A session. Attendance is mandatory for all team members.',
      priority: 'high',
      targetRole: 'all',
      createdBy: hrAdmin._id,
      readBy: [hrAdmin._id, manager._id],
    },
    {
      title: 'Health & Wellness Benefit Enrollment Deadline',
      content:
        'Reminder: Annual benefits selection window closes on the 15th. Please review healthcare plans and flexible spending account contributions in the HR portal.',
      priority: 'medium',
      targetRole: 'all',
      createdBy: hrAdmin._id,
      readBy: [hrAdmin._id],
    },
    {
      title: 'Q4 Management Performance Reviews Schedule',
      content:
        'All people managers should finalize 360-degree feedback cycles with direct reports before the end of the month. Guidance template is in the manager handbook.',
      priority: 'high',
      targetRole: 'manager',
      createdBy: hrAdmin._id,
      readBy: [hrAdmin._id, manager._id],
    },
  ]);

  // 5. Training Programs
  const training1 = await Training.create({
    title: 'Scalable Distributed Systems & Microservices',
    description:
      'In-depth masterclass covering event-driven architecture, distributed tracing, Kubernetes ingress, and database sharding patterns.',
    category: 'Cloud Engineering',
    instructor: 'Dr. Robert Lang',
    capacity: 12,
    startDate: new Date(Date.now() + 86400000 * 5),
    endDate: new Date(Date.now() + 86400000 * 12),
    createdBy: manager._id,
    enrolledEmployees: [
      { user: employee1._id, enrolledAt: new Date(), status: 'enrolled' },
    ],
  });

  const training2 = await Training.create({
    title: 'Advanced React 19 & Next-Gen State Architecture',
    description:
      'Master concurrent rendering, optimistic UI mutations, server actions, and high-performance animation patterns.',
    category: 'Frontend Engineering',
    instructor: 'Sophia Meyer',
    capacity: 10,
    startDate: new Date(Date.now() + 86400000 * 3),
    endDate: new Date(Date.now() + 86400000 * 7),
    createdBy: manager._id,
    enrolledEmployees: [
      { user: employee2._id, enrolledAt: new Date(), status: 'enrolled' },
    ],
  });

  const training3 = await Training.create({
    title: 'High-Impact Management & Empathy-Driven Coaching',
    description:
      'Essential leadership competencies: constructive feedback, psychological safety, career development roadmaps, and conflict resolution.',
    category: 'Leadership',
    instructor: 'Sarah Connor',
    capacity: 8,
    startDate: new Date(Date.now() + 86400000 * 7),
    endDate: new Date(Date.now() + 86400000 * 14),
    createdBy: hrAdmin._id,
    enrolledEmployees: [],
  });

  // 6. Pre-existing Leave Records
  await Leave.create([
    {
      user: employee2._id,
      leaveType: 'annual',
      startDate: new Date(Date.now() + 86400000 * 14),
      endDate: new Date(Date.now() + 86400000 * 18),
      days: 4,
      reason: 'Annual family holiday to visit parents abroad.',
      status: 'approved',
      reviewedBy: manager._id,
      reviewNote: 'Approved. Enjoy your vacation, Elena!',
      reviewedAt: new Date(),
    },
    {
      user: employee3._id,
      leaveType: 'sick',
      startDate: new Date(Date.now() - 86400000 * 2),
      endDate: new Date(Date.now() - 86400000 * 1),
      days: 1,
      reason: 'Seasonal viral flu and fever recovery.',
      status: 'approved',
      reviewedBy: hrAdmin._id,
      reviewNote: 'Approved. Rest well and recover.',
      reviewedAt: new Date(Date.now() - 86400000 * 2),
    },
  ]);

  // 7. Initial Attendance Records
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  await Attendance.create([
    {
      user: employee1._id,
      date: yesterday,
      clockIn: new Date(Date.now() - 86400000 - 3600000 * 8),
      clockOut: new Date(Date.now() - 86400000),
      durationMinutes: 480,
      status: 'present',
    },
    {
      user: employee2._id,
      date: yesterday,
      clockIn: new Date(Date.now() - 86400000 - 3600000 * 8),
      clockOut: new Date(Date.now() - 86400000),
      durationMinutes: 480,
      status: 'present',
    },
    {
      user: manager._id,
      date: today,
      clockIn: new Date(Date.now() - 3600000 * 2),
      clockOut: null,
      durationMinutes: 120,
      status: 'present',
    },
  ]);

  console.log('----------------------------------------------------');
  console.log('✅ STAFFSYNC DEMO DATABASE SEEDED SUCCESSFULLY');
  console.log('  HR Admin:     hr@staffsync.io      (Password: Password123!)');
  console.log('  Manager:      manager@staffsync.io (Password: Password123!)');
  console.log('  Employee 1:   david@staffsync.io   (Password: Password123!)');
  console.log('  Employee 2:   elena@staffsync.io   (Password: Password123!)');
  console.log('  Employee 3:   aisha@staffsync.io   (Password: Password123!)');
  console.log('----------------------------------------------------');
}

// Standalone execution support
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase(true)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
