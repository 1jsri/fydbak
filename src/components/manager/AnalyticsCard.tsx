import { TrendingUp, TrendingDown, Minus, Video as LucideIcon } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  subtitle?: string;
}

export function AnalyticsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  subtitle,
}: AnalyticsCardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="w-4 h-4" />;
    return change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-slate-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${iconBgColor} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-semibold">
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {(subtitle || changeLabel) && (
          <p className="text-xs text-slate-500">
            {changeLabel || subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  progressColor?: string;
}

export function ProgressCard({
  title,
  current,
  total,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  progressColor = 'bg-blue-600',
}: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
      </div>

      <h3 className="text-sm font-medium text-slate-900 mb-2">{title}</h3>

      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
        <div
          className={`${progressColor} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-slate-600">
        {current} of {total}
      </p>
    </div>
  );
}
