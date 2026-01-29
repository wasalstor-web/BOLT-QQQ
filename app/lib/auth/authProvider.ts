/**
 * 🔄 Auth Provider - مزود المصادقة للتطبيق
 * يتحقق من حالة المستخدم ويحدّث المخزن المركزي
 */

import { useEffect, useState } from 'react';
import { getSupabase, getUserRole } from '~/lib/supabase/client';
import { setUser, clearUser, userSession } from '~/lib/stores/userStore';
import { useStore } from '@nanostores/react';

// قائمة بريد المشرفين الافتراضيين
const ADMIN_EMAILS = [
  'wasal.stor@gmail.com', // المشرف الرئيسي
  'admin@mubasit.local',
  'wasalstor-web@users.noreply.github.com', // حساب GitHub الرئيسي
];

// تهيئة المستخدم عند بدء التطبيق
export async function initializeAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // التحقق من الوضع التجريبي
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';

    if (isDemoMode) {
      const role = (localStorage.getItem('demo_role') as 'admin' | 'client') || 'client';
      const userData = localStorage.getItem('demo_user');
      const parsed = userData ? JSON.parse(userData) : null;

      setUser(
        {
          id: parsed?.id || 'demo-user',
          email: parsed?.email || 'demo@local',
          name: parsed?.name || (role === 'admin' ? 'مشرف تجريبي' : 'عميل تجريبي'),
          role,
        },
        true,
      );

      return;
    }

    // التحقق من Supabase
    const supabase = getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      clearUser();
      return;
    }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      clearUser();
      return;
    }

    // التحقق من الدور في قاعدة البيانات أولاً
    let role = await getUserRole();

    // إذا لم يوجد دور، تحقق من قائمة المشرفين
    if (!role || role === 'client') {
      const email = authUser.email?.toLowerCase() || '';

      if (ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email)) {
        role = 'admin';

        // حاول إضافة الدور للقاعدة
        await ensureUserRole(authUser.id, 'admin');
      }
    }

    setUser({
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.user_metadata?.user_name,
      avatar: authUser.user_metadata?.avatar_url,
      role: role || 'client',
    });
  } catch (error) {
    console.error('Auth initialization error:', error);
    clearUser();
  }
}

// التأكد من وجود دور للمستخدم في قاعدة البيانات
async function ensureUserRole(userId: string, role: 'admin' | 'developer' | 'client') {
  try {
    const supabase = getSupabase();

    // التحقق إذا الدور موجود
    const { data: existing } = await supabase.from('user_roles').select('*').eq('user_id', userId).single();

    if (!existing) {
      // إضافة الدور
      await supabase.from('user_roles').insert({
        user_id: userId,
        role,
      });
      console.log('✅ User role added:', role);
    } else if (existing.role !== role && role === 'admin') {
      // ترقية للمشرف
      await supabase.from('user_roles').update({ role }).eq('user_id', userId);
      console.log('✅ User upgraded to admin');
    }
  } catch (error) {
    console.error('Error ensuring user role:', error);
  }
}

// Hook لاستخدام حالة المصادقة
export function useAuthState() {
  const session = useStore(userSession);

  useEffect(() => {
    if (session.loading) {
      initializeAuth();
    }
  }, []);

  return {
    ...session,
    isAdmin: session.user?.role === 'admin',
    isDeveloper: session.user?.role === 'admin' || session.user?.role === 'developer',
    isClient: session.user?.role === 'client',
  };
}

// تسجيل الخروج
export async function signOutUser() {
  try {
    // مسح الوضع التجريبي
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('demo_role');
      localStorage.removeItem('demo_user');
    }

    const supabase = getSupabase();
    await supabase.auth.signOut();
    clearUser();

    // توجيه لصفحة الدخول
    window.location.href = '/login';
  } catch (error) {
    console.error('Sign out error:', error);
    clearUser();
    window.location.href = '/login';
  }
}
