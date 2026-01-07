const User = require('../models/User');
const Event = require('../models/Event');
const Purchase = require('../models/Purchase');
const ActivityLog = require('../models/ActivityLog');
const { parsePagination, buildPaginationMeta } = require('../utils/helpers');
const { HTTP_STATUS, ERROR_MESSAGES, ROLES } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler.middleware');

/**
 * Get all users (admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { role, search, isActive } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        users,
        pagination: buildPaginationMeta(page, limit, total)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID (admin only)
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (admin only)
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    // Don't allow updating password here
    delete updateData.password;

    Object.assign(user, updateData);
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity logs (admin only)
 */
const getActivityLogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { userId, activityType, severity, startDate, endDate } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (activityType) query.activityType = activityType;
    if (severity) query.severity = severity;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('userId', 'email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query)
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        logs,
        pagination: buildPaginationMeta(page, limit, total)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get statistics (admin only)
 */
const getStatistics = async (req, res, next) => {
  try {
    const Purchase = require('../models/Purchase');
    const Ticket = require('../models/Ticket');
    const TicketType = require('../models/TicketType');
    const ActivityLog = require('../models/ActivityLog');
    
    const [totalUsers, totalEvents, totalPurchases, totalRevenue, totalTickets, totalTicketTypes, recentActivity] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Purchase.countDocuments({ status: 'paid' }),
      Purchase.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Ticket.countDocuments(),
      TicketType.countDocuments(),
      ActivityLog.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
    ]);

    // Get revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const revenueByMonth = await Purchase.aggregate([
      { 
        $match: { 
          status: 'paid',
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        users: { total: totalUsers },
        events: { total: totalEvents },
        purchases: { total: totalPurchases },
        tickets: { total: totalTickets },
        ticketTypes: { total: totalTicketTypes },
        revenue: { 
          total: totalRevenue[0]?.total || 0,
          byMonth: revenueByMonth
        },
        activity: {
          last24Hours: recentActivity
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all refunds (admin only)
 */
const getAllRefunds = async (req, res, next) => {
  try {
    const Refund = require('../models/Refund');
    const { page, limit, skip } = parsePagination(req.query);
    const { status, eventId, startDate, endDate } = req.query;

    const query = {};
    if (status) query.status = status;
    if (eventId) query.eventId = eventId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [refunds, total] = await Promise.all([
      Refund.find(query)
        .populate('userId', 'email firstName lastName')
        .populate('eventId', 'title')
        .populate('purchaseId', 'transactionId totalAmount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Refund.countDocuments(query)
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        refunds,
        pagination: buildPaginationMeta(page, limit, total)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all purchases (admin only)
 */
const getAllPurchases = async (req, res, next) => {
  try {
    const Purchase = require('../models/Purchase');
    const { page, limit, skip } = parsePagination(req.query);
    const { status, eventId, startDate, endDate } = req.query;

    const query = {};
    if (status) query.status = status;
    if (eventId) query.eventId = eventId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate('userId', 'email firstName lastName')
        .populate('eventId', 'title startDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Purchase.countDocuments(query)
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        purchases,
        pagination: buildPaginationMeta(page, limit, total)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  getActivityLogs,
  getStatistics,
  getAllRefunds,
  getAllPurchases
};
