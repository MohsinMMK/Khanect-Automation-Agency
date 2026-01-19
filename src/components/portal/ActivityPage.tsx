import { useState, useEffect, useCallback } from 'react';
import SEO from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getActivities, getActivityStats, ActivityFilters } from '@/services/activityService';
import type { Activity, ActivityType } from '@/types/portal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Type styles and labels
const typeStyles: Record<ActivityType, string> = {
  lead_processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  email_generation: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  chat: 'bg-brand-lime/10 text-brand-lime border-brand-lime/20',
};

const typeLabels: Record<ActivityType, string> = {
  lead_processing: 'Lead Processing',
  email_generation: 'Email Generation',
  chat: 'Chat Session',
};

const typeIcons: Record<ActivityType, React.ReactNode> = {
  lead_processing: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  email_generation: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  chat: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

interface ActivityCardProps {
  activity: Activity;
}

function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.1] transition-colors">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn('p-3 rounded-xl', typeStyles[activity.interaction_type])}>
          {typeIcons[activity.interaction_type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  activity.success ? 'bg-green-500' : 'bg-red-500'
                )} />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {typeLabels[activity.interaction_type]}
                </h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Model: {activity.model_used}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatTimeAgo(activity.created_at)}
              </p>
              <p className="text-xs text-gray-400">{formatDate(activity.created_at)}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {activity.input_tokens !== undefined && activity.output_tokens !== undefined && (
              <Badge variant="outline" className="text-xs">
                {(activity.input_tokens + activity.output_tokens).toLocaleString()} tokens
              </Badge>
            )}
            {activity.total_cost_usd !== undefined && (
              <Badge variant="outline" className="text-xs text-brand-lime border-brand-lime/20">
                ${activity.total_cost_usd.toFixed(4)}
              </Badge>
            )}
            {activity.latency_ms !== undefined && (
              <Badge variant="outline" className="text-xs">
                {activity.latency_ms}ms
              </Badge>
            )}
            {!activity.success && activity.error_message && (
              <Badge variant="outline" className="text-xs text-red-500 border-red-500/20">
                Error
              </Badge>
            )}
          </div>

          {/* Error message */}
          {!activity.success && activity.error_message && (
            <p className="mt-2 text-xs text-red-500 bg-red-500/10 p-2 rounded-lg">
              {activity.error_message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<{
    totalInteractions: number;
    todayInteractions: number;
    weekCost: number;
    successRate: number;
  } | null>(null);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([]);
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('all');

  const getDateFilter = useCallback(() => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return undefined;
    }
  }, [dateRange]);

  const fetchActivities = useCallback(async (pageNum = 1) => {
    setIsLoading(true);

    const filters: ActivityFilters = {
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
      dateFrom: getDateFilter(),
    };

    const [activitiesResult, statsResult] = await Promise.all([
      getActivities(filters, pageNum, 20),
      pageNum === 1 ? getActivityStats() : Promise.resolve({ success: true, data: stats }),
    ]);

    if (activitiesResult.success && activitiesResult.data) {
      if (pageNum === 1) {
        setActivities(activitiesResult.data);
      } else {
        setActivities(prev => [...prev, ...activitiesResult.data!]);
      }
      setTotalCount(activitiesResult.count || 0);
    } else {
      toast.error(activitiesResult.error?.message || 'Failed to fetch activities');
    }

    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data);
    }

    setIsLoading(false);
  }, [selectedTypes, getDateFilter, stats]);

  useEffect(() => {
    setPage(1);
    fetchActivities(1);
  }, [selectedTypes, dateRange]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage);
  };

  const toggleType = (type: ActivityType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SEO
        title="Activity - Client Portal - Khanect AI"
        description="View AI agent activity and automation logs."
        noindex={true}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track AI agent interactions and automation logs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-4 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Interactions</p>
          {isLoading && !stats ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.totalInteractions || 0}
            </p>
          )}
        </div>
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-4 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
          {isLoading && !stats ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats?.todayInteractions || 0}
            </p>
          )}
        </div>
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-4 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">Cost (7 days)</p>
          {isLoading && !stats ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-brand-lime mt-1">
              ${stats?.weekCost?.toFixed(2) || '0.00'}
            </p>
          )}
        </div>
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-4 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
          {isLoading && !stats ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-green-500 mt-1">
              {stats?.successRate || 100}%
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
          {(['chat', 'lead_processing', 'email_generation'] as ActivityType[]).map(type => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                selectedTypes.includes(type)
                  ? typeStyles[type]
                  : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
              )}
            >
              {typeLabels[type]}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-white/[0.06] hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Date:</span>
          {[
            { value: 'today', label: 'Today' },
            { value: '7days', label: '7 Days' },
            { value: '30days', label: '30 Days' },
            { value: 'all', label: 'All Time' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value as any)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                dateRange === option.value
                  ? 'bg-brand-lime/10 text-brand-lime'
                  : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {isLoading && activities.length === 0 ? (
          [...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))
        ) : activities.length > 0 ? (
          <>
            {activities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}

            {/* Load More */}
            {activities.length < totalCount && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : `Load More (${activities.length}/${totalCount})`}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl">
            <div className="w-16 h-16 bg-brand-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-lime">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No activity yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              AI agent interactions will appear here as they happen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
