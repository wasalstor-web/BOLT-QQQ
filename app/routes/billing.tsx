import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { getUser } from '~/lib/supabase/client';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import { CreditCard, Check, Sparkles, Zap, Star, Crown, Download, ExternalLink, Calendar, Receipt } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'الفوترة - مبسط إديتر' }, { name: 'description', content: 'إدارة اشتراكك والفواتير' }];
};

const plans = [
  {
    id: 'free',
    name: 'مجاني',
    price: 0,
    description: 'للمبتدئين والمشاريع الصغيرة',
    icon: Zap,
    color: 'gray',
    features: ['3 مشاريع', '500 رسالة AI شهرياً', 'نشر على نطاق فرعي', 'دعم مجتمعي'],
  },
  {
    id: 'pro',
    name: 'احترافي',
    price: 29,
    description: 'للمحترفين والفرق الصغيرة',
    icon: Star,
    color: 'purple',
    popular: true,
    features: [
      'مشاريع غير محدودة',
      'رسائل AI غير محدودة',
      'نطاق مخصص',
      'تحليلات متقدمة',
      'دعم أولوي',
      'تكاملات متقدمة',
    ],
  },
  {
    id: 'enterprise',
    name: 'مؤسسات',
    price: 99,
    description: 'للشركات الكبيرة',
    icon: Crown,
    color: 'yellow',
    features: ['كل مميزات الاحترافي', 'SSO ومصادقة مخصصة', 'SLA مضمون', 'دعم مخصص 24/7', 'تخصيص كامل', 'API متقدمة'],
  },
];

const invoices = [
  { id: 'INV-001', date: '2025-01-01', amount: 29, status: 'paid' },
  { id: 'INV-002', date: '2024-12-01', amount: 29, status: 'paid' },
  { id: 'INV-003', date: '2024-11-01', amount: 29, status: 'paid' },
];

export default function BillingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan] = useState('free');

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
        setUser(currentUser || { email: 'demo@example.com', user_metadata: { name: 'مستخدم تجريبي' } });
      } catch (err) {
        console.error('Billing error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

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
        <DashboardHeader title="الفوترة والاشتراك" subtitle="إدارة خطتك والمدفوعات" />

        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">خطتك الحالية: مجاني</h3>
                <p className="text-gray-400 text-sm">3 مشاريع • 500 رسالة AI شهرياً</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
              ترقية الآن
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <h3 className="text-lg font-semibold text-white mb-6">الخطط المتاحة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => {
            const PlanIcon = plan.icon;
            const isCurrentPlan = plan.id === currentPlan;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white/5 backdrop-blur-xl rounded-2xl border p-6 transition-all ${
                  plan.popular
                    ? 'border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'border-white/10 hover:border-purple-500/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-xs text-white font-medium">
                      الأكثر شعبية
                    </span>
                  </div>
                )}

                <div
                  className={`p-3 rounded-xl w-fit mb-4 ${
                    plan.color === 'purple'
                      ? 'bg-purple-500/20 text-purple-400'
                      : plan.color === 'yellow'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  <PlanIcon className="h-6 w-6" />
                </div>

                <h4 className="text-xl font-bold text-white mb-1">{plan.name}</h4>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">/شهرياً</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check
                        className={`h-4 w-4 ${
                          plan.color === 'purple'
                            ? 'text-purple-400'
                            : plan.color === 'yellow'
                              ? 'text-yellow-400'
                              : 'text-gray-400'
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-2.5 rounded-xl font-medium transition-all ${
                    isCurrentPlan
                      ? 'bg-white/10 text-gray-400 cursor-default'
                      : plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'الخطة الحالية' : 'اختيار الخطة'}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">طريقة الدفع</h3>
            <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">إضافة بطاقة</button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">•••• •••• •••• 4242</p>
              <p className="text-gray-400 text-sm">تنتهي 12/2026</p>
            </div>
            <button className="text-gray-400 hover:text-white text-sm transition-colors">تعديل</button>
          </div>
        </motion.div>

        {/* Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">الفواتير</h3>
            <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors">
              <Download className="h-4 w-4" />
              تحميل الكل
            </button>
          </div>

          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-500/20 rounded-lg">
                    <Receipt className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{invoice.id}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(invoice.date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-white font-medium">${invoice.amount}</span>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">مدفوعة</span>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
