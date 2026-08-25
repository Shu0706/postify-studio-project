const mongoose = require('mongoose');

const analyticsDataSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ['service', 'user', 'employee', 'request', 'assignment', 'submission', 'system'],
    required: [true, 'Entity type is required']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Entity ID is required']
  },
  metricType: {
    type: String,
    enum: [
      // User metrics
      'user-registration',
      'user-login',
      'user-activity',
      
      // Service metrics
      'service-view',
      'service-inquiry',
      'service-request',
      'service-completion',
      
      // Request metrics
      'request-created',
      'request-approved',
      'request-completed',
      'request-cancelled',
      
      // Assignment metrics
      'assignment-created',
      'assignment-accepted',
      'assignment-completed',
      'assignment-overdue',
      
      // Employee metrics
      'employee-performance',
      'employee-workload',
      'employee-rating',
      
      // Financial metrics
      'revenue-generated',
      'payment-received',
      'cost-incurred',
      
      // System metrics
      'system-performance',
      'error-rate',
      'response-time',
      'storage-usage'
    ],
    required: [true, 'Metric type is required']
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Metric value is required']
  },
  unit: {
    type: String,
    enum: ['count', 'percentage', 'currency', 'time', 'bytes', 'rating'],
    default: 'count'
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'INR'],
    default: 'USD'
  },
  period: {
    type: String,
    enum: ['real-time', 'hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'real-time'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  dimensions: {
    // Common dimensions for filtering/grouping
    userId: mongoose.Schema.Types.ObjectId,
    employeeId: mongoose.Schema.Types.ObjectId,
    serviceId: mongoose.Schema.Types.ObjectId,
    department: String,
    category: String,
    source: String,
    platform: String,
    location: {
      country: String,
      state: String,
      city: String,
      timezone: String
    },
    device: {
      type: String,
      browser: String,
      os: String,
      isMobile: Boolean
    }
  },
  metadata: {
    // Additional context data
    sessionId: String,
    ipAddress: String,
    userAgent: String,
    referrer: String,
    tags: [String],
    customData: mongoose.Schema.Types.Mixed
  },
  aggregated: {
    type: Boolean,
    default: false
  },
  aggregationLevel: {
    type: String,
    enum: ['raw', 'hourly', 'daily', 'weekly', 'monthly'],
    default: 'raw'
  }
}, {
  timestamps: false, // We use custom timestamp field
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
analyticsDataSchema.index({ entityType: 1, entityId: 1 });
analyticsDataSchema.index({ metricType: 1, timestamp: -1 });
analyticsDataSchema.index({ period: 1, timestamp: -1 });
analyticsDataSchema.index({ aggregated: 1, aggregationLevel: 1 });
analyticsDataSchema.index({ 'dimensions.userId': 1, timestamp: -1 });
analyticsDataSchema.index({ 'dimensions.employeeId': 1, timestamp: -1 });
analyticsDataSchema.index({ 'dimensions.serviceId': 1, timestamp: -1 });
analyticsDataSchema.index({ 'dimensions.department': 1, timestamp: -1 });

// TTL index for automatic cleanup (optional - can be configured per metric type)
analyticsDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 }); // 1 year

// Static method to record metric
analyticsDataSchema.statics.record = function(data) {
  return this.create({
    entityType: data.entityType,
    entityId: data.entityId,
    metricType: data.metricType,
    value: data.value,
    unit: data.unit || 'count',
    currency: data.currency || 'USD',
    period: data.period || 'real-time',
    timestamp: data.timestamp || new Date(),
    dimensions: data.dimensions || {},
    metadata: data.metadata || {}
  });
};

// Static method to get metrics for dashboard
analyticsDataSchema.statics.getDashboardMetrics = function(dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchQuery = {};
  
  if (startDate || endDate) {
    matchQuery.timestamp = {};
    if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
    if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$metricType',
        totalValue: { $sum: '$value' },
        avgValue: { $avg: '$value' },
        count: { $sum: 1 },
        lastRecorded: { $max: '$timestamp' }
      }
    },
    {
      $group: {
        _id: null,
        metrics: {
          $push: {
            type: '$_id',
            total: '$totalValue',
            average: '$avgValue',
            count: '$count',
            lastRecorded: '$lastRecorded'
          }
        },
        totalMetrics: { $sum: '$count' }
      }
    }
  ]);
};

// Static method to get service performance
analyticsDataSchema.statics.getServicePerformance = function(serviceId, dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchQuery = {
    'dimensions.serviceId': mongoose.Types.ObjectId(serviceId)
  };
  
  if (startDate || endDate) {
    matchQuery.timestamp = {};
    if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
    if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$metricType',
        value: { $sum: '$value' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        views: { $sum: { $cond: [{ $eq: ['$_id', 'service-view'] }, '$value', 0] } },
        inquiries: { $sum: { $cond: [{ $eq: ['$_id', 'service-inquiry'] }, '$value', 0] } },
        requests: { $sum: { $cond: [{ $eq: ['$_id', 'service-request'] }, '$value', 0] } },
        completions: { $sum: { $cond: [{ $eq: ['$_id', 'service-completion'] }, '$value', 0] } },
        conversionRate: {
          $multiply: [
            { $divide: [
              { $sum: { $cond: [{ $eq: ['$_id', 'service-request'] }, '$value', 0] } },
              { $sum: { $cond: [{ $eq: ['$_id', 'service-view'] }, '$value', 1] } }
            ]},
            100
          ]
        }
      }
    }
  ]);
};

// Static method to get employee performance
analyticsDataSchema.statics.getEmployeePerformance = function(employeeId, dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchQuery = {
    'dimensions.employeeId': mongoose.Types.ObjectId(employeeId)
  };
  
  if (startDate || endDate) {
    matchQuery.timestamp = {};
    if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
    if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$metricType',
        totalValue: { $sum: '$value' },
        avgValue: { $avg: '$value' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get revenue analytics
analyticsDataSchema.statics.getRevenueAnalytics = function(dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchQuery = {
    metricType: { $in: ['revenue-generated', 'payment-received', 'cost-incurred'] }
  };
  
  if (startDate || endDate) {
    matchQuery.timestamp = {};
    if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
    if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          type: '$metricType',
          period: {
            $dateToString: {
              format: '%Y-%m',
              date: '$timestamp'
            }
          }
        },
        amount: { $sum: '$value' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.period',
        revenue: { $sum: { $cond: [{ $eq: ['$_id.type', 'revenue-generated'] }, '$amount', 0] } },
        received: { $sum: { $cond: [{ $eq: ['$_id.type', 'payment-received'] }, '$amount', 0] } },
        costs: { $sum: { $cond: [{ $eq: ['$_id.type', 'cost-incurred'] }, '$amount', 0] } }
      }
    },
    {
      $addFields: {
        profit: { $subtract: ['$received', '$costs'] },
        period: '$_id'
      }
    },
    {
      $sort: { period: 1 }
    }
  ]);
};

// Static method to get time-series data
analyticsDataSchema.statics.getTimeSeries = function(metricType, dateRange = {}, groupBy = 'day') {
  const { startDate, endDate } = dateRange;
  const matchQuery = { metricType };
  
  if (startDate || endDate) {
    matchQuery.timestamp = {};
    if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
    if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
  }
  
  let dateFormat;
  switch (groupBy) {
    case 'hour':
      dateFormat = '%Y-%m-%d %H:00:00';
      break;
    case 'day':
      dateFormat = '%Y-%m-%d';
      break;
    case 'week':
      dateFormat = '%Y-%U';
      break;
    case 'month':
      dateFormat = '%Y-%m';
      break;
    case 'year':
      dateFormat = '%Y';
      break;
    default:
      dateFormat = '%Y-%m-%d';
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          $dateToString: {
            format: dateFormat,
            date: '$timestamp'
          }
        },
        value: { $sum: '$value' },
        count: { $sum: 1 },
        avgValue: { $avg: '$value' }
      }
    },
    {
      $addFields: {
        period: '$_id'
      }
    },
    {
      $sort: { period: 1 }
    }
  ]);
};

// Static method to get top performers
analyticsDataSchema.statics.getTopPerformers = function(metricType, limit = 10, dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchQuery = { metricType };
  
  if (startDate || endDate) {
    matchQuery.timestamp = {};
    if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
    if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$entityId',
        totalValue: { $sum: '$value' },
        avgValue: { $avg: '$value' },
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' }
      }
    },
    {
      $sort: { totalValue: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

module.exports = mongoose.model('AnalyticsData', analyticsDataSchema);
