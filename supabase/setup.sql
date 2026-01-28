-- =============================================
-- 🚀 بولت يوم الدقه - إعداد قاعدة البيانات
-- نفذ هذا الملف في Supabase SQL Editor
-- =============================================

-- 1. تحديث جدول المشاريع (إضافة الحقول الناقصة)
ALTER TABLE IF EXISTS projects 
ADD COLUMN IF NOT EXISTS files_json JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preview_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. إنشاء جدول إعدادات المشرف
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  is_secret BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(admin_id, setting_key)
);

-- 3. إنشاء جدول طلبات النشر
CREATE TABLE IF NOT EXISTS deploy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_files JSONB DEFAULT '{}',
  target_platform TEXT CHECK (target_platform IN ('cloudflare', 'vercel', 'netlify')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deployed')),
  deployed_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- 4. إنشاء جدول الاشتراكات
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  payment_provider TEXT,
  payment_id TEXT,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'SAR',
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. إنشاء جدول الفواتير
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. إنشاء جدول أعضاء الفريق
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email TEXT NOT NULL,
  member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'developer', 'viewer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ
);

-- =============================================
-- 🔒 سياسات الأمان (RLS)
-- =============================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deploy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- سياسات admin_settings
DROP POLICY IF EXISTS "Admins can manage their settings" ON admin_settings;
CREATE POLICY "Admins can manage their settings" ON admin_settings
  FOR ALL USING (auth.uid() = admin_id);

-- سياسات deploy_requests
DROP POLICY IF EXISTS "Users can view their deploy requests" ON deploy_requests;
CREATE POLICY "Users can view their deploy requests" ON deploy_requests
  FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Users can create deploy requests" ON deploy_requests;
CREATE POLICY "Users can create deploy requests" ON deploy_requests
  FOR INSERT WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Admins can view all deploy requests" ON deploy_requests;
CREATE POLICY "Admins can view all deploy requests" ON deploy_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update deploy requests" ON deploy_requests;
CREATE POLICY "Admins can update deploy requests" ON deploy_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- سياسات subscriptions
DROP POLICY IF EXISTS "Users can view their subscription" ON subscriptions;
CREATE POLICY "Users can view their subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- سياسات invoices
DROP POLICY IF EXISTS "Users can view their invoices" ON invoices;
CREATE POLICY "Users can view their invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

-- سياسات team_members
DROP POLICY IF EXISTS "Owners can manage team members" ON team_members;
CREATE POLICY "Owners can manage team members" ON team_members
  FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Members can view their teams" ON team_members;
CREATE POLICY "Members can view their teams" ON team_members
  FOR SELECT USING (auth.uid() = member_id);

-- =============================================
-- 🔄 Triggers للتعيين التلقائي
-- =============================================

-- Function لإنشاء دور افتراضي للمستخدم الجديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- إنشاء دور افتراضي (client)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- إنشاء ملف شخصي
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- إنشاء اشتراك مجاني
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 👑 إنشاء مستخدم Admin (يدوياً من Dashboard)
-- =============================================
-- بعد إنشاء المستخدم من الواجهة، نفذ هذا:
-- UPDATE user_roles SET role = 'admin' WHERE user_id = 'USER_ID_HERE';

-- =============================================
-- 📊 Views للإحصائيات
-- =============================================

-- عدد المستخدمين حسب الخطة
CREATE OR REPLACE VIEW subscription_stats AS
SELECT 
  plan,
  status,
  COUNT(*) as count,
  SUM(amount) as total_revenue
FROM subscriptions
GROUP BY plan, status;

-- إحصائيات المشاريع
CREATE OR REPLACE VIEW project_stats AS
SELECT 
  status,
  COUNT(*) as count
FROM projects
GROUP BY status;

-- =============================================
-- ✅ تم الإعداد بنجاح!
-- =============================================
