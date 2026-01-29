import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { userSession } from '~/lib/stores/userStore';
import { signOutUser } from '~/lib/auth/authProvider';

function UserMenu() {
  const session = useStore(userSession);

  if (session.loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse" />;
  }

  if (!session.isAuthenticated || !session.user) {
    return (
      <a
        href="/login"
        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
      >
        تسجيل الدخول
      </a>
    );
  }

  const roleLabel = session.user.role === 'admin' ? 'مشرف' : session.user.role === 'developer' ? 'مطور' : 'عميل';
  const roleColor =
    session.user.role === 'admin' ? 'bg-red-500' : session.user.role === 'developer' ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className="flex items-center gap-3">
      {/* Dashboard Link */}
      <a
        href="/dashboard"
        className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        لوحة التحكم
      </a>

      {/* User Avatar & Info */}
      <div className="relative group">
        <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-700/50 transition-all">
          {session.user.avatar ? (
            <img src={session.user.avatar} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {(session.user.name || session.user.email)[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-white">{session.user.name || session.user.email.split('@')[0]}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor} text-white`}>{roleLabel}</span>
          </div>
        </button>

        {/* Dropdown Menu */}
        <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="p-3 border-b border-gray-700">
            <p className="text-sm text-white font-medium">{session.user.name || session.user.email}</p>
            <p className="text-xs text-gray-400">{session.user.email}</p>
          </div>
          <div className="p-2">
            <a href="/dashboard" className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg">
              لوحة التحكم
            </a>
            <a href="/projects" className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg">
              مشاريعي
            </a>
            <a href="/settings" className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg">
              الإعدادات
            </a>
            <hr className="my-2 border-gray-700" />
            <button
              onClick={() => signOutUser()}
              className="w-full text-right px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={classNames('flex items-center justify-between px-4 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <div className="i-ph:sidebar-simple-duotone text-xl" />
        <a href="/" className="text-2xl font-semibold text-accent flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">م</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            مبسط إديتر
          </span>
        </a>
      </div>

      {/* Chat Description - Center */}
      {chat.started && (
        <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
          <ClientOnly>{() => <ChatDescription />}</ClientOnly>
        </span>
      )}

      {/* Right Side - Actions & User */}
      <div className="flex items-center gap-4">
        {chat.started && <ClientOnly>{() => <HeaderActionButtons chatStarted={chat.started} />}</ClientOnly>}
        <ClientOnly>{() => <UserMenu />}</ClientOnly>
      </div>
    </header>
  );
}
