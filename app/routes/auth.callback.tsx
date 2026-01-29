import { useEffect, useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { getSupabase, getUserRole } from '~/lib/supabase/client';
import { getDashboardRoute } from '~/lib/auth';
import { motion } from 'framer-motion';

// قائمة المشرفين
const ADMIN_EMAILS = [
  'wasal.stor@gmail.com', // المشرف الرئيسي
  'admin@mubasit.local',
  'wasalstor-web@users.noreply.github.com', // حساب GitHub الرئيسي
];

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('جاري تسجيل الدخول...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabase();

        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          setMessage('جاري التحقق من الحساب...');

          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Session error:', error);
            setStatus('error');
            setMessage('فشل في تسجيل الدخول');
            setTimeout(() => navigate('/login?error=session_failed'), 2000);

            return;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setStatus('success');
          setMessage('تم تسجيل الدخول بنجاح!');

          // الحصول على بيانات المستخدم
          const {
            data: { user },
          } = await supabase.auth.getUser();
          const email = user?.email?.toLowerCase() || '';

          // التحقق من الدور
          let role = await getUserRole();

          // إذا لم يوجد دور، تحقق من قائمة المشرفين
          if (!role || role === 'client') {
            if (ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email)) {
              role = 'admin';

              // إضافة الدور في قاعدة البيانات
              if (user) {
                try {
                  await supabase.from('user_roles').upsert(
                    {
                      user_id: user.id,
                      role: 'admin',
                    },
                    { onConflict: 'user_id' },
                  );
                  console.log('✅ Admin role assigned');
                } catch (e) {
                  console.error('Failed to assign admin role:', e);
                }
              }
            }
          }

          const dashboardRoute = getDashboardRoute(role);
          setTimeout(() => navigate(dashboardRoute), 1500);
        } else {
          setStatus('error');
          setMessage('لم يتم العثور على جلسة');
          setTimeout(() => navigate('/login?error=no_session'), 2000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setMessage('حدث خطأ غير متوقع');
        setTimeout(() => navigate('/login?error=unknown'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center"
      dir="rtl"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center p-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-gray-800 shadow-2xl"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
          <span className="text-3xl font-bold text-white">م</span>
        </div>

        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 mx-auto">
              <svg className="animate-spin text-purple-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
            >
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto"
            >
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>
          )}
        </div>

        <motion.p
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={
            'text-lg font-medium ' +
            (status === 'success' ? 'text-green-400' : status === 'error' ? 'text-red-400' : 'text-gray-300')
          }
        >
          {message}
        </motion.p>

        {status === 'loading' && (
          <div className="mt-6 w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
