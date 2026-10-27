import { Response, NextFunction } from 'express';
import { Leave } from '../models/Leave';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export async function submitLeave(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { leaveType, startDate, endDate, days, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !days || !reason) {
      res.status(400).json({
        success: false,
        message: 'Leave type, start date, end date, days count, and reason are required.',
      });
      return;
    }

    if (!['annual', 'sick', 'casual', 'unpaid'].includes(leaveType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid leave type. Must be annual, sick, casual, or unpaid.',
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid start or end date format.' });
      return;
    }

    if (end < start) {
      res.status(400).json({ success: false, message: 'End date cannot be prior to start date.' });
      return;
    }

    const leave = await Leave.create({
      user: req.user!._id,
      leaveType,
      startDate: start,
      endDate: end,
      days: Number(days),
      reason: reason.trim(),
      status: 'pending',
    });

    const populatedLeave = await Leave.findById(leave._id).populate('user', 'name email position department');

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully and routed for managerial review.',
      data: populatedLeave,
    });
  } catch (err) {
    next(err);
  }
}

export async function getLeaves(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const currentUser = req.user!;
    let query: any = {};

    if (currentUser.role === 'hr_admin') {
      // HR Admin views all company leaves
      query = {};
    } else if (currentUser.role === 'manager') {
      // Manager views team's leaves + own leaves
      const directReports = await User.find({ managerId: currentUser._id }).select('_id');
      const reportIds = directReports.map((r) => r._id);
      query = {
        $or: [{ user: { $in: reportIds } }, { user: currentUser._id }],
      };
    } else {
      // Employee views only own leaves
      query = { user: currentUser._id };
    }

    const leaves = await Leave.find(query)
      .populate('user', 'name email position department managerId avatar')
      .populate('reviewedBy', 'name email position')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (err) {
    next(err);
  }
}

export async function reviewLeave(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, reviewNote } = req.body;
    const currentUser = req.user!;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be either "approved" or "rejected".',
      });
      return;
    }

    const leave = await Leave.findById(req.params.id).populate('user');
    if (!leave) {
      res.status(404).json({ success: false, message: 'Leave request not found.' });
      return;
    }

    // Role verification: If manager, verify the applicant is in their direct reports
    if (currentUser.role === 'manager') {
      const applicantUser = leave.user as any;
      if (!applicantUser.managerId || applicantUser.managerId.toString() !== currentUser._id.toString()) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: you are not authorized to review leave for employees outside your direct team.',
        });
        return;
      }
    }

    leave.status = status;
    leave.reviewNote = reviewNote || (status === 'approved' ? 'Approved by supervisor' : 'Rejected by supervisor');
    leave.reviewedBy = currentUser._id;
    leave.reviewedAt = new Date();

    await leave.save();

    const updated = await Leave.findById(leave._id)
      .populate('user', 'name email position department')
      .populate('reviewedBy', 'name email position');

    res.json({
      success: true,
      message: `Leave request marked as ${status}.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}
