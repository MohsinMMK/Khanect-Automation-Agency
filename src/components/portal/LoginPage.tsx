import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Get the redirect path from location state, or default to /portal
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/portal';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLogging(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || 'Invalid email or password.');
    }

    setIsLogging(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsResetting(true);

    const result = await resetPassword(resetEmail);

    if (result.success) {
      toast.success('Password reset email sent. Check your inbox.');
      setShowForgotPassword(false);
      setResetEmail('');
    } else {
      toast.error(result.error || 'Failed to send reset email.');
    }

    setIsResetting(false);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50 dark:bg-[#0F0F11]">
        <SEO
          title="Reset Password - Client Portal - Khanect AI"
          description="Reset your Khanect AI client portal password."
          noindex={true}
        />
        <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] shadow-xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-lime/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand-lime">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Reset Password
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="peer w-full bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-lg px-4 pt-6 pb-2 text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:border-brand-lime transition-all duration-300 focus:ring-1 focus:ring-brand-lime/50 text-sm"
                placeholder="name@company.com"
                required
                disabled={isResetting}
              />
              <label
                htmlFor="resetEmail"
                className="absolute left-4 top-2 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs"
              >
                Email Address
              </label>
            </div>

            <button
              type="submit"
              disabled={isResetting}
              className="w-full bg-brand-lime hover:bg-brand-limeHover text-black font-bold py-3 rounded-lg transition-all duration-300 ease-fluid hover:shadow-[0_0_20px_rgba(211,243,107,0.3)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isResetting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <button
            onClick={() => setShowForgotPassword(false)}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50 dark:bg-[#0F0F11]">
      <SEO
        title="Login - Client Portal - Khanect AI"
        description="Login to your Khanect AI client portal."
        noindex={true}
      />
      <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-lime/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand-lime">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="3" />
              <path d="M12 8v3" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Client Portal
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Sign in to access your automation dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
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

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
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
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLogging}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Forgot password link */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-brand-lime hover:text-brand-lime/80 transition-colors"
            >
              Forgot password?
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
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-gray-500">
          Don't have access? Contact your administrator for an invite.
        </p>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/[0.06] text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors inline-flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
