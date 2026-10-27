import { Response, NextFunction } from 'express';
import { Announcement } from '../models/Announcement';
import { AuthRequest } from '../middleware/auth';

export async function createAnnouncement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, content, priority, targetRole } = req.body;

    if (!title || !content) {
      res.status(400).json({
        success: false,
        message: 'Title and announcement content are required.',
      });
      return;
    }

    const item = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      priority: priority || 'medium',
      targetRole: targetRole || 'all',
      createdBy: req.user!._id,
      readBy: [req.user!._id],
    });

    const populated = await Announcement.findById(item._id).populate('createdBy', 'name email position department');

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully to organization feed.',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAnnouncements(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const currentUser = req.user!;
    const userRole = currentUser.role;

    const targetRoles = ['all', userRole];
    if (userRole === 'hr_admin') {
      targetRoles.push('manager', 'employee');
    }

    const announcements = await Announcement.find({ targetRole: { $in: targetRoles } })
      .populate('createdBy', 'name email position department avatar')
      .sort({ createdAt: -1 });

    const formatted = announcements.map((a) => {
      const isRead = a.readBy.some((id) => id.toString() === currentUser._id.toString());
      return {
        ...a.toObject(),
        isRead,
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user!._id } },
      { new: true }
    );

    if (!announcement) {
      res.status(404).json({ success: false, message: 'Announcement not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Announcement marked as read.',
      data: announcement,
    });
  } catch (err) {
    next(err);
  }
}
