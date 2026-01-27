import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from '@remix-run/react';
import { motion } from 'framer-motion';
import type { MetaFunction } from '@remix-run/cloudflare';
import { getProject, getUser, updateProject } from '~/lib/supabase/client';
import type { Project } from '~/lib/supabase/client';

export const meta: MetaFunction = () => {
  return [
    { title: 'تعديل المشروع - مبسط إديتر' },
    { name: 'description', content: 'تعديل مشروعك' },
  ];
};

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      try {
        const { user } = await getUser();
        // تم تعطيل التحقق مؤقتاً
        // if (!user) {
        //   navigate('/login');
        //   return;
        // }

        if (id) {
          const { data, error: fetchError } = await getProject(id);
          if (fetchError || !data) {
            setError('المشروع غير موجود');
          } else {
            setProject(data);
          }
        }
      } catch (err) {
        setError('حدث خطأ في تحميل المشروع');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!project || !id) return;

    setSaving(true);
    try {
      await updateProject(id, {
        name: project.name,
        description: project.description,
        status: project.status,
      });
    } catch (err) {
      setError('فشل حفظ التغييرات');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditor = () => {
    // Navigate to editor with project context
    navigate(`/?project=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">م</span>
          </div>
          <p className="text-gray-400">جاري تحميل المشروع...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{error || 'المشروع غير موجود'}</h2>
          <Link to="/dashboard" className="text-purple-400 hover:text-purple-300">
            العودة للوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{project.name}</h1>
              <p className="text-sm text-gray-500">آخر تحديث: {new Date(project.updated_at).toLocaleDateString('ar-SA')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              <span>حفظ</span>
            </button>

            <button
              onClick={handleOpenEditor}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>فتح في المحرر</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid gap-8">
          {/* Project Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-8"
          >
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              معلومات المشروع
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">اسم المشروع</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => setProject({ ...project, name: e.target.value })}
                  className="w-full bg-slate-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">الوصف</label>
                <textarea
                  value={project.description || ''}
                  onChange={(e) => setProject({ ...project, description: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="وصف مختصر للمشروع..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">الحالة</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setProject({ ...project, status: 'draft' })}
                    className={`flex-1 py-3 rounded-xl border transition-all ${
                      project.status === 'draft'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                        : 'bg-slate-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    مسودة
                  </button>
                  <button
                    onClick={() => setProject({ ...project, status: 'published' })}
                    className={`flex-1 py-3 rounded-xl border transition-all ${
                      project.status === 'published'
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-slate-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    منشور
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-8"
          >
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              إجراءات سريعة
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={handleOpenEditor}
                className="flex flex-col items-center gap-3 p-6 bg-slate-800/50 hover:bg-purple-500/20 border border-gray-700 hover:border-purple-500/50 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className="text-sm">تعديل</span>
              </button>

              <button className="flex flex-col items-center gap-3 p-6 bg-slate-800/50 hover:bg-blue-500/20 border border-gray-700 hover:border-blue-500/50 rounded-xl transition-all group">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="text-sm">معاينة</span>
              </button>

              <button className="flex flex-col items-center gap-3 p-6 bg-slate-800/50 hover:bg-green-500/20 border border-gray-700 hover:border-green-500/50 rounded-xl transition-all group">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <span className="text-sm">نشر</span>
              </button>

              <button className="flex flex-col items-center gap-3 p-6 bg-slate-800/50 hover:bg-cyan-500/20 border border-gray-700 hover:border-cyan-500/50 rounded-xl transition-all group">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <span className="text-sm">تحميل</span>
              </button>
            </div>
          </motion.div>

          {/* Project Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-6"
          >
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-purple-400">{Object.keys(project.files_json || {}).length}</p>
              <p className="text-gray-500 text-sm mt-1">ملفات</p>
            </div>
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-blue-400">0</p>
              <p className="text-gray-500 text-sm mt-1">زيارات</p>
            </div>
            <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-green-400">{project.status === 'published' ? '1' : '0'}</p>
              <p className="text-gray-500 text-sm mt-1">نشر</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
