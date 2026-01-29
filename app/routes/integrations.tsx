import { useState } from 'react';
import { motion } from 'framer-motion';
import type { MetaFunction } from '@remix-run/cloudflare';
import { useRequireAuth } from '~/lib/auth/useAuth';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import {
  Puzzle,
  GitBranch,
  Cloud,
  Database,
  Zap,
  Link2,
  Check,
  X,
  ExternalLink,
  Settings,
  Loader2,
  Search,
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'التكاملات - مبسط إديتر' }, { name: 'description', content: 'إدارة التكاملات والخدمات الخارجية' }];
};

interface Integration {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: 'hosting' | 'database' | 'git' | 'ai' | 'analytics';
  connected: boolean;
  popular?: boolean;
}

const integrations: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    nameEn: 'GitHub',
    description: 'ربط مستودعات GitHub لنشر التطبيقات',
    icon: GitBranch,
    color: 'from-gray-600 to-gray-800',
    category: 'git',
    connected: true,
    popular: true,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    nameEn: 'Vercel',
    description: 'نشر تطبيقات الويب على Vercel',
    icon: Cloud,
    color: 'from-black to-gray-800',
    category: 'hosting',
    connected: false,
    popular: true,
  },
  {
    id: 'netlify',
    name: 'Netlify',
    nameEn: 'Netlify',
    description: 'استضافة ونشر المواقع الثابتة',
    icon: Cloud,
    color: 'from-teal-500 to-teal-700',
    category: 'hosting',
    connected: false,
  },
  {
    id: 'supabase',
    name: 'Supabase',
    nameEn: 'Supabase',
    description: 'قاعدة بيانات PostgreSQL مع مصادقة',
    icon: Database,
    color: 'from-green-500 to-emerald-700',
    category: 'database',
    connected: true,
    popular: true,
  },
  {
    id: 'firebase',
    name: 'Firebase',
    nameEn: 'Firebase',
    description: 'خدمات Google السحابية للتطبيقات',
    icon: Database,
    color: 'from-orange-500 to-yellow-600',
    category: 'database',
    connected: false,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    nameEn: 'OpenAI',
    description: 'دمج GPT-4 وDALL-E في تطبيقاتك',
    icon: Zap,
    color: 'from-teal-400 to-green-600',
    category: 'ai',
    connected: true,
    popular: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    nameEn: 'Anthropic',
    description: 'استخدام Claude للذكاء الاصطناعي',
    icon: Zap,
    color: 'from-orange-400 to-red-600',
    category: 'ai',
    connected: false,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    nameEn: 'Cloudflare',
    description: 'CDN وحماية وWorkers',
    icon: Cloud,
    color: 'from-orange-500 to-orange-700',
    category: 'hosting',
    connected: true,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    nameEn: 'Stripe',
    description: 'معالجة المدفوعات العالمية',
    icon: Link2,
    color: 'from-purple-500 to-indigo-700',
    category: 'analytics',
    connected: false,
    popular: true,
  },
  {
    id: 'myfatoorah',
    name: 'ماي فاتورة',
    nameEn: 'MyFatoorah',
    description: 'بوابة دفع عربية للخليج',
    icon: Link2,
    color: 'from-blue-500 to-blue-700',
    category: 'analytics',
    connected: false,
    popular: true,
  },
];

const categories = [
  { id: 'all', name: 'الكل', icon: Puzzle },
  { id: 'hosting', name: 'الاستضافة', icon: Cloud },
  { id: 'database', name: 'قواعد البيانات', icon: Database },
  { id: 'git', name: 'Git', icon: GitBranch },
  { id: 'ai', name: 'الذكاء الاصطناعي', icon: Zap },
  { id: 'analytics', name: 'الدفع والتحليلات', icon: Link2 },
];

export default function IntegrationsPage() {
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [integrationsState, setIntegrationsState] = useState(integrations);

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

  const filteredIntegrations = integrationsState.filter((integration) => {
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory;
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  const handleToggleConnection = (id: string) => {
    setIntegrationsState((prev) => prev.map((int) => (int.id === id ? { ...int, connected: !int.connected } : int)));
  };

  const connectedCount = integrationsState.filter((i) => i.connected).length;

  return (
    <DashboardLayout
      user={{
        name: user.name || user.email?.split('@')[0] || 'المستخدم',
        email: user.email || '',
        avatar: user.avatar,
      }}
    >
      <div className="p-6 lg:p-8" dir="rtl">
        <DashboardHeader title="التكاملات" subtitle="ربط خدماتك المفضلة" />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
          >
            <div className="p-2 rounded-lg w-fit mb-3 bg-purple-500/20">
              <Puzzle className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">إجمالي التكاملات</p>
            <span className="text-2xl font-bold text-white">{integrationsState.length}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
          >
            <div className="p-2 rounded-lg w-fit mb-3 bg-green-500/20">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">متصلة</p>
            <span className="text-2xl font-bold text-white">{connectedCount}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
          >
            <div className="p-2 rounded-lg w-fit mb-3 bg-yellow-500/20">
              <X className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">غير متصلة</p>
            <span className="text-2xl font-bold text-white">{integrationsState.length - connectedCount}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5"
          >
            <div className="p-2 rounded-lg w-fit mb-3 bg-blue-500/20">
              <Zap className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">الأكثر شعبية</p>
            <span className="text-2xl font-bold text-white">{integrationsState.filter((i) => i.popular).length}</span>
          </motion.div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                activeCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن تكامل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white placeholder-gray-500"
          />
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${integration.color}`}>
                  <integration.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  {integration.popular && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">شائع</span>
                  )}
                  {integration.connected && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      متصل
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{integration.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{integration.description}</p>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleToggleConnection(integration.id)}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    integration.connected
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {integration.connected ? 'فصل' : 'ربط'}
                </motion.button>

                {integration.connected && (
                  <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <Settings className="w-5 h-5 text-gray-400" />
                  </button>
                )}

                <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Puzzle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد تكاملات</h3>
            <p className="text-gray-400">لم يتم العثور على تكاملات تطابق بحثك</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
