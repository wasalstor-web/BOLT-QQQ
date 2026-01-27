import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '~/lib/utils';
import {
  Search,
  FileCode2,
  Settings,
  Users,
  BarChart3,
  Zap,
  Home,
  Folder,
  Plus,
  LogOut,
  Moon,
  Sun,
  Keyboard,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  category: 'navigation' | 'actions' | 'settings' | 'help';
}

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
  onAction?: (action: string) => void;
}

export function CommandMenu({ isOpen, onClose, onNavigate, onAction }: CommandMenuProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const commands: CommandItem[] = [
    // Navigation
    { id: 'home', title: 'الرئيسية', icon: <Home className="h-4 w-4" />, action: () => onNavigate?.('/dashboard'), category: 'navigation' },
    { id: 'projects', title: 'المشاريع', icon: <Folder className="h-4 w-4" />, action: () => onNavigate?.('/projects'), category: 'navigation' },
    { id: 'analytics', title: 'التحليلات', icon: <BarChart3 className="h-4 w-4" />, action: () => onNavigate?.('/analytics'), category: 'navigation' },
    { id: 'team', title: 'الفريق', icon: <Users className="h-4 w-4" />, action: () => onNavigate?.('/team'), category: 'navigation' },
    { id: 'settings', title: 'الإعدادات', icon: <Settings className="h-4 w-4" />, shortcut: ['⌘', ','], action: () => onNavigate?.('/settings'), category: 'navigation' },
    
    // Actions
    { id: 'new-project', title: 'مشروع جديد', description: 'إنشاء مشروع بالذكاء الاصطناعي', icon: <Plus className="h-4 w-4" />, shortcut: ['⌘', 'N'], action: () => onAction?.('new-project'), category: 'actions' },
    { id: 'open-editor', title: 'فتح المحرر', description: 'الانتقال للمحرر', icon: <FileCode2 className="h-4 w-4" />, action: () => onNavigate?.('/'), category: 'actions' },
    { id: 'ai-generate', title: 'توليد بالذكاء الاصطناعي', icon: <Zap className="h-4 w-4" />, shortcut: ['⌘', 'G'], action: () => onAction?.('ai-generate'), category: 'actions' },
    
    // Settings
    { id: 'theme-toggle', title: 'تبديل السمة', description: 'داكن / فاتح', icon: <Moon className="h-4 w-4" />, action: () => onAction?.('toggle-theme'), category: 'settings' },
    { id: 'shortcuts', title: 'اختصارات لوحة المفاتيح', icon: <Keyboard className="h-4 w-4" />, shortcut: ['⌘', '/'], action: () => onAction?.('show-shortcuts'), category: 'settings' },
    
    // Help
    { id: 'docs', title: 'التوثيق', icon: <ExternalLink className="h-4 w-4" />, action: () => window.open('/docs', '_blank'), category: 'help' },
    { id: 'help', title: 'المساعدة والدعم', icon: <HelpCircle className="h-4 w-4" />, action: () => onAction?.('show-help'), category: 'help' },
    { id: 'logout', title: 'تسجيل الخروج', icon: <LogOut className="h-4 w-4" />, action: () => onAction?.('logout'), category: 'help' },
  ];
  
  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(search.toLowerCase())
  );
  
  const groupedCommands = {
    navigation: filteredCommands.filter((c) => c.category === 'navigation'),
    actions: filteredCommands.filter((c) => c.category === 'actions'),
    settings: filteredCommands.filter((c) => c.category === 'settings'),
    help: filteredCommands.filter((c) => c.category === 'help'),
  };
  
  const categoryTitles = {
    navigation: 'التنقل',
    actions: 'الإجراءات',
    settings: 'الإعدادات',
    help: 'المساعدة',
  };
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  }, [isOpen, filteredCommands, selectedIndex, onClose]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);
  
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-white/10 px-4">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن أوامر..."
                  className="flex-1 bg-transparent py-4 text-white placeholder-gray-500 outline-none"
                  autoFocus
                />
                <kbd className="hidden rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-400 sm:inline">
                  ESC
                </kbd>
              </div>
              
              {/* Commands List */}
              <div className="max-h-[400px] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    لا توجد نتائج لـ "{search}"
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, items]) => {
                    if (items.length === 0) return null;
                    
                    return (
                      <div key={category} className="mb-2">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500">
                          {categoryTitles[category as keyof typeof categoryTitles]}
                        </div>
                        {items.map((cmd) => {
                          const globalIndex = filteredCommands.findIndex((c) => c.id === cmd.id);
                          const isSelected = globalIndex === selectedIndex;
                          
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => {
                                cmd.action();
                                onClose();
                              }}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right transition-colors',
                                isSelected ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
                              )}
                            >
                              <div className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg',
                                isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'
                              )}>
                                {cmd.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{cmd.title}</div>
                                {cmd.description && (
                                  <div className="text-xs text-gray-500 truncate">{cmd.description}</div>
                                )}
                              </div>
                              {cmd.shortcut && (
                                <div className="flex items-center gap-1">
                                  {cmd.shortcut.map((key, i) => (
                                    <kbd
                                      key={i}
                                      className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-gray-400"
                                    >
                                      {key}
                                    </kbd>
                                  ))}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Footer */}
              <div className="border-t border-white/10 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-white/10 bg-white/5 px-1">↑</kbd>
                      <kbd className="rounded border border-white/10 bg-white/5 px-1">↓</kbd>
                      للتنقل
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-white/10 bg-white/5 px-1">↵</kbd>
                      للتحديد
                    </span>
                  </div>
                  <span>مبسط إديتر</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to use Command Menu with keyboard shortcut
export function useCommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
