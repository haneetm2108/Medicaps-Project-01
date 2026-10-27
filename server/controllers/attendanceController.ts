import { Response, NextFunction } from 'express';
import { Attendance } from '../models/Attendance';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

function getTodayFormatted(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function clockIn(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const today = getTodayFormatted();

    const existingRecord = await Attendance.findOne({ user: userId, date: today });
    if (existingRecord) {
      res.status(400).json({
        success: false,
        message: 'Attendance already recorded: you have already clocked in for today.',
        data: existingRecord,
      });
      return;
    }

    const clockInTime = new Date();
    const hours = clockInTime.getHours();
    const minutes = clockInTime.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);

    const record = await Attendance.create({
      user: userId,
      date: today,
      clockIn: clockInTime,
      status: isLate ? 'late' : 'present',
    });

    res.status(201).json({
      success: true,
      message: `Clock-in registered successfully at ${clockInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      data: record,
    });
  } catch (err) {
    next(err);
  }
}

export async function clockOut(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const today = getTodayFormatted();

    const record = await Attendance.findOne({ user: userId, date: today });

    if (!record) {
      res.status(400).json({
        success: false,
        message: 'Cannot clock out: no clock-in record found for today.',
      });
      return;
    }

    if (record.clockOut) {
      res.status(400).json({
        success: false,
        message: 'You have already clocked out for today.',
        data: record,
      });
      return;
    }

    const clockOutTime = new Date();
    const durationMs = clockOutTime.getTime() - new Date(record.clockIn).getTime();
    const durationMinutes = Math.max(1, Math.round(durationMs / (1000 * 60)));

    record.clockOut = clockOutTime;
    record.durationMinutes = durationMinutes;

    if (record.status !== 'late') {
      record.status = durationMinutes >= 240 ? 'present' : 'half_day';
    }

    await record.save();

    res.json({
      success: true,
      message: `Clock-out registered successfully. Worked duration: ${(durationMinutes / 60).toFixed(1)} hours.`,
      data: record,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const today = getTodayFormatted();

    const [records, todayRecord] = await Promise.all([
      Attendance.find({ user: userId }).sort({ date: -1 }).limit(30),
      Attendance.findOne({ user: userId, date: today }),
    ]);

    res.json({
      success: true,
      today: todayRecord || null,
      history: records,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAttendanceOverview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const currentUser = req.user!;
    const today = getTodayFormatted();
    let userFilter: any = {};

    if (currentUser.role === 'manager') {
      const reports = await User.find({ managerId: currentUser._id }).select('_id');
      const reportIds = reports.map((r) => r._id);
      userFilter = { user: { $in: [...reportIds, currentUser._id] } };
    }

    const todayRecords = await Attendance.find({ date: today, ...userFilter })
      .populate('user', 'name email position department avatar')
      .sort({ clockIn: -1 });

    res.json({
      success: true,
      date: today,
      count: todayRecords.length,
      data: todayRecords,
    });
  } catch (err) {
    next(err);
  }
}
