import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ChartDataPoint } from '../types';
import { supabase, Client } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

const data: ChartDataPoint[] = [
  { month: 'Jan', cost: 4000, savings: 0 },
  { month: 'Feb', cost: 3800, savings: 500 },
  { month: 'Mar', cost: 3500, savings: 1200 },
  { month: 'Apr', cost: 2800, savings: 2400 },
  { month: 'May', cost: 2000, savings: 3800 },
  { month: 'Jun', cost: 1500, savings: 5200 },
  { month: 'Jul', cost: 1200, savings: 6500 },
];

const ClientPortal: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLogging, setIsLogging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Check initial session and set up auth listener
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchClientData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchClientData(session.user.id);
      } else {
        setClient(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch client data from clients table
  const fetchClientData = async (userId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching client data:', error);
        setAuthError('Failed to load client data. Please contact support.');
        setLoading(false);
        return;
      }

      if (!data) {
        setAuthError('No client record found. Please contact support.');
        setLoading(false);
        return;
      }

      // Check if client status is active
      if (data.status !== 'active') {
        setAuthError(`Your account is ${data.status}. Please contact support.`);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      setClient(data);
      setLoading(false);
    } catch (err) {
      console.error('Unexpected error:', err);
      setAuthError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Update timestamp every minute
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !supabase) return;

    setIsLogging(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setAuthError(error.message || 'Invalid email or password.');
        setIsLogging(false);
        return;
      }

      if (data.user) {
        // fetchClientData will be called by the auth state change listener
        setIsLogging(false);
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setAuthError('An unexpected error occurred. Please try again.');
      setIsLogging(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;

    await supabase.auth.signOut();
    setUser(null);
    setClient(null);
    setEmail('');
    setPassword('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-[85vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-lime/20 border-t-brand-lime rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login form (NO SIGN UP)
  if (!user || !client) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-[85vh] flex items-center justify-center">
        <div className="glass-card w-full max-w-md p-8 rounded-2xl animate-scale-up shadow-xl dark:shadow-2xl">

            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-brand-lime/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand-lime">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/></svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white transition-colors">
                    Client Portal
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">
                    Sign in to access your automation dashboard
                </p>
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {authError}
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                {/* Floating Label - Email */}
                <div className="relative">
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer w-full bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-lg px-4 pt-6 pb-2 text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:border-brand-lime transition-all duration-300 focus:ring-1 focus:ring-brand-lime/50 text-sm"
                        placeholder="name@company.com"
                        required
                        disabled={isLogging}
                    />
                    <label
                        htmlFor="email"
                        className="absolute left-4 top-2 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs"
                    >
                        Email Address
                    </label>
                </div>

                {/* Floating Label - Password */}
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="peer w-full bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-lg px-4 pt-6 pb-2 pr-10 text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:border-brand-lime transition-all duration-300 focus:ring-1 focus:ring-brand-lime/50 text-sm"
                        placeholder="••••••••"
                        required
                        disabled={isLogging}
                    />
                    <label
                        htmlFor="password"
                        className="absolute left-4 top-2 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs"
                    >
                        Password
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none disabled:opacity-50"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        disabled={isLogging}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLogging}
                    className="w-full bg-brand-lime hover:bg-brand-limeHover text-black font-bold py-3 rounded-lg transition-all duration-300 ease-fluid hover:shadow-[0_0_20px_rgba(211,243,107,0.3)] hover:scale-[1.02] mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLogging ? (
                        <>
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                            Signing In...
                        </>
                    ) : 'Sign In'}
                </button>
            </form>

            <p className="text-center mt-6 text-xs text-gray-500">
                Don't have access? Contact your administrator for an invite.
            </p>
        </div>
      </div>
    );
  }

  // Authenticated - show dashboard
  return (
    <div className="pt-24 md:pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header with Logout Button */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4 stagger-fade">
        <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 text-brand-lime text-xs font-bold border border-brand-lime/20 mb-2 cursor-default">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-brand-lime opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-lime"></span>
                </span>
                Live System Status: Healthy
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white transition-colors">
              {client.business_name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors">
              Welcome back, {client.full_name || user.email}. Here is your automation performance.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-6 py-4 rounded-xl border border-gray-200 dark:border-white/10 transition-colors">
              <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1 transition-colors">Total Saved YTD</span>
              <div className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">$45,230.00</div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all duration-200 border border-gray-200 dark:border-white/10"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stat Cards with CSS-only stagger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 stagger-fade">
        <StatCard
            title="Active Agents"
            value="4"
            trend="+12%"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>}
            colorClass="lime"
        />

        <StatCard
            title="Hours Saved (Mo)"
            value="842"
            trend="+240hrs"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            colorClass="white"
        />

        <StatCard
            title="ROI Factor"
            value="3.4x"
            trend="+45%"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            colorClass="white"
        />
      </div>

      {/* Main Chart */}
      <div className="glass-card p-6 md:p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl stagger-fade">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white transition-colors">Cost vs. Savings Analysis</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D3F36B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#D3F36B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#333" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#333" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(17, 17, 17, 0.75)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '12px'
                }}
                itemStyle={{ color: '#D3F36B' }}
                labelStyle={{ color: '#fff', marginBottom: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="savings"
                stroke="#D3F36B"
                fillOpacity={1}
                fill="url(#colorSavings)"
                name="Operational Savings ($)"
                animationDuration={prefersReducedMotion ? 0 : 1200}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="#666"
                fillOpacity={1}
                fill="url(#colorCost)"
                name="Operational Cost ($)"
                animationDuration={prefersReducedMotion ? 0 : 1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    icon: React.ReactNode;
    colorClass: 'lime' | 'white';
}

const StatCard = React.memo<StatCardProps>(({ title, value, trend, icon, colorClass }) => {
    const bgColors = {
        lime: 'bg-brand-lime/10 text-brand-lime',
        white: 'bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white',
    };

    return (
        <div className="glass-card p-6 rounded-2xl group cursor-default hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 ease-fluid">
           <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-lg transition-transform duration-300 ease-fluid group-hover:scale-110 ${bgColors[colorClass]}`}>
                    {icon}
               </div>
               <span className="text-xs font-semibold text-brand-lime bg-brand-lime/10 px-2 py-1 rounded">{trend}</span>
           </div>
           <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{title}</h3>
           <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1 group-hover:scale-105 origin-left transition-transform duration-300 ease-fluid">{value}</p>
        </div>
    );
});

StatCard.displayName = 'StatCard';

export default ClientPortal;
