import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { MetaFunction } from '@remix-run/cloudflare';
import { Link, useNavigate } from '@remix-run/react';
import { useRequireAuth } from '~/lib/auth/useAuth';
import { 
  Users, FolderGit2, CreditCard, BarChart3, Settings, Shield, 
  Bot, TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle2,
  ArrowLeft, Activity, Database, Globe, Loader2, LogOut, Bell
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'لوحة المشرف - مبسط إديتر' }, { name: 'description', content: 'لوحة تحكم المشرف' }];
};

interface StatCard {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'project' | 'payment' | 'system';
  message: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

const stats: StatCard[] = [
  { label: 'إجمالي المستخدمين', value: '1,247', change: 12.5, icon: Users, color: 'purple' },
  { label: 'المشاريع النشطة', value: '856', change: 8.3, icon: FolderGit2, color: 'blue' },
  { label: 'الإيرادات الشهرية', value: '45,200 ر.س', change: 23.1, icon: CreditCard, color: 'green' },
  { label: 'استخدام API', value: '2.4M', change: -5.2, icon: Activity, color: 'orange' },
];

const recentActivities: RecentActivity[] = [
  { id: '1', type: 'user', message: 'مستخدم جديد: أحمد@example.com', time: 'منذ 5 دقائق', status: 'success' },
  { id: '2', type: 'payment', message: 'دفعة جديدة: 299 ر.س - باقة Pro', time: 'منذ 15 دقيقة', status: 'success' },
  { id: '3', type: 'project', message: 'مشروع جديد: متجر إلكتروني', time: 'منذ 30 دقيقة', status: 'success' },
  { id: '4', type: 'system', message: 'تحذير: استخدام عالي للذاكرة', time: 'منذ ساعة', status: 'warning' },
  { id: '5', type: 'user', message: 'إلغاء اشتراك: user@example.com', time: 'منذ ساعتين', status: 'error' },
];

const systemStatus = [
  { name: 'API Server', status: 'operational', uptime: '99.9%' },
  { name: 'Database', status: 'operational', uptime: '99.8%' },
  { name: 'CDN', status: 'operational', uptime: '100%' },
  { name: 'AI Services', status: 'degraded', uptime: '95.2%' },
];

const quickLinks = [
  { name: 'إدارة المستخدمين', path: '/admin/users', icon: Users, color: 'bg-purple-500/20 text-purple-400' },
  { name: 'المشاريع', path: '/admin/projects', icon: FolderGit2, color: 'bg-blue-500/20 text-blue-400' },
  { name: 'المدفوعات', path: '/admin/payments', icon: CreditCard, color: 'bg-green-500/20 text-green-400' },
  { name: 'الإعدادات', path: '/admin/settings', icon: Settings, color: 'bg-gray-500/20 text-gray-400' },
  { name: 'وكيل الذكاء', path: '/admin/agent', icon: Bot, color: 'bg-orange-500/20 text-orange-400' },
  { name: 'التحليلات', path: '/admin/analytics', icon: BarChart3, color: 'bg-pink-500/20 text-pink-400' },
];

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated, signOut } = useRequireAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user is admin
  const isAdmin = user.role === 'admin';
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">غير مصرح</h1>
          <p className="text-gray-400 mb-6">ليس لديك صلاحية الوصول لهذه الصفحة</p>
          <Link 
            to="/dashboard"
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            العودة للوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">لوحة المشرف</h1>
                <p className="text-gray-400 text-sm">إدارة النظام والمستخدمين</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-gray-400"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>لوحة المستخدم</span>
              </Link>

              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.name?.charAt(0) || user.email?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{user.name || 'المشرف'}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
              </div>

              <button 
                onClick={signOut}
                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  stat.color === 'purple' ? 'bg-purple-500/20' :
                  stat.color === 'blue' ? 'bg-blue-500/20' :
                  stat.color === 'green' ? 'bg-green-500/20' : 'bg-orange-500/20'
                }`}>
                  <stat.icon className={`h-5 w-5 ${
                    stat.color === 'purple' ? 'text-purple-400' :
                    stat.color === 'blue' ? 'text-blue-400' :
                    stat.color === 'green' ? 'text-green-400' : 'text-orange-400'
                  }`} />
                </div>
                <span className={`text-sm flex items-center gap-1 ${
                  stat.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(stat.change)}%
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">الوصول السريع</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <div className={`p-2 rounded-lg w-fit mb-2 ${link.color}`}>
                    <link.icon className="w-5 h-5" />
                  </div>
                  <p className="text-white text-sm group-hover:text-purple-400 transition-colors">{link.name}</p>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">النشاط الأخير</h3>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'success' ? 'bg-green-500/20' :
                    activity.status === 'warning' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                  }`}>
                    {activity.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                     activity.status === 'warning' ? <AlertCircle className="w-4 h-4 text-yellow-400" /> :
                     <AlertCircle className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">حالة النظام</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemStatus.map((service) => (
              <div key={service.name} className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{service.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    service.status === 'operational' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {service.status === 'operational' ? 'يعمل' : 'متأخر'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        service.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: service.uptime }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm">{service.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
