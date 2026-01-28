import { redirect, json } from '@remix-run/cloudflare';
import { createServerClient } from '@supabase/ssr';
import type { UserRole } from '~/lib/supabase/client';

/*
 * ═══════════════════════════════════════════════════════════════════
 * Supabase Credentials
 * ═══════════════════════════════════════════════════════════════════
 */
const SUPABASE_URL = 'https://ocrtidqksqojdkinqcxk.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcnRpZHFrc3FvamRraW5xY3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDI1NDQsImV4cCI6MjA4NTA3ODU0NH0.tpThTu1AYx_fie7U3iTF5Vjv5o2XrdgxL8WwBM_60v4';

/*
 * ═══════════════════════════════════════════════════════════════════
 * Supabase Client Factory
 * ═══════════════════════════════════════════════════════════════════
 */

export async function getSupabaseClient(request: Request, context: any) {
  const cookieHeader = request.headers.get('Cookie') || '';

  const supabaseUrl = context?.cloudflare?.env?.SUPABASE_URL || SUPABASE_URL;
  const supabaseKey = context?.cloudflare?.env?.SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => {
        return cookieHeader
          .split(';')
          .filter(Boolean)
          .map((cookie) => {
            const [name, ...rest] = cookie.trim().split('=');
            return { name, value: rest.join('=') || '' };
          });
      },
      setAll: () => {},
    },
  });
}

/*
 * ═══════════════════════════════════════════════════════════════════
 * Auth Result Type
 * ═══════════════════════════════════════════════════════════════════
 */

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  plan?: string;
  usage_limit?: number;
  usage_current?: number;
  is_active?: boolean;
}

export interface AuthResult {
  user: any;
  profile: UserProfile;
  supabase: any;
}

/*
 * ═══════════════════════════════════════════════════════════════════
 * Auth Functions
 * ═══════════════════════════════════════════════════════════════════
 */

export async function getAuth(request: Request, context: any): Promise<AuthResult | null> {
  try {
    const supabase = await getSupabaseClient(request, context);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // جلب الدور من جدول user_roles
    let role: UserRole = 'client';

    try {
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();

      if (roleData) {
        role = roleData.role as UserRole;
      }
    } catch {
      // جدول الأدوار قد لا يكون موجوداً بعد
    }

    // جلب الملف الشخصي
    const profile: UserProfile = {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.name || user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
      role,
      plan: 'free',
      usage_limit: 1000,
      usage_current: 0,
      is_active: true,
    };

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileData) {
        profile.full_name = profileData.full_name || profile.full_name;
        profile.avatar_url = profileData.avatar_url || profile.avatar_url;
      }
    } catch {
      // جدول الملفات الشخصية قد لا يكون موجوداً بعد
    }

    return { user, profile, supabase };
  } catch {
    return null;
  }
}

export async function requireAuth(request: Request, context: any): Promise<AuthResult> {
  const auth = await getAuth(request, context);

  if (!auth) {
    throw redirect('/login');
  }

  return auth;
}

export async function requireAdmin(request: Request, context: any): Promise<AuthResult> {
  const auth = await requireAuth(request, context);

  if (auth.profile.role !== 'admin') {
    throw redirect('/dashboard/client');
  }

  return auth;
}

export async function requireClient(request: Request, context: any): Promise<AuthResult> {
  const auth = await requireAuth(request, context);

  if (auth.profile.role === 'admin') {
    throw redirect('/dashboard/admin');
  }

  return auth;
}

/*
 * ═══════════════════════════════════════════════════════════════════
 * Error Responses
 * ═══════════════════════════════════════════════════════════════════
 */

export function unauthorizedResponse(message = 'غير مصرح') {
  return json({ error: message, code: 'UNAUTHORIZED' }, { status: 401 });
}

export function forbiddenResponse(message = 'ممنوع الوصول') {
  return json({ error: message, code: 'FORBIDDEN' }, { status: 403 });
}
