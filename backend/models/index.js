// Export all models for easy importing
const User = require('./User');
const Employee = require('./Employee');
const Admin = require('./Admin');
const Service = require('./Service');
const ServiceRequest = require('./ServiceRequest');
const Assignment = require('./Assignment');
const Submission = require('./Submission');
const Notification = require('./Notification');
const Message = require('./Message');
const File = require('./File');
const AnalyticsData = require('./AnalyticsData');

module.exports = {
  User,
  Employee,
  Admin,
  Service,
  ServiceRequest,
  Assignment,
  Submission,
  Notification,
  Message,
  File,
  AnalyticsData
};
