import { useEffect, useState } from 'react';
import { useNavigate, Link } from '@remix-run/react';
import { motion } from 'framer-motion';
import type { MetaFunction } from '@remix-run/cloudflare';
import { getUser, signOut } from '~/lib/supabase/client';

export const meta: MetaFunction = () => {
  return [
    { title: 'الإعدادات - مبسط إديتر' },
    { name: 'description', content: 'إعدادات حسابك' },
  ];
};

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    avatar: '',
  });
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    google: '',
  });
  const [preferences, setPreferences] = useState({
    language: 'ar',
    theme: 'dark',
    notifications: true,
    autoSave: true,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user } = await getUser();
        // تم تعطيل التحقق مؤقتاً
        // if (!user) {
        //   navigate('/login');
        //   return;
        // }
        const demoUser = user || { email: 'demo@example.com', user_metadata: { full_name: 'مستخدم تجريبي', avatar_url: '' } };

        setProfile({
          name: demoUser.user_metadata?.full_name || demoUser.email?.split('@')[0] || '',
          email: demoUser.email || '',
          avatar: (demoUser.user_metadata as any)?.avatar_url || '',
        });
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
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

  const tabs = [
    { id: 'profile', name: 'الملف الشخصي', icon: '👤' },
    { id: 'api', name: 'مفاتيح API', icon: '🔑' },
    { id: 'preferences', name: 'التفضيلات', icon: '⚙️' },
    { id: 'billing', name: 'الفوترة', icon: '💳' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">م</span>
          </div>
          <p className="text-gray-400">جاري التحميل...</p>
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
              <h1 className="text-xl font-bold">الإعدادات</h1>
              <p className="text-sm text-gray-500">إدارة حسابك وتفضيلاتك</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
          >
            {saving ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>حفظ التغييرات</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}

              <hr className="border-gray-800 my-4" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>تسجيل الخروج</span>
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-8">
                  <h2 className="text-lg font-semibold mb-6">الملف الشخصي</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Avatar"
                          className="w-24 h-24 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">
                            {profile.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <button className="absolute -bottom-2 -left-2 p-2 bg-slate-800 border border-gray-700 rounded-xl hover:bg-slate-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{profile.name}</h3>
                      <p className="text-gray-500">{profile.email}</p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="grid gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">الاسم الكامل</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full bg-slate-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full bg-slate-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-600 mt-2">لا يمكن تغيير البريد الإلكتروني</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-8">
                  <h2 className="text-lg font-semibold mb-2">مفاتيح API</h2>
                  <p className="text-gray-500 mb-6">أضف مفاتيح API الخاصة بك للاستفادة من خدمات الذكاء الاصطناعي</p>

                  <div className="space-y-6">
                    {/* OpenAI */}
                    <div className="p-6 bg-slate-800/30 border border-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🤖</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">OpenAI</h3>
                          <p className="text-sm text-gray-500">GPT-4, GPT-3.5, DALL-E</p>
                        </div>
                      </div>
                      <input
                        type="password"
                        value={apiKeys.openai}
                        onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                        placeholder="sk-..."
                        className="w-full bg-slate-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                      />
                    </div>

                    {/* Anthropic */}
                    <div className="p-6 bg-slate-800/30 border border-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🧠</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Anthropic</h3>
                          <p className="text-sm text-gray-500">Claude 3, Claude 2</p>
                        </div>
                      </div>
                      <input
                        type="password"
                        value={apiKeys.anthropic}
                        onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                        placeholder="sk-ant-..."
                        className="w-full bg-slate-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>

                    {/* Google */}
                    <div className="p-6 bg-slate-800/30 border border-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🌐</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Google AI</h3>
                          <p className="text-sm text-gray-500">Gemini Pro, PaLM 2</p>
                        </div>
                      </div>
                      <input
                        type="password"
                        value={apiKeys.google}
                        onChange={(e) => setApiKeys({ ...apiKeys, google: e.target.value })}
                        placeholder="AIza..."
                        className="w-full bg-slate-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-8">
                  <h2 className="text-lg font-semibold mb-6">التفضيلات</h2>

                  <div className="space-y-6">
                    {/* Language */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                          <span>🌍</span>
                        </div>
                        <div>
                          <h3 className="font-medium">اللغة</h3>
                          <p className="text-sm text-gray-500">اختر لغة الواجهة</p>
                        </div>
                      </div>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        className="bg-slate-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    {/* Theme */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <span>🎨</span>
                        </div>
                        <div>
                          <h3 className="font-medium">المظهر</h3>
                          <p className="text-sm text-gray-500">اختر مظهر الواجهة</p>
                        </div>
                      </div>
                      <select
                        value={preferences.theme}
                        onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                        className="bg-slate-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="dark">داكن</option>
                        <option value="light">فاتح</option>
                        <option value="system">تلقائي</option>
                      </select>
                    </div>

                    {/* Notifications */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                          <span>🔔</span>
                        </div>
                        <div>
                          <h3 className="font-medium">الإشعارات</h3>
                          <p className="text-sm text-gray-500">تلقي إشعارات التحديثات</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
                        className={`w-14 h-8 rounded-full transition-colors ${
                          preferences.notifications ? 'bg-purple-500' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 bg-white rounded-full transition-transform ${
                            preferences.notifications ? '-translate-x-1' : '-translate-x-7'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Auto Save */}
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <span>💾</span>
                        </div>
                        <div>
                          <h3 className="font-medium">الحفظ التلقائي</h3>
                          <p className="text-sm text-gray-500">حفظ التغييرات تلقائياً</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPreferences({ ...preferences, autoSave: !preferences.autoSave })}
                        className={`w-14 h-8 rounded-full transition-colors ${
                          preferences.autoSave ? 'bg-purple-500' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 bg-white rounded-full transition-transform ${
                            preferences.autoSave ? '-translate-x-1' : '-translate-x-7'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-slate-900/50 border border-gray-800/50 rounded-2xl p-8">
                  <h2 className="text-lg font-semibold mb-6">الفوترة والاشتراك</h2>

                  {/* Current Plan */}
                  <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="px-3 py-1 bg-purple-500/30 text-purple-300 text-sm rounded-full">الخطة الحالية</span>
                        <h3 className="text-2xl font-bold mt-2">مجاني</h3>
                        <p className="text-gray-500">3 مشاريع • AI محدود</p>
                      </div>
                      <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all">
                        ترقية الخطة
                      </button>
                    </div>
                  </div>

                  {/* Plans */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-800/30 border border-gray-700/50 rounded-xl">
                      <h4 className="font-semibold text-lg mb-2">Pro</h4>
                      <p className="text-3xl font-bold mb-2">$19<span className="text-sm text-gray-500 font-normal">/شهر</span></p>
                      <ul className="space-y-2 mb-6 text-sm text-gray-400">
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> مشاريع غير محدودة
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> AI غير محدود
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> نشر مخصص
                        </li>
                      </ul>
                      <button className="w-full py-2 border border-purple-500 text-purple-400 rounded-xl hover:bg-purple-500/10 transition-colors">
                        اختيار Pro
                      </button>
                    </div>

                    <div className="p-6 bg-slate-800/30 border border-gray-700/50 rounded-xl">
                      <h4 className="font-semibold text-lg mb-2">Enterprise</h4>
                      <p className="text-3xl font-bold mb-2">$49<span className="text-sm text-gray-500 font-normal">/شهر</span></p>
                      <ul className="space-y-2 mb-6 text-sm text-gray-400">
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> كل مميزات Pro
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> دعم أولوية
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> API خاص
                        </li>
                      </ul>
                      <button className="w-full py-2 border border-purple-500 text-purple-400 rounded-xl hover:bg-purple-500/10 transition-colors">
                        اختيار Enterprise
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
