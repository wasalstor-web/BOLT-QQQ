import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { useRequireAuth } from '~/lib/auth/useAuth';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import { User, Mail, Camera, Globe, MapPin, FileText, Shield, Bell, Palette, LogOut, Loader2, Save } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'الملف الشخصي - مبسط إديتر' }, { name: 'description', content: 'إدارة ملفك الشخصي' }];
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated, signOut } = useRequireAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    website: '',
    location: '',
  });

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

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <DashboardLayout
      user={{
        name: user.name || user.email?.split('@')[0] || 'المستخدم',
        email: user.email || '',
        avatar: user.avatar,
      }}
    >
      <div className="p-6 lg:p-8" dir="rtl">
        <DashboardHeader title="الملف الشخصي" subtitle="إدارة معلومات حسابك" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Avatar Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">الصورة الشخصية</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                    {user.name?.charAt(0) || user.email?.charAt(0) || 'م'}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">تغيير الصورة</p>
                  <p className="text-gray-400 text-sm">JPG, PNG أو GIF. الحد الأقصى 2MB</p>
                  <button className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
                    رفع صورة جديدة
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">المعلومات الشخصية</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <User className="h-4 w-4" />
                    الاسم
                  </label>
                  <input
                    type="text"
                    value={formData.name || user.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                    placeholder="اسمك الكامل"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Mail className="h-4 w-4" />
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <FileText className="h-4 w-4" />
                    نبذة عنك
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 resize-none"
                    placeholder="اكتب نبذة قصيرة عنك..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <Globe className="h-4 w-4" />
                      الموقع الإلكتروني
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <MapPin className="h-4 w-4" />
                      الموقع الجغرافي
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                      placeholder="المدينة، البلد"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">روابط سريعة</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
                >
                  <Shield className="h-5 w-5 text-purple-400" />
                  <span>الأمان وكلمة المرور</span>
                </button>

                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
                >
                  <Bell className="h-5 w-5 text-blue-400" />
                  <span>الإشعارات</span>
                </button>

                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
                >
                  <Palette className="h-5 w-5 text-green-400" />
                  <span>المظهر والتخصيص</span>
                </button>

                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
