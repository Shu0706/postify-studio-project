import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
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
import { 
  fadeIn, 
  slideUp, 
  slideLeft, 
  slideRight, 
  scaleIn, 
  staggerContainer, 
  staggerItem,
  hoverScale,
  hoverLift,
  floatingCard
} from '../../utils/motionVariants';
import { gsapAnimations } from '../../utils/gsapAnimations';

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
  
  // Refs for GSAP animations
  const containerRef = useRef(null);
  const statsRef = useRef([]);
  const cardsRef = useRef([]);

  // Initialize animations
  useEffect(() => {
    if (!isLoading) {
      // Welcome animation
      gsap.fromTo('.dashboard-header', {
        y: -50,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
      });

      // Stats cards stagger animation
      gsap.fromTo('.stat-card', {
        y: 100,
        opacity: 0,
        scale: 0.8
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)"
      });

      // Activity cards animation
      gsap.fromTo('.activity-card', {
        x: -50,
        opacity: 0
      }, {
        x: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5
      });

      // Quick actions animation
      gsap.fromTo('.quick-action', {
        scale: 0,
        rotation: -180
      }, {
        scale: 1,
        rotation: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.8
      });
    }
  }, [isLoading]);

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
      className={`stat-card relative overflow-hidden card-gradient rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 p-6 group cursor-pointer`}
      variants={scaleIn}
      whileHover={{ 
        scale: 1.05, 
        y: -10,
        rotateY: 5,
        z: 50
      }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => {
        gsap.to(`.icon-${color}`, {
          rotation: 360,
          duration: 0.8,
          ease: "back.out(1.7)"
        });
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dots opacity-5"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <motion.p 
            className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.p>
          <motion.p 
            className="text-3xl font-bold text-gray-900 dark:text-white"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            {value}
          </motion.p>
          {trend && (
            <motion.div 
              className="flex items-center mt-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">+{trend}%</span>
            </motion.div>
          )}
        </div>
        
        <motion.div 
          className={`icon-${color} p-4 rounded-2xl bg-gradient-to-br ${
            color === 'blue' ? 'from-blue-500 to-blue-600' :
            color === 'green' ? 'from-green-500 to-green-600' :
            color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
            'from-purple-500 to-purple-600'
          } shadow-lg`}
          whileHover={{ 
            scale: 1.2,
            boxShadow: `0 0 30px ${
              color === 'blue' ? 'rgba(59, 130, 246, 0.5)' :
              color === 'green' ? 'rgba(34, 197, 94, 0.5)' :
              color === 'yellow' ? 'rgba(234, 179, 8, 0.5)' :
              'rgba(147, 51, 234, 0.5)'
            }`
          }}
        >
          <Icon className="h-8 w-8 text-white" />
        </motion.div>
      </div>
      
      {/* Animated background gradient */}
      <motion.div
        className={`absolute inset-0 opacity-0 bg-gradient-to-r ${
          color === 'blue' ? 'from-blue-400/20 to-blue-600/20' :
          color === 'green' ? 'from-green-400/20 to-green-600/20' :
          color === 'yellow' ? 'from-yellow-400/20 to-yellow-600/20' :
          'from-purple-400/20 to-purple-600/20'
        } rounded-2xl`}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Hover effect line */}
      <motion.div 
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${
          color === 'blue' ? 'from-blue-500 to-blue-600' :
          color === 'green' ? 'from-green-500 to-green-600' :
          color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
          'from-purple-500 to-purple-600'
        } rounded-full`}
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );

  const QuickActionCard = ({ action }) => {
    const { title, icon: Icon, color, description } = action;
    
    return (
      <motion.div
        className="quick-action group cursor-pointer"
        whileHover={{ 
          scale: 1.05,
          rotateY: 10,
          z: 50
        }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => {
          gsap.to(`.action-icon-${action.id}`, {
            scale: 1.2,
            rotation: 15,
            duration: 0.3,
            ease: "power2.out"
          });
        }}
        onHoverEnd={() => {
          gsap.to(`.action-icon-${action.id}`, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: "power2.out"
          });
        }}
      >
        <div className={`relative overflow-hidden p-6 rounded-2xl card-glass border shadow-md hover:shadow-xl transition-all duration-300`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid opacity-5"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <motion.div 
              className={`action-icon-${action.id} p-3 rounded-xl bg-gradient-to-r ${
                color === 'blue' ? 'from-blue-500 to-blue-600' :
                color === 'green' ? 'from-green-500 to-green-600' :
                color === 'purple' ? 'from-purple-500 to-purple-600' :
                'from-orange-500 to-orange-600'
              } shadow-lg`}
              whileHover={{
                boxShadow: `0 0 30px ${
                  color === 'blue' ? 'rgba(59, 130, 246, 0.5)' :
                  color === 'green' ? 'rgba(34, 197, 94, 0.5)' :
                  color === 'purple' ? 'rgba(147, 51, 234, 0.5)' :
                  'rgba(249, 115, 22, 0.5)'
                }`
              }}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
            
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            </motion.div>
          </div>
          
          <motion.h3 
            className="font-semibold text-gray-900 dark:text-white mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h3>
          
          <motion.p 
            className="text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {description}
          </motion.p>
          
          {/* Hover effect line */}
          <motion.div 
            className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${
              color === 'blue' ? 'from-blue-500 to-blue-600' :
              color === 'green' ? 'from-green-500 to-green-600' :
              color === 'purple' ? 'from-purple-500 to-purple-600' :
              'from-orange-500 to-orange-600'
            } rounded-full`}
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
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
    <motion.div 
      className="p-4 md:p-6 space-y-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden"
      ref={containerRef}
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-5"></div>
      <motion.div 
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-500/10 to-transparent rounded-full blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
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
    </motion.div>
  );
};

export default ClientDashboard;
