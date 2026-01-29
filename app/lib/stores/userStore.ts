/**
 * 🔐 User Store - مخزن بيانات المستخدم المركزي
 * يربط بين نظام المصادقة والمحرر وحفظ المشاريع
 */

import { atom, map } from 'nanostores';

export interface UserData {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'developer' | 'client';
}

export interface UserSession {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  isDemoMode: boolean;
}

// حالة المستخدم الرئيسية
export const userSession = map<UserSession>({
  isAuthenticated: false,
  user: null,
  loading: true,
  isDemoMode: false,
});

// إحصائيات المستخدم
export const userStats = map({
  projectsCount: 0,
  deploysCount: 0,
  lastActive: null as Date | null,
});

// تحديث بيانات المستخدم
export function setUser(user: UserData | null, isDemoMode = false) {
  userSession.set({
    isAuthenticated: !!user,
    user,
    loading: false,
    isDemoMode,
  });
}

// تسجيل الخروج
export function clearUser() {
  userSession.set({
    isAuthenticated: false,
    user: null,
    loading: false,
    isDemoMode: false,
  });
}

// التحقق من الصلاحيات
export function hasPermission(requiredRole: 'admin' | 'developer' | 'client'): boolean {
  const session = userSession.get();

  if (!session.isAuthenticated || !session.user) {
    return false;
  }

  const roleHierarchy = { admin: 3, developer: 2, client: 1 };

  return roleHierarchy[session.user.role] >= roleHierarchy[requiredRole];
}

// هل المستخدم مشرف؟
export function isAdmin(): boolean {
  return userSession.get().user?.role === 'admin';
}

// هل المستخدم مطور؟
export function isDeveloper(): boolean {
  const role = userSession.get().user?.role;
  return role === 'admin' || role === 'developer';
}
