import { useState } from 'react';
import { useNavigate, Link } from '@remix-run/react';
import { motion } from 'framer-motion';
import type { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [
    { title: 'القوالب الجاهزة - مبسط إديتر' },
    { name: 'description', content: 'اختر من بين مئات القوالب الاحترافية' },
  ];
};

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  popular: boolean;
  new: boolean;
}

const templates: Template[] = [
  {
    id: 'store-1',
    name: 'متجر إلكتروني عصري',
    description: 'قالب متجر إلكتروني متكامل مع سلة تسوق ونظام دفع',
    category: 'متاجر',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    popular: true,
    new: false,
  },
  {
    id: 'store-2',
    name: 'متجر أزياء',
    description: 'قالب أنيق لمتاجر الملابس والأزياء',
    category: 'متاجر',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    popular: true,
    new: true,
  },
  {
    id: 'company-1',
    name: 'شركة تقنية',
    description: 'موقع احترافي لشركات التقنية والبرمجيات',
    category: 'شركات',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    popular: true,
    new: false,
  },
  {
    id: 'company-2',
    name: 'وكالة تسويق',
    description: 'قالب ديناميكي لوكالات التسويق والإعلان',
    category: 'شركات',
    image: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=300&fit=crop',
    popular: false,
    new: true,
  },
  {
    id: 'personal-1',
    name: 'ملف شخصي',
    description: 'صفحة شخصية احترافية لعرض أعمالك',
    category: 'شخصي',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&h=300&fit=crop',
    popular: true,
    new: false,
  },
  {
    id: 'personal-2',
    name: 'مدونة شخصية',
    description: 'قالب مدونة عصري مع دعم RTL كامل',
    category: 'شخصي',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop',
    popular: false,
    new: false,
  },
  {
    id: 'restaurant-1',
    name: 'مطعم فاخر',
    description: 'قالب أنيق للمطاعم مع قائمة طعام تفاعلية',
    category: 'مطاعم',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    popular: true,
    new: false,
  },
  {
    id: 'restaurant-2',
    name: 'كافيه عصري',
    description: 'قالب مميز للكافيهات والمقاهي',
    category: 'مطاعم',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    popular: false,
    new: true,
  },
];

const categories = [
  { id: 'all', name: 'الكل', icon: '🎨' },
  { id: 'متاجر', name: 'متاجر', icon: '🛒' },
  { id: 'شركات', name: 'شركات', icon: '🏢' },
  { id: 'شخصي', name: 'شخصي', icon: '👤' },
  { id: 'مطاعم', name: 'مطاعم', icon: '🍽️' },
];

export default function Templates() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (templateId: string) => {
    // Navigate to editor with template
    navigate(`/?template=${templateId}`);
  };

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
              <h1 className="text-xl font-bold">القوالب الجاهزة</h1>
              <p className="text-sm text-gray-500">اختر قالباً وابدأ البناء فوراً</p>
            </div>
          </div>

          <Link
            to="/editor"
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>ابدأ من الصفر</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          {/* Search */}
          <div className="flex-1 relative">
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في القوالب..."
              className="w-full bg-slate-900/50 border border-gray-800 rounded-xl pr-12 pl-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-slate-900/50 border border-gray-800/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

                {/* Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {template.popular && (
                    <span className="px-2 py-1 bg-yellow-500/90 text-yellow-900 text-xs font-medium rounded-lg">
                      ⭐ شائع
                    </span>
                  )}
                  {template.new && (
                    <span className="px-2 py-1 bg-green-500/90 text-green-900 text-xs font-medium rounded-lg">
                      ✨ جديد
                    </span>
                  )}
                </div>

                {/* Overlay Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                  <button className="p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl transition-colors">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-sm font-medium transition-colors"
                  >
                    استخدام القالب
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <span className="text-xs text-gray-500 bg-slate-800 px-2 py-1 rounded">{template.category}</span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{template.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد نتائج</h3>
            <p className="text-gray-500">جرب البحث بكلمات مختلفة أو اختر فئة أخرى</p>
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-4">لم تجد ما تبحث عنه؟</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              ابدأ من الصفر واستخدم الذكاء الاصطناعي لبناء موقعك المثالي. فقط صف ما تريد وسنقوم ببنائه لك!
            </p>
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>ابدأ مشروعاً جديداً</span>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
