import { atom, computed } from 'nanostores';

// ═══════════════════════════════════════════════════════════════════
// أنواع المستخدم والأدوار
// ═══════════════════════════════════════════════════════════════════

export type UserRole = 'developer' | 'client';
export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  plan: UserPlan;
  usage_limit: number;
  usage_current: number;
  is_active: boolean;
  preferences?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════
// Stores
// ═══════════════════════════════════════════════════════════════════

export const userStore = atom<User | null>(null);
export const isLoadingAuth = atom<boolean>(true);
export const authError = atom<string | null>(null);

// ═══════════════════════════════════════════════════════════════════
// Computed Values
// ═══════════════════════════════════════════════════════════════════

export const isAuthenticated = computed(userStore, (user) => !!user);
export const isDeveloper = computed(userStore, (user) => user?.role === 'developer');
export const isClient = computed(userStore, (user) => user?.role === 'client');
export const userRole = computed(userStore, (user) => user?.role || 'client');
export const userPlan = computed(userStore, (user) => user?.plan || 'free');

export const usagePercentage = computed(userStore, (user) => {
  if (!user || user.usage_limit === 0) return 0;
  return Math.round((user.usage_current / user.usage_limit) * 100);
});

export const remainingUsage = computed(userStore, (user) => {
  if (!user) return 0;
  return Math.max(0, user.usage_limit - user.usage_current);
});

export const isUsageLimitReached = computed(userStore, (user) => {
  if (!user || user.role === 'developer') return false;
  return user.usage_current >= user.usage_limit;
});

// ═══════════════════════════════════════════════════════════════════
// Actions
// ═══════════════════════════════════════════════════════════════════

export function setUser(user: User | null) {
  userStore.set(user);
  isLoadingAuth.set(false);
  authError.set(null);
}

export function clearUser() {
  userStore.set(null);
  isLoadingAuth.set(false);
}

export function setAuthError(error: string | null) {
  authError.set(error);
  isLoadingAuth.set(false);
}

export function updateUserProfile(updates: Partial<User>) {
  const current = userStore.get();
  if (current) {
    userStore.set({ ...current, ...updates });
  }
}

export function updateUsage(tokensUsed: number) {
  const current = userStore.get();
  if (current) {
    userStore.set({
      ...current,
      usage_current: current.usage_current + tokensUsed,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// Permission Helpers
// ═══════════════════════════════════════════════════════════════════

export function canAccessFeature(feature: string): boolean {
  const user = userStore.get();
  if (!user) return false;

  // المطور يستطيع الوصول لكل شيء
  if (user.role === 'developer') return true;

  // صلاحيات العميل حسب الخطة
  const featuresByPlan: Record<UserPlan, string[]> = {
    free: ['chat', 'preview', 'export'],
    pro: ['chat', 'preview', 'export', 'terminal', 'git', 'deploy'],
    enterprise: ['chat', 'preview', 'export', 'terminal', 'git', 'deploy', 'api', 'team'],
  };

  return featuresByPlan[user.plan]?.includes(feature) || false;
}

export const permissions = {
  canAccessTerminal: () => canAccessFeature('terminal'),
  canEditCode: () => {
    const user = userStore.get();
    return user?.role === 'developer' || user?.plan !== 'free';
  },
  canAccessAdminDashboard: () => userStore.get()?.role === 'developer',
  canManageUsers: () => userStore.get()?.role === 'developer',
  canManageSettings: () => userStore.get()?.role === 'developer',
  canDeploy: () => canAccessFeature('deploy'),
  canUseGit: () => canAccessFeature('git'),
  canExport: () => canAccessFeature('export'),
  canUseApi: () => canAccessFeature('api'),
};
