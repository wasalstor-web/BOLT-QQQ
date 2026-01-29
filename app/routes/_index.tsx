import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Link } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { cn } from '~/lib/utils';
import {
  Sparkles,
  Zap,
  Code2,
  Globe,
  Palette,
  Rocket,
  Shield,
  Star,
  Play,
  Check,
  ArrowLeft,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    { title: 'مبسط إديتر - أنشئ موقعك بالذكاء الاصطناعي' },
    { name: 'description', content: 'صف فكرتك بالعربية، ودع الذكاء الاصطناعي يحولها إلى موقع ويب احترافي كامل' },
  ];
};

// ============ Animation Hooks ============
function useCounter(end: number, duration: number = 2000, trigger: boolean = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) {
      return;
    }

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) {
        startTime = currentTime;
      }

      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, trigger]);

  return count;
}

function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);

    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return position;
}

// ============ 3D Components ============

// Floating Orbs with Parallax
function FloatingOrbs() {
  const mousePosition = useMousePosition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const orbs = [
    { size: 400, color: 'from-purple-500/30 to-purple-900/10', x: '10%', y: '20%', parallax: 0.02 },
    { size: 300, color: 'from-blue-500/20 to-cyan-900/10', x: '80%', y: '30%', parallax: 0.03 },
    { size: 350, color: 'from-pink-500/25 to-rose-900/10', x: '50%', y: '70%', parallax: 0.025 },
    { size: 200, color: 'from-violet-500/20 to-indigo-900/10', x: '20%', y: '80%', parallax: 0.04 },
    { size: 250, color: 'from-cyan-500/15 to-blue-900/10', x: '70%', y: '60%', parallax: 0.015 },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={cn('absolute rounded-full blur-3xl bg-gradient-to-br', orb.color)}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            x: (mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * orb.parallax,
            y: (mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) * orb.parallax,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Animated Grid Background
function GridBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <svg className="absolute inset-0 w-full h-full">
        <motion.line
          x1="0%"
          y1="30%"
          x2="100%"
          y2="30%"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <motion.line
          x1="60%"
          y1="0%"
          x2="60%"
          y2="100%"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: 1 }}
        />
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.5)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// 3D Card Component with Tilt Effect
function Card3D({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={cn('relative', className)}
    >
      <motion.div
        className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 blur-xl"
        animate={{ opacity: isHovered ? 0.4 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-xl overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-0"
          style={{
            background:
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
          }}
          animate={{
            x: isHovered ? ['0%', '200%'] : '0%',
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {children}
      </div>
    </motion.div>
  );
}

// Animated Counter Component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCounter(value, 2000, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

// Typing Animation Component
function TypingAnimation({ texts }: { texts: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[currentIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentText.length) {
            setDisplayText(currentText.slice(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex((prev) => (prev + 1) % texts.length);
          }
        }
      },
      isDeleting ? 50 : 100,
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex, texts]);

  return (
    <span className="inline-block min-w-[200px] text-right">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-[3px] h-[1em] bg-purple-400 mr-1 align-middle"
      />
    </span>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card3D className="h-full">
        <div className="p-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 mb-4">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
      </Card3D>
    </motion.div>
  );
}

// Pricing Card Component
function PricingCard({
  name,
  price,
  period,
  features,
  isPopular = false,
  ctaText = 'ابدأ الآن',
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  ctaText?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn('relative', isPopular && 'scale-105 z-10')}
    >
      <Card3D>
        <div className="p-8">
          {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                الأكثر شعبية
              </span>
            </div>
          )}

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {price}
              </span>
              <span className="text-gray-500">{period}</span>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <Check className="h-5 w-5 text-purple-400 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/login"
            className={cn(
              'block w-full py-3 rounded-xl font-medium text-center transition-all',
              isPopular
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02]'
                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20',
            )}
          >
            {ctaText}
          </Link>
        </div>
      </Card3D>
    </motion.div>
  );
}

// Testimonial Card
function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  delay = 0,
}: {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card3D>
        <div className="p-6">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-gray-300 leading-relaxed mb-6">"{quote}"</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {avatar}
            </div>
            <div>
              <p className="font-medium text-white">{author}</p>
              <p className="text-sm text-gray-500">{role}</p>
            </div>
          </div>
        </div>
      </Card3D>
    </motion.div>
  );
}

// ============ Main Component ============
export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'ذكاء اصطناعي متقدم',
      description: 'نماذج AI متطورة تفهم متطلباتك بالعربية وتحولها لكود احترافي',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'سرعة فائقة',
      description: 'أنشئ موقعك في دقائق معدودة بدلاً من أسابيع من البرمجة',
    },
    {
      icon: <Code2 className="h-6 w-6" />,
      title: 'كود نظيف',
      description: 'كود احترافي قابل للتعديل والتصدير بأي وقت',
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'نشر فوري',
      description: 'انشر موقعك مباشرة على الإنترنت بضغطة زر واحدة',
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: 'تصاميم عصرية',
      description: 'تصاميم متجاوبة وعصرية تناسب جميع الأجهزة',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'أمان متكامل',
      description: 'حماية متقدمة لموقعك وبياناتك مع شهادة SSL مجانية',
    },
  ];

  const testimonials = [
    {
      quote: 'أفضل أداة لبناء المواقع استخدمتها. وفرت علي أسابيع من العمل!',
      author: 'محمد أحمد',
      role: 'رائد أعمال',
      avatar: 'م',
    },
    {
      quote: 'الذكاء الاصطناعي فهم بالضبط ما أريده وأنشأ موقعاً مذهلاً',
      author: 'سارة العلي',
      role: 'مصممة',
      avatar: 'س',
    },
    { quote: 'حولت فكرتي لموقع متكامل في 10 دقائق. لا يصدق!', author: 'خالد المطيري', role: 'مطور', avatar: 'خ' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden" dir="rtl">
      <FloatingOrbs />
      <GridBackground />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled && 'bg-gray-950/80 backdrop-blur-xl border-b border-white/5',
        )}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30"
              >
                <Sparkles className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                مبسط
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                المميزات
              </a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                الأسعار
              </a>
              <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">
                آراء العملاء
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors font-medium">
                تسجيل الدخول
              </Link>
              <Link
                to="/login"
                className="group px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50 hover:scale-105 flex items-center gap-2"
              >
                ابدأ مجاناً
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-gray-950/95 backdrop-blur-xl"
            >
              <div className="px-6 py-4 space-y-4">
                <a href="#features" className="block text-gray-300 hover:text-white">
                  المميزات
                </a>
                <a href="#pricing" className="block text-gray-300 hover:text-white">
                  الأسعار
                </a>
                <a href="#testimonials" className="block text-gray-300 hover:text-white">
                  آراء العملاء
                </a>
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <Link to="/login" className="block text-center py-2.5 text-gray-300">
                    جرب الآن
                  </Link>
                  <Link
                    to="/login"
                    className="block text-center py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium"
                  >
                    ابدأ مجاناً
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              الجيل الجديد من بناء المواقع
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              أنشئ
            </span>{' '}
            <TypingAnimation texts={['متجرك', 'موقعك', 'مدونتك', 'محفظتك']} />
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              بالذكاء الاصطناعي
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            صف فكرتك بالعربية، ودع الذكاء الاصطناعي يحولها إلى موقع ويب احترافي كامل
            <br className="hidden md:block" />
            <span className="text-purple-300">في دقائق معدودة. بدون أي خبرة برمجية.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              to="/login"
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/30 transition-all hover:shadow-purple-500/50 hover:scale-105 flex items-center gap-3"
            >
              <Rocket className="h-5 w-5" />
              ابدأ الإنشاء مجاناً
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <a
              href="#demo"
              className="group px-8 py-4 border border-white/20 hover:border-purple-500/50 rounded-2xl font-medium text-gray-300 hover:text-white transition-all hover:bg-white/5 flex items-center gap-3"
            >
              <Play className="h-5 w-5" />
              شاهد العرض التوضيحي
            </a>
          </motion.div>

          {/* Browser Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            style={{ perspective: 1000 }}
            className="max-w-5xl mx-auto"
          >
            <Card3D className="w-full">
              <div className="bg-gray-900">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 text-gray-400 text-sm">
                      <Shield className="h-4 w-4 text-green-400" />
                      <span>mubasit-editor.app</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 aspect-video bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="h-full rounded-xl bg-gray-950/50 border border-white/5 flex">
                    <div className="w-16 border-l border-white/5 p-3 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          className={cn('w-10 h-10 rounded-lg', i === 0 ? 'bg-purple-500/30' : 'bg-white/5')}
                        />
                      ))}
                    </div>

                    <div className="flex-1 p-6">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="mb-4"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="h-3 w-24 bg-white/20 rounded" />
                            <div className="h-2 w-16 bg-white/10 rounded mt-1" />
                          </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-xl p-4 border border-white/5">
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="text-gray-300 text-sm"
                          >
                            أنشئ لي موقع لمطعم عربي فاخر مع قائمة طعام وحجز طاولات...
                          </motion.p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.5 }}
                        className="flex items-center gap-2 text-green-400 text-sm"
                      >
                        <Check className="h-5 w-5" />
                        <span>جاري إنشاء الموقع...</span>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full"
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </Card3D>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 5000, suffix: '+', label: 'مشروع تم إنشاؤه' },
              { value: 1200, suffix: '+', label: 'مستخدم نشط' },
              { value: 99, suffix: '%', label: 'رضا العملاء' },
              { value: 24, suffix: '/7', label: 'دعم فني' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-gray-400 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                لماذا مبسط إديتر؟
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              كل ما تحتاجه لإنشاء مواقع احترافية بدون كتابة سطر واحد من الكود
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="relative z-10 px-6 py-24 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                أسعار بسيطة وشفافة
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              اختر الباقة التي تناسب احتياجاتك. يمكنك الترقية في أي وقت
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="مجاني"
              price="$0"
              period="/شهرياً"
              features={['3 مشاريع', '1GB مساحة تخزين', 'نطاق فرعي مجاني', 'دعم المجتمع']}
              ctaText="ابدأ مجاناً"
            />
            <PricingCard
              name="احترافي"
              price="$19"
              period="/شهرياً"
              features={[
                'مشاريع غير محدودة',
                '50GB مساحة تخزين',
                'نطاق مخصص',
                'دعم أولوية',
                'تحليلات متقدمة',
                'إزالة العلامة المائية',
              ]}
              isPopular
            />
            <PricingCard
              name="المؤسسات"
              price="$49"
              period="/شهرياً"
              features={[
                'كل مميزات الاحترافي',
                'مساحة غير محدودة',
                'API كامل',
                'SLA مضمون',
                'مدير حساب مخصص',
                'تدريب الفريق',
              ]}
              ctaText="تواصل معنا"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ماذا يقول عملاؤنا
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard
                key={i}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                avatar={testimonial.avatar}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <Card3D>
            <div className="p-12 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">مستعد لإنشاء موقعك؟</h2>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                  انضم لآلاف المستخدمين الذين يبنون مواقعهم بالذكاء الاصطناعي
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/30 transition-all hover:shadow-purple-500/50 hover:scale-105"
                >
                  <Rocket className="h-5 w-5" />
                  ابدأ الآن مجاناً
                </Link>
              </motion.div>
            </div>
          </Card3D>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">مبسط إديتر</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>

            <p className="text-gray-500 text-sm">© 2025 مبسط إديتر. جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
