import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { adminService } from '../../services/adminService';
import {
  UsersIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [error, setError] = useState(null);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.getAnalytics(timeRange);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data');
      // Use mock data as fallback
      setData(getMockData());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockData = () => ({
    period: timeRange,
    overview: {
      totalClients: 0,
      totalEmployees: 0,
      totalProjects: 0,
      completedTasks: 0,
      activeProjects: 0,
      pendingRequests: 0,
      totalRevenue: 0,
      avgTurnaroundTime: 0,
      clientGrowth: 0
    },
    serviceRequests: {
      total: 85,
      byStatus: [
        { _id: 'pending', count: 8 },
        { _id: 'in_progress', count: 13 },
        { _id: 'completed', count: 72 }
      ]
    },
    assignments: {
      total: 85,
      byStatus: [
        { _id: 'assigned', count: 13 },
        { _id: 'completed', count: 72 }
      ]
    },
    topPerformers: [],
    charts: {
      projectsOverTime: [],
      serviceDistribution: []
    }
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const isPositive = change >= 0;
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500'
    };

    return (
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositive ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                )}
                {formatPercentage(change)}
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive insights into your business performance</p>
              {error && (
                <p className="text-amber-600 text-sm mt-2">⚠️ {error}</p>
              )}
            </div>
            <div className="flex space-x-2">
              {['7d', '30d', '90d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === period
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Clients"
            value={data.overview.totalClients}
            change={data.overview.clientGrowth}
            icon={UsersIcon}
            color="blue"
          />
          <StatCard
            title="Active Projects"
            value={data.overview.activeProjects}
            change={5.2}
            icon={BriefcaseIcon}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data.overview.totalRevenue)}
            change={12.8}
            icon={CurrencyDollarIcon}
            color="yellow"
          />
          <StatCard
            title="Avg. Turnaround"
            value={`${data.overview.avgTurnaroundTime} days`}
            change={-8.5}
            icon={ClockIcon}
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Over Time */}
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.charts.projectsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                  stroke="#666"
                />
                <YAxis stroke="#666" tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Projects']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Service Distribution */}
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.charts.serviceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.charts.serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Projects Over Time */}
        <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.projectsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                stroke="#666"
              />
              <YAxis stroke="#666" />
              <Tooltip 
                formatter={(value, name) => [value, name === 'projects' ? 'Projects' : 'Revenue']}
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              />
              <Bar dataKey="projects" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Performers */}
        <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-medium text-gray-600">Employee</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Department</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Completed Tasks</th>
                  <th className="pb-3 text-sm font-medium text-gray-600">Avg. Rating</th>
                </tr>
              </thead>
              <tbody>
                {data.topPerformers.map((performer, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 text-sm text-gray-900">{performer.employeeName}</td>
                    <td className="py-4 text-sm text-gray-600">{performer.department}</td>
                    <td className="py-4 text-sm text-gray-900">{performer.completedTasks}</td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">{performer.avgRating}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(performer.avgRating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminAnalytics;
