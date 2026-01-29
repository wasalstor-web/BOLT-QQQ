import { motion } from 'framer-motion';
import type { MetaFunction } from '@remix-run/cloudflare';
import { useRequireAuth } from '~/lib/auth/useAuth';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Loader2,
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'التحليلات - مبسط إديتر' }, { name: 'description', content: 'تحليلات مشاريعك' }];
};

const visitsData = [
  { name: 'الأحد', value: 1200 },
  { name: 'الإثنين', value: 1900 },
  { name: 'الثلاثاء', value: 1500 },
  { name: 'الأربعاء', value: 2100 },
  { name: 'الخميس', value: 1800 },
  { name: 'الجمعة', value: 2400 },
  { name: 'السبت', value: 2000 },
];

const topPages = [
  { path: '/الرئيسية', views: 12500, growth: 12.5 },
  { path: '/المنتجات', views: 8200, growth: 3.2 },
  { path: '/من-نحن', views: 5400, growth: 8.7 },
  { path: '/تواصل', views: 3200, growth: 15.3 },
  { path: '/المدونة', views: 2800, growth: 1.5 },
];

const devices = [
  { name: 'الحاسوب', value: 58, icon: Monitor, color: 'purple' },
  { name: 'الجوال', value: 35, icon: Smartphone, color: 'blue' },
  { name: 'التابلت', value: 7, icon: Tablet, color: 'green' },
];

const countries = [
  { name: 'السعودية', code: '🇸🇦', visits: 4500, percent: 35 },
  { name: 'الإمارات', code: '🇦🇪', visits: 2800, percent: 22 },
  { name: 'مصر', code: '🇪🇬', visits: 2100, percent: 16 },
  { name: 'الكويت', code: '🇰🇼', visits: 1500, percent: 12 },
  { name: 'الأردن', code: '🇯🇴', visits: 900, percent: 7 },
];

export default function AnalyticsPage() {
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();

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

  return (
    <DashboardLayout
      user={{
        name: user.name || user.email?.split('@')[0] || 'المستخدم',
        email: user.email || '',
        avatar: user.avatar,
      }}
    >
      <div className="p-6 lg:p-8" dir="rtl">
        <DashboardHeader title="التحليلات" subtitle="نظرة عامة على أداء مشاريعك" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'إجمالي الزيارات', value: '45.7K', icon: Eye, growth: 12.5, color: 'purple' },
            { label: 'الزوار الفريدون', value: '12.3K', icon: Users, growth: 8.2, color: 'blue' },
            { label: 'معدل النقر', value: '4.2%', icon: MousePointer, growth: 2.1, color: 'green' },
            { label: 'متوسط مدة الجلسة', value: '3:45', icon: Clock, growth: 15.3, color: 'orange' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
            >
              <div
                className={`p-2 rounded-lg w-fit mb-3 ${
                  stat.color === 'purple'
                    ? 'bg-purple-500/20'
                    : stat.color === 'blue'
                      ? 'bg-blue-500/20'
                      : stat.color === 'green'
                        ? 'bg-green-500/20'
                        : 'bg-orange-500/20'
                }`}
              >
                <stat.icon
                  className={`h-5 w-5 ${
                    stat.color === 'purple'
                      ? 'text-purple-400'
                      : stat.color === 'blue'
                        ? 'text-blue-400'
                        : stat.color === 'green'
                          ? 'text-green-400'
                          : 'text-orange-400'
                  }`}
                />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-green-400 text-sm flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.growth}%
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1">من الأسبوع الماضي</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">الزيارات اليومية</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {visitsData.map((day, index) => (
                <div key={day.name} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.value / 2500) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-lg"
                  />
                  <span className="text-gray-400 text-xs">{day.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Devices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">الأجهزة</h3>
            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.name} className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      device.color === 'purple'
                        ? 'bg-purple-500/20'
                        : device.color === 'blue'
                          ? 'bg-blue-500/20'
                          : 'bg-green-500/20'
                    }`}
                  >
                    <device.icon
                      className={`h-5 w-5 ${
                        device.color === 'purple'
                          ? 'text-purple-400'
                          : device.color === 'blue'
                            ? 'text-blue-400'
                            : 'text-green-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm">{device.name}</span>
                      <span className="text-gray-400 text-sm">{device.value}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${device.value}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${
                          device.color === 'purple'
                            ? 'bg-purple-500'
                            : device.color === 'blue'
                              ? 'bg-blue-500'
                              : 'bg-green-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">أكثر الصفحات زيارة</h3>
            <div className="space-y-3">
              {topPages.map((page, index) => (
                <div key={page.path} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-6">{index + 1}</span>
                    <span className="text-white">{page.path}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">{page.views.toLocaleString()}</span>
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {page.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">الدول</h3>
            <div className="space-y-3">
              {countries.map((country) => (
                <div key={country.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.code}</span>
                    <span className="text-white">{country.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">{country.visits.toLocaleString()}</span>
                    <span className="text-purple-400 text-sm">{country.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
