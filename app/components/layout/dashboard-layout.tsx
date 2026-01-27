import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from '@remix-run/react';
import { Sidebar, NotificationBell } from './sidebar';
import { CommandMenu, useCommandMenu } from '~/components/ui/command-menu';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { isOpen, open, close } = useCommandMenu();
  
  const handleLogout = async () => {
    // Sign out and navigate to editor
    try {
      const response = await fetch('/auth/signout', { method: 'POST' });
      if (response.ok) navigate('/editor');
    } catch {
      navigate('/editor');
    }
  };
  
  const handleNewProject = () => {
    navigate('/editor');
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  const handleAction = (action: string) => {
    switch (action) {
      case 'new-project':
        navigate('/editor');
        break;
      case 'ai-generate':
        navigate('/editor');
        break;
      case 'toggle-theme':
        // Toggle theme logic
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950" dir="rtl">
      {/* Sidebar */}
      <Sidebar
        user={user}
        onLogout={handleLogout}
        onNewProject={handleNewProject}
        onSearch={open}
      />
      
      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/5 bg-gray-950/80 px-4 backdrop-blur-xl lg:px-8">
          {/* Mobile spacer for menu button */}
          <div className="w-10 lg:hidden" />
          
          {/* Search - Desktop */}
          <button
            onClick={open}
            className="hidden md:flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 hover:border-white/20 hover:bg-white/10 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>بحث سريع...</span>
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs">⌘K</kbd>
          </button>
          
          {/* Right Side */}
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>
        
        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
      
      {/* Command Menu */}
      <CommandMenu
        isOpen={isOpen}
        onClose={close}
        onNavigate={handleNavigate}
        onAction={handleAction}
      />
    </div>
  );
}


