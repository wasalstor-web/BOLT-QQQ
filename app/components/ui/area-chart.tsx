import { motion } from 'framer-motion';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn, formatNumber } from '~/lib/utils';

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface AreaChartProps {
  data: ChartData[];
  dataKey?: string;
  title?: string;
  subtitle?: string;
  gradientId?: string;
  color?: string;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  height?: number;
  className?: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="rounded-lg border border-white/10 bg-gray-900/95 p-3 shadow-xl backdrop-blur-xl">
      <p className="mb-1 text-xs text-gray-400">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm font-semibold text-white">
          {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function AreaChart({
  data,
  dataKey = 'value',
  title,
  subtitle,
  gradientId = 'colorValue',
  color = '#8b5cf6',
  showGrid = true,
  showXAxis = true,
  showYAxis = false,
  height = 300,
  className,
}: AreaChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        'rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
        </div>
      )}
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
            )}
            
            {showXAxis && (
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
              />
            )}
            
            {showYAxis && (
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value)}
                dx={-10}
              />
            )}
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface MultiAreaChartProps extends Omit<AreaChartProps, 'dataKey' | 'color'> {
  series: Array<{
    dataKey: string;
    color: string;
    name?: string;
  }>;
}

export function MultiAreaChart({
  data,
  series,
  title,
  subtitle,
  showGrid = true,
  showXAxis = true,
  showYAxis = false,
  height = 300,
  className,
}: MultiAreaChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        'rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4">
            {series.map((s) => (
              <div key={s.dataKey} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-xs text-gray-400">{s.name || s.dataKey}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.dataKey} id={`gradient-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
            )}
            
            {showXAxis && (
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
              />
            )}
            
            {showYAxis && (
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value)}
                dx={-10}
              />
            )}
            
            <Tooltip content={<CustomTooltip />} />
            
            {series.map((s) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                stroke={s.color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-${s.dataKey})`}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
