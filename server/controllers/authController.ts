import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest, JWT_SECRET } from '../middleware/auth';

function generateToken(id: string): string {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({ success: false, message: 'This account is inactive.' });
      return;
    }

    const token = generateToken(user._id.toString());
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user._id).populate('managerId', 'name email position department');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

export async function listDemoUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await User.find({ status: 'active' }).select('name email role department position avatar').limit(10);
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}
