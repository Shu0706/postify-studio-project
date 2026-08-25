const { User, Employee, Admin, Service, ServiceRequest, Assignment, Submission, Notification, Message, File, AnalyticsData } = require('../models');
const { formatResponse, formatError, calculateAnalytics } = require('../utils/helpers');
const { sendEmail, sendEmployeeCreatedEmail, sendWelcomeEmail, sendEmployeeRegistrationEmail } = require('../utils/mailer');
const { AppError } = require('../middlewares/errorHandler');
const bcrypt = require('bcryptjs');

class AdminController {
  // Dashboard
  async getDashboard(req, res, next) {
    try {
      const adminId = req.user._id;

      // Get admin profile
      const admin = await Admin.findById(adminId);
      if (!admin) {
        throw new AppError('Admin profile not found', 404);
      }

      // Get overview statistics
      const totalEmployees = await Employee.countDocuments({ isActive: true });
      const totalClients = await User.countDocuments({ role: 'client', isActive: true });
      const totalServiceRequests = await ServiceRequest.countDocuments();
      const activeAssignments = await Assignment.countDocuments({ status: 'assigned' });
      const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });

      // Get recent activities
      const recentServiceRequests = await ServiceRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client', 'firstName lastName email')
        .populate('service', 'name category');

      const recentSubmissions = await Submission.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('assignment')
        .populate('submittedBy', 'firstName lastName email');

      // Get performance metrics
      const completedAssignments = await Assignment.countDocuments({ status: 'completed' });
      const completionRate = totalServiceRequests > 0 ? 
        ((completedAssignments / totalServiceRequests) * 100).toFixed(2) : 0;

      const dashboardData = {
        admin: {
          name: admin.fullName,
          email: admin.email,
          department: admin.role,
          permissions: admin.permissions
        },
        overview: {
          totalEmployees,
          totalClients,
          totalServiceRequests,
          activeAssignments,
          pendingSubmissions,
          completionRate: parseFloat(completionRate)
        },
        recentActivities: {
          serviceRequests: recentServiceRequests,
          submissions: recentSubmissions
        }
      };

      res.json(formatResponse(dashboardData, 'Dashboard data retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Employee Management
  async getEmployees(req, res, next) {
    try {
      const { page = 1, limit = 10, search, department, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const query = {};
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (department) {
        query.department = department;
      }
      
      if (status) {
        query.isActive = status === 'active';
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const employees = await Employee.find(query)
        .populate('userId', 'name email isActive')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Employee.countDocuments(query);

      res.json(formatResponse({
        employees,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }, 'Employees retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req, res, next) {
    try {
      const { id } = req.params;
      
      const employee = await Employee.findById(id)
        .populate('userId', 'name email phone isActive createdAt');
      
      if (!employee) {
        throw new AppError('Employee not found', 404);
      }

      // Get employee's assignments and performance
      const assignments = await Assignment.find({ assignedTo: id })
        .populate('serviceRequest')
        .sort({ createdAt: -1 })
        .limit(10);

      const performance = await this.calculateEmployeePerformance(id);

      res.json(formatResponse({
        employee,
        assignments,
        performance
      }, 'Employee details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const employee = await Employee.findById(id);
      if (!employee) {
        throw new AppError('Employee not found', 404);
      }

      // Update employee fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && key !== 'userId') {
          employee[key] = updates[key];
        }
      });

      await employee.save();

      // Update user fields if provided
      if (updates.name || updates.email || updates.phone) {
        const userUpdates = {};
        if (updates.name) userUpdates.name = updates.name;
        if (updates.email) userUpdates.email = updates.email;
        if (updates.phone) userUpdates.phone = updates.phone;

        await User.findByIdAndUpdate(employee.userId, userUpdates);
      }

      const updatedEmployee = await Employee.findById(id)
        .populate('userId', 'name email phone isActive');

      res.json(formatResponse(updatedEmployee, 'Employee updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req, res, next) {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        department, 
        position, 
        employeeId,
        salary,
        joinDate 
      } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('Email already exists', 400);
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Create user account
      const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role: 'employee',
        isActive: true
      });

      // Create employee profile
      const employee = await Employee.create({
        userId: user._id,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        employeeId: employeeId || `EMP${Date.now()}`,
        department,
        position,
        salary,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        isActive: true,
        createdBy: req.user ? req.user._id : null
      });

      // Send email with login credentials
      try {
        await sendEmployeeCreatedEmail({
          firstName,
          lastName,
          email,
          employeeId: employee.employeeId,
          department,
          position
        }, tempPassword);
        
        // Send notification to admin about new employee
        const admin = await Admin.findOne();
        if (admin && admin.email && admin.email !== req.user.email) {
          await sendEmployeeRegistrationEmail(employee, admin.email);
        }
      } catch (emailError) {
        console.error('Failed to send employee creation email:', emailError);
      }

      const populatedEmployee = await Employee.findById(employee._id)
        .populate('userId', 'firstName lastName email phone isActive');

      res.status(201).json(formatResponse(populatedEmployee, 'Employee created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req, res, next) {
    try {
      const { id } = req.params;
      
      const employee = await Employee.findById(id);
      if (!employee) {
        throw new AppError('Employee not found', 404);
      }

      // Soft delete - deactivate instead of removing
      employee.isActive = false;
      await employee.save();

      // Also deactivate the user account
      await User.findByIdAndUpdate(employee.userId, { isActive: false });

      res.json(formatResponse(null, 'Employee deactivated successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Client Management
  async getClients(req, res, next) {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.info('[ADMIN DEBUG] getClients called by user:', {
          userId: req.user?._id,
          userRole: req.userRole
        });
      }
      const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const query = { role: 'client' };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (status) {
        query.isActive = status === 'active';
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const clients = await User.find(query)
        .select('-password -refreshToken')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await User.countDocuments(query);

      // Get service request counts for each client
      const clientsWithStats = await Promise.all(clients.map(async (client) => {
        const serviceRequestCount = await ServiceRequest.countDocuments({ client: client._id });
        const activeRequests = await ServiceRequest.countDocuments({ 
          client: client._id, 
          status: { $in: ['pending', 'assigned', 'in_progress'] } 
        });
        
        return {
          ...client.toObject(),
          stats: {
            totalServiceRequests: serviceRequestCount,
            activeRequests
          }
        };
      }));

      res.json(formatResponse({
        clients: clientsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }, 'Clients retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getClientById(req, res, next) {
    try {
      const { id } = req.params;
      
      const client = await User.findById(id).select('-password -refreshToken');
      
      if (!client || client.role !== 'client') {
        throw new AppError('Client not found', 404);
      }

      // Get client's service requests
      const serviceRequests = await ServiceRequest.find({ client: id })
        .populate('service', 'name description')
        .sort({ createdAt: -1 })
        .limit(10);

      res.json(formatResponse({
        client,
        serviceRequests
      }, 'Client details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async createClient(req, res, next) {
    try {
      const { firstName, lastName, email, phone, company } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('Email already exists', 400);
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Create client account
      const client = await User.create({
        firstName,
        lastName,
        email,
        phone,
        company,
        password: hashedPassword,
        role: 'client',
        isActive: true
      });

      // Send welcome email with login credentials
      try {
        await sendWelcomeEmail({
          firstName,
          lastName,
          email
        });
        
        // Send separate email with credentials
        await sendEmail({
          to: email,
          subject: 'Your Postify Studio Account Credentials',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333; text-align: center;">Your Account Credentials</h1>
              <p>Dear ${firstName} ${lastName},</p>
              <p>Your account has been created by our admin team. Here are your login credentials:</p>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              </div>
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
              </div>
              <p>You can login to your account and start requesting our services.</p>
              <p>Best regards,<br>Postify Studio Team</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send client creation email:', emailError);
      }

      const clientResponse = client.toObject();
      delete clientResponse.password;
      delete clientResponse.refreshToken;

      res.status(201).json(formatResponse(clientResponse, 'Client created successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Service Requests Management
  async getServiceRequests(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        priority, 
        search,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;
      
      const query = {};
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (priority) {
        query.priority = priority;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const requests = await ServiceRequest.find(query)
        .populate('client', 'firstName lastName email')
        .populate('service', 'name category')
        .populate('assignment', 'status assignedTo')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await ServiceRequest.countDocuments(query);

      res.json(formatResponse({
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }, 'Service requests retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getServiceRequestById(req, res, next) {
    try {
      const { id } = req.params;
      
      const request = await ServiceRequest.findById(id)
        .populate('client', 'firstName lastName email phone')
        .populate('service', 'name category description')
        .populate('assignment')
        .exec();
      
      if (!request) {
        throw new AppError('Service request not found', 404);
      }

      res.json(formatResponse(request, 'Service request retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateServiceRequestStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      const request = await ServiceRequest.findById(id);
      if (!request) {
        throw new AppError('Service request not found', 404);
      }

      // Update status
      await request.updateStatus(status, note, req.user._id);

      // Create notification for client
      await Notification.create({
        recipient: request.client,
        recipientModel: 'User',
        title: 'Service Request Status Update',
        message: `Your service request "${request.title}" status has been updated to ${status}`,
        type: 'status-update',
        relatedEntity: request._id,
        relatedEntityModel: 'ServiceRequest'
      });

      // Emit real-time notification
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${request.client}`).emit('statusUpdate', {
          requestId: request._id,
          status,
          message: `Your service request "${request.title}" status has been updated to ${status}`
        });
      }

      const updatedRequest = await ServiceRequest.findById(id)
        .populate('client', 'firstName lastName email')
        .populate('service', 'name category');

      res.json(formatResponse(updatedRequest, 'Service request status updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Task Assignment
  async assignTask(req, res, next) {
    try {
      const { serviceRequestId, employeeId, priority, deadline, instructions } = req.body;

      // Validate service request
      const serviceRequest = await ServiceRequest.findById(serviceRequestId);
      if (!serviceRequest) {
        throw new AppError('Service request not found', 404);
      }

      // Validate employee
      const employee = await Employee.findById(employeeId);
      if (!employee || !employee.isActive) {
        throw new AppError('Employee not found or inactive', 404);
      }

      // Check if already assigned
      const existingAssignment = await Assignment.findOne({ serviceRequestId });
      if (existingAssignment) {
        throw new AppError('Service request already assigned', 400);
      }

      // Create assignment
      const assignment = new Assignment({
        serviceRequestId,
        employeeId,
        assignedBy: req.user._id,
        priority: priority || 'medium',
        deadline,
        instructions,
        status: 'assigned'
      });

      await assignment.save();

      // Update service request status
      serviceRequest.status = 'assigned';
      await serviceRequest.save();

      // Create notification for employee
      await Notification.create({
        userId: employee.userId,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${serviceRequest.title}`,
        type: 'task_assigned',
        relatedId: assignment._id,
        relatedModel: 'Assignment'
      });

      // Send email notification
      try {
        await sendEmail(
          employee.userId.email,
          'New Task Assignment',
          'taskAssigned',
          {
            employeeName: employee.name,
            taskTitle: serviceRequest.title,
            priority: assignment.priority,
            deadline: assignment.deadline,
            instructions: assignment.instructions
          }
        );
      } catch (emailError) {
        console.error('Failed to send assignment email:', emailError);
      }

      const populatedAssignment = await Assignment.findById(assignment._id)
        .populate('serviceRequestId')
        .populate('employeeId', 'name department')
        .populate('assignedBy', 'name');

      res.status(201).json(formatResponse(populatedAssignment, 'Task assigned successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getAssignments(req, res, next) {
    try {
      const { page = 1, limit = 10, status, employeeId, priority, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const query = {};
      
      if (status) {
        query.status = status;
      }
      
      if (employeeId) {
        query.employeeId = employeeId;
      }
      
      if (priority) {
        query.priority = priority;
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const assignments = await Assignment.find(query)
        .populate('serviceRequestId', 'title description')
        .populate('employeeId', 'name department')
        .populate('assignedBy', 'name')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Assignment.countDocuments(query);

      res.json(formatResponse({
        assignments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }, 'Assignments retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateAssignment(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const assignment = await Assignment.findById(id);
      if (!assignment) {
        throw new AppError('Assignment not found', 404);
      }

      // Update assignment fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          assignment[key] = updates[key];
        }
      });

      await assignment.save();

      const updatedAssignment = await Assignment.findById(id)
        .populate('serviceRequestId')
        .populate('employeeId', 'name department')
        .populate('assignedBy', 'name');

      res.json(formatResponse(updatedAssignment, 'Assignment updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Submissions Management
  async getSubmissions(req, res, next) {
    try {
      const { page = 1, limit = 10, status, employeeId, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;
      
      const query = {};
      
      if (status) {
        query.status = status;
      }
      
      if (employeeId) {
        query.employeeId = employeeId;
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const submissions = await Submission.find(query)
        .populate({
          path: 'assignmentId',
          populate: {
            path: 'serviceRequestId',
            select: 'title description'
          }
        })
        .populate('employeeId', 'name department')
        .populate('reviewedBy', 'name')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Submission.countDocuments(query);

      res.json(formatResponse({
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }, 'Submissions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async reviewSubmission(req, res, next) {
    try {
      const { id } = req.params;
      const { status, feedback, rating } = req.body;

      const submission = await Submission.findById(id);
      if (!submission) {
        throw new AppError('Submission not found', 404);
      }

      // Update submission
      submission.status = status;
      submission.feedback = feedback;
      submission.rating = rating;
      submission.reviewedBy = req.user._id;
      submission.reviewedAt = new Date();

      await submission.save();

      // Update assignment status if approved
      if (status === 'approved') {
        const assignment = await Assignment.findById(submission.assignmentId);
        if (assignment) {
          assignment.status = 'completed';
          assignment.completedAt = new Date();
          await assignment.save();

          // Update service request status
          const serviceRequest = await ServiceRequest.findById(assignment.serviceRequestId);
          if (serviceRequest) {
            serviceRequest.status = 'completed';
            await serviceRequest.save();
          }
        }
      }

      // Create notification for employee
      const employee = await Employee.findById(submission.employeeId);
      if (employee) {
        await Notification.create({
          userId: employee.userId,
          title: 'Submission Reviewed',
          message: `Your submission has been ${status}. ${feedback ? 'Feedback: ' + feedback : ''}`,
          type: 'submission_reviewed',
          relatedId: submission._id,
          relatedModel: 'Submission'
        });
      }

      const updatedSubmission = await Submission.findById(id)
        .populate({
          path: 'assignmentId',
          populate: {
            path: 'serviceRequestId',
            select: 'title description'
          }
        })
        .populate('employeeId', 'name department')
        .populate('reviewedBy', 'name');

      res.json(formatResponse(updatedSubmission, 'Submission reviewed successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Analytics
  async getAnalytics(req, res, next) {
    try {
      const { period = '30d', startDate, endDate } = req.query;

      let dateFilter = {};
      
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        };
      } else {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const startDateCalc = new Date();
        startDateCalc.setDate(startDateCalc.getDate() - days);
        dateFilter = { createdAt: { $gte: startDateCalc } };
      }

      // Get overall counts
      const [
        totalClients,
        totalEmployees,
        totalProjects,
        completedTasks,
        activeProjects,
        pendingRequests
      ] = await Promise.all([
        User.countDocuments({ role: 'client', isActive: true }),
        Employee.countDocuments({ isActive: true }),
        ServiceRequest.countDocuments(),
        Assignment.countDocuments({ status: 'completed' }),
        ServiceRequest.countDocuments({ status: { $in: ['approved', 'in_progress'] } }),
        ServiceRequest.countDocuments({ status: 'pending' })
      ]);

      // Service requests analytics
      const serviceRequestStats = await ServiceRequest.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Assignment completion analytics with turnaround time
      const assignmentStats = await Assignment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgCompletionTime: {
              $avg: {
                $cond: [
                  { $ne: ['$completedAt', null] },
                  { $subtract: ['$completedAt', '$createdAt'] },
                  null
                ]
              }
            }
          }
        }
      ]);

      // Calculate average turnaround time in days
      const avgTurnaroundTime = assignmentStats
        .filter(stat => stat._id === 'completed' && stat.avgCompletionTime)
        .reduce((acc, stat) => acc + (stat.avgCompletionTime / (1000 * 60 * 60 * 24)), 0);

      // Employee performance
      const employeePerformance = await Assignment.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        {
          $group: {
            _id: '$employeeId',
            completedTasks: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        },
        {
          $lookup: {
            from: 'employees',
            localField: '_id',
            foreignField: '_id',
            as: 'employee'
          }
        },
        { $unwind: '$employee' },
        {
          $project: {
            employeeName: '$employee.name',
            department: '$employee.department',
            completedTasks: 1,
            avgRating: 1
          }
        },
        { $sort: { completedTasks: -1 } },
        { $limit: 10 }
      ]);

      // Revenue analytics with monthly breakdown
      const revenueStats = await ServiceRequest.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        {
          $lookup: {
            from: 'services',
            localField: 'service',
            foreignField: '_id',
            as: 'service'
          }
        },
        { $unwind: '$service' },
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            revenue: { $sum: '$service.price' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      // Calculate total revenue
      const totalRevenue = revenueStats.reduce((sum, item) => sum + item.revenue, 0);

      // Service type distribution
      const serviceDistribution = await ServiceRequest.aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: 'services',
            localField: 'service',
            foreignField: '_id',
            as: 'service'
          }
        },
        { $unwind: '$service' },
        {
          $group: {
            _id: '$service.category',
            count: { $sum: 1 },
            revenue: { $sum: '$service.price' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Growth metrics (compared to previous period)
      const previousPeriodStart = new Date(dateFilter.createdAt.$gte);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - (period === '7d' ? 7 : period === '30d' ? 30 : 90));
      
      const previousPeriodClients = await User.countDocuments({
        role: 'client',
        createdAt: {
          $gte: previousPeriodStart,
          $lt: dateFilter.createdAt.$gte
        }
      });

      const currentPeriodClients = await User.countDocuments({
        role: 'client',
        createdAt: dateFilter
      });

      const clientGrowth = previousPeriodClients > 0 
        ? ((currentPeriodClients - previousPeriodClients) / previousPeriodClients * 100).toFixed(2)
        : 0;

      const analytics = {
        period,
        overview: {
          totalClients,
          totalEmployees,
          totalProjects,
          completedTasks,
          activeProjects,
          pendingRequests,
          totalRevenue: Math.round(totalRevenue),
          avgTurnaroundTime: Math.round(avgTurnaroundTime * 10) / 10, // Round to 1 decimal
          clientGrowth: parseFloat(clientGrowth)
        },
        serviceRequests: {
          total: serviceRequestStats.reduce((sum, item) => sum + item.count, 0),
          byStatus: serviceRequestStats
        },
        assignments: {
          total: assignmentStats.reduce((sum, item) => sum + item.count, 0),
          byStatus: assignmentStats
        },
        topPerformers: employeePerformance,
        revenue: {
          monthly: revenueStats,
          total: totalRevenue,
          serviceDistribution
        },
        charts: {
          projectsOverTime: revenueStats.map(item => ({
            month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            projects: item.count,
            revenue: item.revenue
          })),
          serviceDistribution: serviceDistribution.map(item => ({
            name: item._id,
            value: item.count,
            revenue: item.revenue
          }))
        }
      };

      res.json(formatResponse(analytics, 'Analytics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Notifications
  async getNotifications(req, res, next) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      
      const query = { userId: req.user._id };
      
      if (unreadOnly === 'true') {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ 
        userId: req.user._id, 
        isRead: false 
      });

      res.json(formatResponse({
        notifications,
        unreadCount,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }, 'Notifications retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async markNotificationAsRead(req, res, next) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      res.json(formatResponse(notification, 'Notification marked as read'));
    } catch (error) {
      next(error);
    }
  }

  async sendBulkNotification(req, res, next) {
    try {
      const { title, message, type, recipients, sendEmail: shouldSendEmail } = req.body;

      let userIds = [];

      if (recipients.type === 'all') {
        const users = await User.find({ isActive: true }, '_id');
        userIds = users.map(user => user._id);
      } else if (recipients.type === 'role') {
        const users = await User.find({ role: recipients.role, isActive: true }, '_id');
        userIds = users.map(user => user._id);
      } else if (recipients.type === 'specific') {
        userIds = recipients.userIds;
      }

      // Create notifications
      const notifications = userIds.map(userId => ({
        userId,
        title,
        message,
        type: type || 'announcement',
        createdBy: req.user._id
      }));

      await Notification.insertMany(notifications);

      // Send emails if requested
      if (shouldSendEmail) {
        const users = await User.find({ _id: { $in: userIds } }, 'name email');
        
        for (const user of users) {
          try {
            await sendEmail(
              user.email,
              title,
              'notification',
              {
                userName: user.name,
                title,
                message
              }
            );
          } catch (emailError) {
            console.error(`Failed to send email to ${user.email}:`, emailError);
          }
        }
      }

      res.json(formatResponse({
        sentTo: userIds.length,
        emailsSent: shouldSendEmail ? userIds.length : 0
      }, 'Bulk notification sent successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Service Management
  async getServices(req, res, next) {
    try {
      const services = await Service.find()
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 });

      res.json(formatResponse(services, 'Services retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getServiceById(req, res, next) {
    try {
      const { id } = req.params;
      
      const service = await Service.findById(id)
        .populate('createdBy', 'fullName email');
      
      if (!service) {
        throw new AppError('Service not found', 404);
      }

      res.json(formatResponse(service, 'Service retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async createService(req, res, next) {
    try {
      const adminId = req.user._id;
      const serviceData = {
        ...req.body,
        createdBy: adminId
      };

      const service = new Service(serviceData);
      await service.save();

      await service.populate('createdBy', 'fullName email');

      // Send notification to relevant users
      try {
        const notification = new Notification({
          title: 'New Service Available',
          message: `New service "${service.name}" has been added to our offerings.`,
          type: 'service_created',
          recipients: ['client'], // Notify all clients
          createdBy: adminId,
          metadata: {
            serviceId: service._id,
            serviceName: service.name
          }
        });
        await notification.save();

        // Emit real-time notification
        if (req.io) {
          req.io.to('client_room').emit('notification', {
            type: 'service_created',
            title: notification.title,
            message: notification.message,
            service: {
              id: service._id,
              name: service.name,
              category: service.category
            },
            timestamp: new Date()
          });
        }
      } catch (notificationError) {
        console.error('Error sending service creation notification:', notificationError);
      }

      res.status(201).json(formatResponse(service, 'Service created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateService(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const service = await Service.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('createdBy', 'fullName email');

      if (!service) {
        throw new AppError('Service not found', 404);
      }

      res.json(formatResponse(service, 'Service updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req, res, next) {
    try {
      const { id } = req.params;

      // Check if service has active requests
      const activeRequests = await ServiceRequest.countDocuments({ 
        service: id, 
        status: { $in: ['pending', 'assigned', 'in_progress'] }
      });

      if (activeRequests > 0) {
        throw new AppError(
          'Cannot delete service with active requests. Please complete or cancel existing requests first.',
          400
        );
      }

      const service = await Service.findByIdAndDelete(id);

      if (!service) {
        throw new AppError('Service not found', 404);
      }

      res.json(formatResponse(null, 'Service deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Helper methods
  async calculateEmployeePerformance(employeeId) {
    const assignments = await Assignment.find({ employeeId });
    const submissions = await Submission.find({ employeeId });

    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

    const avgRating = submissions.length > 0 ? 
      submissions.reduce((sum, s) => sum + (s.rating || 0), 0) / submissions.length : 0;

    const onTimeDeliveries = assignments.filter(a => 
      a.completedAt && a.deadline && a.completedAt <= a.deadline
    ).length;
    const onTimeRate = completedAssignments > 0 ? (onTimeDeliveries / completedAssignments) * 100 : 0;

    return {
      totalAssignments,
      completedAssignments,
      completionRate: parseFloat(completionRate.toFixed(2)),
      averageRating: parseFloat(avgRating.toFixed(2)),
      onTimeDeliveryRate: parseFloat(onTimeRate.toFixed(2))
    };
  }
}

module.exports = new AdminController();
