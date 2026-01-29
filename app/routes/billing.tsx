import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { useRequireAuth } from '~/lib/auth/useAuth';
import { DashboardLayout } from '~/components/layout/dashboard-layout';
import { DashboardHeader } from '~/components/layout/sidebar';
import { CreditCard, Check, Sparkles, Zap, Star, Crown, Download, Calendar, Receipt, Loader2 } from 'lucide-react';

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
    price: 99,
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
    price: 299,
    description: 'للشركات الكبيرة',
    icon: Crown,
    color: 'yellow',
    features: ['كل مميزات الاحترافي', 'SSO ومصادقة مخصصة', 'SLA مضمون', 'دعم مخصص 24/7', 'تخصيص كامل', 'API متقدمة'],
  },
];

export default function BillingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [currentPlan] = useState('free');

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

  return (
    <DashboardLayout
      user={{
        name: user.name || user.email?.split('@')[0] || 'المستخدم',
        email: user.email || '',
        avatar: user.avatar,
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
                  <span className="text-3xl font-bold text-white">{plan.price} ر.س</span>
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

          <div className="text-center py-8 text-gray-400">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لم تتم إضافة طريقة دفع بعد</p>
            <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white text-sm transition-colors">
              إضافة بطاقة دفع
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
