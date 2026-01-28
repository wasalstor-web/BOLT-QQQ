import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { useRequireAuth } from '~/lib/auth/useAuth';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import { User, Bell, Shield, Palette, Globe, Key, Loader2, Save, Moon, Sun, Monitor } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'الإعدادات - مبسط إديتر' }, { name: 'description', content: 'إدارة إعدادات حسابك' }];
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('ar');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
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
        <DashboardHeader 
          title="الإعدادات" 
          subtitle="إدارة حسابك وتفضيلاتك"
          action={
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-4">الملف الشخصي</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'م'}
              </div>
              <div>
                <h4 className="text-white font-semibold">{user.name || 'مستخدم'}</h4>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm">الاسم الكامل</label>
                <input
                  type="text"
                  defaultValue={user.name || ''}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-500 text-sm cursor-not-allowed"
                />
                <p className="text-gray-500 text-xs mt-1">لا يمكن تغيير البريد الإلكتروني</p>
              </div>
            </div>
          </motion.div>

          {/* Main Settings */}
          <div className="lg:col-span-3 space-y-6">
            {/* Appearance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Palette className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">المظهر</h3>
                  <p className="text-gray-400 text-sm">تخصيص مظهر التطبيق</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'light', label: 'فاتح', icon: Sun },
                  { id: 'dark', label: 'داكن', icon: Moon },
                  { id: 'system', label: 'تلقائي', icon: Monitor },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={`p-4 rounded-xl border transition-all ${
                      theme === option.id
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <option.icon className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">الإشعارات</h3>
                  <p className="text-gray-400 text-sm">إدارة تفضيلات الإشعارات</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'email', label: 'إشعارات البريد الإلكتروني', desc: 'استلام إشعارات عبر البريد' },
                  { id: 'push', label: 'إشعارات الدفع', desc: 'إشعارات فورية في المتصفح' },
                  { id: 'updates', label: 'تحديثات المنتج', desc: 'أخبار وتحديثات جديدة' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notifications[item.id as keyof typeof notifications] ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        notifications[item.id as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">الأمان</h3>
                  <p className="text-gray-400 text-sm">إدارة أمان الحساب</p>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-gray-400" />
                    <div className="text-right">
                      <p className="text-white font-medium">تغيير كلمة المرور</p>
                      <p className="text-gray-400 text-sm">آخر تغيير: لم يتم</p>
                    </div>
                  </div>
                  <span className="text-purple-400 text-sm">تغيير</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
