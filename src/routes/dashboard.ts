import { Router } from 'express';
import User from '../db/user.js';

const router = Router();

// Dashboard stats API endpoint (protected by AdminJS session)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const managerUsers = await User.countDocuments({ role: 'manager' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Get user registration data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const registrationData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get recent users (last 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email name createdAt role status')
      .lean();

    // Get users by role for pie chart
    const usersByRole = [
      { name: 'Admin', value: adminUsers },
      { name: 'Manager', value: managerUsers },
      { name: 'User', value: regularUsers },
    ];

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        adminUsers,
        managerUsers,
        regularUsers,
      },
      registrationData,
      usersByRole,
      recentUsers: recentUsers.map(user => ({
        ...user,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
