import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fade, Slide } from 'react-awesome-reveal';
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Zap, 
  Calendar, 
  Star,
  ArrowRight,
  Bell,
  Plus,
  Eye,
  Download,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AIAssistant from '../../components/common/AIAssistant';

const ClientDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    pendingApprovals: 0,
    newMessages: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStats({
        activeProjects: 3,
        completedProjects: 8,
        pendingApprovals: 2,
        newMessages: 5
      });
      
      setRecentActivity([
        { id: 1, type: 'project', title: 'Website Redesign Started', time: '2 hours ago', status: 'in-progress' },
        { id: 2, type: 'message', title: 'New message from John Doe', time: '4 hours ago', status: 'unread' },
        { id: 3, type: 'approval', title: 'Logo Design Approved', time: '1 day ago', status: 'completed' },
        { id: 4, type: 'project', title: 'Mobile App Development', time: '2 days ago', status: 'pending' }
      ]);
      
      setQuickActions([
        { id: 1, title: 'Start New Project', icon: Plus, color: 'blue', description: 'Begin a new creative project' },
        { id: 2, title: 'View Messages', icon: MessageSquare, color: 'green', description: 'Check your latest messages' },
        { id: 3, title: 'Schedule Meeting', icon: Calendar, color: 'purple', description: 'Book a consultation call' },
        { id: 4, title: 'View Analytics', icon: BarChart3, color: 'orange', description: 'See your project insights' }
      ]);
      
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <motion.div 
      className={`relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 p-6 group cursor-pointer`}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">+{trend}%</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${
          color === 'blue' ? 'from-blue-500 to-blue-600' :
          color === 'green' ? 'from-green-500 to-green-600' :
          color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
          'from-purple-500 to-purple-600'
        } group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      
      {/* Animated background gradient */}
      <motion.div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r ${
          color === 'blue' ? 'from-blue-400 to-blue-600' :
          color === 'green' ? 'from-green-400 to-green-600' :
          color === 'yellow' ? 'from-yellow-400 to-yellow-600' :
          'from-purple-400 to-purple-600'
        } rounded-2xl`}
        initial={{ scale: 0.8 }}
        whileHover={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );

  const QuickActionCard = ({ action }) => {
    const { title, icon: Icon, color, description } = action;
    
    return (
      <motion.div
        className="group cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${
          color === 'blue' ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-blue-200 dark:border-blue-800' :
          color === 'green' ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border-green-200 dark:border-green-800' :
          color === 'purple' ? 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 border-purple-200 dark:border-purple-800' :
          'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 border-orange-200 dark:border-orange-800'
        } border shadow-md hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${
              color === 'blue' ? 'from-blue-500 to-blue-600' :
              color === 'green' ? 'from-green-500 to-green-600' :
              color === 'purple' ? 'from-purple-500 to-purple-600' :
              'from-orange-500 to-orange-600'
            } shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </motion.div>
    );
  };

  const ActivityItem = ({ activity }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'green';
        case 'in-progress': return 'blue';
        case 'pending': return 'yellow';
        case 'unread': return 'red';
        default: return 'gray';
      }
    };

    const getIcon = (type) => {
      switch (type) {
        case 'project': return BarChart3;
        case 'message': return MessageSquare;
        case 'approval': return CheckCircle;
        default: return Bell;
      }
    };

    const Icon = getIcon(activity.type);
    const statusColor = getStatusColor(activity.status);

    return (
      <motion.div
        className="flex items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 group cursor-pointer"
        whileHover={{ x: 5 }}
      >
        <div className={`p-2 rounded-lg bg-gradient-to-br ${
          statusColor === 'green' ? 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/40' :
          statusColor === 'blue' ? 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/40' :
          statusColor === 'yellow' ? 'from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/40' :
          statusColor === 'red' ? 'from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/40' :
          'from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600'
        } mr-4`}>
          <Icon className={`h-5 w-5 ${
            statusColor === 'green' ? 'text-green-600 dark:text-green-400' :
            statusColor === 'blue' ? 'text-blue-600 dark:text-blue-400' :
            statusColor === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
            statusColor === 'red' ? 'text-red-600 dark:text-red-400' :
            'text-gray-600 dark:text-gray-400'
          }`} />
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {activity.title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusColor === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
          statusColor === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
          statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
          statusColor === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {activity.status.replace('-', ' ')}
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="animate-pulse">
          {/* Skeleton loader */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                ))}
              </div>
            </div>
            <div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-1 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      {/* Welcome section */}
      <Fade direction="down">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Welcome back, {currentUser?.name || 'Client'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Here's what's happening with your projects today.
              </p>
            </div>
            <motion.div
              className="hidden md:flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </Fade>

      {/* Stats cards */}
      <Slide direction="up" triggerOnce>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={BarChart3} 
            title="Active Projects" 
            value={stats.activeProjects} 
            color="blue" 
            trend={12}
          />
          <StatCard 
            icon={CheckCircle} 
            title="Completed Projects" 
            value={stats.completedProjects} 
            color="green" 
            trend={8}
          />
          <StatCard 
            icon={Clock} 
            title="Pending Approvals" 
            value={stats.pendingApprovals} 
            color="yellow" 
          />
          <StatCard 
            icon={MessageSquare} 
            title="New Messages" 
            value={stats.newMessages} 
            color="purple" 
            trend={25}
          />
        </div>
      </Slide>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Fade direction="up" delay={200}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors">
                  View All
                </button>
              </div>
              
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ActivityItem activity={activity} />
                  </motion.div>
                ))}
              </div>
            </div>
          </Fade>
        </div>

        {/* Quick Actions */}
        <div>
          <Fade direction="up" delay={400}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
              
              <div className="grid grid-cols-1 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <QuickActionCard action={action} />
                  </motion.div>
                ))}
              </div>
            </div>
          </Fade>
        </div>
      </div>

      {/* AI Assistant */}
      <Fade direction="up" delay={800}>
        <div className="mt-8">
          <AIAssistant />
        </div>
      </Fade>
    </div>
  );
};

export default ClientDashboard;
