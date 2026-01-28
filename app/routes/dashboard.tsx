import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { getProjects } from '~/lib/supabase/client';
import type { Project as SupabaseProject } from '~/lib/supabase/client';
import { useRequireAuth } from '~/lib/auth/useAuth';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { StatsCard, StatsGrid } from '~/components/ui/stats-card';
import { AreaChart } from '~/components/ui/area-chart';
import { ActivityFeed, type ActivityType } from '~/components/ui/activity-feed';
import { ProjectCard, ProjectGrid, EmptyProjects } from '~/components/ui/project-card';
import { Folder, Eye, TrendingUp, Zap, Plus, Sparkles, Loader2 } from 'lucide-react';

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

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      if (!isAuthenticated) return;

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const userName = user.name || user.email?.split('@')[0] || 'مستخدم';

  // Transform projects to match ProjectCard interface
  const transformedProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status === 'published' ? 'active' as const : 'draft' as const,
    lastUpdated: p.updated_at,
    createdAt: p.created_at,
    views: Math.floor(Math.random() * 500),
  }));

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">مرحباً، {userName} 👋</h1>
            <p className="text-gray-400 mt-1">إليك نظرة عامة على مشاريعك ونشاطك</p>
          </div>
          <button
            onClick={() => navigate('/editor')}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            مشروع جديد
          </button>
        </div>

        {/* Stats Grid */}
        <StatsGrid>
          <StatsCard
            title="إجمالي المشاريع"
            value={stats.total}
            icon={<Folder className="w-5 h-5" />}
            delay={0}
          />
          <StatsCard
            title="المشاريع المنشورة"
            value={stats.published}
            icon={<Eye className="w-5 h-5" />}
            change={25}
            trend="up"
            delay={0.1}
          />
          <StatsCard
            title="المشاهدات الكلية"
            value={stats.views}
            icon={<TrendingUp className="w-5 h-5" />}
            change={stats.growth}
            trend="up"
            delay={0.2}
          />
          <StatsCard
            title="معدل النمو"
            value={`${stats.growth}%`}
            icon={<Zap className="w-5 h-5" />}
            delay={0.3}
          />
        </StatsGrid>

        {/* Charts & Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AreaChart
              data={chartData}
              title="الزيارات الشهرية"
              subtitle="إحصائيات زيارات مشاريعك خلال الأشهر الماضية"
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
            <h2 className="text-xl font-bold text-white">مشاريعك الأخيرة</h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              عرض الكل
            </button>
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : transformedProjects.length > 0 ? (
            <ProjectGrid>
              {transformedProjects.slice(0, 3).map((project, index) => (
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
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2 text-center md:text-right">
              <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="w-5 h-5" />
                هل تريد إنشاء موقع جديد؟
              </h3>
              <p className="text-purple-100">
                استخدم الذكاء الاصطناعي لإنشاء موقعك في دقائق معدودة
              </p>
            </div>
            <button
              onClick={() => navigate('/editor')}
              className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              ابدأ مع AI
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
