import { redirect, json } from '@remix-run/cloudflare';
import { createServerClient } from '@supabase/ssr';
import type { User, UserRole } from './stores/auth';

// ═══════════════════════════════════════════════════════════════════
// Supabase Client Factory
// ═══════════════════════════════════════════════════════════════════

export async function getSupabaseClient(request: Request, context: any) {
  const cookieHeader = request.headers.get('Cookie') || '';

  return createServerClient(context.cloudflare.env.SUPABASE_URL, context.cloudflare.env.SUPABASE_ANON_KEY, {
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

// ═══════════════════════════════════════════════════════════════════
// Auth Result Type
// ═══════════════════════════════════════════════════════════════════

export interface AuthResult {
  user: any;
  profile: User;
  supabase: any;
}

// ═══════════════════════════════════════════════════════════════════
// Auth Functions
// ═══════════════════════════════════════════════════════════════════

export async function getAuth(request: Request, context: any): Promise<AuthResult | null> {
  try {
    const supabase = await getSupabaseClient(request, context);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role, plan, usage_limit, usage_current, is_active, preferences')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      user,
      profile: {
        id: user.id,
        email: user.email || '',
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: (profile.role as UserRole) || 'client',
        plan: profile.plan || 'free',
        usage_limit: profile.usage_limit || 1000,
        usage_current: profile.usage_current || 0,
        is_active: profile.is_active !== false,
        preferences: profile.preferences,
      },
      supabase,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(request: Request, context: any): Promise<AuthResult> {
  const auth = await getAuth(request, context);

  if (!auth) {
    throw redirect('/dashboard');
  }

  if (!auth.profile.is_active) {
    throw redirect('/account-suspended');
  }

  return auth;
}

export async function requireDeveloper(request: Request, context: any): Promise<AuthResult> {
  const auth = await requireAuth(request, context);

  if (auth.profile.role !== 'developer') {
    throw redirect('/dashboard/client');
  }

  return auth;
}

export async function requireClient(request: Request, context: any): Promise<AuthResult> {
  const auth = await requireAuth(request, context);

  if (auth.profile.role !== 'client') {
    throw redirect('/dashboard/admin');
  }

  return auth;
}

// ═══════════════════════════════════════════════════════════════════
// Usage Tracking
// ═══════════════════════════════════════════════════════════════════

export async function checkUsageLimit(
  request: Request,
  context: any
): Promise<{ allowed: boolean; remaining: number }> {
  const auth = await getAuth(request, context);

  if (!auth) {
    return { allowed: false, remaining: 0 };
  }

  if (auth.profile.role === 'developer') {
    return { allowed: true, remaining: Infinity };
  }

  const remaining = auth.profile.usage_limit - auth.profile.usage_current;
  return { allowed: remaining > 0, remaining };
}

export async function logUsage(
  supabase: any,
  data: {
    service: string;
    provider: string;
    model: string;
    tokens_input: number;
    tokens_output: number;
    project_id?: string;
    conversation_id?: string;
  }
): Promise<boolean> {
  const { error } = await supabase.rpc('log_usage', {
    p_service: data.service,
    p_provider: data.provider,
    p_model: data.model,
    p_tokens_input: data.tokens_input,
    p_tokens_output: data.tokens_output,
    p_project_id: data.project_id || null,
    p_conversation_id: data.conversation_id || null,
  });

  return !error;
}

// ═══════════════════════════════════════════════════════════════════
// Error Responses
// ═══════════════════════════════════════════════════════════════════

export function unauthorizedResponse(message = 'غير مصرح') {
  return json({ error: message, code: 'UNAUTHORIZED' }, { status: 401 });
}

export function forbiddenResponse(message = 'ممنوع الوصول') {
  return json({ error: message, code: 'FORBIDDEN' }, { status: 403 });
}

export function usageLimitResponse() {
  return json(
    {
      error: 'تم تجاوز حد الاستخدام',
      code: 'USAGE_LIMIT_EXCEEDED',
    },
    { status: 429 }
  );
}
