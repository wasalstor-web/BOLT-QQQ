import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { getUser } from '~/lib/supabase/client';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import { StatsCard, StatsGrid } from '~/components/ui/stats-card';
import { AreaChart, MultiAreaChart } from '~/components/ui/area-chart';
import {
  Eye,
  Users,
  MousePointerClick,
  Clock,
  TrendingUp,
  TrendingDown,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Sparkles,
  Calendar,
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'التحليلات - مبسط إديتر' }, { name: 'description', content: 'تحليلات مشاريعك وإحصائياتها' }];
};

// Mock data
const visitsData = [
  { name: 'الأحد', value: 1200 },
  { name: 'الإثنين', value: 1900 },
  { name: 'الثلاثاء', value: 1600 },
  { name: 'الأربعاء', value: 2100 },
  { name: 'الخميس', value: 1800 },
  { name: 'الجمعة', value: 2400 },
  { name: 'السبت', value: 2800 },
];

const multiData = [
  { name: 'يناير', visits: 4000, clicks: 2400, conversions: 240 },
  { name: 'فبراير', visits: 3000, clicks: 1398, conversions: 139 },
  { name: 'مارس', visits: 2000, clicks: 9800, conversions: 980 },
  { name: 'أبريل', visits: 2780, clicks: 3908, conversions: 390 },
  { name: 'مايو', visits: 1890, clicks: 4800, conversions: 480 },
  { name: 'يونيو', visits: 2390, clicks: 3800, conversions: 380 },
];

const topPages = [
  { path: '/الرئيسية', views: 12500, change: 12.5 },
  { path: '/المنتجات', views: 8200, change: -3.2 },
  { path: '/من-نحن', views: 5400, change: 8.7 },
  { path: '/تواصل', views: 3200, change: 15.3 },
  { path: '/المدونة', views: 2800, change: -1.5 },
];

const deviceStats = [
  { device: 'الحاسوب', icon: Monitor, percentage: 58, color: 'purple' },
  { device: 'الجوال', icon: Smartphone, percentage: 35, color: 'blue' },
  { device: 'التابلت', icon: Tablet, percentage: 7, color: 'pink' },
];

const countries = [
  { name: 'السعودية', flag: '🇸🇦', visits: 4500, percentage: 35 },
  { name: 'الإمارات', flag: '🇦🇪', visits: 2800, percentage: 22 },
  { name: 'مصر', flag: '🇪🇬', visits: 2100, percentage: 16 },
  { name: 'الكويت', flag: '🇰🇼', visits: 1500, percentage: 12 },
  { name: 'الأردن', flag: '🇯🇴', visits: 900, percentage: 7 },
];

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    const loadData = async () => {
      try {
        const { user: currentUser } = await getUser();

        /*
         * تم تعطيل التحقق مؤقتاً
         * if (!currentUser) {
         *   navigate('/login');
         *   return;
         * }
         */
        setUser(currentUser || { email: 'demo@example.com', user_metadata: { name: 'مستخدم تجريبي' } });
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={{
        name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'المستخدم',
        email: user?.email || '',
        avatar: user?.user_metadata?.avatar_url,
      }}
    >
      <div className="p-6 lg:p-8" dir="rtl">
        <div className="flex items-center justify-between mb-8">
          <DashboardHeader title="التحليلات" subtitle="نظرة عامة على أداء مشاريعك" />

          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  dateRange === range ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === '24h' ? 'اليوم' : range === '7d' ? 'أسبوع' : range === '30d' ? 'شهر' : '3 أشهر'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <StatsGrid columns={4} className="mb-8">
          <StatsCard
            title="إجمالي الزيارات"
            value={45678}
            change={12.5}
            changeLabel="من الأسبوع الماضي"
            icon={<Eye className="h-5 w-5" />}
          />
          <StatsCard
            title="الزوار الفريدون"
            value={12340}
            change={8.2}
            changeLabel="من الأسبوع الماضي"
            icon={<Users className="h-5 w-5" />}
          />
          <StatsCard
            title="معدل النقر"
            value="4.2%"
            change={-2.1}
            changeLabel="من الأسبوع الماضي"
            icon={<MousePointerClick className="h-5 w-5" />}
          />
          <StatsCard
            title="متوسط مدة الجلسة"
            value="3:45"
            change={15.3}
            changeLabel="من الأسبوع الماضي"
            icon={<Clock className="h-5 w-5" />}
          />
        </StatsGrid>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AreaChart data={visitsData} title="الزيارات اليومية" color="#8b5cf6" />
          <MultiAreaChart
            data={multiData as any}
            title="نظرة شاملة"
            series={[
              { dataKey: 'visits', name: 'الزيارات', color: '#8b5cf6' },
              { dataKey: 'clicks', name: 'النقرات', color: '#3b82f6' },
              { dataKey: 'conversions', name: 'التحويلات', color: '#10b981' },
            ]}
          />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">أكثر الصفحات زيارة</h3>
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={page.path} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center text-xs font-medium bg-white/10 rounded-full text-gray-400">
                      {index + 1}
                    </span>
                    <span className="text-white">{page.path}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{page.views.toLocaleString('ar-SA')}</span>
                    <span
                      className={`flex items-center text-xs ${page.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {page.change >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(page.change)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Devices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">الأجهزة</h3>
            <div className="space-y-6">
              {deviceStats.map((device) => (
                <div key={device.device}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <device.icon className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{device.device}</span>
                    </div>
                    <span className="text-gray-400">{device.percentage}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${device.percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        device.color === 'purple'
                          ? 'bg-purple-500'
                          : device.color === 'blue'
                            ? 'bg-blue-500'
                            : 'bg-pink-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">الدول</h3>
            </div>
            <div className="space-y-4">
              {countries.map((country) => (
                <div key={country.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{country.flag}</span>
                    <span className="text-white">{country.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{country.visits.toLocaleString('ar-SA')}</span>
                    <span className="text-xs text-gray-500">{country.percentage}%</span>
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
