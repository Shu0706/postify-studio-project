const { Assignment, Submission, Notification, Message, Employee } = require('../models');
const { createSuccessResponse, createErrorResponse, getPaginationMeta } = require('../utils/helpers');
const { processUploadedFiles } = require('../utils/fileUpload');
const { sendWorkSubmissionEmail } = require('../utils/mailer');

// Get employee dashboard data
const getDashboard = async (req, res) => {
  try {
    const employeeId = req.user._id;

    // Get assignments summary
    const assignmentsSummary = await Assignment.aggregate([
      { $match: { assignedTo: employeeId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent assignments
    const recentAssignments = await Assignment.find({ assignedTo: employeeId })
      .populate('serviceRequest', 'title budget')
      .sort({ 'timeline.assignedAt': -1 })
      .limit(5);

    // Get overdue assignments
    const overdueAssignments = await Assignment.findOverdue().where('assignedTo').equals(employeeId);

    // Get unread notifications
    const unreadNotifications = await Notification.countUnread(employeeId, 'Employee');

    // Get performance stats
    const performanceStats = await Assignment.getStatistics(employeeId);

    // Get upcoming deadlines
    const upcomingDeadlines = await Assignment.find({
      assignedTo: employeeId,
      status: { $in: ['assigned', 'accepted', 'in-progress'] },
      'timeline.dueDate': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      }
    }).sort({ 'timeline.dueDate': 1 });

    res.json(createSuccessResponse({
      assignmentsSummary,
      recentAssignments,
      overdueAssignments,
      unreadNotifications,
      performanceStats,
      upcomingDeadlines,
      workload: {
        current: req.user.workload.current,
        maximum: req.user.workload.maximum,
        percentage: Math.round((req.user.workload.current / req.user.workload.maximum) * 100)
      }
    }, 'Dashboard data retrieved successfully'));

  } catch (error) {
    console.error('Get employee dashboard error:', error);
    res.status(500).json(createErrorResponse('Failed to get dashboard data'));
  }
};

// Get assigned tasks
const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const skip = (page - 1) * limit;

    const query = { assignedTo: req.user._id };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const total = await Assignment.countDocuments(query);
    const assignments = await Assignment.find(query)
      .populate('serviceRequest', 'title description budget client')
      .populate('assignedBy', 'firstName lastName')
      .sort({ 'timeline.dueDate': 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const meta = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.json(createSuccessResponse(
      assignments,
      'Tasks retrieved successfully',
      meta
    ));

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json(createErrorResponse('Failed to get tasks'));
  }
};

// Get single task details
const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const assignment = await Assignment.findOne({
      _id: taskId,
      assignedTo: req.user._id
    })
      .populate('serviceRequest', 'title description requirements budget client')
      .populate('assignedBy', 'firstName lastName')
      .populate({
        path: 'serviceRequest',
        populate: {
          path: 'client',
          select: 'firstName lastName company email'
        }
      });

    if (!assignment) {
      return res.status(404).json(createErrorResponse('Task not found'));
    }

    res.json(createSuccessResponse(
      assignment,
      'Task retrieved successfully'
    ));

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json(createErrorResponse('Failed to get task'));
  }
};

// Accept task
const acceptTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const assignment = await Assignment.findOne({
      _id: taskId,
      assignedTo: req.user._id,
      status: 'assigned'
    });

    if (!assignment) {
      return res.status(404).json(createErrorResponse('Task not found or cannot be accepted'));
    }

    assignment.status = 'accepted';
    assignment.timeline.acceptedAt = new Date();
    await assignment.save();

    // Create notification for admin
    await Notification.createNotification({
      recipient: assignment.assignedBy,
      recipientModel: 'Admin',
      sender: req.user._id,
      senderModel: 'Employee',
      title: 'Task Accepted',
      message: `${req.user.firstName} ${req.user.lastName} has accepted the task: ${assignment.title}`,
      type: 'task-assigned',
      priority: 'medium',
      relatedEntity: assignment._id,
      relatedEntityModel: 'Assignment'
    });

    res.json(createSuccessResponse(
      assignment,
      'Task accepted successfully'
    ));

  } catch (error) {
    console.error('Accept task error:', error);
    res.status(500).json(createErrorResponse('Failed to accept task'));
  }
};

// Decline task
const declineTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { reason } = req.body;

    const assignment = await Assignment.findOne({
      _id: taskId,
      assignedTo: req.user._id,
      status: 'assigned'
    });

    if (!assignment) {
      return res.status(404).json(createErrorResponse('Task not found or cannot be declined'));
    }

    assignment.status = 'declined';
    if (reason) {
      await assignment.addFeedback(req.user._id, 'Employee', `Task declined: ${reason}`);
    }
    await assignment.save();

    // Decrease employee workload
    await Employee.findByIdAndUpdate(req.user._id, {
      $inc: { 'workload.current': -1 }
    });

    // Create notification for admin
    await Notification.createNotification({
      recipient: assignment.assignedBy,
      recipientModel: 'Admin',
      sender: req.user._id,
      senderModel: 'Employee',
      title: 'Task Declined',
      message: `${req.user.firstName} ${req.user.lastName} has declined the task: ${assignment.title}`,
      type: 'task-assigned',
      priority: 'high',
      relatedEntity: assignment._id,
      relatedEntityModel: 'Assignment'
    });

    res.json(createSuccessResponse(
      assignment,
      'Task declined successfully'
    ));

  } catch (error) {
    console.error('Decline task error:', error);
    res.status(500).json(createErrorResponse('Failed to decline task'));
  }
};

// Start working on task
const startTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const assignment = await Assignment.findOne({
      _id: taskId,
      assignedTo: req.user._id,
      status: 'accepted'
    });

    if (!assignment) {
      return res.status(404).json(createErrorResponse('Task not found or cannot be started'));
    }

    assignment.status = 'in-progress';
    assignment.timeline.startedAt = new Date();
    await assignment.save();

    res.json(createSuccessResponse(
      assignment,
      'Task started successfully'
    ));

  } catch (error) {
    console.error('Start task error:', error);
    res.status(500).json(createErrorResponse('Failed to start task'));
  }
};

// Update task progress
const updateTaskProgress = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { percentage, hoursWorked, milestoneIndex, notes } = req.body;

    const assignment = await Assignment.findOne({
      _id: taskId,
      assignedTo: req.user._id,
      status: { $in: ['accepted', 'in-progress'] }
    });

    if (!assignment) {
      return res.status(404).json(createErrorResponse('Task not found or cannot be updated'));
    }

    if (percentage !== undefined) {
      await assignment.updateProgress(percentage, hoursWorked || 0);
    }

    if (milestoneIndex !== undefined) {
      await assignment.completeMilestone(milestoneIndex);
    }

    if (notes) {
      await assignment.addFeedback(req.user._id, 'Employee', notes);
    }

    const updatedAssignment = await Assignment.findById(taskId)
      .populate('serviceRequest', 'title client');

    res.json(createSuccessResponse(
      updatedAssignment,
      'Task progress updated successfully'
    ));

  } catch (error) {
    console.error('Update task progress error:', error);
    res.status(500).json(createErrorResponse('Failed to update task progress'));
  }
};

// Submit work
const submitWork = async (req, res) => {
  try {
    const { taskId } = req.params;
    const {
      title,
      description,
      workSummary,
      hoursWorked,
      deliverables
    } = req.body;

    const assignment = await Assignment.findOne({
      _id: taskId,
      assignedTo: req.user._id,
      status: { $in: ['accepted', 'in-progress'] }
    });

    if (!assignment) {
      return res.status(404).json(createErrorResponse('Task not found or cannot submit work'));
    }

    // Process uploaded files
    let processedDeliverables = [];
    if (req.files && req.files.length > 0) {
      const uploadedFiles = await processUploadedFiles(
        req.files,
        req.user._id,
        'Employee',
        assignment._id,
        'Assignment'
      );

      processedDeliverables = [{
        name: title,
        description: description,
        type: 'file',
        files: uploadedFiles.map(file => ({
          filename: file.filename,
          originalName: file.originalName,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size
        }))
      }];
    }

    // Parse deliverables from request if provided
    if (deliverables) {
      try {
        const parsedDeliverables = JSON.parse(deliverables);
        processedDeliverables = [...processedDeliverables, ...parsedDeliverables];
      } catch (error) {
        console.error('Error parsing deliverables:', error);
      }
    }

    // Create submission
    const submission = await Submission.create({
      assignment: assignment._id,
      submittedBy: req.user._id,
      title,
      description,
      workSummary,
      hoursWorked,
      deliverables: processedDeliverables
    });

    // Update assignment status
    assignment.status = 'submitted';
    assignment.timeline.submittedAt = new Date();
    assignment.progress.percentage = 100;
    await assignment.save();

    // Create notification for admin
    await Notification.createGlobalNotification(['admin'], {
      title: 'Work Submitted',
      message: `${req.user.firstName} ${req.user.lastName} has submitted work for: ${assignment.title}`,
      type: 'submission-received',
      priority: 'medium',
      actionUrl: `/admin/submissions/${submission._id}`,
      actionText: 'Review Submission',
      relatedEntity: submission._id,
      relatedEntityModel: 'Submission'
    });

    // Send email notification to admin
    try {
      const populatedSubmission = await Submission.findById(submission._id)
        .populate('submittedBy', 'firstName lastName');
      
      await sendWorkSubmissionEmail(populatedSubmission, process.env.ADMIN_EMAIL);
    } catch (emailError) {
      console.error('Work submission email failed:', emailError);
    }

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('assignment', 'title serviceRequest');

    res.status(201).json(createSuccessResponse(
      populatedSubmission,
      'Work submitted successfully'
    ));

  } catch (error) {
    console.error('Submit work error:', error);
    res.status(500).json(createErrorResponse('Failed to submit work'));
  }
};

// Get employee submissions
const getSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { submittedBy: req.user._id };
    if (status) query.status = status;

    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .populate('assignment', 'title serviceRequest timeline')
      .sort({ 'timeline.submittedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const meta = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.json(createSuccessResponse(
      submissions,
      'Submissions retrieved successfully',
      meta
    ));

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json(createErrorResponse('Failed to get submissions'));
  }
};

// Get employee notifications
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.findByRecipient(
      req.user._id,
      'Employee',
      status
    ).skip(skip).limit(parseInt(limit));

    const total = await Notification.countDocuments({
      $or: [
        { recipient: req.user._id, recipientModel: 'Employee' },
        { isGlobal: true, globalRoles: 'employee' }
      ],
      ...(status && { status })
    });

    const unreadCount = await Notification.countUnread(req.user._id, 'Employee');
    const meta = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.json(createSuccessResponse(
      { notifications, unreadCount },
      'Notifications retrieved successfully',
      meta
    ));

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json(createErrorResponse('Failed to get notifications'));
  }
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json(createErrorResponse('Notification not found'));
    }

    // Check if employee can access this notification
    const canAccess = notification.isGlobal 
      ? notification.globalRoles.includes('employee')
      : notification.recipient.toString() === req.user._id.toString();

    if (!canAccess) {
      return res.status(403).json(createErrorResponse('Access denied'));
    }

    await notification.markAsRead();

    res.json(createSuccessResponse(
      notification,
      'Notification marked as read'
    ));

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json(createErrorResponse('Failed to mark notification as read'));
  }
};

// Get employee performance stats
const getPerformanceStats = async (req, res) => {
  try {
    const employeeId = req.user._id;

    // Get assignment statistics
    const assignmentStats = await Assignment.getStatistics(employeeId);
    
    // Get submission statistics
    const submissionStats = await Submission.getStatistics(employeeId);

    // Get current month performance
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyAssignments = await Assignment.countDocuments({
      assignedTo: employeeId,
      'timeline.assignedAt': { $gte: currentMonth },
      status: 'completed'
    });

    const monthlySubmissions = await Submission.countDocuments({
      submittedBy: employeeId,
      'timeline.submittedAt': { $gte: currentMonth }
    });

    // Calculate average rating from feedback
    const ratings = await Assignment.aggregate([
      { $match: { assignedTo: employeeId } },
      { $unwind: '$feedback' },
      { $match: { 'feedback.rating': { $exists: true } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$feedback.rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    res.json(createSuccessResponse({
      assignmentStats,
      submissionStats,
      monthlyPerformance: {
        completedAssignments: monthlyAssignments,
        submissions: monthlySubmissions
      },
      rating: ratings[0] || { averageRating: 0, totalRatings: 0 },
      workload: {
        current: req.user.workload.current,
        maximum: req.user.workload.maximum,
        percentage: Math.round((req.user.workload.current / req.user.workload.maximum) * 100)
      }
    }, 'Performance statistics retrieved successfully'));

  } catch (error) {
    console.error('Get performance stats error:', error);
    res.status(500).json(createErrorResponse('Failed to get performance statistics'));
  }
};

// Send chat message
const sendChatMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text' } = req.body;

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      senderModel: 'Employee',
      content,
      messageType,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'web'
      }
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName avatar');

    // Emit socket event for real-time chat
    const io = req.app.get('io');
    io.to(conversationId).emit('receive-message', populatedMessage);

    res.status(201).json(createSuccessResponse(
      populatedMessage,
      'Message sent successfully'
    ));

  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json(createErrorResponse('Failed to send message'));
  }
};

// Get submission by ID
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user._id;

    const submission = await Submission.findOne({ 
      _id: id, 
      submittedBy: employeeId 
    })
    .populate('assignment', 'title description timeline')
    .populate('files');

    if (!submission) {
      return res.status(404).json(createErrorResponse('Submission not found'));
    }

    res.json(createSuccessResponse(submission));
  } catch (error) {
    console.error('Get submission by ID error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch submission'));
  }
};

// Update submission
const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user._id;
    const { description, notes } = req.body;

    const submission = await Submission.findOne({ 
      _id: id, 
      submittedBy: employeeId,
      status: { $in: ['submitted', 'needs_revision'] }
    });

    if (!submission) {
      return res.status(404).json(createErrorResponse('Submission not found or cannot be updated'));
    }

    // Process uploaded files if any
    let files = [];
    if (req.files && req.files.length > 0) {
      files = await processUploadedFiles(req.files, 'submissions');
    }

    // Update submission
    submission.description = description || submission.description;
    submission.notes = notes || submission.notes;
    if (files.length > 0) {
      submission.files = [...submission.files, ...files];
    }
    submission.updatedAt = new Date();

    await submission.save();

    res.json(createSuccessResponse(submission, 'Submission updated successfully'));
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json(createErrorResponse('Failed to update submission'));
  }
};

// Get employee profile
const getProfile = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const employee = await Employee.findById(employeeId)
      .select('-password')
      .populate('skills', 'name');

    if (!employee) {
      return res.status(404).json(createErrorResponse('Employee not found'));
    }

    res.json(createSuccessResponse(employee));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch profile'));
  }
};

// Update employee profile
const updateProfile = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { firstName, lastName, email, phone, bio, skills, experience } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json(createErrorResponse('Employee not found'));
    }

    // Update fields
    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (email) employee.email = email;
    if (phone) employee.phone = phone;
    if (bio) employee.bio = bio;
    if (skills) employee.skills = skills;
    if (experience) employee.experience = experience;

    await employee.save();

    // Return updated employee without password
    const updatedEmployee = await Employee.findById(employeeId)
      .select('-password')
      .populate('skills', 'name');

    res.json(createSuccessResponse(updatedEmployee, 'Profile updated successfully'));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(createErrorResponse('Failed to update profile'));
  }
};

// Get chat conversations
const getChatConversations = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: employeeId },
            { recipient: employeeId }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', employeeId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $last: '$content' },
          lastMessageAt: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$sender', employeeId] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'participant'
        }
      },
      {
        $unwind: '$participant'
      },
      {
        $project: {
          participant: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            role: 1
          },
          lastMessage: 1,
          lastMessageAt: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { lastMessageAt: -1 }
      }
    ]);

    res.json(createSuccessResponse(conversations));
  } catch (error) {
    console.error('Get chat conversations error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch conversations'));
  }
};

// Get chat messages
const getChatMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const employeeId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: employeeId, recipient: conversationId },
        { sender: conversationId, recipient: employeeId }
      ]
    })
    .populate('sender', 'firstName lastName role')
    .populate('recipient', 'firstName lastName role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

    // Mark messages as read
    await Message.updateMany(
      { sender: conversationId, recipient: employeeId, isRead: false },
      { isRead: true }
    );

    const total = await Message.countDocuments({
      $or: [
        { sender: employeeId, recipient: conversationId },
        { sender: conversationId, recipient: employeeId }
      ]
    });

    const pagination = getPaginationMeta(page, limit, total);

    res.json(createSuccessResponse({
      messages: messages.reverse(),
      pagination
    }));
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json(createErrorResponse('Failed to fetch messages'));
  }
};

module.exports = {
  getDashboard,
  getTasks,
  getTask,
  acceptTask,
  declineTask,
  startTask,
  updateTaskProgress,
  submitWork,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
  getPerformanceStats,
  sendChatMessage,
  getChatConversations,
  getChatMessages
};
