const { ServiceRequest, Service, File, Notification, Message, Submission, Admin } = require('../models');
const { createSuccessResponse, createErrorResponse, getPaginationMeta } = require('../utils/helpers');
const { processUploadedFiles } = require('../utils/fileUpload');
const { sendServiceRequestEmail, sendServiceRequestAdminEmail } = require('../utils/mailer');

// Get client dashboard data
const getDashboard = async (req, res) => {
  try {
    const clientId = req.user._id;

    // Get service requests summary
    const requestsSummary = await ServiceRequest.aggregate([
      { $match: { client: clientId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent service requests
    const recentRequests = await ServiceRequest.find({ client: clientId })
      .populate('service', 'name category')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get unread notifications count
    const unreadNotifications = await Notification.countUnread(clientId, 'User');

    // Get total spent (approved requests)
    const totalSpent = await ServiceRequest.aggregate([
      { 
        $match: { 
          client: clientId, 
          status: { $in: ['completed', 'delivered'] }
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$budget.amount' }
        }
      }
    ]);

    res.json(createSuccessResponse({
      requestsSummary,
      recentRequests,
      unreadNotifications,
      totalSpent: totalSpent[0]?.total || 0,
      stats: {
        totalRequests: recentRequests.length,
        activeRequests: requestsSummary.filter(s => 
          ['pending', 'reviewing', 'approved', 'assigned', 'in-progress'].includes(s._id)
        ).reduce((sum, s) => sum + s.count, 0)
      }
    }, 'Dashboard data retrieved successfully'));

  } catch (error) {
    console.error('Get client dashboard error:', error);
    res.status(500).json(createErrorResponse('Failed to get dashboard data'));
  }
};

// Request a service
const requestService = async (req, res) => {
  try {
    console.log('📋 Service request received:', JSON.stringify(req.body, null, 2));
    console.log('👤 User info:', { id: req.user._id, role: req.userRole, email: req.user.email });
    
    const {
      service,
      title,
      description,
      requirements,
      budget,
      timeline,
      priority = 'medium'
    } = req.body;

    // Verify service exists
    console.log('🔍 Verifying service exists:', service);
    const serviceExists = await Service.findById(service);
    if (!serviceExists) {
      console.log('❌ Service not found:', service);
      return res.status(404).json(createErrorResponse('Service not found'));
    }
    console.log('✅ Service found:', serviceExists.name);

    // Create service request
    console.log('📝 Creating service request...');
    const serviceRequest = await ServiceRequest.create({
      client: req.user._id,
      service,
      title,
      description,
      requirements,
      budget,
      timeline,
      priority,
      metadata: {
        clientIP: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    console.log('✅ Service request created:', serviceRequest._id);

    // Skip file processing for now to isolate the issue
    console.log('⏭️ Skipping file processing for debugging');

    // Create notification for admin
    console.log('🔔 Creating admin notification...');
    try {
      // Find an admin user to send the notification to
      const adminUser = await Admin.findOne({ isActive: true }).sort({ createdAt: 1 });
      
      if (adminUser) {
        console.log('👤 Found admin user:', adminUser.email);
        
        // Create individual notification for the admin
        const createdNotification = await Notification.create({
          recipient: adminUser._id,
          recipientModel: 'Admin',
          sender: req.user._id,
          senderModel: 'User',
          title: 'New Service Request',
          message: `New service request created by ${req.user.email}`,
          type: 'service-inquiry',
          priority: priority,
          actionRequired: true,
          actionUrl: `/admin/requests/${serviceRequest._id}`,
          actionText: 'View Request',
          relatedEntity: serviceRequest._id,
          relatedEntityModel: 'ServiceRequest',
          metadata: {
            serviceRequestId: serviceRequest._id,
            clientId: req.user._id,
            serviceName: serviceExists.name
          }
        });
        
        console.log('✅ Admin notification created successfully');

        // Emit real-time events to admins
        try {
          const io = req.app.get('io');
          if (io) {
            // Notify all admins in admin_room about the new service request
            io.to('admin_room').emit('new-service-request', {
              id: serviceRequest._id,
              title: serviceRequest.title,
              client: {
                id: req.user._id,
                email: req.user.email,
                name: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim()
              },
              createdAt: serviceRequest.createdAt || new Date()
            });

            // Notify the specific admin user in their personal room about the new notification
            io.to(`user_${adminUser._id}`).emit('new-notification', {
              id: createdNotification._id,
              title: createdNotification.title,
              message: createdNotification.message,
              actionUrl: createdNotification.actionUrl,
              createdAt: createdNotification.createdAt
            });
          }
        } catch (emitError) {
          console.error('❌ Failed to emit socket events for new service request:', emitError);
        }

      } else {
        console.log('⚠️ No admin user found, skipping notification creation');
        // Still notify admin_room in case any admin clients are connected and want to refresh
        try {
          const io = req.app.get('io');
          if (io) {
            io.to('admin_room').emit('new-service-request', {
              id: serviceRequest._id,
              title: serviceRequest.title,
              client: {
                id: req.user._id,
                email: req.user.email,
                name: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim()
              },
              createdAt: serviceRequest.createdAt || new Date()
            });
          }
        } catch (emitErr) {
          console.error('❌ Failed to emit admin_room notification when no admin user found:', emitErr);
        }
      }
    } catch (notificationError) {
      console.error('❌ Failed to create admin notification:', notificationError);
      // Don't fail the entire request if notification creation fails
      console.log('🔄 Continuing with service request creation...');
    }

    // Skip real-time notifications for now
    console.log('⏭️ Skipping real-time notifications for debugging');

    // Skip email notifications for now to isolate the issue
    console.log('⏭️ Skipping email notifications for debugging');

    const populatedRequest = await ServiceRequest.findById(serviceRequest._id)
      .populate('service', 'name category pricing');
    console.log('✅ Service request populated and ready to return');

    res.status(201).json(createSuccessResponse(
      populatedRequest,
      'Service request submitted successfully'
    ));

  } catch (error) {
    console.error('💥 Request service error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      console.log('📋 Validation error details:', error.errors);
      return res.status(400).json(createErrorResponse('Validation failed: ' + error.message));
    }
    
    // Check if it's a cast error (invalid ObjectId)
    if (error.name === 'CastError') {
      console.log('📋 Cast error details:', error);
      return res.status(400).json(createErrorResponse('Invalid data format: ' + error.message));
    }
    
    res.status(500).json(createErrorResponse('Failed to submit service request'));
  }
};

// Get client's service requests
const getServiceRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, service } = req.query;
    const skip = (page - 1) * limit;

    const query = { client: req.user._id };
    if (status) query.status = status;
    if (service) query.service = service;

    const total = await ServiceRequest.countDocuments(query);
    const requests = await ServiceRequest.find(query)
      .populate('service', 'name category pricing')
      .populate('assignment', 'status assignedTo timeline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const meta = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.json(createSuccessResponse(
      requests,
      'Service requests retrieved successfully',
      meta
    ));

  } catch (error) {
    console.error('Get service requests error:', error);
    res.status(500).json(createErrorResponse('Failed to get service requests'));
  }
};

// Get client's projects (compact view for user dashboard)
const getClientProjects = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { client: req.user._id };

    const total = await ServiceRequest.countDocuments(query);
    const requests = await ServiceRequest.find(query)
      .select('title status createdAt service')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const projects = requests.map(r => ({
      id: r._id,
      name: r.title || (r.service && r.service.name) || 'Untitled Project',
      status: r.status,
      createdAt: r.createdAt,
      service: r.service ? { id: r.service._id, name: r.service.name } : null
    }));

    const meta = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.json(createSuccessResponse(
      { projects },
      'Client projects retrieved successfully',
      meta
    ));
  } catch (error) {
    console.error('Get client projects error:', error);
    res.status(500).json(createErrorResponse('Failed to get client projects'));
  }
};

// Get single service request details
const getServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceRequest = await ServiceRequest.findOne({
      _id: id,
      client: req.user._id
    })
      .populate('service', 'name category pricing features')
      .populate({
        path: 'assignment',
        populate: {
          path: 'assignedTo',
          select: 'firstName lastName position department'
        }
      });

    if (!serviceRequest) {
      return res.status(404).json(createErrorResponse('Service request not found'));
    }

    res.json(createSuccessResponse(
      serviceRequest,
      'Service request retrieved successfully'
    ));

  } catch (error) {
    console.error('Get service request error:', error);
    res.status(500).json(createErrorResponse('Failed to get service request'));
  }
};

// Update service request (only if pending)
const updateServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const serviceRequest = await ServiceRequest.findOne({
      _id: id,
      client: req.user._id
    });

    if (!serviceRequest) {
      return res.status(404).json(createErrorResponse('Service request not found'));
    }

    if (serviceRequest.status !== 'pending') {
      return res.status(400).json(createErrorResponse('Cannot update request that is not pending'));
    }

    const allowedUpdates = ['title', 'description', 'requirements', 'budget', 'timeline'];
    const filteredUpdates = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      id,
      filteredUpdates,
      { new: true, runValidators: true }
    ).populate('service', 'name category pricing');

    res.json(createSuccessResponse(
      updatedRequest,
      'Service request updated successfully'
    ));

  } catch (error) {
    console.error('Update service request error:', error);
    res.status(500).json(createErrorResponse('Failed to update service request'));
  }
};

// Cancel service request
const cancelServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const serviceRequest = await ServiceRequest.findOne({
      _id: id,
      client: req.user._id
    });

    if (!serviceRequest) {
      return res.status(404).json(createErrorResponse('Service request not found'));
    }

    if (!['pending', 'reviewing', 'quoted'].includes(serviceRequest.status)) {
      return res.status(400).json(createErrorResponse('Cannot cancel request at this stage'));
    }

    serviceRequest.status = 'cancelled';
    if (reason) {
      await serviceRequest.addCommunication(
        req.user._id,
        'User',
        `Request cancelled by client. Reason: ${reason}`
      );
    }

    await serviceRequest.save();

    // Notify admin
    await Notification.createGlobalNotification(['admin'], {
      title: 'Service Request Cancelled',
      message: `${req.user.firstName} ${req.user.lastName} cancelled their service request: ${serviceRequest.title}`,
      type: 'service-inquiry',
      priority: 'medium',
      relatedEntity: serviceRequest._id,
      relatedEntityModel: 'ServiceRequest'
    });

    res.json(createSuccessResponse(
      serviceRequest,
      'Service request cancelled successfully'
    ));

  } catch (error) {
    console.error('Cancel service request error:', error);
    res.status(500).json(createErrorResponse('Failed to cancel service request'));
  }
};

// Get client notifications
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = status ? { status } : {};
    const notifications = await Notification.findByRecipient(
      req.user._id,
      'User',
      status
    ).skip(skip).limit(parseInt(limit));

    const total = await Notification.countDocuments({
      $or: [
        { recipient: req.user._id, recipientModel: 'User' },
        { isGlobal: true, globalRoles: 'client' }
      ],
      ...(status && { status })
    });

    const unreadCount = await Notification.countUnread(req.user._id, 'User');
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

    // Check if user can access this notification
    const canAccess = notification.isGlobal 
      ? notification.globalRoles.includes('client')
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

// Get downloadable files
const getDownloads = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get completed submissions for this client's requests
    const clientRequests = await ServiceRequest.find({ client: req.user._id }).select('_id');
    const requestIds = clientRequests.map(req => req._id);

    // Find assignments related to client's requests
    const assignments = await Assignment.find({ serviceRequest: { $in: requestIds } }).select('_id');
    const assignmentIds = assignments.map(assign => assign._id);

    // Find approved submissions
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
      status: { $in: ['delivered', 'client-approved'] }
    })
      .populate('assignment', 'title serviceRequest')
      .populate({
        path: 'assignment',
        populate: {
          path: 'serviceRequest',
          select: 'title service',
          populate: {
            path: 'service',
            select: 'name category'
          }
        }
      })
      .sort({ 'timeline.deliveredAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments({
      assignment: { $in: assignmentIds },
      status: { $in: ['delivered', 'client-approved'] }
    });

    const meta = getPaginationMeta(parseInt(page), parseInt(limit), total);

    res.json(createSuccessResponse(
      submissions,
      'Downloads retrieved successfully',
      meta
    ));

  } catch (error) {
    console.error('Get downloads error:', error);
    res.status(500).json(createErrorResponse('Failed to get downloads'));
  }
};

// Download submission file
const downloadSubmissionFile = async (req, res) => {
  try {
    const { submissionId, deliverableIndex, fileIndex } = req.params;

    // Verify client has access to this submission
    const clientRequests = await ServiceRequest.find({ client: req.user._id }).select('_id');
    const requestIds = clientRequests.map(req => req._id);

    const assignment = await Assignment.findOne({ serviceRequest: { $in: requestIds } }).select('_id');
    if (!assignment) {
      return res.status(403).json(createErrorResponse('Access denied'));
    }

    const submission = await Submission.findOne({
      _id: submissionId,
      assignment: assignment._id,
      status: { $in: ['delivered', 'client-approved'] }
    });

    if (!submission) {
      return res.status(404).json(createErrorResponse('Submission not found'));
    }

    const deliverable = submission.deliverables[deliverableIndex];
    if (!deliverable) {
      return res.status(404).json(createErrorResponse('Deliverable not found'));
    }

    const file = deliverable.files[fileIndex];
    if (!file) {
      return res.status(404).json(createErrorResponse('File not found'));
    }

    // Track download
    await submission.incrementDownloadCount(deliverableIndex, fileIndex);
    await submission.trackClientDownload();

    res.download(file.path, file.originalName);

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json(createErrorResponse('Failed to download file'));
  }
};

// Get chat conversation
const getChatMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify client is part of this conversation
    if (!conversationId.includes(req.user._id.toString())) {
      return res.status(403).json(createErrorResponse('Access denied'));
    }

    const messages = await Message.findByConversation(conversationId, {
      limit: parseInt(limit),
      skip: (page - 1) * limit
    });

    res.json(createSuccessResponse(
      messages,
      'Chat messages retrieved successfully'
    ));

  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json(createErrorResponse('Failed to get chat messages'));
  }
};

// Send chat message
const sendChatMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text' } = req.body;

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      senderModel: 'User',
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

module.exports = {
  getDashboard,
  requestService,
  getServiceRequests,
  getServiceRequest,
  updateServiceRequest,
  cancelServiceRequest,
  getClientProjects,
  getNotifications,
  markNotificationRead,
  getDownloads,
  downloadSubmissionFile,
  getChatMessages,
  sendChatMessage
};
