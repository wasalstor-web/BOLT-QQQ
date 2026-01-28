import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from '@remix-run/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '~/lib/utils';
import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  Home,
  Folder,
  BarChart3,
  Users,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Bell,
  LogOut,
  User,
  CreditCard,
  HelpCircle,
  Moon,
  Sun,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  FileCode2,
  Layers,
  GitBranch,
  Puzzle,
} from 'lucide-react';

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  onNewProject?: () => void;
  onSearch?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number | string;
  isNew?: boolean;
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: <Home className="h-5 w-5" />, href: '/dashboard' },
  { id: 'projects', label: 'المشاريع', icon: <Folder className="h-5 w-5" />, href: '/projects' },
  { id: 'templates', label: 'القوالب', icon: <Layers className="h-5 w-5" />, href: '/templates', isNew: true },
  { id: 'analytics', label: 'التحليلات', icon: <BarChart3 className="h-5 w-5" />, href: '/analytics' },
  { id: 'team', label: 'الفريق', icon: <Users className="h-5 w-5" />, href: '/team' },
];

const bottomNavItems: NavItem[] = [
  { id: 'integrations', label: 'التكاملات', icon: <Puzzle className="h-5 w-5" />, href: '/integrations' },
  { id: 'settings', label: 'الإعدادات', icon: <Settings className="h-5 w-5" />, href: '/settings' },
];

export function Sidebar({ user, onLogout, onNewProject, onSearch }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const NavItemComponent = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

    const content = (
      <Link
        to={item.href}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/10 text-white'
            : 'text-gray-400 hover:bg-white/5 hover:text-white',
        )}
      >
        {/* Active Indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-gradient-to-b from-purple-500 to-blue-500"
          />
        )}

        <span
          className={cn(
            'shrink-0 transition-colors',
            isActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-white',
          )}
        >
          {item.icon}
        </span>

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badge */}
        {!collapsed && item.badge && (
          <span className="mr-auto rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
            {item.badge}
          </span>
        )}

        {/* New Badge */}
        {!collapsed && item.isNew && (
          <span className="mr-auto rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-2 py-0.5 text-xs text-white">
            جديد
          </span>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip.Provider delayDuration={0}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="left"
                className="rounded-lg border border-white/10 bg-gray-900 px-3 py-1.5 text-sm text-white shadow-xl"
                sideOffset={10}
              >
                {item.label}
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      );
    }

    return content;
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/5">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-bold text-white"
              >
                مبسط
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Collapse Button - Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* New Project Button */}
      <div className="p-4">
        <button
          onClick={onNewProject}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 font-medium text-white',
            'shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40',
            'transition-all duration-300 hover:scale-[1.02]',
            isCollapsed && 'px-2',
          )}
        >
          <Plus className="h-5 w-5" />
          {!isCollapsed && <span>مشروع جديد</span>}
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-4 mb-4">
          <button
            onClick={onSearch}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-400 hover:border-white/20 hover:bg-white/10 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>بحث...</span>
            <kbd className="mr-auto rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs">⌘K</kbd>
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavItemComponent key={item.id} item={item} collapsed={isCollapsed} />
        ))}

        <div className="my-4 h-px bg-white/5" />

        {bottomNavItems.map((item) => (
          <NavItemComponent key={item.id} item={item} collapsed={isCollapsed} />
        ))}
      </nav>

      {/* Editor Quick Access */}
      <div className="px-3 pb-4">
        <button
          onClick={() => navigate('/editor')}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-400',
            'hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-white',
            'transition-all duration-300 group',
            isCollapsed && 'justify-center px-2',
          )}
        >
          <FileCode2 className="h-5 w-5 group-hover:text-purple-400 transition-colors" />
          {!isCollapsed && (
            <>
              <span>فتح المحرر</span>
              <ExternalLink className="h-3.5 w-3.5 mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </button>
      </div>

      {/* User Section */}
      <div className="border-t border-white/5 p-3">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-right transition-colors',
                'hover:bg-white/5',
                isCollapsed && 'justify-center px-2',
              )}
            >
              <Avatar.Root className="shrink-0">
                <Avatar.Image src={user?.avatar} className="h-9 w-9 rounded-full object-cover" alt={user?.name} />
                <Avatar.Fallback className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-medium text-white">
                  {user?.name?.charAt(0) || 'م'}
                </Avatar.Fallback>
              </Avatar.Root>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name || 'المستخدم'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                </div>
              )}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[220px] rounded-xl border border-white/10 bg-gray-900/95 p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
              side="top"
              sideOffset={10}
              align="start"
            >
              <div className="px-3 py-2 mb-1 border-b border-white/10">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <DropdownMenu.Item
                onClick={() => navigate('/profile')}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white outline-none"
              >
                <User className="h-4 w-4" />
                الملف الشخصي
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={() => navigate('/billing')}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white outline-none"
              >
                <CreditCard className="h-4 w-4" />
                الفوترة
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={() => navigate('/settings')}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white outline-none"
              >
                <Settings className="h-4 w-4" />
                الإعدادات
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-white/10" />

              <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white outline-none">
                <HelpCircle className="h-4 w-4" />
                المساعدة والدعم
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-white/10" />

              <DropdownMenu.Item
                onClick={onLogout}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 outline-none"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gray-900/90 text-white backdrop-blur-xl lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-72 border-l border-white/10 bg-gray-900/95 backdrop-blur-xl lg:hidden"
          >
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'hidden lg:flex h-screen shrink-0 flex-col border-l border-white/5 bg-gray-900/50 backdrop-blur-xl',
          'sticky top-0',
        )}
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}

// Notification Bell Component
export function NotificationBell() {
  const [hasNotifications] = useState(true);

  return (
    <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
      <Bell className="h-5 w-5" />
      {hasNotifications && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />}
    </button>
  );
}

// Header Component for Dashboard pages
export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-gray-400">{subtitle}</p>}
    </div>
  );
}
