import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { getProjects, deleteProject } from '~/lib/supabase/client';
import type { Project } from '~/lib/supabase/client';
import { useRequireAuth } from '~/lib/auth/useAuth';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import { ProjectCard, ProjectGrid, EmptyProjects } from '~/components/ui/project-card';
import { Plus, Search, Filter, Grid3X3, List, Sparkles, SortAsc, SortDesc, Loader2 } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'المشاريع - مبسط إديتر' }, { name: 'description', content: 'إدارة جميع مشاريعك' }];
};

const mapStatus = (status: string): 'active' | 'building' | 'archived' | 'draft' => {
  if (status === 'published') {
    return 'active';
  }

  if (status === 'draft') {
    return 'draft';
  }

  if (status === 'archived') {
    return 'archived';
  }

  if (status === 'building') {
    return 'building';
  }

  return 'draft';
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    const loadProjects = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const { data } = await getProjects();
        setProjects(data || []);
      } catch (err) {
        console.error('Projects error:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.updated_at).getTime();
      const dateB = new Date(b.updated_at).getTime();

      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // شاشة التحميل
  if (authLoading || loading) {
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
        <DashboardHeader title="المشاريع" subtitle={`${projects.length} مشروع`} />

        {/* Toolbar */}
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="بحث في المشاريع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
            >
              <option value="all">الكل</option>
              <option value="published">منشور</option>
              <option value="draft">مسودة</option>
            </select>

            {/* Sort */}
            <button
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title={sortOrder === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}
            >
              {sortOrder === 'desc' ? <SortDesc className="h-5 w-5" /> : <SortAsc className="h-5 w-5" />}
            </button>

            {/* View Mode */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* New Project */}
            <button
              onClick={() => navigate('/editor')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">مشروع جديد</span>
            </button>
          </div>
        </div>

        {/* Projects */}
        {filteredProjects.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={
              viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'
            }
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProjectCard
                  project={{
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    thumbnail: project.thumbnail_url,
                    status: mapStatus(project.status),
                    lastUpdated: new Date(project.updated_at),
                    createdAt: new Date(project.created_at),
                    url: project.preview_url,
                  }}
                  onOpen={() => navigate(`/?project=${project.id}`)}
                  onEdit={() => navigate(`/?project=${project.id}`)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : searchQuery || filterStatus !== 'all' ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">لا توجد نتائج</h3>
            <p className="text-gray-400">جرب تغيير معايير البحث أو الفلترة</p>
          </div>
        ) : (
          <EmptyProjects onCreateNew={() => navigate('/editor')} />
        )}
      </div>
    </DashboardLayout>
  );
}
