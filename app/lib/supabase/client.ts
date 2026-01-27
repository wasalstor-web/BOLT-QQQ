import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization - only create client when needed and in browser
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client cannot be used on server');
  }
  
  if (!supabaseInstance) {
    const supabaseUrl = (window as any).ENV?.VITE_SUPABASE_URL || 
                        import.meta.env?.VITE_SUPABASE_URL || 
                        'https://ocrtidqksqojdkinqcxk.supabase.co';
    const supabaseAnonKey = (window as any).ENV?.VITE_SUPABASE_ANON_KEY || 
                            import.meta.env?.VITE_SUPABASE_ANON_KEY || 
                            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcnRpZHFrc3FvamRraW5xY3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDI1NDQsImV4cCI6MjA4NTA3ODU0NH0.tpThTu1AYx_fie7U3iTF5Vjv5o2XrdgxL8WwBM_60v4';
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  
  return supabaseInstance;
}

export const getSupabase = getSupabaseClient;

export type User = {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
  created_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  files_json?: Record<string, any>;
  preview_url?: string;
  thumbnail_url?: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
};

export async function signUp(email: string, password: string, name: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signInWithGoogle() {
  if (typeof window === 'undefined') {
    return { data: null, error: new Error('Cannot use OAuth on server') };
  }
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/auth/callback' },
  });
  return { data, error };
}

export async function signInWithGithub() {
  if (typeof window === 'undefined') {
    return { data: null, error: new Error('Cannot use OAuth on server') };
  }
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin + '/auth/callback' },
  });
  return { data, error };
}

export async function signOut() {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const supabase = getSupabase();
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

export async function getUser() {
  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getProjects() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  return { data: data as Project[] | null, error };
}

export async function getProject(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
  return { data: data as Project | null, error };
}

export async function createProject(project: Partial<Project>) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('projects').insert({ ...project, user_id: user.id }).select().single();
  return { data: data as Project | null, error };
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
  return { data: data as Project | null, error };
}

export async function deleteProject(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  return { error };
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = getSupabase();
  return supabase.auth.onAuthStateChange(callback);
}

// ========================================
// نظام الأدوار والإعدادات
// ========================================

export type UserRole = 'admin' | 'developer' | 'client';

export interface AdminSetting {
  setting_key: string;
  setting_value: string;
  is_secret?: boolean;
}

export interface DeployRequest {
  id: string;
  client_id: string;
  project_name: string;
  project_files?: Record<string, any>;
  target_platform: 'cloudflare' | 'vercel' | 'netlify';
  status: 'pending' | 'approved' | 'rejected' | 'deployed';
  deployed_url?: string;
  admin_notes?: string;
  created_at: string;
}

// الحصول على دور المستخدم
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    return data?.role || 'client';
  } catch {
    return 'client';
  }
}

// التحقق إذا المستخدم مشرف
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

// حفظ إعداد للمشرف
export async function saveAdminSetting(key: string, value: string, isSecret = false) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('admin_settings')
    .upsert({
      admin_id: user.id,
      setting_key: key,
      setting_value: value,
      is_secret: isSecret,
      updated_at: new Date().toISOString()
    }, { onConflict: 'admin_id,setting_key' })
    .select()
    .single();

  return { data, error };
}

// الحصول على إعداد المشرف
export async function getAdminSetting(key: string): Promise<string | null> {
  try {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('admin_id', user.id)
      .eq('setting_key', key)
      .single();

    return data?.setting_value || null;
  } catch {
    return null;
  }
}

// الحصول على جميع إعدادات المشرف
export async function getAllAdminSettings(): Promise<AdminSetting[]> {
  try {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('admin_settings')
      .select('setting_key, setting_value, is_secret')
      .eq('admin_id', user.id);

    return data || [];
  } catch {
    return [];
  }
}

// إنشاء طلب نشر (للعميل)
export async function createDeployRequest(
  projectName: string,
  projectFiles: Record<string, any>,
  targetPlatform: 'cloudflare' | 'vercel' | 'netlify'
) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('deploy_requests')
    .insert({
      client_id: user.id,
      project_name: projectName,
      project_files: projectFiles,
      target_platform: targetPlatform,
      status: 'pending'
    })
    .select()
    .single();

  return { data, error };
}

// الحصول على طلبات النشر (للمشرف)
export async function getDeployRequests(status?: string) {
  const supabase = getSupabase();
  let query = supabase.from('deploy_requests').select('*').order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data: data as DeployRequest[] | null, error };
}

// تحديث حالة طلب النشر (للمشرف)
export async function updateDeployRequest(
  requestId: string,
  updates: { status?: string; deployed_url?: string; admin_notes?: string }
) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('deploy_requests')
    .update({
      ...updates,
      processed_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single();

  return { data, error };
}

// حفظ إعدادات التكامل (GitHub, Vercel, etc.)
export async function saveIntegrationSettings(integrations: Record<string, any>) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // حفظ في localStorage كـ fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('bolt_integrations', JSON.stringify(integrations));
    }
    return { success: true, source: 'localStorage' };
  }

  // حفظ كل integration كـ setting منفصل
  const promises = Object.entries(integrations).map(([key, value]) =>
    saveAdminSetting(`integration_${key}`, JSON.stringify(value), true)
  );

  await Promise.all(promises);
  return { success: true, source: 'supabase' };
}

// استرجاع إعدادات التكامل
export async function loadIntegrationSettings(): Promise<Record<string, any>> {
  try {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // استرجاع من localStorage
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('bolt_integrations');
        return saved ? JSON.parse(saved) : {};
      }
      return {};
    }

    const settings = await getAllAdminSettings();
    const integrations: Record<string, any> = {};

    settings
      .filter(s => s.setting_key.startsWith('integration_'))
      .forEach(s => {
        const key = s.setting_key.replace('integration_', '');
        try {
          integrations[key] = JSON.parse(s.setting_value);
        } catch {
          integrations[key] = s.setting_value;
        }
      });

    return integrations;
  } catch {
    return {};
  }
}
