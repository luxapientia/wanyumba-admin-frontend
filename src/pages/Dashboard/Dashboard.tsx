import { motion } from 'framer-motion';
import { 
  Users, 
  Database, 
  AlertCircle, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  ArrowUpRight,
  Clock,
  Activity,
  Zap,
  BarChart3,
  FileText,
  Settings,
  UserPlus
} from 'lucide-react';
import Button from '../../components/UI/Button.js';

export default function Dashboard() {
  const stats = [
    {
      label: 'Total Users',
      value: '1,234',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hoverColor: 'hover:shadow-blue-500/20',
    },
    {
      label: 'Total Properties',
      value: '5,678',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: Database,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      hoverColor: 'hover:shadow-emerald-500/20',
    },
    {
      label: 'Pending Approvals',
      value: '23',
      change: '-5.1%',
      changeType: 'negative' as const,
      icon: AlertCircle,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      hoverColor: 'hover:shadow-amber-500/20',
    },
    {
      label: 'Active Listings',
      value: '4,521',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      hoverColor: 'hover:shadow-purple-500/20',
    },
  ];

  const recentActivities = [
    {
      icon: UserPlus,
      title: 'New user registered',
      description: 'John Doe created an account',
      time: '2 minutes ago',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Database,
      title: 'Property approved',
      description: 'Property #1234 was approved',
      time: '15 minutes ago',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: AlertCircle,
      title: 'Pending review',
      description: '3 properties need review',
      time: '1 hour ago',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      icon: Settings,
      title: 'Settings updated',
      description: 'System settings were modified',
      time: '2 hours ago',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const quickActions = [
    {
      icon: Users,
      title: 'Manage Users',
      description: 'View and edit user accounts',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
      hoverBg: 'hover:bg-indigo-100',
      textColor: 'text-indigo-900',
      descColor: 'text-indigo-600',
    },
    {
      icon: Database,
      title: 'Review Properties',
      description: 'Approve or reject listings',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      hoverBg: 'hover:bg-purple-100',
      textColor: 'text-purple-900',
      descColor: 'text-purple-600',
    },
    {
      icon: Settings,
      title: 'System Settings',
      description: 'Configure platform settings',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      hoverBg: 'hover:bg-pink-100',
      textColor: 'text-pink-900',
      descColor: 'text-pink-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-2"
              >
                Dashboard Overview
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 text-sm sm:text-base"
              >
                Monitor and manage your platform in real-time
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </motion.div>
              <span className="text-sm font-semibold text-indigo-900">System Operational</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative bg-white rounded-2xl shadow-sm border border-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Animated Gradient Accent */}
                <motion.div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                />
                
                {/* Hover Glow Effect */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.5, type: 'spring' }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                        stat.changeType === 'positive'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      <ArrowUpRight
                        size={12}
                        className={stat.changeType === 'negative' ? 'rotate-180' : ''}
                      />
                      {stat.change}
                    </motion.div>
                  </div>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className="text-3xl font-bold text-gray-900 mb-1"
                  >
                    {stat.value}
                  </motion.h3>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Activity className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 hover:text-indigo-700"
                rightIcon={<ArrowUpRight size={14} />}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-transparent hover:from-indigo-50/50 hover:to-purple-50/50 rounded-xl transition-all duration-300 cursor-pointer group"
                  >
                    <motion.div
                      className={`w-12 h-12 ${activity.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-0.5">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={14} />
                      <span>{activity.time}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    fullWidth
                    className={`text-left px-4 py-4 ${action.bgColor} ${action.hoverBg} justify-start`}
                    rightIcon={<ArrowUpRight size={16} className={`${action.textColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-2 bg-gradient-to-r ${action.color} rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${action.textColor} mb-0.5`}>
                          {action.title}
                        </p>
                        <p className={`text-xs ${action.descColor}`}>{action.description}</p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

