/*
 * Hook للمصادقة - يستخدم في مكونات React
 * P0 FIX: Demo Mode removed for production security
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@remix-run/react';
import { getSupabase, getUserRole, type UserRole } from '~/lib/supabase/client';
import { getDashboardRoute } from './guard';

// قائمة المشرفين
const ADMIN_EMAILS = [
  'wasal.stor@gmail.com', // المشرف الرئيسي
  'admin@mubasit.local',
  'wasalstor-web@users.noreply.github.com', // حساب GitHub الرئيسي
];

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    try {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUser(null);
        setLoading(false);

        return;
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setLoading(false);

        return;
      }

      // التحقق من الدور
      let role = await getUserRole();

      // إذا لم يوجد دور، تحقق من قائمة المشرفين
      const email = authUser.email?.toLowerCase() || '';

      if (!role || role === 'client') {
        if (ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email)) {
          role = 'admin';

          // حاول حفظ الدور في قاعدة البيانات
          try {
            await supabase.from('user_roles').upsert(
              {
                user_id: authUser.id,
                role: 'admin',
              },
              { onConflict: 'user_id' },
            );
          } catch (e) {
            console.error('Failed to save admin role:', e);
          }
        }
      }

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.user_metadata?.user_name,
        avatar: authUser.user_metadata?.avatar_url,
        role: role || 'client',
      });
    } catch (err) {
      console.error('Auth load error:', err);
      setError('فشل في تحميل بيانات المستخدم');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    if (typeof window !== 'undefined') {
      const supabase = getSupabase();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [loadUser]);

  const signOut = async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);

      // Still navigate to login on error
      navigate('/login');
    }
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDeveloper: user?.role === 'developer' || user?.role === 'admin',
    isClient: user?.role === 'client',
    isDemoMode: false, // P0 FIX: Demo mode disabled
    signOut,
    goToDashboard,
    reload: loadUser,
  };
}

export function useRequireAuth(requiredRole?: UserRole) {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        navigate('/login');
        return;
      }

      if (requiredRole && auth.user?.role !== requiredRole && auth.user?.role !== 'admin') {
        navigate('/dashboard');
      }
    }
  }, [auth.loading, auth.isAuthenticated, auth.user, requiredRole, navigate]);

  return {
    user: auth.user,
    loading: auth.loading,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
    isDeveloper: auth.isDeveloper,
    isClient: auth.isClient,
    isDemoMode: false, // P0 FIX: Demo mode disabled
    signOut: auth.signOut,
  };
}
