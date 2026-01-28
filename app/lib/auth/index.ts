// تصدير ملفات المصادقة
export { checkAuth, requireAuth, getDashboardRoute, hasPermission } from './guard';
export { useAuth, useRequireAuth, type AuthUser } from './useAuth';
