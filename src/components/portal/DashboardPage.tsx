import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import SEO from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getDashboardStats, getLeadsChartData, getRecentActivity } from '@/services/dashboardService';
import type { DashboardStats, Activity } from '@/types/portal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  colorClass: 'lime' | 'white';
  isLoading?: boolean;
}

function StatCard({ title, value, trend, trendUp = true, icon, colorClass, isLoading }: StatCardProps) {
  const bgColors = {
    lime: 'bg-brand-lime/10 text-brand-lime',
    white: 'bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white',
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-6 rounded-2xl">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <Skeleton className="w-16 h-6 rounded" />
        </div>
        <Skeleton className="w-24 h-4 mb-2" />
        <Skeleton className="w-20 h-8" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-6 rounded-2xl group cursor-default hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 ease-fluid">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-lg transition-transform duration-300 ease-fluid group-hover:scale-110 ${bgColors[colorClass]}`}
        >
          {icon}
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-semibold px-2 py-1 rounded',
            trendUp 
              ? 'text-green-600 bg-green-500/10' 
              : 'text-red-600 bg-red-500/10'
          )}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:scale-105 origin-left transition-transform duration-300 ease-fluid">
        {value}
      </p>
    </div>
  );
}

// Activity item component
interface ActivityItemProps {
  activity: Activity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const typeStyles = {
    lead_processing: 'bg-blue-500/10 text-blue-500',
    email_generation: 'bg-purple-500/10 text-purple-500',
    chat: 'bg-brand-lime/10 text-brand-lime',
  };

  const typeLabels = {
    lead_processing: 'Lead Processing',
    email_generation: 'Email Generation',
    chat: 'Chat',
  };

  const typeIcons = {
    lead_processing: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      </svg>
    ),
    email_generation: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    chat: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
      <div className={cn('p-2 rounded-lg', typeStyles[activity.interaction_type])}>
        {typeIcons[activity.interaction_type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            activity.success ? 'bg-green-500' : 'bg-red-500'
          )} />
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {typeLabels[activity.interaction_type]}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-500">{formatTimeAgo(activity.created_at)}</span>
          {activity.input_tokens && activity.output_tokens && (
            <span className="text-xs text-gray-400">
              {(activity.input_tokens + activity.output_tokens).toLocaleString()} tokens
            </span>
          )}
          {activity.total_cost_usd && (
            <span className="text-xs text-brand-lime">
              ${activity.total_cost_usd.toFixed(4)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { client, user } = useAuth();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);

    const [statsResult, chartResult, activityResult] = await Promise.all([
      getDashboardStats(),
      getLeadsChartData(30),
      getRecentActivity(8),
    ]);

    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data);
    } else if (statsResult.error) {
      toast.error(statsResult.error.message);
    }

    if (chartResult.success && chartResult.data) {
      setChartData(chartResult.data);
    }

    if (activityResult.success) {
      setRecentActivity(activityResult.data as Activity[]);
    }

    setIsLoading(false);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Update timestamp every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Format chart data for display
  const formattedChartData = useMemo(() => {
    return chartData.map(point => ({
      ...point,
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [chartData]);

  return (
    <div className="max-w-7xl mx-auto">
      <SEO
        title="Dashboard - Client Portal - Khanect AI"
        description="View your automation performance and activity."
        noindex={true}
      />

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 text-brand-lime text-xs font-bold border border-brand-lime/20 mb-2 cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-brand-lime opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-lime"></span>
            </span>
            Live System Status: Healthy
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {client?.business_name || 'Dashboard'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Welcome back, {client?.full_name || user?.email}. Here is your automation performance.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isLoading ? 'animate-spin' : ''}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          </button>
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] px-6 py-4 rounded-xl">
            <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">
              Total Leads
            </span>
            {isLoading ? (
              <Skeleton className="w-16 h-9" />
            ) : (
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.totalLeads || 0}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Leads This Month"
          value={stats?.leadsThisMonth || 0}
          trend={stats?.leadsChange !== undefined ? `${stats.leadsChange >= 0 ? '+' : ''}${stats.leadsChange}%` : undefined}
          trendUp={(stats?.leadsChange || 0) >= 0}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          colorClass="lime"
          isLoading={isLoading}
        />

        <StatCard
          title="Hot Leads"
          value={stats?.hotLeads || 0}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          }
          colorClass="white"
          isLoading={isLoading}
        />

        <StatCard
          title="Emails Sent"
          value={stats?.emailsSent || 0}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          }
          colorClass="white"
          isLoading={isLoading}
        />

        <StatCard
          title="AI Cost (Total)"
          value={`$${(stats?.totalCost || 0).toFixed(2)}`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
          colorClass="white"
          isLoading={isLoading}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Leads Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-6 md:p-8 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Leads Over Time
            </h2>
            <Badge variant="outline" className="text-xs">Last 30 days</Badge>
          </div>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-brand-lime/20 border-t-brand-lime rounded-full animate-spin"></div>
            </div>
          ) : formattedChartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formattedChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(17, 17, 17, 0.9)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '12px',
                    }}
                    itemStyle={{ color: '#14B8A6' }}
                    labelStyle={{ color: '#fff', marginBottom: '8px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="#14B8A6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                    name="New Leads"
                    animationDuration={prefersReducedMotion ? 0 : 1200}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              No data available yet
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <Badge variant="outline" className="text-xs">Live</Badge>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-1 max-h-[350px] overflow-y-auto">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-white/[0.06] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No activity yet
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lead Categories */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Lead Categories</h3>
          </div>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Hot</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.hotLeads || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Warm</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.warmLeads || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Cold</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.coldLeads || 0}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">This Month</h3>
          </div>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">New Leads</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.leadsThisMonth || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Emails Sent</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.emailsThisMonth || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">AI Costs</span>
                <span className="font-semibold text-gray-900 dark:text-white">${(stats?.costThisMonth || 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Conversion</h3>
          </div>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="flex flex-col items-center justify-center h-[100px]">
              <div className="text-4xl font-bold text-brand-lime">
                {stats?.conversionRate || 0}%
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Leads Scored
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
