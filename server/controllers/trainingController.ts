import { Response, NextFunction } from 'express';
import { Training } from '../models/Training';
import { AuthRequest } from '../middleware/auth';

export async function createTraining(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, category, instructor, capacity, startDate, endDate } = req.body;

    if (!title || !description || !category || !instructor || !capacity || !startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'All fields (title, description, category, instructor, capacity, startDate, endDate) are required.',
      });
      return;
    }

    const capNum = Number(capacity);
    if (isNaN(capNum) || capNum < 1) {
      res.status(400).json({
        success: false,
        message: 'Capacity must be a positive integer greater than zero.',
      });
      return;
    }

    const training = await Training.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      instructor: instructor.trim(),
      capacity: capNum,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: req.user!._id,
      enrolledEmployees: [],
    });

    const populated = await Training.findById(training._id).populate('createdBy', 'name email position');

    res.status(201).json({
      success: true,
      message: 'Training program successfully published to company learning portal.',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
}

export async function getTrainings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;

    const trainings = await Training.find()
      .populate('createdBy', 'name email position department')
      .populate('enrolledEmployees.user', 'name email department position avatar')
      .sort({ startDate: 1 });

    const formatted = trainings.map((t) => {
      const isEnrolled = t.enrolledEmployees.some(
        (e) => e.user && (e.user as any)._id?.toString() === userId.toString()
      );
      return {
        ...t.toObject(),
        isEnrolled,
        enrolledCount: t.enrolledEmployees.length,
        isFull: t.enrolledEmployees.length >= t.capacity,
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

export async function enrollTraining(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const training = await Training.findById(req.params.id);

    if (!training) {
      res.status(404).json({ success: false, message: 'Training course not found.' });
      return;
    }

    const isAlreadyEnrolled = training.enrolledEmployees.some(
      (e) => e.user.toString() === userId.toString()
    );

    if (isAlreadyEnrolled) {
      res.status(400).json({
        success: false,
        message: 'You are already enrolled in this training program.',
      });
      return;
    }

    if (training.enrolledEmployees.length >= training.capacity) {
      res.status(400).json({
        success: false,
        message: 'Enrollment full: maximum participant capacity reached for this cohort.',
      });
      return;
    }

    training.enrolledEmployees.push({
      user: userId,
      enrolledAt: new Date(),
      status: 'enrolled',
    });

    await training.save();

    const updated = await Training.findById(training._id)
      .populate('createdBy', 'name email position')
      .populate('enrolledEmployees.user', 'name email department');

    res.json({
      success: true,
      message: `Enrolled successfully in ${training.title}. Confirmation sent.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}
