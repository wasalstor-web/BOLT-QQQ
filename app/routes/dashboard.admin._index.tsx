import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { useAuth } from '~/lib/auth';
import { getDeployRequests, getAllAdminSettings, type DeployRequest, type AdminSetting } from '~/lib/supabase/client';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { StatsCard, StatsGrid } from '~/components/ui/stats-card';
import { Users, Settings, Cloud, CheckCircle, Clock, AlertCircle, Sparkles, Key } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'لوحة المشرف - مبسط إديتر' }, { name: 'description', content: 'إدارة النظام والمستخدمين' }];
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const [deployRequests, setDeployRequests] = useState<DeployRequest[]>([]);
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (!isAdmin) {
        navigate('/dashboard/client');
        return;
      }
    }

    const loadData = async () => {
      try {
        const [requestsResult, settingsResult] = await Promise.all([getDeployRequests(), getAllAdminSettings()]);
        setDeployRequests(requestsResult.data || []);
        setSettings(settingsResult || []);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      loadData();
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </motion.div>
      </div>
    );
  }

  const pendingRequests = deployRequests.filter((r) => r.status === 'pending');
  const completedRequests = deployRequests.filter((r) => r.status === 'deployed');

  return (
    <DashboardLayout user={{ name: user?.name || 'المشرف', email: user?.email || '', avatar: user?.avatar }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            لوحة المشرف 🛠️
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 mt-1"
          >
            إدارة النظام وطلبات النشر
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-3">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium text-white transition-all"
          >
            <Settings className="h-5 w-5" />
            الإعدادات
          </Link>
          <Link
            to="/integrations"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium text-white shadow-lg shadow-purple-500/25"
          >
            <Key className="h-5 w-5" />
            API Keys
          </Link>
        </motion.div>
      </div>

      {/* Stats */}
      <StatsGrid className="mb-8">
        <StatsCard title="طلبات معلقة" value={pendingRequests.length} icon={<Clock className="h-5 w-5" />} delay={0} />
        <StatsCard
          title="تم النشر"
          value={completedRequests.length}
          change={10}
          icon={<CheckCircle className="h-5 w-5" />}
          delay={0.1}
        />
        <StatsCard title="إعدادات API" value={settings.length} icon={<Key className="h-5 w-5" />} delay={0.2} />
        <StatsCard title="المستخدمين" value={25} change={5} icon={<Users className="h-5 w-5" />} delay={0.3} />
      </StatsGrid>

      {/* Pending Requests */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">طلبات النشر المعلقة</h2>
        {pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{request.project_name}</h3>
                    <p className="text-sm text-gray-400">منصة: {request.target_platform}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all">
                    موافقة
                  </button>
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
                    رفض
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد طلبات معلقة</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-500/30 p-6 cursor-pointer hover:border-blue-500/50 transition-all"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-8 w-8 text-blue-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">إعدادات النظام</h3>
          <p className="text-sm text-gray-400">تخصيص إعدادات التطبيق</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl border border-purple-500/30 p-6 cursor-pointer hover:border-purple-500/50 transition-all"
          onClick={() => navigate('/integrations')}
        >
          <Key className="h-8 w-8 text-purple-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">مفاتيح API</h3>
          <p className="text-sm text-gray-400">إدارة مفاتيح التكامل</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-500/30 p-6 cursor-pointer hover:border-green-500/50 transition-all"
          onClick={() => navigate('/team')}
        >
          <Users className="h-8 w-8 text-green-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">إدارة الفريق</h3>
          <p className="text-sm text-gray-400">إضافة وإدارة المستخدمين</p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
