import { motion } from 'framer-motion';
import { cn, formatRelativeTime, formatNumber } from '~/lib/utils';
import { 
  MoreHorizontal, 
  ExternalLink, 
  Copy, 
  Trash2, 
  Edit3,
  Eye,
  GitBranch,
  Clock,
  Globe,
  Zap
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface Project {
  id: string;
  name: string;
  description?: string;
  url?: string;
  previewUrl?: string;
  thumbnail?: string;
  status: 'active' | 'draft' | 'archived' | 'building';
  framework?: string;
  views?: number;
  lastUpdated: Date | string;
  createdAt: Date | string;
}

interface ProjectCardProps {
  project: Project;
  onOpen?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDuplicate?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onPreview?: (project: Project) => void;
  className?: string;
  delay?: number;
}

const statusConfig = {
  active: { label: 'نشط', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  draft: { label: 'مسودة', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  archived: { label: 'مؤرشف', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  building: { label: 'قيد البناء', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

const frameworkIcons: Record<string, string> = {
  react: '⚛️',
  vue: '💚',
  angular: '🅰️',
  svelte: '🔥',
  next: '▲',
  nuxt: '💚',
  remix: '💿',
  astro: '🚀',
  html: '🌐',
};

export function ProjectCard({
  project,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
  onPreview,
  className,
  delay = 0,
}: ProjectCardProps) {
  const status = statusConfig[project.status];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10',
        'bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl',
        'hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10',
        'transition-all duration-300 cursor-pointer',
        className
      )}
      onClick={() => onOpen?.(project)}
    >
      {/* Thumbnail / Preview */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-900/50">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/20 to-blue-900/20">
            <div className="text-4xl opacity-50">
              {frameworkIcons[project.framework || ''] || '📁'}
            </div>
          </div>
        )}
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.(project);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          {project.previewUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview?.(project);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
            status.color
          )}>
            {project.status === 'building' && (
              <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            )}
            {status.label}
          </span>
        </div>
        
        {/* Actions Menu */}
        <div className="absolute top-3 right-3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white/70 backdrop-blur-sm hover:bg-black/60 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[180px] rounded-xl border border-white/10 bg-gray-900/95 p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
                sideOffset={5}
                align="end"
              >
                <DropdownMenu.Item
                  onClick={() => onEdit?.(project)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white outline-none"
                >
                  <Edit3 className="h-4 w-4" />
                  تعديل
                </DropdownMenu.Item>
                
                {project.url && (
                  <DropdownMenu.Item
                    onClick={() => window.open(project.url, '_blank')}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white outline-none"
                  >
                    <ExternalLink className="h-4 w-4" />
                    فتح الرابط
                  </DropdownMenu.Item>
                )}
                
                <DropdownMenu.Item
                  onClick={() => onDuplicate?.(project)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white outline-none"
                >
                  <Copy className="h-4 w-4" />
                  نسخ
                </DropdownMenu.Item>
                
                <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
                
                <DropdownMenu.Item
                  onClick={() => onDelete?.(project)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 outline-none"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-white truncate">{project.name}</h3>
          {project.framework && (
            <span className="text-lg shrink-0">{frameworkIcons[project.framework]}</span>
          )}
        </div>
        
        {project.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">{project.description}</p>
        )}
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {project.views !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{formatNumber(project.views)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatRelativeTime(project.lastUpdated)}</span>
          </div>
        </div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}

interface ProjectGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ProjectGrid({ children, className }: ProjectGridProps) {
  return (
    <div className={cn(
      'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      className
    )}>
      {children}
    </div>
  );
}

interface EmptyProjectsProps {
  onCreateNew?: () => void;
}

export function EmptyProjects({ onCreateNew }: EmptyProjectsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
        <Zap className="h-10 w-10 text-purple-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-white">لا توجد مشاريع بعد</h3>
      <p className="mb-6 max-w-md text-gray-400">
        ابدأ بإنشاء مشروعك الأول باستخدام الذكاء الاصطناعي
      </p>
      {onCreateNew && (
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-medium text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
        >
          <Zap className="h-4 w-4" />
          إنشاء مشروع جديد
        </button>
      )}
    </motion.div>
  );
}
