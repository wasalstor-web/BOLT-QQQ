// نظام حماية الصفحات والتحقق من المصادقة
import { getSupabase, getUserRole, type UserRole } from '~/lib/supabase/client';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  role: UserRole | null;
}

export interface AuthGuardResult {
  allowed: boolean;
  redirect?: string;
  user?: any;
  role?: UserRole;
}

// التحقق من المصادقة
export async function checkAuth(): Promise<AuthState> {
  try {
    if (typeof window === 'undefined') {
      return { isAuthenticated: false, isLoading: false, user: null, role: null };
    }

    const supabase = getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { isAuthenticated: false, isLoading: false, user: null, role: null };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const role = await getUserRole();

    return {
      isAuthenticated: true,
      isLoading: false,
      user,
      role,
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return { isAuthenticated: false, isLoading: false, user: null, role: null };
  }
}

// حارس الصفحات المحمية
export async function requireAuth(requiredRole?: UserRole): Promise<AuthGuardResult> {
  const authState = await checkAuth();

  if (!authState.isAuthenticated) {
    return { allowed: false, redirect: '/login' };
  }

  if (requiredRole && authState.role !== requiredRole) {
    // توجيه حسب الدور
    if (authState.role === 'admin') {
      return { allowed: false, redirect: '/dashboard/admin' };
    } else {
      return { allowed: false, redirect: '/dashboard/client' };
    }
  }

  return {
    allowed: true,
    user: authState.user,
    role: authState.role || 'client',
  };
}

/*
 * توجيه حسب الدور بعد تسجيل الدخول
 * الكل يذهب لنفس الرابط /dashboard والمحتوى يتغير حسب الدور
 */
export function getDashboardRoute(role: UserRole | null): string {
  // رابط موحد للجميع - المحتوى يتغير حسب الدور
  return '/dashboard';
}

// التحقق من صلاحية الوصول
export async function hasPermission(permission: string): Promise<boolean> {
  const authState = await checkAuth();

  if (!authState.isAuthenticated) {
    return false;
  }

  // المشرف لديه كل الصلاحيات
  if (authState.role === 'admin') {
    return true;
  }

  // صلاحيات المطور
  if (authState.role === 'developer') {
    const developerPermissions = [
      'view_projects',
      'create_project',
      'edit_project',
      'delete_project',
      'deploy_project',
    ];
    return developerPermissions.includes(permission);
  }

  // صلاحيات العميل
  const clientPermissions = ['view_projects', 'create_project', 'edit_project', 'request_deploy'];

  return clientPermissions.includes(permission);
}
