import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export async function createEmployee(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, role, department, position, managerId, phone, avatar } = req.body;

    if (!name || !email || !password || !department || !position) {
      res.status(400).json({
        success: false,
        message: 'Name, email, password, department, and position are required fields.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.',
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: `An employee with email '${email}' already exists in StaffSync.`,
      });
      return;
    }

    if (managerId && managerId.trim() !== '') {
      const manager = await User.findById(managerId);
      if (!manager || !['manager', 'hr_admin'].includes(manager.role)) {
        res.status(400).json({
          success: false,
          message: 'The selected manager is invalid or does not have manager privileges.',
        });
        return;
      }
    }

    const newEmployee = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'employee',
      department: department.trim(),
      position: position.trim(),
      managerId: managerId && managerId.trim() !== '' ? managerId : null,
      phone: phone || '',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
    });

    const result = newEmployee.toObject();
    delete result.password;

    res.status(201).json({
      success: true,
      message: 'Employee successfully created in organization directory.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllEmployees(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const currentUser = req.user!;
    let query: any = {};

    if (currentUser.role === 'manager') {
      // Managers view their direct reports + themselves in detail
      query = {
        $or: [{ managerId: currentUser._id }, { _id: currentUser._id }],
      };
    } else if (currentUser.role === 'employee') {
      // Employees can browse active staff directory
      query = { status: 'active' };
    }

    const employees = await User.find(query)
      .populate('managerId', 'name email position department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (err) {
    next(err);
  }
}

export async function getEmployeeById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const currentUser = req.user!;
    const employee = await User.findById(req.params.id).populate('managerId', 'name email position department');

    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee record not found.' });
      return;
    }

    // RBAC: Employee can only view themselves
    if (currentUser.role === 'employee' && employee._id.toString() !== currentUser._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: employees may only access their own detailed employee file.',
      });
      return;
    }

    // RBAC: Manager can only view themselves or their assigned direct reports
    if (
      currentUser.role === 'manager' &&
      employee._id.toString() !== currentUser._id.toString() &&
      employee.managerId?.toString() !== currentUser._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: you are not authorized to view an employee outside your direct reports.',
      });
      return;
    }

    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
}
