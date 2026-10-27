import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Attendance } from '../models/Attendance';
import { Leave } from '../models/Leave';
import { Training } from '../models/Training';
import { Announcement } from '../models/Announcement';
import { AuthRequest } from '../middleware/auth';

function getTodayFormatted(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const today = getTodayFormatted();
    const now = new Date();

    if (user.role === 'hr_admin') {
      const [
        totalEmployees,
        todayAttendance,
        pendingLeaves,
        activeLeaves,
        totalTrainings,
        departmentDistribution,
        recentAnnouncements,
      ] = await Promise.all([
        User.countDocuments({ status: 'active' }),
        Attendance.countDocuments({ date: today }),
        Leave.countDocuments({ status: 'pending' }),
        Leave.countDocuments({
          status: 'approved',
          startDate: { $lte: now },
          endDate: { $gte: now },
        }),
        Training.countDocuments(),
        User.aggregate([
          { $match: { status: 'active' } },
          { $group: { _id: '$department', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Announcement.find().sort({ createdAt: -1 }).limit(3).populate('createdBy', 'name position'),
      ]);

      const attendanceRate = totalEmployees > 0 ? Math.round((todayAttendance / totalEmployees) * 100) : 0;

      res.json({
        success: true,
        role: 'hr_admin',
        metrics: {
          totalEmployees,
          todayAttendance,
          attendanceRate,
          pendingLeaves,
          activeLeaves,
          totalTrainings,
        },
        departmentDistribution: departmentDistribution.map((d) => ({
          department: d._id || 'General',
          count: d.count,
        })),
        recentAnnouncements,
      });
      return;
    }

    if (user.role === 'manager') {
      const directReports = await User.find({ managerId: user._id }).select('_id name email position department avatar');
      const reportIds = directReports.map((r) => r._id);

      const [teamTodayAttendance, teamPendingLeaves, teamActiveLeaves, myTodayAttendance] = await Promise.all([
        Attendance.countDocuments({ user: { $in: reportIds }, date: today }),
        Leave.countDocuments({ user: { $in: reportIds }, status: 'pending' }),
        Leave.countDocuments({
          user: { $in: reportIds },
          status: 'approved',
          startDate: { $lte: now },
          endDate: { $gte: now },
        }),
        Attendance.findOne({ user: user._id, date: today }),
      ]);

      const teamAttendanceRate =
        directReports.length > 0 ? Math.round((teamTodayAttendance / directReports.length) * 100) : 0;

      res.json({
        success: true,
        role: 'manager',
        metrics: {
          teamSize: directReports.length,
          teamTodayAttendance,
          teamAttendanceRate,
          teamPendingLeaves,
          teamActiveLeaves,
        },
        teamMembers: directReports,
        myAttendance: myTodayAttendance,
      });
      return;
    }

    // Role: employee
    const [myApprovedLeaves, myTotalAttendance, myEnrolledTrainings, todayAttendance, myPendingLeaves] =
      await Promise.all([
        Leave.countDocuments({ user: user._id, status: 'approved' }),
        Attendance.countDocuments({ user: user._id }),
        Training.countDocuments({ 'enrolledEmployees.user': user._id }),
        Attendance.findOne({ user: user._id, date: today }),
        Leave.countDocuments({ user: user._id, status: 'pending' }),
      ]);

    res.json({
      success: true,
      role: 'employee',
      metrics: {
        daysAttended: myTotalAttendance,
        approvedLeaves: myApprovedLeaves,
        pendingLeaves: myPendingLeaves,
        enrolledTrainings: myEnrolledTrainings,
      },
      todayAttendance,
    });
  } catch (err) {
    next(err);
  }
}
