// Hook للمصادقة - يستخدم في مكونات React
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@remix-run/react';
import { getSupabase, getUserRole, type UserRole } from '~/lib/supabase/client';
import { getDashboardRoute } from './guard';

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

      const role = await getUserRole();

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.user_metadata?.full_name,
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

    // الاستماع لتغييرات المصادقة
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

  // تسجيل الخروج
  const signOut = async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // التوجيه للوحة التحكم المناسبة
  const goToDashboard = () => {
    const route = getDashboardRoute(user?.role || null);
    navigate(route);
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDeveloper: user?.role === 'developer',
    isClient: user?.role === 'client',
    signOut,
    goToDashboard,
    reload: loadUser,
  };
}

// Hook للتحقق من الصفحات المحمية
export function useRequireAuth(requiredRole?: UserRole) {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        const route = getDashboardRoute(user?.role || null);
        navigate(route);
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, navigate]);

  return { user, loading, isAuthenticated, signOut: async () => { const supabase = (await import('~/lib/supabase/client')).getSupabase(); await supabase.auth.signOut(); navigate('/login'); } };
}
