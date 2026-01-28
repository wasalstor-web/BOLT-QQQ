import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { getUser, signOut } from '~/lib/supabase/client';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import * as Avatar from '@radix-ui/react-avatar';
import { User, Mail, Calendar, Camera, Save, Sparkles, Lock, Bell, Globe, Palette, ArrowRight } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'الملف الشخصي - مبسط إديتر' }, { name: 'description', content: 'إعدادات حسابك الشخصي' }];
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    website: '',
    location: '',
  });

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
        const userToSet = currentUser || {
          email: 'demo@example.com',
          user_metadata: { name: 'مستخدم تجريبي', bio: '', website: '', location: '' },
        };
        setUser(userToSet);

        const metadata = userToSet.user_metadata as any;
        setFormData({
          name: metadata?.name || userToSet.email?.split('@')[0] || '',
          email: userToSet.email || '',
          bio: metadata?.bio || '',
          website: metadata?.website || '',
          location: metadata?.location || '',
        });
      } catch (err) {
        console.error('Profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);

    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/editor');
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
      <div className="p-6 lg:p-8 max-w-4xl" dir="rtl">
        <DashboardHeader title="الملف الشخصي" subtitle="إدارة معلومات حسابك" />

        <div className="grid gap-8">
          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">الصورة الشخصية</h3>

            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar.Root className="h-24 w-24 rounded-2xl overflow-hidden">
                  <Avatar.Image src={user?.user_metadata?.avatar_url} alt={formData.name} className="object-cover" />
                  <Avatar.Fallback className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-bold">
                    {formData.name.charAt(0)}
                  </Avatar.Fallback>
                </Avatar.Root>
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </button>
              </div>

              <div>
                <p className="text-white font-medium mb-1">تغيير الصورة</p>
                <p className="text-gray-400 text-sm mb-3">JPG, PNG أو GIF. الحد الأقصى 2MB</p>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-sm transition-colors">
                  رفع صورة جديدة
                </button>
              </div>
            </div>
          </motion.div>

          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">المعلومات الشخصية</h3>

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">الاسم</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-4 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-4 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">نبذة عنك</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  placeholder="اكتب نبذة قصيرة عنك..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">الموقع الإلكتروني</label>
                  <div className="relative">
                    <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full pl-4 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">الموقع الجغرافي</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="الرياض، السعودية"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">روابط سريعة</h3>

            <div className="grid gap-4">
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                  <span className="text-white">الأمان وكلمة المرور</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <span className="text-white">الإشعارات</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-gray-400" />
                  <span className="text-white">المظهر والتخصيص</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </motion.div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <button onClick={handleLogout} className="px-6 py-2.5 text-red-400 hover:text-red-300 transition-colors">
              تسجيل الخروج
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
