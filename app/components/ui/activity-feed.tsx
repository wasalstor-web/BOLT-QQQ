import { motion } from 'framer-motion';
import { cn, formatRelativeTime, getInitials, generateAvatarColor } from '~/lib/utils';
import * as Avatar from '@radix-ui/react-avatar';
import { 
  FileCode2, 
  GitBranch, 
  MessageSquare, 
  Star, 
  Users,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Rocket
} from 'lucide-react';

export type ActivityType = 
  | 'project_created'
  | 'project_deployed'
  | 'project_updated'
  | 'comment_added'
  | 'member_joined'
  | 'build_success'
  | 'build_failed'
  | 'ai_generation';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  user: {
    name: string;
    avatar?: string;
  };
  project?: {
    name: string;
    url?: string;
  };
  timestamp: Date | string;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  className?: string;
  maxItems?: number;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  project_created: <FileCode2 className="h-4 w-4" />,
  project_deployed: <Rocket className="h-4 w-4" />,
  project_updated: <GitBranch className="h-4 w-4" />,
  comment_added: <MessageSquare className="h-4 w-4" />,
  member_joined: <Users className="h-4 w-4" />,
  build_success: <CheckCircle2 className="h-4 w-4" />,
  build_failed: <XCircle className="h-4 w-4" />,
  ai_generation: <Zap className="h-4 w-4" />,
};

const activityColors: Record<ActivityType, string> = {
  project_created: 'bg-blue-500/10 text-blue-400',
  project_deployed: 'bg-green-500/10 text-green-400',
  project_updated: 'bg-purple-500/10 text-purple-400',
  comment_added: 'bg-yellow-500/10 text-yellow-400',
  member_joined: 'bg-cyan-500/10 text-cyan-400',
  build_success: 'bg-emerald-500/10 text-emerald-400',
  build_failed: 'bg-red-500/10 text-red-400',
  ai_generation: 'bg-violet-500/10 text-violet-400',
};

function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group flex gap-4 py-4 hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-colors"
    >
      {/* Activity Icon */}
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
        activityColors[activity.type]
      )}>
        {activityIcons[activity.type]}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-white">
              <span className="font-medium">{activity.user.name}</span>
              {' '}
              <span className="text-gray-400">{activity.title}</span>
              {activity.project && (
                <>
                  {' '}
                  <span className="font-medium text-purple-400 hover:text-purple-300 cursor-pointer">
                    {activity.project.name}
                  </span>
                </>
              )}
            </p>
            {activity.description && (
              <p className="mt-1 text-xs text-gray-500 truncate">{activity.description}</p>
            )}
          </div>
          
          {/* Timestamp */}
          <div className="flex items-center gap-1 shrink-0 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(activity.timestamp)}</span>
          </div>
        </div>
      </div>
      
      {/* User Avatar */}
      <Avatar.Root className="shrink-0">
        <Avatar.Image
          className="h-8 w-8 rounded-full object-cover"
          src={activity.user.avatar}
          alt={activity.user.name}
        />
        <Avatar.Fallback
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white',
            generateAvatarColor(activity.user.name)
          )}
        >
          {getInitials(activity.user.name)}
        </Avatar.Fallback>
      </Avatar.Root>
    </motion.div>
  );
}

export function ActivityFeed({
  activities,
  title = 'النشاط الأخير',
  showViewAll = true,
  onViewAll,
  className,
  maxItems = 5,
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn(
        'rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            عرض الكل
          </button>
        )}
      </div>
      
      {/* Activities List */}
      <div className="divide-y divide-white/5">
        {displayedActivities.length > 0 ? (
          displayedActivities.map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} index={index} />
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">لا يوجد نشاط حتى الآن</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
