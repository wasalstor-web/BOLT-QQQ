import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { getUser, getProjects, signOut } from '~/lib/supabase/client';
import type { Project } from '~/lib/supabase/client';
import { cn } from '~/lib/utils';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import { StatsCard, StatsGrid } from '~/components/ui/stats-card';
import { AreaChart } from '~/components/ui/area-chart';
import { ActivityFeed } from '~/components/ui/activity-feed';
import { ProjectCard, ProjectGrid, EmptyProjects } from '~/components/ui/project-card';
import { 
  Folder, 
  Eye, 
  TrendingUp, 
  Zap,
  Plus,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

type ActivityType = 'project_created' | 'ai_generation' | 'project_deployed' | 'project_updated' | 'comment_added';

export const meta: MetaFunction = () => {
  return [
    { title: 'لوحة التحكم - مبسط إديتر' },
    { name: 'description', content: 'إدارة مشاريعك ومواقعك' },
  ];
};

// Mock chart data
const chartData = [
  { name: 'يناير', value: 400 },
  { name: 'فبراير', value: 300 },
  { name: 'مارس', value: 600 },
  { name: 'أبريل', value: 800 },
  { name: 'مايو', value: 500 },
  { name: 'يونيو', value: 900 },
  { name: 'يوليو', value: 1200 },
];

// Mock activities
const mockActivities = [
  {
    id: '1',
    type: 'project_created' as ActivityType,
    title: 'أنشأ مشروع جديد',
    user: { name: 'أنت', avatar: undefined },
    project: { name: 'متجر إلكتروني' },
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    type: 'ai_generation' as ActivityType,
    title: 'ولّد بالذكاء الاصطناعي',
    user: { name: 'أنت', avatar: undefined },
    project: { name: 'موقع شركة' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    type: 'project_deployed' as ActivityType,
    title: 'نشر المشروع',
    user: { name: 'أنت', avatar: undefined },
    project: { name: 'مدونة شخصية' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { user: currentUser } = await getUser();
        // تم تعطيل التحقق مؤقتاً للاختبار - يمكن إعادة تفعيله لاحقاً
        // if (!currentUser) {
        //   navigate('/login');
        //   return;
        // }
        setUser(currentUser || { email: 'demo@example.com', user_metadata: { name: 'مستخدم تجريبي' } });

        const { data } = await getProjects();
        setProjects(data || []);
      } catch (err) {
        console.error('Dashboard error:', err);
        // Use mock data for now
        setProjects([
          { 
            id: '1', 
            user_id: '', 
            name: 'متجر إلكتروني', 
            description: 'متجر لبيع المنتجات الإلكترونية', 
            status: 'published', 
            created_at: '2025-01-20', 
            updated_at: '2025-01-20' 
          },
          { 
            id: '2', 
            user_id: '', 
            name: 'موقع شركة', 
            description: 'موقع تعريفي لشركة تقنية', 
            status: 'draft', 
            created_at: '2025-01-18', 
            updated_at: '2025-01-18' 
          },
          { 
            id: '3', 
            user_id: '', 
            name: 'مدونة شخصية', 
            description: 'مدونة للتدوين والمقالات', 
            status: 'published', 
            created_at: '2025-01-15', 
            updated_at: '2025-01-17' 
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const stats = {
    total: projects.length,
    published: projects.filter((p) => p.status === 'published').length,
    draft: projects.filter((p) => p.status === 'draft').length,
    views: 1234,
    growth: 12.5,
  };

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
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-400"
          >
            جاري التحميل...
          </motion.div>
        </div>
      </div>
    );
  }

  // Transform projects for ProjectCard
  const transformedProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description || undefined,
    status: (p.status === 'published' ? 'active' : 'draft') as 'active' | 'draft' | 'archived' | 'building',
    lastUpdated: p.updated_at,
    createdAt: p.created_at,
    views: Math.floor(Math.random() * 1000),
    framework: ['react', 'vue', 'next'][Math.floor(Math.random() * 3)],
  }));

  return (
    <DashboardLayout 
      user={{
        name: user?.user_metadata?.name || 'المستخدم',
        email: user?.email || 'user@example.com',
        avatar: user?.user_metadata?.avatar_url,
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            مرحباً، {user?.user_metadata?.name?.split(' ')[0] || 'صديقي'} 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 mt-1"
          >
            إليك نظرة عامة على مشاريعك ونشاطك
          </motion.p>
        </div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/editor')}
          className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          مشروع جديد
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Stats Grid */}
      <StatsGrid className="mb-8">
        <StatsCard
          title="إجمالي المشاريع"
          value={stats.total}
          icon={<Folder className="h-5 w-5" />}
          delay={0}
        />
        <StatsCard
          title="المشاريع المنشورة"
          value={stats.published}
          change={25}
          icon={<Zap className="h-5 w-5" />}
          delay={0.1}
        />
        <StatsCard
          title="المشاهدات الكلية"
          value={stats.views}
          change={stats.growth}
          icon={<Eye className="h-5 w-5" />}
          delay={0.2}
        />
        <StatsCard
          title="معدل النمو"
          value={`${stats.growth}%`}
          format="none"
          trend="up"
          icon={<TrendingUp className="h-5 w-5" />}
          delay={0.3}
        />
      </StatsGrid>

      {/* Chart and Activity */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <AreaChart
            data={chartData}
            title="الزيارات الشهرية"
            subtitle="إحصائيات زيارات مشاريعك خلال الأشهر الماضية"
            color="#8b5cf6"
          />
        </div>
        <div>
          <ActivityFeed
            activities={mockActivities}
            title="النشاط الأخير"
            maxItems={4}
          />
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">مشاريعك الأخيرة</h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            عرض الكل
          </button>
        </div>
        
        {transformedProjects.length > 0 ? (
          <ProjectGrid>
            {transformedProjects.slice(0, 4).map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                delay={index * 0.1}
                onOpen={() => navigate(`/project/${project.id}`)}
                onEdit={() => navigate(`/editor`)}
                onPreview={() => window.open(`/preview/${project.id}`, '_blank')}
              />
            ))}
          </ProjectGrid>
        ) : (
          <EmptyProjects onCreateNew={() => navigate('/editor')} />
        )}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 backdrop-blur-xl"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold text-white mb-1">
              هل تريد إنشاء موقع جديد؟
            </h3>
            <p className="text-gray-400">
              استخدم الذكاء الاصطناعي لإنشاء موقعك في دقائق معدودة
            </p>
          </div>
          <button
            onClick={() => navigate('/editor')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-medium text-white transition-all"
          >
            <Sparkles className="h-5 w-5 text-purple-400" />
            ابدأ مع AI
          </button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

