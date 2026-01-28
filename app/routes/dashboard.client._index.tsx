import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { useAuth } from '~/lib/auth';
import { getProjects, type Project } from '~/lib/supabase/client';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { StatsCard, StatsGrid } from '~/components/ui/stats-card';
import { ProjectCard, ProjectGrid, EmptyProjects } from '~/components/ui/project-card';
import { Folder, Eye, Zap, Plus, ArrowLeft, Sparkles, Clock } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'لوحة التحكم - مبسط إديتر' }, { name: 'description', content: 'إدارة مشاريعك' }];
};

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadProjects = async () => {
      try {
        const { data } = await getProjects();
        setProjects(data || []);
      } catch (err) {
        console.error('Error loading projects:', err);

        // بيانات تجريبية
        setProjects([
          {
            id: '1',
            user_id: '',
            name: 'متجر إلكتروني',
            description: 'متجر لبيع المنتجات',
            status: 'published',
            created_at: '2025-01-20',
            updated_at: '2025-01-20',
          },
          {
            id: '2',
            user_id: '',
            name: 'موقع شركة',
            description: 'موقع تعريفي',
            status: 'draft',
            created_at: '2025-01-18',
            updated_at: '2025-01-18',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadProjects();
    }
  }, [authLoading, isAuthenticated, navigate]);

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

  const stats = {
    total: projects.length,
    published: projects.filter((p) => p.status === 'published').length,
    draft: projects.filter((p) => p.status === 'draft').length,
  };

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
    <DashboardLayout user={{ name: user?.name || 'المستخدم', email: user?.email || '', avatar: user?.avatar }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            مرحباً، {user?.name?.split(' ')[0] || 'صديقي'} 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 mt-1"
          >
            إليك نظرة عامة على مشاريعك
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => navigate('/')}
          className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          مشروع جديد
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Stats */}
      <StatsGrid className="mb-8">
        <StatsCard title="إجمالي المشاريع" value={stats.total} icon={<Folder className="h-5 w-5" />} delay={0} />
        <StatsCard
          title="المنشورة"
          value={stats.published}
          change={20}
          icon={<Zap className="h-5 w-5" />}
          delay={0.1}
        />
        <StatsCard title="المسودات" value={stats.draft} icon={<Clock className="h-5 w-5" />} delay={0.2} />
        <StatsCard title="المشاهدات" value={1234} change={15} icon={<Eye className="h-5 w-5" />} delay={0.3} />
      </StatsGrid>

      {/* Projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">مشاريعك</h2>
          <Link to="/projects" className="text-sm text-purple-400 hover:text-purple-300">
            عرض الكل
          </Link>
        </div>

        {transformedProjects.length > 0 ? (
          <ProjectGrid>
            {transformedProjects.slice(0, 6).map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                delay={index * 0.1}
                onOpen={() => navigate(/project/ + project.id)}
                onEdit={() => navigate('/')}
                onPreview={() => window.open(/preview/ + project.id, '_blank')}
              />
            ))}
          </ProjectGrid>
        ) : (
          <EmptyProjects onCreateNew={() => navigate('/')} />
        )}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 backdrop-blur-xl"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold text-white mb-1">جاهز لإنشاء موقع جديد؟</h3>
            <p className="text-gray-400">استخدم الذكاء الاصطناعي لإنشاء موقعك في دقائق</p>
          </div>
          <button
            onClick={() => navigate('/')}
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
