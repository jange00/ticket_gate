const Event = require('../models/Event');
const Purchase = require('../models/Purchase');
const Ticket = require('../models/Ticket');
const TicketType = require('../models/TicketType');
const Refund = require('../models/Refund');
const { parsePagination, buildPaginationMeta } = require('../utils/helpers');
const { HTTP_STATUS, ERROR_MESSAGES, PURCHASE_STATUS, REFUND_STATUS } = require('../utils/constants');
const { AppError } = require('../middleware/errorHandler.middleware');

/**
 * Get organizer statistics
 */
const getOrganizerStatistics = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get organizer's events
    const events = await Event.find({ organizerId: userId }).lean();
    const eventIds = events.map(e => e._id);

    // Get statistics
    const [
      totalEvents,
      publishedEvents,
      totalRevenue,
      totalTicketsSold,
      totalPurchases,
      pendingRefunds
    ] = await Promise.all([
      Event.countDocuments({ organizerId: userId }),
      Event.countDocuments({ organizerId: userId, status: 'published' }),
      Purchase.aggregate([
        { $match: { eventId: { $in: eventIds }, status: PURCHASE_STATUS.PAID } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Purchase.aggregate([
        { $match: { eventId: { $in: eventIds }, status: PURCHASE_STATUS.PAID } },
        { $group: { _id: null, total: { $sum: { $sum: '$tickets.quantity' } } } }
      ]),
      Purchase.countDocuments({ eventId: { $in: eventIds }, status: PURCHASE_STATUS.PAID }),
      Refund.countDocuments({ eventId: { $in: eventIds }, status: REFUND_STATUS.PENDING })
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

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
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        events: {
          total: totalEvents,
          published: publishedEvents
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          byMonth: revenueByMonth
        },
        tickets: {
          sold: totalTicketsSold[0]?.total || 0
        },
        purchases: {
          total: totalPurchases
        },
        refunds: {
          pending: pendingRefunds
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

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

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        event: {
          id: event._id,
          title: event.title,
          totalTickets: event.totalTickets,
          soldTickets: event.soldTickets
        },
        summary: {
          totalRevenue,
          totalTicketsSold,
          totalPurchases: purchases.length,
          averageOrderValue: purchases.length > 0 ? totalRevenue / purchases.length : 0
        },
        salesByType,
        salesByDay: Object.entries(salesByDay).map(([date, data]) => ({
          date,
          ...data
        })),
        recentPurchases: purchases.slice(0, 10)
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




