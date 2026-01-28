import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { useRequireAuth } from '~/lib/auth/useAuth';
import { 
  Bot, Send, ArrowLeft, Shield, Loader2, Settings, 
  Database, Users, FolderGit2, CreditCard, Activity,
  Sparkles, Terminal, Eye, Brain, Zap, History,
  Copy, Check, RefreshCw, Trash2, Download, Upload
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [{ title: 'وكيل الذكاء الاصطناعي - مبسط إديتر' }, { name: 'description', content: 'تحدث مع وكيل الذكاء الاصطناعي' }];
};

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  prompt: string;
  color: string;
}

const quickActions: QuickAction[] = [
  { id: 'users', label: 'تقرير المستخدمين', icon: Users, prompt: 'أريد تقريراً شاملاً عن المستخدمين المسجلين', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'projects', label: 'إحصائيات المشاريع', icon: FolderGit2, prompt: 'ما هي إحصائيات المشاريع النشطة؟', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'revenue', label: 'تحليل الإيرادات', icon: CreditCard, prompt: 'حلل الإيرادات للشهر الحالي', color: 'bg-green-500/20 text-green-400' },
  { id: 'system', label: 'حالة النظام', icon: Activity, prompt: 'ما هي حالة النظام الحالية؟', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'database', label: 'قاعدة البيانات', icon: Database, prompt: 'أظهر لي إحصائيات قاعدة البيانات', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'security', label: 'تقرير الأمان', icon: Shield, prompt: 'أريد تقريراً عن حالة الأمان', color: 'bg-red-500/20 text-red-400' },
];

const systemCapabilities = [
  { icon: Eye, label: 'الرؤية الحاسوبية', desc: 'تحليل الصور والشاشات' },
  { icon: Terminal, label: 'تنفيذ الأوامر', desc: 'تشغيل أوامر النظام' },
  { icon: Database, label: 'الوصول للبيانات', desc: 'قراءة وتحديث البيانات' },
  { icon: Brain, label: 'التحليل الذكي', desc: 'تحليل وتوقعات متقدمة' },
];

// Simulated AI responses
const aiResponses: Record<string, string> = {
  'users': `## تقرير المستخدمين 📊

### الإحصائيات العامة:
- **إجمالي المستخدمين:** 1,247 مستخدم
- **المستخدمون النشطون:** 856 (68.6%)
- **المستخدمون الجدد (هذا الشهر):** 127

### التوزيع حسب الباقة:
| الباقة | العدد | النسبة |
|--------|-------|--------|
| مجاني | 654 | 52.4% |
| Pro | 423 | 33.9% |
| Enterprise | 170 | 13.7% |

### التوصيات:
1. ✅ معدل التحويل من المجاني لـ Pro جيد (15.2%)
2. ⚠️ يوجد 45 مستخدم غير نشط منذ 30 يوم
3. 💡 إرسال حملة تسويقية للمستخدمين المجانيين`,

  'projects': `## إحصائيات المشاريع 🚀

### النظرة العامة:
- **إجمالي المشاريع:** 2,456 مشروع
- **المشاريع النشطة:** 1,823 (74.2%)
- **المشاريع المنشورة:** 1,234 (50.2%)

### أكثر التقنيات استخداماً:
1. **React** - 45.2%
2. **Next.js** - 28.7%
3. **Vue.js** - 15.3%
4. **Svelte** - 10.8%

### استخدام الموارد:
- CPU: 67% متوسط
- Memory: 4.2GB من 8GB
- Storage: 234GB من 500GB`,

  'revenue': `## تحليل الإيرادات 💰

### الشهر الحالي:
- **إجمالي الإيرادات:** 45,200 ر.س
- **النمو عن الشهر السابق:** +23.1%

### مصادر الإيرادات:
| المصدر | المبلغ | النسبة |
|--------|--------|--------|
| اشتراكات Pro | 28,500 ر.س | 63.1% |
| اشتراكات Enterprise | 15,200 ر.س | 33.6% |
| خدمات إضافية | 1,500 ر.س | 3.3% |

### التوقعات:
- الربع القادم: 150,000 ر.س (متوقع)
- النمو السنوي: 45% (متوقع)`,

  'system': `## حالة النظام ⚡

### الخدمات:
| الخدمة | الحالة | Uptime |
|--------|--------|--------|
| API Server | 🟢 يعمل | 99.9% |
| Database | 🟢 يعمل | 99.8% |
| CDN | 🟢 يعمل | 100% |
| AI Services | 🟡 بطيء | 95.2% |

### الأداء:
- **Response Time:** 124ms متوسط
- **Error Rate:** 0.02%
- **Active Connections:** 234

### التنبيهات:
⚠️ خدمات AI تحتاج تحسين - استهلاك GPU عالي`,

  'database': `## إحصائيات قاعدة البيانات 🗄️

### المعلومات العامة:
- **نوع القاعدة:** PostgreSQL 15
- **الحجم الكلي:** 12.4 GB
- **عدد الجداول:** 24 جدول

### أكبر الجداول:
1. **projects** - 4.2 GB (890,000 صف)
2. **files** - 3.1 GB (2.1M صف)
3. **users** - 234 MB (1,247 صف)
4. **sessions** - 156 MB (45,000 صف)

### الأداء:
- **Queries/sec:** 1,234
- **Cache Hit Ratio:** 98.7%
- **Active Connections:** 45/100`,

  'security': `## تقرير الأمان 🔒

### نظرة عامة:
- **حالة الأمان:** جيدة ✅
- **آخر فحص:** منذ ساعتين

### محاولات الدخول:
- **ناجحة:** 12,456 (الأسبوع الماضي)
- **فاشلة:** 234 (تم حظر 12 IP)

### الثغرات:
| الأولوية | العدد | الحالة |
|----------|-------|--------|
| حرجة | 0 | ✅ |
| عالية | 2 | 🔄 قيد الإصلاح |
| متوسطة | 5 | 📋 مجدولة |

### التوصيات:
1. تحديث SSL certificates (تنتهي خلال 30 يوم)
2. تفعيل 2FA للمشرفين المتبقين (3 مشرفين)`,
};

export default function AdminAgentPage() {
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'مرحباً! أنا وكيل الذكاء الاصطناعي الخاص بك. يمكنني مساعدتك في:\n\n- 📊 تحليل البيانات والتقارير\n- 👥 إدارة المستخدمين\n- 💰 تحليل الإيرادات\n- 🔧 مراقبة النظام\n- 🔒 تقارير الأمان\n\nكيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">غير مصرح</h1>
          <p className="text-gray-400 mb-6">ليس لديك صلاحية الوصول لهذه الصفحة</p>
          <Link to="/dashboard" className="px-6 py-3 bg-purple-600 text-white rounded-xl">
            العودة للوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI thinking
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    // Simulate response delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Find matching response
    let response = 'أنا أفهم طلبك. دعني أحلل البيانات وأعود إليك بتقرير مفصل.\n\n_جاري معالجة الطلب..._';
    
    for (const [key, value] of Object.entries(aiResponses)) {
      if (messageText.includes(key) || quickActions.find(a => a.id === key && messageText.includes(a.label))) {
        response = value;
        break;
      }
    }

    // Check for keywords
    if (messageText.includes('مستخدم') || messageText.includes('المستخدمين')) {
      response = aiResponses.users;
    } else if (messageText.includes('مشروع') || messageText.includes('المشاريع')) {
      response = aiResponses.projects;
    } else if (messageText.includes('إيراد') || messageText.includes('الإيرادات') || messageText.includes('دخل')) {
      response = aiResponses.revenue;
    } else if (messageText.includes('نظام') || messageText.includes('حالة')) {
      response = aiResponses.system;
    } else if (messageText.includes('بيانات') || messageText.includes('قاعدة')) {
      response = aiResponses.database;
    } else if (messageText.includes('أمان') || messageText.includes('حماية')) {
      response = aiResponses.security;
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => prev.filter(m => m.id !== 'typing').concat(assistantMessage));
    setIsLoading(false);
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSend(action.prompt);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: 'تم مسح المحادثة. كيف يمكنني مساعدتك؟',
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  وكيل الذكاء الاصطناعي
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </h1>
                <p className="text-gray-400 text-sm">مساعدك الذكي لإدارة النظام</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleClear}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                title="مسح المحادثة"
              >
                <Trash2 className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors" title="السجل">
                <History className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors" title="الإعدادات">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="hidden lg:block w-80 border-l border-white/10 p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">قدرات الوكيل</h3>
            <div className="space-y-3">
              {systemCapabilities.map((cap) => (
                <div key={cap.label} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <cap.icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm">{cap.label}</p>
                    <p className="text-gray-500 text-xs">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-4">إجراءات سريعة</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-right"
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-white text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-2xl ${
                    message.role === 'user' 
                      ? 'bg-purple-600/20 border border-purple-500/30' 
                      : 'bg-white/5 border border-white/10'
                  } rounded-2xl p-4`}>
                    {message.isTyping ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        <span className="text-gray-400">جاري التفكير...</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          {message.role === 'assistant' ? (
                            <Bot className="w-4 h-4 text-purple-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-purple-600" />
                          )}
                          <span className="text-gray-400 text-xs">
                            {message.role === 'assistant' ? 'الوكيل' : 'أنت'}
                          </span>
                          <span className="text-gray-600 text-xs">
                            {message.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-white whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                          {message.content}
                        </div>
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                            <button
                              onClick={() => handleCopy(message.content, message.id)}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              {copiedId === message.id ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                              <RefreshCw className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (Mobile) */}
          <div className="lg:hidden px-6 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickActions.slice(0, 4).map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap ${action.color}`}
                >
                  <action.icon className="w-4 h-4" />
                  <span className="text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-6 border-t border-white/10">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-3"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </motion.button>
            </form>
            <p className="text-center text-gray-500 text-xs mt-3">
              وكيل الذكاء الاصطناعي يمكنه الوصول لجميع بيانات النظام وتنفيذ المهام
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
