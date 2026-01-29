import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

/**
 * API لإعداد قاعدة البيانات
 * يُستخدم لإنشاء الجداول والإعدادات الأولية
 */

const SUPABASE_URL = 'https://italiano-substitute-folder-rehabilitation.trycloudflare.com';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcnRpZHFrc3FvamRraW5xY3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDI1NDQsImV4cCI6MjA4NTA3ODU0NH0.tpThTu1AYx_fie7U3iTF5Vjv5o2XrdgxL8WwBM_60v4';

interface SupabaseCheckResponse {
  paths?: Record<string, unknown>;
}

interface SupabaseSignupResult {
  user?: { id: string; email: string };
  error?: { message: string };
  msg?: string;
}

interface SupabaseAuthResult {
  user?: { id: string; email: string; user_metadata?: { name?: string } };
  access_token?: string;
  error?: string;
  error_code?: string;
  msg?: string;
}

interface UserRole {
  role: string;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await request.json().catch(() => ({}));
  const { action, data } = body as { action?: string; data?: Record<string, string> };

  try {
    switch (action) {
      case 'check-tables':
        return await checkTables();

      case 'create-admin':
        return await createAdminUser(data as { email: string; password: string; name?: string });

      case 'test-auth':
        return await testAuth(data as { email: string; password: string });

      default:
        return json({
          message: 'Database Setup API',
          endpoints: {
            'check-tables': 'Check existing tables',
            'create-admin': 'Create admin user (requires email, password)',
            'test-auth': 'Test authentication (requires email, password)',
          },
        });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: errorMessage }, { status: 500 });
  }
}

async function checkTables() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  const data = (await response.json()) as SupabaseCheckResponse;
  const tables = data.paths ? Object.keys(data.paths).filter((p: string) => p !== '/') : [];

  return json({
    success: true,
    tables: tables.map((t: string) => t.replace('/', '')),
    message: `Found ${tables.length} tables`,
  });
}

async function createAdminUser(data: { email: string; password: string; name?: string }) {
  if (!data?.email || !data?.password) {
    return json({ error: 'Email and password required' }, { status: 400 });
  }

  const signupResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      data: { name: data.name || 'Admin' },
    }),
  });

  const signupResult = (await signupResponse.json()) as SupabaseSignupResult;

  if (signupResult.error) {
    return json({ error: signupResult.error.message || signupResult.msg }, { status: 400 });
  }

  return json({
    success: true,
    message: 'User created! Check email for confirmation, then set role to admin in Supabase Dashboard.',
    user: {
      id: signupResult.user?.id,
      email: signupResult.user?.email,
    },
    next_steps: [
      '1. Confirm email',
      '2. Go to Supabase Dashboard > SQL Editor',
      `3. Run: UPDATE user_roles SET role = 'admin' WHERE user_id = '${signupResult.user?.id}';`,
    ],
  });
}

async function testAuth(data: { email: string; password: string }) {
  if (!data?.email || !data?.password) {
    return json({ error: 'Email and password required' }, { status: 400 });
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  const result = (await response.json()) as SupabaseAuthResult;

  if (result.error || result.error_code) {
    return json(
      {
        success: false,
        error: result.msg || result.error,
      },
      { status: 401 },
    );
  }

  if (!result.user || !result.access_token) {
    return json({ success: false, error: 'Invalid response from auth' }, { status: 401 });
  }

  const roleResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${result.user.id}&select=role`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${result.access_token}`,
    },
  });

  const roles = (await roleResponse.json()) as UserRole[];

  return json({
    success: true,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.user_metadata?.name,
      role: roles[0]?.role || 'client',
    },
    access_token: result.access_token.substring(0, 20) + '...',
  });
}

export async function loader() {
  return json({
    message: 'Database Setup API - Use POST with action parameter',
    actions: ['check-tables', 'create-admin', 'test-auth'],
  });
}
