import { motion } from 'framer-motion';
import { cn, formatNumber, formatPercentage } from '~/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percentage' | 'none';
  className?: string;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = 'من الشهر الماضي',
  icon,
  trend,
  format = 'number',
  className,
  delay = 0,
}: StatsCardProps) {
  const formattedValue = typeof value === 'number' && format !== 'none'
    ? formatNumber(value)
    : value;
  
  const trendDirection = trend || (change ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl',
        'hover:border-white/20 hover:from-white/10 hover:to-white/5',
        'transition-all duration-300 group',
        className
      )}
    >
      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-400">{title}</span>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
            {icon}
          </div>
        )}
      </div>
      
      {/* Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <motion.span
          key={formattedValue}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white"
        >
          {formattedValue}
        </motion.span>
      </div>
      
      {/* Change Indicator */}
      {change !== undefined && (
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
            trendDirection === 'up' && 'bg-green-500/10 text-green-400',
            trendDirection === 'down' && 'bg-red-500/10 text-red-400',
            trendDirection === 'neutral' && 'bg-gray-500/10 text-gray-400'
          )}>
            {trendDirection === 'up' && <ArrowUpIcon className="h-3 w-3" />}
            {trendDirection === 'down' && <ArrowDownIcon className="h-3 w-3" />}
            <span>{formatPercentage(Math.abs(change), { showSign: false })}</span>
          </div>
          <span className="text-xs text-gray-500">{changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}
