const Event = require('../models/Event');
const Purchase = require('../models/Purchase');
const Ticket = require('../models/Ticket');
const TicketType = require('../models/TicketType');
const Refund = require('../models/Refund');
const { parsePagination, buildPaginationMeta } = require('../utils/helpers');
const { HTTP_STATUS, ERROR_MESSAGES, PURCHASE_STATUS, REFUND_STATUS } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler.middleware');
const logger = require('../services/logging.service');

/**
 * Get organizer statistics
 */
const getOrganizerStatistics = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { dateRange = '6months' } = req.query;
    logger.info(`[STATS_DEBUG] Start for user: ${userId}, range: ${dateRange}`);

    // Calculate date filter
    let dateFilter = {};
    const now = new Date();
    if (dateRange === '1month') {
      dateFilter = { $gte: subMonths(now, 1) };
    } else if (dateRange === '3months') {
      dateFilter = { $gte: subMonths(now, 3) };
    } else if (dateRange === '6months') {
      dateFilter = { $gte: subMonths(now, 6) };
    } else if (dateRange === '1year') {
      dateFilter = { $gte: subMonths(now, 12) };
    }
    logger.info(`[STATS_DEBUG] Date filter: ${JSON.stringify(dateFilter)}`);

    // Get organizer's events
    const events = await Event.find({ organizerId: userId }).lean();
    logger.info(`[STATS_DEBUG] Found ${events.length} events for organizer ${userId}`);
    const eventIds = events.map(e => e._id);

    // Get statistics
    logger.info(`[STATS_DEBUG] Running aggregations for ${eventIds.length} events...`);
    const [
      totalEvents,
      publishedEvents,
      revenueStats,
      ticketStats,
      totalPurchases,
      pendingRefunds,
      topEvents
    ] = await Promise.all([
      Event.countDocuments({ organizerId: userId }),
      Event.countDocuments({ organizerId: userId, status: 'published' }),
      Purchase.aggregate([
        { $match: { eventId: { $in: eventIds }, status: PURCHASE_STATUS.PAID, createdAt: dateFilter } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(res => { logger.info(`[STATS_DEBUG] RevenueStats: ${JSON.stringify(res)}`); return res; }),
      Purchase.aggregate([
        { $match: { eventId: { $in: eventIds }, status: PURCHASE_STATUS.PAID, createdAt: dateFilter } },
        { $unwind: '$tickets' },
        { $group: { _id: null, total: { $sum: '$tickets.quantity' } } }
      ]).then(res => { logger.info(`[STATS_DEBUG] TicketStats: ${JSON.stringify(res)}`); return res; }),
      Purchase.countDocuments({ eventId: { $in: eventIds }, status: PURCHASE_STATUS.PAID, createdAt: dateFilter }),
      Refund.countDocuments({ eventId: { $in: eventIds }, status: REFUND_STATUS.PENDING }),
      Purchase.aggregate([
        { $match: { eventId: { $in: eventIds }, status: PURCHASE_STATUS.PAID } },
        { $group: { _id: '$eventId', revenue: { $sum: '$totalAmount' }, ticketsSold: { $sum: { $sum: '$tickets.quantity' } } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'events',
            localField: '_id',
            foreignField: '_id',
            as: 'event'
          }
        },
        { $unwind: '$event' },
        {
          $project: {
            title: '$event.title',
            date: '$event.startDate',
            status: '$event.status',
            revenue: 1,
            ticketsSold: 1
          }
        }
      ]).then(res => { logger.info(`[STATS_DEBUG] TopEvents: ${JSON.stringify(res)}`); return res; })
    ]);

    const totalRevenue = revenueStats[0]?.total || 0;
    const totalTicketsSold = ticketStats[0]?.total || 0;

    // Revenue by month (last 6 months)
    const sixMonthsAgo = subMonths(new Date(), 6);
    const revenueByMonth = await Purchase.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: PURCHASE_STATUS.PAID,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    logger.info(`[STATS_DEBUG] RevenueByMonth: ${JSON.stringify(revenueByMonth)}`);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalEvents,
        publishedEvents,
        totalRevenue,
        totalTicketsSold,
        totalPurchases,
        pendingRefunds,
        averageRevenuePerEvent: totalEvents > 0 ? totalRevenue / totalEvents : 0,
        revenueByMonth: revenueByMonth.map(m => ({
          month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
          revenue: m.revenue
        })),
        topEvents
      }
    });
  } catch (error) {
    logger.error(`[STATS_DEBUG] Error: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

// Helper function for subMonths (to avoid adding date-fns to backend if not there)
function subMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

/**
 * Get event sales analytics
 */
const getEventSalesAnalytics = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    // Verify event ownership
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError(ERROR_MESSAGES.EVENT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (event.organizerId.toString() !== userId && req.user.role !== 'admin') {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    // Get ticket types
    const ticketTypes = await TicketType.find({ eventId }).lean();

    // Get sales data
    const purchases = await Purchase.find({
      eventId,
      status: PURCHASE_STATUS.PAID
    })
      .populate('userId', 'email firstName lastName')
      .lean();

    // Calculate analytics
    const totalRevenue = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalTicketsSold = purchases.reduce((sum, p) => sum + p.tickets.reduce((s, t) => s + t.quantity, 0), 0);

    // Sales by ticket type
    const salesByType = {};
    purchases.forEach(purchase => {
      purchase.tickets.forEach(ticket => {
        const typeName = ticket.ticketType;
        if (!salesByType[typeName]) {
          salesByType[typeName] = { quantity: 0, revenue: 0 };
        }
        salesByType[typeName].quantity += ticket.quantity;
        salesByType[typeName].revenue += ticket.subtotal;
      });
    });

    // Sales by day
    const salesByDay = {};
    purchases.forEach(purchase => {
      const day = new Date(purchase.createdAt).toISOString().split('T')[0];
      if (!salesByDay[day]) {
        salesByDay[day] = { count: 0, revenue: 0 };
      }
      salesByDay[day].count += 1;
      salesByDay[day].revenue += purchase.totalAmount;
    });

    // Calculate check-in rate
    const Ticket = require('../models/Ticket');
    const { TICKET_STATUS } = require('../utils/constants');
    const tickets = await Ticket.find({ eventId }).lean();
    const checkedInTickets = tickets.filter(t => t.status === TICKET_STATUS.CHECKED_IN).length;
    const checkInRate = tickets.length > 0 ? ((checkedInTickets / tickets.length) * 100).toFixed(2) : 0;

    // Convert salesByType object to array format
    const salesByTypeArray = Object.entries(salesByType).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue
    }));

    // Format revenueByDay array
    const revenueByDayArray = Object.entries(salesByDay)
      .map(([date, data]) => ({
        date,
        name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: data.revenue,
        count: data.count
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalRevenue,
        ticketsSold: totalTicketsSold,
        averageOrder: purchases.length > 0 ? totalRevenue / purchases.length : 0,
        checkInRate: parseFloat(checkInRate),
        revenueByDay: revenueByDayArray,
        salesByType: salesByTypeArray,
        recentPurchases: purchases.slice(0, 10).map(purchase => ({
          _id: purchase._id,
          createdAt: purchase.createdAt,
          totalAmount: purchase.totalAmount,
          status: purchase.status,
          attendeeInfo: {
            firstName: purchase.userId?.firstName,
            lastName: purchase.userId?.lastName,
            email: purchase.userId?.email
          },
          tickets: purchase.tickets || []
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganizerStatistics,
  getEventSalesAnalytics
};







