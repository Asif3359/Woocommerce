// components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Box, H1, H2, Text, Button, Loader } from '@adminjs/design-system';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  adminUsers: number;
  managerUsers: number;
  regularUsers: number;
}

interface DashboardData {
  stats: DashboardStats;
  registrationData: Array<{ _id: string; count: number }>;
  usersByRole: Array<{ name: string; value: number }>;
  recentUsers: Array<{
    _id: string;
    email: string;
    name?: string;
    createdAt: string;
    role: string;
    status: string;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <Box p="xl" display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Loader />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box p="xl">
        <H1>Error</H1>
        <Text color="error">{error || 'Failed to load dashboard data'}</Text>
      </Box>
    );
  }

  const { stats, registrationData, usersByRole, recentUsers } = data;

  // Prepare chart data
  const chartData = registrationData.map((item) => ({
    date: formatDate(item._id),
    users: item.count,
  }));

  const statsCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers.toLocaleString(), 
      icon: '👥', 
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    { 
      title: 'Active Users', 
      value: stats.activeUsers.toLocaleString(), 
      icon: '✅', 
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
    { 
      title: 'Suspended Users', 
      value: stats.suspendedUsers.toLocaleString(), 
      icon: '⛔', 
      color: '#EF4444',
      bgColor: '#FEF2F2',
    },
    { 
      title: 'Admin Users', 
      value: stats.adminUsers.toLocaleString(), 
      icon: '👑', 
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
    },
  ];

  const activePercentage = stats.totalUsers > 0 
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100) 
    : 0;

  return (
    <Box p="xl" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb="xl" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <H1 mb="sm" style={{ fontSize: '2rem', fontWeight: 700 }}>AdminPro Dashboard</H1>
        <Text variant="lg" color="grey600">Welcome to your professional administration panel</Text>
      </Box>

      {/* Stats Cards */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" 
        gap="lg" 
        mb="xl"
      >
        {statsCards.map((stat, index) => (
          <Box
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${stat.color}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Text variant="sm" color="grey600" mb="sm" style={{ fontWeight: 600 }}>
                  {stat.title}
                </Text>
                <H2 marginTop="sm" marginBottom="sm" style={{ color: stat.color, fontSize: '2rem', fontWeight: 700 }}>
                  {stat.value}
                </H2>
              </Box>
              <Box
                style={{
                  backgroundColor: stat.bgColor,
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                }}
              >
                {stat.icon}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Charts Section */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(auto-fit, minmax(500px, 1fr))" 
        gap="lg" 
        mb="xl"
      >
        {/* User Registration Chart */}
        <Box
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <H2 mb="lg" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            User Registrations (Last 7 Days)
          </H2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 5 }}
                activeDot={{ r: 7 }}
                name="New Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Users by Role Pie Chart */}
        <Box
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <H2 mb="lg" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Users by Role
          </H2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usersByRole}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, percent } = props;
                  return `${name}: ${((percent || 0) * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {usersByRole.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Additional Stats Bar Chart */}
      <Box
        mb="xl"
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <H2 mb="lg" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          User Distribution
        </H2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { name: 'Active', value: stats.activeUsers },
              { name: 'Suspended', value: stats.suspendedUsers },
              { name: 'Admin', value: stats.adminUsers },
              { name: 'Manager', value: stats.managerUsers },
              { name: 'User', value: stats.regularUsers },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Recent Users and System Health */}
      <Box 
        display="grid" 
        gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))" 
        gap="lg" 
        mb="xl"
      >
        {/* Recent Users */}
        <Box
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <H2 mb="lg" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Recent Users
          </H2>
          <Box>
            {recentUsers.length > 0 ? (
              recentUsers.map((user, index) => (
                <Box
                  key={user._id}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py="md"
                  borderBottom={index < recentUsers.length - 1 ? '1px solid #E5E7EB' : 'none'}
                >
                  <Box>
                    <Text fontWeight="bold" mb="xs">{user.email}</Text>
                    <Box display="flex" gap="sm" alignItems="center">
                      <Text variant="sm" color="grey600">
                        {user.name || 'No name'}
                      </Text>
                      <Box
                        style={{
                          backgroundColor: user.status === 'active' ? '#ECFDF5' : '#FEF2F2',
                          color: user.status === 'active' ? '#10B981' : '#EF4444',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {user.status}
                      </Box>
                      <Box
                        style={{
                          backgroundColor: '#F3F4F6',
                          color: '#6B7280',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {user.role}
                      </Box>
                    </Box>
                  </Box>
                  <Text variant="sm" color="grey500">
                    {getTimeAgo(user.createdAt)}
                  </Text>
                </Box>
              ))
            ) : (
              <Text color="grey500">No recent users</Text>
            )}
          </Box>
        </Box>

        {/* System Health */}
        <Box
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <H2 mb="lg" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            System Health
          </H2>
          <Box>
            <Box mb="lg">
              <Box display="flex" justifyContent="space-between" mb="sm">
                <Text fontWeight="bold">Active Users Rate</Text>
                <Text fontWeight="bold" style={{ color: '#10B981' }}>
                  {activePercentage}%
                </Text>
              </Box>
              <Box
                style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    width: `${activePercentage}%`,
                    height: '100%',
                    backgroundColor: '#10B981',
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
            </Box>
            <Box mb="lg">
              <Box display="flex" justifyContent="space-between" mb="sm">
                <Text fontWeight="bold">Suspended Users Rate</Text>
                <Text fontWeight="bold" style={{ color: '#EF4444' }}>
                  {stats.totalUsers > 0 
                    ? Math.round((stats.suspendedUsers / stats.totalUsers) * 100) 
                    : 0}%
                </Text>
              </Box>
              <Box
                style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    width: `${stats.totalUsers > 0 
                      ? Math.round((stats.suspendedUsers / stats.totalUsers) * 100) 
                      : 0}%`,
                    height: '100%',
                    backgroundColor: '#EF4444',
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
            </Box>
            <Box
              style={{
                backgroundColor: '#F3F4F6',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem',
              }}
            >
              <Text variant="sm" color="grey600" mb="xs">Database Status</Text>
              <Text fontWeight="bold" style={{ color: '#10B981' }}>
                ● Connected
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <H2 mb="md" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          Quick Actions
        </H2>
        <Box display="flex" gap="default" flexWrap="wrap">
          <Button 
            variant="primary" 
            onClick={() => window.location.href = '/admin/resources/User'}
            style={{ borderRadius: '8px', padding: '0.5rem 1.5rem' }}
          >
            Manage Users
          </Button>
          <Button 
            variant="contained"
            style={{ borderRadius: '8px', padding: '0.5rem 1.5rem' }}
          >
            System Settings
          </Button>
          <Button 
            variant="light"
            style={{ borderRadius: '8px', padding: '0.5rem 1.5rem' }}
          >
            View Reports
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;