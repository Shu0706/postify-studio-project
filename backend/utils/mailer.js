const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments || []
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Email templates
const emailTemplates = {
  // Welcome email for new users
  welcome: (user) => ({
    subject: 'Welcome to Postify Studio!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Welcome to Postify Studio!</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Thank you for joining Postify Studio! We're excited to help you with your digital marketing needs.</p>
        <p>Your account has been successfully created with the email: <strong>${user.email}</strong></p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What's next?</h3>
          <ul>
            <li>Browse our services and find what suits your needs</li>
            <li>Submit your first service request</li>
            <li>Connect with our team through the chat feature</li>
          </ul>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Postify Studio Team</p>
      </div>
    `
  }),

  // Employee account creation
  employeeCreated: (employee, password) => ({
    subject: 'Your Postify Studio Employee Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Welcome to the Postify Studio Team!</h1>
        <p>Dear ${employee.firstName} ${employee.lastName},</p>
        <p>Your employee account has been created. Here are your login credentials:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${employee.email}</p>
          <p><strong>Temporary Password:</strong> ${password}</p>
          <p><strong>Employee ID:</strong> ${employee.employeeId}</p>
          <p><strong>Department:</strong> ${employee.department}</p>
          <p><strong>Position:</strong> ${employee.position}</p>
        </div>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
        </div>
        <p>You can login to your account and start managing your tasks.</p>
        <p>Welcome to the team!</p>
        <p>Best regards,<br>Postify Studio Administration</p>
      </div>
    `
  }),

  // Task assignment notification
  taskAssigned: (assignment, employee) => ({
    subject: `New Task Assigned: ${assignment.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">New Task Assigned</h1>
        <p>Dear ${employee.firstName} ${employee.lastName},</p>
        <p>A new task has been assigned to you:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff;">${assignment.title}</h3>
          <p><strong>Description:</strong> ${assignment.description}</p>
          <p><strong>Priority:</strong> <span style="color: ${getPriorityColor(assignment.priority)};">${assignment.priority.toUpperCase()}</span></p>
          <p><strong>Due Date:</strong> ${new Date(assignment.timeline.dueDate).toLocaleDateString()}</p>
          ${assignment.timeline.estimatedHours ? `<p><strong>Estimated Hours:</strong> ${assignment.timeline.estimatedHours}</p>` : ''}
        </div>
        ${assignment.instructions ? `
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Instructions:</h4>
            <p>${assignment.instructions}</p>
          </div>
        ` : ''}
        <p>Please login to your dashboard to view more details and accept the task.</p>
        <p>Best regards,<br>Postify Studio Team</p>
      </div>
    `
  }),

  // Work submission notification
  workSubmitted: (submission, admin) => ({
    subject: `Work Submitted: ${submission.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Work Submission Received</h1>
        <p>Dear Admin,</p>
        <p>A new work submission has been received:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #28a745;">${submission.title}</h3>
          <p><strong>Submitted by:</strong> ${submission.submittedBy.firstName} ${submission.submittedBy.lastName}</p>
          <p><strong>Hours Worked:</strong> ${submission.hoursWorked}</p>
          <p><strong>Submitted on:</strong> ${new Date(submission.timeline.submittedAt).toLocaleString()}</p>
        </div>
        <p><strong>Work Summary:</strong></p>
        <p>${submission.workSummary || 'No summary provided'}</p>
        <p>Please review the submission in the admin dashboard.</p>
        <p>Best regards,<br>Postify Studio System</p>
      </div>
    `
  }),

  // Work approved notification
  workApproved: (submission, client) => ({
    subject: `Your Work is Ready: ${submission.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Your Work is Ready!</h1>
        <p>Dear ${client.firstName} ${client.lastName},</p>
        <p>Great news! Your requested work has been completed and approved:</p>
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #155724;">${submission.title}</h3>
          <p><strong>Completed on:</strong> ${new Date(submission.timeline.approvedAt).toLocaleString()}</p>
          <p><strong>Total Files:</strong> ${submission.metadata.fileCount}</p>
        </div>
        <p>You can now download your files from your client dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/client/downloads" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Download Your Files
          </a>
        </div>
        <p>Thank you for choosing Postify Studio!</p>
        <p>Best regards,<br>The Postify Studio Team</p>
      </div>
    `
  }),

  // Password reset
  passwordReset: (user, resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>You have requested a password reset for your Postify Studio account.</p>
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>Postify Studio Security Team</p>
      </div>
    `
  }),

  // Service inquiry
  serviceInquiry: (inquiry, admin) => ({
    subject: `New Service Inquiry: ${inquiry.service}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">New Service Inquiry</h1>
        <p>Dear Admin,</p>
        <p>A new service inquiry has been received:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${inquiry.service}</p>
          <p><strong>Client:</strong> ${inquiry.clientName}</p>
          <p><strong>Email:</strong> ${inquiry.clientEmail}</p>
          <p><strong>Budget:</strong> $${inquiry.budget}</p>
          <p><strong>Timeline:</strong> ${inquiry.timeline}</p>
        </div>
        <p><strong>Message:</strong></p>
        <p>${inquiry.message}</p>
        <p>Please respond to the client promptly.</p>
        <p>Best regards,<br>Postify Studio System</p>
      </div>
    `
  }),

  // Service request notification
  serviceRequest: (serviceRequest, client, service) => ({
    subject: `Service Request Received: ${service.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Service Request Received</h1>
        <p>Dear ${client.firstName} ${client.lastName},</p>
        <p>We have received your service request and our team will review it shortly.</p>
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #155724;">${service.name}</h3>
          <p><strong>Title:</strong> ${serviceRequest.title}</p>
          <p><strong>Budget:</strong> $${serviceRequest.budget.amount} ${serviceRequest.budget.currency}</p>
          <p><strong>Timeline:</strong> ${new Date(serviceRequest.timeline.expectedDeliveryDate).toLocaleDateString()}</p>
          <p><strong>Request ID:</strong> #${serviceRequest._id.toString().slice(-8).toUpperCase()}</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4>What happens next?</h4>
          <ul>
            <li>Our team will review your requirements within 24 hours</li>
            <li>We'll assign the best team member for your project</li>
            <li>You'll receive updates on your dashboard and via email</li>
            <li>Feel free to use our chat feature for any questions</li>
          </ul>
        </div>
        <p>You can track the progress of your request in your client dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard/projects" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View My Projects
          </a>
        </div>
        <p>Thank you for choosing Postify Studio!</p>
        <p>Best regards,<br>The Postify Studio Team</p>
      </div>
    `
  }),

  // Service request admin notification
  serviceRequestAdmin: (serviceRequest, client, service) => ({
    subject: `New Service Request: ${service.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">New Service Request</h1>
        <p>Dear Admin,</p>
        <p>A new service request has been received that requires your attention.</p>
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404;">${service.name}</h3>
          <p><strong>Client:</strong> ${client.firstName} ${client.lastName} (${client.email})</p>
          <p><strong>Title:</strong> ${serviceRequest.title}</p>
          <p><strong>Budget:</strong> $${serviceRequest.budget.amount} ${serviceRequest.budget.currency}</p>
          <p><strong>Timeline:</strong> ${new Date(serviceRequest.timeline.expectedDeliveryDate).toLocaleDateString()}</p>
          <p><strong>Priority:</strong> ${serviceRequest.priority || 'Medium'}</p>
          <p><strong>Request ID:</strong> #${serviceRequest._id.toString().slice(-8).toUpperCase()}</p>
          <p><strong>Submitted:</strong> ${new Date(serviceRequest.createdAt).toLocaleString()}</p>
        </div>
        ${serviceRequest.requirements ? `
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Client Requirements:</h4>
            <p>${serviceRequest.requirements}</p>
          </div>
        ` : ''}
        <p>Please review and assign this request to an appropriate team member.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/admin/service-requests" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Review Request
          </a>
        </div>
        <p>Best regards,<br>Postify Studio System</p>
      </div>
    `
  }),

  // Client registration notification
  clientRegistered: (client) => ({
    subject: `New Client Registration: ${client.firstName} ${client.lastName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">New Client Registration</h1>
        <p>Dear Admin,</p>
        <p>A new client has registered on the platform:</p>
        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #bee5eb;">
          <h3 style="color: #0c5460;">${client.firstName} ${client.lastName}</h3>
          <p><strong>Email:</strong> ${client.email}</p>
          <p><strong>Phone:</strong> ${client.phone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${client.company || 'Not provided'}</p>
          <p><strong>Registration Date:</strong> ${new Date(client.createdAt).toLocaleString()}</p>
          <p><strong>Verification Status:</strong> ${client.isEmailVerified ? 'Verified' : 'Pending'}</p>
        </div>
        <p>The client is now part of your customer base and can start requesting services.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/admin/clients" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View All Clients
          </a>
        </div>
        <p>Best regards,<br>Postify Studio System</p>
      </div>
    `
  }),

  // Employee registration notification
  employeeRegistered: (employee) => ({
    subject: `New Employee Added: ${employee.firstName} ${employee.lastName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">New Employee Added</h1>
        <p>Dear Admin,</p>
        <p>A new employee has been added to your team:</p>
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #155724;">${employee.firstName} ${employee.lastName}</h3>
          <p><strong>Email:</strong> ${employee.email}</p>
          <p><strong>Employee ID:</strong> ${employee.employeeId}</p>
          <p><strong>Department:</strong> ${employee.department}</p>
          <p><strong>Position:</strong> ${employee.position}</p>
          <p><strong>Start Date:</strong> ${new Date(employee.startDate || employee.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${employee.isActive ? 'Active' : 'Inactive'}</p>
        </div>
        <p>The employee has been sent their login credentials and can now access their dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/admin/employees" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View All Employees
          </a>
        </div>
        <p>Best regards,<br>Postify Studio System</p>
      </div>
    `
  }),

  // Generic notification
  notification: (title, message, actionUrl = null, actionText = null) => ({
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">${title}</h1>
        <p>${message}</p>
        ${actionUrl && actionText ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              ${actionText}
            </a>
          </div>
        ` : ''}
        <p>Best regards,<br>Postify Studio Team</p>
      </div>
    `
  })
};

// Helper function to get priority color
const getPriorityColor = (priority) => {
  const colors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    urgent: '#dc3545'
  };
  return colors[priority] || '#6c757d';
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const template = emailTemplates.welcome(user);
  return await sendEmail({
    to: user.email,
    subject: template.subject,
    html: template.html
  });
};

// Send employee creation email
const sendEmployeeCreatedEmail = async (employee, password) => {
  const template = emailTemplates.employeeCreated(employee, password);
  return await sendEmail({
    to: employee.email,
    subject: template.subject,
    html: template.html
  });
};

// Send task assignment email
const sendTaskAssignmentEmail = async (assignment, employee) => {
  const template = emailTemplates.taskAssigned(assignment, employee);
  return await sendEmail({
    to: employee.email,
    subject: template.subject,
    html: template.html
  });
};

// Send work submission email
const sendWorkSubmissionEmail = async (submission, adminEmail) => {
  const template = emailTemplates.workSubmitted(submission);
  return await sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html
  });
};

// Send work approved email
const sendWorkApprovedEmail = async (submission, client) => {
  const template = emailTemplates.workApproved(submission, client);
  return await sendEmail({
    to: client.email,
    subject: template.subject,
    html: template.html
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const template = emailTemplates.passwordReset(user, resetToken);
  return await sendEmail({
    to: user.email,
    subject: template.subject,
    html: template.html
  });
};

// Send service inquiry email
const sendServiceInquiryEmail = async (inquiry, adminEmail) => {
  const template = emailTemplates.serviceInquiry(inquiry);
  return await sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html
  });
};

// Send service request confirmation email
const sendServiceRequestEmail = async (serviceRequest, client, service) => {
  const template = emailTemplates.serviceRequest(serviceRequest, client, service);
  return await sendEmail({
    to: client.email,
    subject: template.subject,
    html: template.html
  });
};

// Send service request admin notification email
const sendServiceRequestAdminEmail = async (serviceRequest, client, service, adminEmail) => {
  const template = emailTemplates.serviceRequestAdmin(serviceRequest, client, service);
  return await sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html
  });
};

// Send client registration notification email
const sendClientRegistrationEmail = async (client, adminEmail) => {
  const template = emailTemplates.clientRegistered(client);
  return await sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html
  });
};

// Send employee registration notification email
const sendEmployeeRegistrationEmail = async (employee, adminEmail) => {
  const template = emailTemplates.employeeRegistered(employee);
  return await sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html
  });
};

// Send custom notification email
const sendNotificationEmail = async (email, title, message, actionUrl = null, actionText = null) => {
  const template = emailTemplates.notification(title, message, actionUrl, actionText);
  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html
  });
};

// Bulk email sender
const sendBulkEmails = async (emails) => {
  const results = [];
  
  for (const emailData of emails) {
    try {
      const result = await sendEmail(emailData);
      results.push({ success: true, email: emailData.to, messageId: result.messageId });
    } catch (error) {
      results.push({ success: false, email: emailData.to, error: error.message });
    }
  }
  
  return results;
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEmployeeCreatedEmail,
  sendTaskAssignmentEmail,
  sendWorkSubmissionEmail,
  sendWorkApprovedEmail,
  sendPasswordResetEmail,
  sendServiceInquiryEmail,
  sendServiceRequestEmail,
  sendServiceRequestAdminEmail,
  sendClientRegistrationEmail,
  sendEmployeeRegistrationEmail,
  sendNotificationEmail,
  sendBulkEmails,
  testEmailConfig,
  emailTemplates
};
