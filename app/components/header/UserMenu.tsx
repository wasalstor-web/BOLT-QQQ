import { useStore } from '@nanostores/react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { userStore, isDeveloper, clearUser, usagePercentage } from '~/lib/stores/auth';
import { createBrowserClient } from '@supabase/ssr';

export function UserMenu() {
  const user = useStore(userStore);
  const isDev = useStore(isDeveloper);
  const usagePct = useStore(usagePercentage);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient(
        (window as any).ENV?.SUPABASE_URL || '',
        (window as any).ENV?.SUPABASE_ANON_KEY || ''
      );
      await supabase.auth.signOut();
      clearUser();
      navigate('/editor');
    } catch (error) {
      console.error('Sign out error:', error);
    }
    setIsOpen(false);
  };

  if (!user) {
    return (
      <a
        href="/dashboard"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium transition-all duration-200 hover:scale-105"
      >
        <div className="i-ph:sign-in text-lg" />
        <span className="hidden sm:inline">تسجيل الدخول</span>
      </a>
    );
  }

  const roleLabel = isDev ? 'مطور' : 'عميل';
  const roleColor = isDev
    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    : 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  const planLabels: Record<string, string> = { free: 'مجاني', pro: 'Pro', enterprise: 'Enterprise' };
  const dashboardUrl = isDev ? '/dashboard/admin' : '/dashboard/client';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bolt-elements-background-depth-2 transition-all duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name || 'User'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-bolt-elements-borderColor"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${isDev ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-accent-500 to-accent-700'}`}
          >
            {(user.full_name?.[0] || user.email[0]).toUpperCase()}
          </div>
        )}

        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium text-bolt-elements-textPrimary leading-tight">
            {user.full_name || user.email.split('@')[0]}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${roleColor}`}>{roleLabel}</span>
        </div>

        <div
          className={`i-ph:caret-down text-xs text-bolt-elements-textSecondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 w-72 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-xl shadow-2xl overflow-hidden z-50"
          dir="rtl"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div className="px-4 py-3 bg-gradient-to-r from-bolt-elements-background-depth-3 to-bolt-elements-background-depth-2">
            <div className="flex items-center gap-3">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold ${isDev ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-accent-500 to-accent-700'}`}
                >
                  {(user.full_name?.[0] || user.email[0]).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-bolt-elements-textPrimary truncate">
                  {user.full_name || 'مستخدم'}
                </p>
                <p className="text-xs text-bolt-elements-textSecondary truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={`px-2 py-0.5 rounded border text-xs ${roleColor}`}>{roleLabel}</span>
              <span className="px-2 py-0.5 rounded bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary text-xs">
                {planLabels[user.plan] || user.plan}
              </span>
            </div>
          </div>

          {!isDev && (
            <div className="px-4 py-3 border-t border-bolt-elements-borderColor">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-bolt-elements-textSecondary">الاستخدام</span>
                <span className={`font-medium ${usagePct > 80 ? 'text-red-400' : 'text-bolt-elements-textPrimary'}`}>
                  {usagePct}%
                </span>
              </div>
              <div className="h-2 bg-bolt-elements-background-depth-1 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePct > 90 ? 'bg-red-500' : usagePct > 70 ? 'bg-yellow-500' : 'bg-accent-500'
                  }`}
                  style={{ width: `${Math.min(usagePct, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-bolt-elements-textSecondary mt-1">
                {user.usage_current.toLocaleString('ar')} / {user.usage_limit.toLocaleString('ar')} توكن
              </p>
            </div>
          )}

          <div className="py-2 border-t border-bolt-elements-borderColor">
            <MenuItem href={dashboardUrl} icon="i-ph:house" onClick={() => setIsOpen(false)}>
              لوحة التحكم
            </MenuItem>
            <MenuItem href="/settings" icon="i-ph:gear" onClick={() => setIsOpen(false)}>
              الإعدادات
            </MenuItem>
            <MenuItem href="/integrations" icon="i-ph:plug" onClick={() => setIsOpen(false)}>
              التكاملات
            </MenuItem>
          </div>

          {isDev && (
            <div className="py-2 border-t border-bolt-elements-borderColor">
              <p className="px-4 py-1 text-[10px] text-purple-400 font-medium uppercase tracking-wider">
                أدوات المطور
              </p>
              <MenuItem
                href="/dashboard/admin/users"
                icon="i-ph:users"
                color="purple"
                onClick={() => setIsOpen(false)}
              >
                إدارة المستخدمين
              </MenuItem>
              <MenuItem
                href="/dashboard/admin/services"
                icon="i-ph:robot"
                color="purple"
                onClick={() => setIsOpen(false)}
              >
                إعدادات الخدمات
              </MenuItem>
              <MenuItem
                href="/dashboard/admin/analytics"
                icon="i-ph:chart-line"
                color="purple"
                onClick={() => setIsOpen(false)}
              >
                التحليلات
              </MenuItem>
            </div>
          )}

          <div className="py-2 border-t border-bolt-elements-borderColor">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <div className="i-ph:sign-out text-lg" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  children,
  color = 'default',
  onClick,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
  color?: 'default' | 'purple';
  onClick?: () => void;
}) {
  const colorClass =
    color === 'purple'
      ? 'text-purple-400 hover:bg-purple-500/10'
      : 'text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3';

  return (
    <a href={href} className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${colorClass}`} onClick={onClick}>
      <div className={`${icon} text-lg`} />
      {children}
    </a>
  );
}
