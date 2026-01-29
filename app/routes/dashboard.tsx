import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { getProjects } from '~/lib/supabase/client';
import type { Project as SupabaseProject } from '~/lib/supabase/client';
import { useRequireAuth } from '~/lib/auth/useAuth';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { StatsCard, StatsGrid } from '~/components/ui/stats-card';
import { AreaChart } from '~/components/ui/area-chart';
import { ActivityFeed, type ActivityType } from '~/components/ui/activity-feed';
import { ProjectCard, ProjectGrid, EmptyProjects } from '~/components/ui/project-card';
import {
  Folder,
  Eye,
  TrendingUp,
  Zap,
  Plus,
  Sparkles,
  Loader2,
  Users,
  Settings,
  Shield,
  Code,
  Server,
  CreditCard,
  BarChart3,
  GitBranch,
  Globe,
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'لوحة التحكم - مبسط إديتر' }, { name: 'description', content: 'إدارة مشاريعك ومواقعك' }];
};

// Chart data
const chartData = [
  { name: 'يناير', value: 400 },
  { name: 'فبراير', value: 300 },
  { name: 'مارس', value: 600 },
  { name: 'أبريل', value: 800 },
  { name: 'مايو', value: 500 },
  { name: 'يونيو', value: 900 },
  { name: 'يوليو', value: 1100 },
];

// Activities data
const recentActivities = [
  {
    id: '1',
    type: 'project_created' as ActivityType,
    title: 'تم إنشاء مشروع جديد',
    user: { name: 'أنت' },
    project: { name: 'متجر إلكتروني' },
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    type: 'ai_generation' as ActivityType,
    title: 'تم توليد كود بالذكاء الاصطناعي',
    user: { name: 'أنت' },
    project: { name: 'موقع شركة' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    type: 'project_deployed' as ActivityType,
    title: 'تم نشر المشروع',
    user: { name: 'أنت' },
    project: { name: 'مدونة شخصية' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

// قائمة أدوات المشرف والمطور
const adminTools = [
  { name: 'إدارة المستخدمين', icon: Users, href: '/admin/users', color: 'from-blue-500 to-cyan-500' },
  { name: 'إدارة الوكيل AI', icon: Code, href: '/admin/agent', color: 'from-purple-500 to-pink-500' },
  { name: 'طلبات النشر', icon: Server, href: '/admin', color: 'from-green-500 to-emerald-500' },
  { name: 'الإحصائيات', icon: BarChart3, href: '/analytics', color: 'from-orange-500 to-amber-500' },
  { name: 'إعدادات الفوترة', icon: CreditCard, href: '/billing', color: 'from-red-500 to-pink-500' },
  { name: 'إعدادات النظام', icon: Settings, href: '/settings', color: 'from-gray-500 to-slate-500' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated, isAdmin, isDeveloper, isClient, isDemoMode } = useRequireAuth();
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const { data } = await getProjects();
        setProjects(data || []);
      } catch (err) {
        console.error('Dashboard error:', err);
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const stats = {
    total: projects.length,
    published: projects.filter((p) => p.status === 'published').length,
    draft: projects.filter((p) => p.status === 'draft').length,
    views: 1234,
    growth: 12.5,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
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

  const userName = user.name || user.email?.split('@')[0] || 'مستخدم';
  const userRole = isAdmin ? 'مشرف' : isDeveloper ? 'مطور' : 'عميل';
  const roleColor = isAdmin ? 'text-red-400' : isDeveloper ? 'text-blue-400' : 'text-green-400';
  const roleBg = isAdmin ? 'bg-red-500/10' : isDeveloper ? 'bg-blue-500/10' : 'bg-green-500/10';

  // Transform projects to match ProjectCard interface
  const transformedProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status === 'published' ? ('active' as const) : ('draft' as const),
    lastUpdated: p.updated_at,
    createdAt: p.created_at,
    views: Math.floor(Math.random() * 500),
  }));

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              مرحباً، {userName} 👋
              <span className={`text-sm px-3 py-1 rounded-full ${roleBg} ${roleColor}`}>{userRole}</span>
            </h1>
            <p className="text-gray-400 mt-1">
              {isAdmin || isDeveloper ? 'إليك نظرة شاملة على النظام والمشاريع' : 'إليك نظرة عامة على مشاريعك'}
            </p>
          </div>
          <button
            onClick={() => navigate('/editor')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-4 h-4" />
            مشروع جديد
          </button>
        </div>

        {/* 🔥 Admin/Developer Tools - يظهر فقط للمشرف والمطور */}
        {(isAdmin || isDeveloper) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-bold text-white">أدوات الإدارة والتطوير</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {adminTools.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={tool.href}
                    className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm text-gray-300 text-center">{tool.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <StatsGrid>
          <StatsCard
            title={isAdmin ? 'إجمالي المشاريع (الكل)' : 'مشاريعي'}
            value={stats.total}
            icon={<Folder className="w-5 h-5" />}
            delay={0}
          />
          <StatsCard
            title="المنشورة"
            value={stats.published}
            icon={<Globe className="w-5 h-5" />}
            change={25}
            trend="up"
            delay={0.1}
          />
          <StatsCard
            title="المشاهدات"
            value={stats.views}
            icon={<Eye className="w-5 h-5" />}
            change={stats.growth}
            trend="up"
            delay={0.2}
          />
          {(isAdmin || isDeveloper) && (
            <StatsCard
              title="معدل النمو"
              value={`${stats.growth}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              delay={0.3}
            />
          )}
        </StatsGrid>

        {/* Charts & Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AreaChart
              data={chartData}
              title={isAdmin ? 'إحصائيات النظام' : 'زيارات مشاريعك'}
              subtitle="إحصائيات خلال الأشهر الماضية"
              color="purple"
            />
          </div>
          <div>
            <ActivityFeed activities={recentActivities} title="النشاط الأخير" maxItems={4} />
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              {isAdmin ? 'جميع المشاريع' : 'مشاريعك'}
            </h2>
            <Link to="/projects" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              عرض الكل
            </Link>
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : transformedProjects.length > 0 ? (
            <ProjectGrid>
              {transformedProjects.slice(0, 6).map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  delay={index * 0.1}
                  onOpen={() => navigate(`/project/${project.id}`)}
                  onEdit={() => navigate('/editor')}
                />
              ))}
            </ProjectGrid>
          ) : (
            <EmptyProjects onCreateNew={() => navigate('/editor')} />
          )}
        </div>

        {/* AI CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2 text-center md:text-right">
              <h3 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                {isAdmin ? 'ابدأ في إنشاء مشروع للعملاء' : 'هل تريد إنشاء موقع جديد؟'}
              </h3>
              <p className="text-gray-400">استخدم الذكاء الاصطناعي لإنشاء مواقع احترافية في دقائق</p>
            </div>
            <button
              onClick={() => navigate('/editor')}
              className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg"
            >
              <Zap className="w-4 h-4" />
              ابدأ مع AI
            </button>
          </div>
        </motion.div>

        {/* Quick Links for Admin */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Link
              to="/admin"
              className="group p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 hover:border-red-500/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-red-400 transition-colors">
                    لوحة الإدارة الكاملة
                  </h4>
                  <p className="text-sm text-gray-400">إدارة المستخدمين، الطلبات، والإعدادات</p>
                </div>
              </div>
            </Link>
            <Link
              to="/settings"
              className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">الإعدادات العامة</h4>
                  <p className="text-sm text-gray-400">تخصيص المنصة وإعدادات الحساب</p>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
