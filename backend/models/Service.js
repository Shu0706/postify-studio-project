const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'social-media-management',
      'content-writing',
      'web-development',
      'graphic-design',
      'seo-optimization',
      'digital-marketing',
      'branding',
      'video-editing',
      'photography'
    ]
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  pricing: {
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'package', 'custom'],
      default: 'fixed'
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR']
    },
    packages: [{
      name: { type: String, required: true },
      description: String,
      price: { type: Number, required: true },
      features: [String],
      deliveryTime: { type: Number, required: true } // in days
    }]
  },
  features: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  deliverables: [{
    type: String,
    trim: true
  }],
  estimatedDeliveryTime: {
    type: Number,
    required: [true, 'Estimated delivery time is required'],
    min: [1, 'Delivery time must be at least 1 day']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  metadata: {
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    orders: { type: Number, default: 0 }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  media: {
    thumbnail: String,
    gallery: [String],
    video: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for request count
serviceSchema.virtual('requestCount', {
  ref: 'ServiceRequest',
  localField: '_id',
  foreignField: 'service',
  count: true
});

// Index for better performance
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ 'pricing.basePrice': 1 });
serviceSchema.index({ popularity: -1 });
serviceSchema.index({ 'rating.average': -1 });

// Text index for search
serviceSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  'seo.keywords': 'text'
});

// Pre-save middleware to update lastUpdatedBy
serviceSchema.pre('save', function(next) {
  if (!this.isNew && this.isModified()) {
    this.lastUpdatedBy = this.modifiedBy || this.createdBy;
  }
  next();
});

// Method to increment view count
serviceSchema.methods.incrementViews = function() {
  this.metadata.views += 1;
  return this.save();
};

// Method to increment inquiry count
serviceSchema.methods.incrementInquiries = function() {
  this.metadata.inquiries += 1;
  return this.save();
};

// Method to increment order count
serviceSchema.methods.incrementOrders = function() {
  this.metadata.orders += 1;
  this.popularity += 1;
  return this.save();
};

// Method to update rating
serviceSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Static method to find active services
serviceSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ popularity: -1 });
};

// Static method to find by category
serviceSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ popularity: -1 });
};

// Static method to search services
serviceSchema.statics.searchServices = function(query, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    deliveryTime,
    rating,
    limit = 20,
    skip = 0
  } = options;

  let searchQuery = { isActive: true };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  if (category) {
    searchQuery.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    searchQuery['pricing.basePrice'] = {};
    if (minPrice !== undefined) searchQuery['pricing.basePrice'].$gte = minPrice;
    if (maxPrice !== undefined) searchQuery['pricing.basePrice'].$lte = maxPrice;
  }

  if (deliveryTime) {
    searchQuery.estimatedDeliveryTime = { $lte: deliveryTime };
  }

  if (rating) {
    searchQuery['rating.average'] = { $gte: rating };
  }

  return this.find(searchQuery)
    .sort({ popularity: -1, 'rating.average': -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Service', serviceSchema);
