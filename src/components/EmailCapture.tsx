import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface EmailCaptureProps {
  className?: string;
  source?: string;
}

export default function EmailCapture({ className = '', source = 'blog_generic' }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fallback to n8n webhook if Supabase table isn't ready or preferred
  const N8N_WEBHOOK = import.meta.env.VITE_N8N_WEBHOOK_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // 1. Try Supabase 'leads' table first
      const { error: supabaseError } = await supabase
        .from('leads')
        .insert([{ email, source, created_at: new Date().toISOString() }]);

      if (supabaseError) {
        // If table doesn't exist, ignore (or log) and try webhook
        console.warn('Supabase leads insert failed (table might be missing), trying webhook', supabaseError);
        
        // 2. Fallback to N8N Webhook if configured
        if (N8N_WEBHOOK) {
            await fetch(N8N_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source, timestamp: new Date().toISOString() })
            });
        }
      }

      setSuccess(true);
      toast.success('Successfully subscribed! check your inbox soon.');
      setEmail('');
    } catch (err) {
      console.error('Submission failed', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-brand-lime/10 border border-brand-lime/20 rounded-2xl p-8 text-center ${className}`}
      >
        <div className="w-12 h-12 bg-brand-lime/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-brand-lime" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">You're in!</h3>
        <p className="text-gray-400">Thanks for subscribing to our newsletter.</p>
      </motion.div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 p-8 md:p-12 ${className}`}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-lime/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Stay ahead of the <span className="text-brand-lime">AI curve</span>
          </h3>
          <p className="text-gray-400 max-w-md mx-auto md:mx-0">
            Join 2,000+ agency owners and founders getting weekly automation insights delivered straight to their inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="px-6 py-3 bg-gray-950 border border-gray-800 rounded-full text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/50 w-full sm:w-80 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="group px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-brand-lime transition-colors flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Subscribe'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  );
}
