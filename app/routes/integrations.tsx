import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { getUser } from '~/lib/supabase/client';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import { storage } from '~/lib/storage';
import {
  Puzzle,
  Github,
  Cloud,
  Database,
  MessageSquare,
  Mail,
  CreditCard,
  BarChart3,
  Shield,
  Sparkles,
  Check,
  ExternalLink,
  Settings,
  Zap,
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    { title: 'التكاملات - مبسط إديتر' },
    { name: 'description', content: 'إدارة تكاملات التطبيقات' },
  ];
};

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'development' | 'deployment' | 'analytics' | 'communication' | 'payment';
  isConnected: boolean;
  isPopular?: boolean;
  isNew?: boolean;
}

const integrations: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'ربط مستودعات GitHub واستيراد المشاريع',
    icon: <Github className="h-6 w-6" />,
    category: 'development',
    isConnected: true,
    isPopular: true,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'نشر المشاريع تلقائياً على Vercel',
    icon: <Cloud className="h-6 w-6" />,
    category: 'deployment',
    isConnected: true,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Pages',
    description: 'نشر سريع على شبكة Cloudflare',
    icon: <Cloud className="h-6 w-6" />,
    category: 'deployment',
    isConnected: false,
    isPopular: true,
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'استضافة ونشر مواقع ويب حديثة',
    icon: <Cloud className="h-6 w-6" />,
    category: 'deployment',
    isConnected: false,
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'قاعدة بيانات ومصادقة وتخزين',
    icon: <Database className="h-6 w-6" />,
    category: 'development',
    isConnected: true,
    isPopular: true,
  },
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'خدمات Google السحابية للتطبيقات',
    icon: <Database className="h-6 w-6" />,
    category: 'development',
    isConnected: false,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'إشعارات وتنبيهات للفريق',
    icon: <MessageSquare className="h-6 w-6" />,
    category: 'communication',
    isConnected: false,
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'إشعارات على قنوات Discord',
    icon: <MessageSquare className="h-6 w-6" />,
    category: 'communication',
    isConnected: false,
    isNew: true,
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'تحليلات متقدمة للزوار',
    icon: <BarChart3 className="h-6 w-6" />,
    category: 'analytics',
    isConnected: false,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'معالجة المدفوعات والاشتراكات',
    icon: <CreditCard className="h-6 w-6" />,
    category: 'payment',
    isConnected: false,
  },
  {
    id: 'auth0',
    name: 'Auth0',
    description: 'مصادقة وإدارة المستخدمين',
    icon: <Shield className="h-6 w-6" />,
    category: 'development',
    isConnected: false,
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'إرسال رسائل البريد الإلكتروني',
    icon: <Mail className="h-6 w-6" />,
    category: 'communication',
    isConnected: false,
    isNew: true,
  },
];

const categories = [
  { id: 'all', label: 'الكل' },
  { id: 'development', label: 'التطوير' },
  { id: 'deployment', label: 'النشر' },
  { id: 'analytics', label: 'التحليلات' },
  { id: 'communication', label: 'التواصل' },
  { id: 'payment', label: 'المدفوعات' },
];

export default function IntegrationsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStates, setConnectionStates] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load saved integration states from localStorage
        const savedIntegrations = storage.getIntegrations();
        if (savedIntegrations && typeof savedIntegrations === 'object') {
          // Convert to simple boolean record
          const booleanStates: Record<string, boolean> = {};
          Object.keys(savedIntegrations).forEach(key => {
            const val = (savedIntegrations as any)[key];
            booleanStates[key] = typeof val === 'boolean' ? val : !!val?.isConnected;
          });
          setConnectionStates(booleanStates);
        }
        
        const { user: currentUser } = await getUser();
        // تم تعطيل التحقق مؤقتاً
        // if (!currentUser) {
        //   navigate('/editor');
        //   return;
        // }
        setUser(currentUser || { email: 'demo@example.com', user_metadata: { name: 'مستخدم تجريبي' } });
      } catch (err) {
        console.error('Integrations error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const toggleConnection = (integrationId: string) => {
    setConnectionStates(prev => {
      const newState = { ...prev, [integrationId]: !prev[integrationId] };
      storage.setIntegrations(newState as any);
      return newState;
    });
  };

  const getIntegrationsList = () => {
    return integrations.map(i => ({
      ...i,
      isConnected: connectionStates[i.id] ?? i.isConnected,
    }));
  };

  const filteredIntegrations = activeCategory === 'all'
    ? getIntegrationsList()
    : getIntegrationsList().filter(i => i.category === activeCategory);

  const connectedCount = getIntegrationsList().filter(i => i.isConnected).length;

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
      <div className="p-6 lg:p-8" dir="rtl">
        <DashboardHeader
          title="التكاملات"
          subtitle={`${connectedCount} تكامل متصل`}
        />

        {/* Connected Summary */}
        <div className="mb-8 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">التكاملات المتصلة</p>
              <p className="text-gray-400 text-sm">
                لديك {connectedCount} تكامل متصل من أصل {integrations.length}
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${integration.isConnected ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'}`}>
                  {integration.icon}
                </div>
                <div className="flex items-center gap-2">
                  {integration.isNew && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-xs text-white font-medium">
                      جديد
                    </span>
                  )}
                  {integration.isPopular && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                      شائع
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{integration.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{integration.description}</p>

              {integration.isConnected ? (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-green-400 text-sm">
                    <Check className="h-4 w-4" />
                    متصل
                  </span>
                  <button className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                    <Settings className="h-4 w-4" />
                    إعدادات
                  </button>
                </div>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 rounded-xl text-white font-medium transition-all">
                  <ExternalLink className="h-4 w-4" />
                  ربط
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
