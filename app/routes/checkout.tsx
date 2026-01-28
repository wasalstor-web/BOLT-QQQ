import { useState } from 'react';
import { motion } from 'framer-motion';
import type { MetaFunction } from '@remix-run/cloudflare';
import { Link, useSearchParams } from '@remix-run/react';
import { useRequireAuth } from '~/lib/auth/useAuth';
import { 
  CreditCard, Check, Shield, Lock, ArrowRight, Loader2,
  Sparkles, Zap, Building2, X, CheckCircle
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'إتمام الدفع - مبسط إديتر' }, { name: 'description', content: 'إتمام عملية الدفع' }];
};

const plans = {
  pro: {
    id: 'pro',
    name: 'الباقة الاحترافية',
    nameEn: 'Pro',
    price: 99,
    currency: 'SAR',
    currencySymbol: 'ر.س',
    interval: 'شهرياً',
    icon: Zap,
    color: 'from-purple-600 to-blue-600',
    features: [
      'مشاريع غير محدودة',
      '100GB تخزين سحابي',
      'دعم AI متقدم (Claude & GPT-4)',
      'نطاقات مخصصة',
      'دعم فني على مدار الساعة',
      'تصدير وتحميل المشاريع',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'باقة الشركات',
    nameEn: 'Enterprise',
    price: 299,
    currency: 'SAR',
    currencySymbol: 'ر.س',
    interval: 'شهرياً',
    icon: Building2,
    color: 'from-orange-500 to-red-600',
    features: [
      'كل مميزات Pro',
      'تخزين غير محدود',
      'فريق عمل غير محدود',
      'SSO وأمان متقدم',
      'مدير حساب مخصص',
      'SLA 99.9%',
      'تقارير وتحليلات متقدمة',
      'تكاملات API مخصصة',
    ],
  },
};

const paymentMethods = [
  { id: 'mada', name: 'مدى', icon: '/icons/mada.svg', popular: true },
  { id: 'visa', name: 'Visa', icon: '/icons/visa.svg' },
  { id: 'mastercard', name: 'MasterCard', icon: '/icons/mastercard.svg' },
  { id: 'applepay', name: 'Apple Pay', icon: '/icons/applepay.svg' },
  { id: 'stcpay', name: 'STC Pay', icon: '/icons/stcpay.svg' },
];

export default function CheckoutPage() {
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [searchParams] = useSearchParams();
  const planId = (searchParams.get('plan') as 'pro' | 'enterprise') || 'pro';
  const plan = plans[planId] || plans.pro;
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('mada');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

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

  const handleApplyCoupon = () => {
    // Demo coupon codes
    if (couponCode.toLowerCase() === 'welcome50') {
      setDiscount(50);
    } else if (couponCode.toLowerCase() === 'save20') {
      setDiscount(20);
    } else {
      setDiscount(0);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, this would call the MyFatoorah API
    // const myfatoorah = createMyFatoorahClient();
    // const payment = await createSubscriptionPayment(myfatoorah, planId, {...}, callbackUrl, errorUrl);
    // window.location.href = payment.Data.PaymentURL;
    
    setIsProcessing(false);
    setIsSuccess(true);
  };

  const finalPrice = plan.price - (plan.price * discount / 100);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-4">تم الدفع بنجاح! 🎉</h1>
          <p className="text-gray-400 mb-8">
            تم تفعيل اشتراكك في {plan.name}. يمكنك الآن الاستمتاع بجميع المميزات.
          </p>
          
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">الباقة</span>
              <span className="text-white font-semibold">{plan.name}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">المبلغ المدفوع</span>
              <span className="text-white font-semibold">{finalPrice} {plan.currencySymbol}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">رقم الفاتورة</span>
              <span className="text-white font-mono">INV-{Date.now()}</span>
            </div>
          </div>
          
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <span>الذهاب للوحة التحكم</span>
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">مبسط إديتر</span>
            </Link>
            
            <div className="flex items-center gap-2 text-gray-400">
              <Lock className="w-4 h-4" />
              <span className="text-sm">دفع آمن ومشفر</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Payment Form */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">إتمام الدفع</h1>
            <p className="text-gray-400 mb-8">أنت على بُعد خطوة واحدة من تفعيل اشتراكك</p>

            {/* Plan Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">الباقة المختارة</h2>
              <div className={`bg-gradient-to-r ${plan.color} p-[1px] rounded-2xl`}>
                <div className="bg-gray-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.color}`}>
                        <plan.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{plan.name}</h3>
                        <p className="text-gray-400 text-sm">{plan.nameEn}</p>
                      </div>
                    </div>
                    <Link 
                      to="/billing"
                      className="text-purple-400 text-sm hover:text-purple-300"
                    >
                      تغيير
                    </Link>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">{plan.currencySymbol}/{plan.interval}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">كود الخصم</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="أدخل كود الخصم"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  تطبيق
                </button>
              </div>
              {discount > 0 && (
                <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  تم تطبيق خصم {discount}%
                </p>
              )}
            </div>

            {/* Payment Methods */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">طريقة الدفع</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="h-8 mb-2 flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                      </div>
                      <span className="text-white text-sm">{method.name}</span>
                      {method.popular && (
                        <span className="block text-xs text-purple-400 mt-1">الأكثر استخداماً</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20 mb-8">
              <Shield className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-400 font-medium">دفع آمن 100%</p>
                <p className="text-gray-400 text-sm">جميع البيانات مشفرة ومحمية عبر بوابة ماي فاتورة</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-6">ملخص الطلب</h2>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-gray-400 text-sm mb-3">المميزات المشمولة:</h3>
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">السعر الأساسي</span>
                  <span className="text-white">{plan.price} {plan.currencySymbol}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex items-center justify-between text-green-400">
                    <span>الخصم ({discount}%)</span>
                    <span>-{(plan.price * discount / 100).toFixed(2)} {plan.currencySymbol}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">الضريبة (15%)</span>
                  <span className="text-white">{(finalPrice * 0.15).toFixed(2)} {plan.currencySymbol}</span>
                </div>
                
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">الإجمالي</span>
                    <span className="text-2xl font-bold text-white">
                      {(finalPrice * 1.15).toFixed(2)} {plan.currencySymbol}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">شامل الضريبة</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري المعالجة...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>إتمام الدفع</span>
                  </>
                )}
              </motion.button>

              <p className="text-center text-gray-500 text-xs mt-4">
                بالمتابعة، أنت توافق على{' '}
                <Link to="/terms" className="text-purple-400 hover:underline">
                  شروط الاستخدام
                </Link>{' '}
                و{' '}
                <Link to="/privacy" className="text-purple-400 hover:underline">
                  سياسة الخصوصية
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
