import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

interface CloudflareEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

interface CreateUserResponse {
  id?: string;
  error_code?: string;
  msg?: string;
}

interface LoginResponse {
  user?: { id: string; email: string };
  access_token?: string;
  refresh_token?: string;
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  // P0 FIX: Get secrets from environment, NOT hardcoded
  const env = (context.cloudflare?.env || {}) as CloudflareEnv;
  const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  const SUPABASE_SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json({ error: 'Service not configured' }, { status: 503 });
  }

  if (!SUPABASE_SERVICE_ROLE) {
    return json({ error: 'Admin registration not configured' }, { status: 503 });
  }

  let body: { email?: string; password?: string; name?: string };
  try {
    const text = await request.text();
    body = JSON.parse(text);
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, password, name } = body;
  if (!email || !password) {
    return json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 });
  }

  try {
    const createRes = await fetch(SUPABASE_URL + '/auth/v1/admin/users', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + SUPABASE_SERVICE_ROLE,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: name || email.split('@')[0] },
      }),
    });

    const createData = (await createRes.json()) as CreateUserResponse;

    if (!createRes.ok) {
      if (createData.error_code === 'email_exists') {
        return json({ error: 'هذا البريد مسجل مسبقاً' }, { status: 400 });
      }
      return json({ error: createData.msg || 'فشل إنشاء الحساب' }, { status: 400 });
    }

    const userId = createData.id;

    // Add role
    await fetch(SUPABASE_URL + '/rest/v1/user_roles', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + SUPABASE_SERVICE_ROLE,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ user_id: userId, role: 'client' }),
    }).catch(() => {});

    // Login
    const loginRes = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      return json({ success: true, message: 'تم إنشاء الحساب بنجاح!', user: { id: userId, email } });
    }

    const loginData = (await loginRes.json()) as LoginResponse;
    return json({
      success: true,
      message: 'تم إنشاء الحساب وتسجيل الدخول!',
      user: loginData.user,
      session: {
        access_token: loginData.access_token,
        refresh_token: loginData.refresh_token,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown';
    return json({ error: 'خطأ: ' + message }, { status: 500 });
  }
}
