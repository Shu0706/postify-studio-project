const { Service } = require('../models');
const { formatResponse, formatError } = require('../utils/helpers');
const { AppError } = require('../middlewares/errorHandler');

class ServiceController {
  // Get all services (public)
  async getAllServices(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        search, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        isActive = true 
      } = req.query;
      
      const query = {};
      
      // Filter by active status
      if (isActive !== undefined) {
        query.isActive = isActive === 'true' || isActive === true;
      }
      
      // Filter by category
      if (category) {
        query.category = category;
      }
      
      // Search functionality
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const services = await Service.find(query)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Service.countDocuments(query);

      // Get unique categories for filtering
      const categories = await Service.distinct('category', { isActive: true });

      res.json(formatResponse({
        services,
        categories,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }, 'Services retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get service by ID
  async getServiceById(req, res, next) {
    try {
      const { id } = req.params;
      
      const service = await Service.findById(id);
      
      if (!service) {
        throw new AppError('Service not found', 404);
      }

      // Only return active services for non-admin users
      if (!service.isActive && (!req.user || req.user.role !== 'admin')) {
        throw new AppError('Service not found', 404);
      }

      res.json(formatResponse(service, 'Service retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Create service (admin only)
  async createService(req, res, next) {
    try {
      const serviceData = req.body;
      
      // Check if service with same name exists
      const existingService = await Service.findOne({ 
        name: serviceData.name,
        isActive: true 
      });
      
      if (existingService) {
        throw new AppError('Service with this name already exists', 400);
      }

      const service = new Service({
        ...serviceData,
        createdBy: req.user._id
      });

      await service.save();

      res.status(201).json(formatResponse(service, 'Service created successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Update service (admin only)
  async updateService(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const service = await Service.findById(id);
      if (!service) {
        throw new AppError('Service not found', 404);
      }

      // Check if updating name to an existing one
      if (updates.name && updates.name !== service.name) {
        const existingService = await Service.findOne({ 
          name: updates.name,
          _id: { $ne: id },
          isActive: true 
        });
        
        if (existingService) {
          throw new AppError('Service with this name already exists', 400);
        }
      }

      // Update service fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && key !== 'createdBy') {
          service[key] = updates[key];
        }
      });

      service.updatedBy = req.user._id;
      await service.save();

      res.json(formatResponse(service, 'Service updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Delete service (admin only) - soft delete
  async deleteService(req, res, next) {
    try {
      const { id } = req.params;
      
      const service = await Service.findById(id);
      if (!service) {
        throw new AppError('Service not found', 404);
      }

      // Soft delete - set isActive to false
      service.isActive = false;
      service.updatedBy = req.user._id;
      await service.save();

      res.json(formatResponse(null, 'Service deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get service categories
  async getCategories(req, res, next) {
    try {
      const categories = await Service.distinct('category', { isActive: true });
      
      res.json(formatResponse(categories, 'Categories retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get featured services
  async getFeaturedServices(req, res, next) {
    try {
      const { limit = 6 } = req.query;
      
      const services = await Service.find({ 
        isActive: true,
        isFeatured: true 
      })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .exec();

      res.json(formatResponse(services, 'Featured services retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get popular services (based on service requests)
  async getPopularServices(req, res, next) {
    try {
      const { limit = 6 } = req.query;
      
      // Aggregate to get services with request counts
      const popularServices = await Service.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'servicerequests',
            localField: '_id',
            foreignField: 'serviceId',
            as: 'requests'
          }
        },
        {
          $addFields: {
            requestCount: { $size: '$requests' }
          }
        },
        { $sort: { requestCount: -1 } },
        { $limit: parseInt(limit) },
        {
          $project: {
            requests: 0 // Remove the requests array from output
          }
        }
      ]);

      res.json(formatResponse(popularServices, 'Popular services retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceController();
