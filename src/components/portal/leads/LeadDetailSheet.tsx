import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getLeadById } from '@/services/leadsService';
import type { Lead, FollowUp } from '@/types/portal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LeadDetailSheetProps {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Category badge styles
const categoryStyles = {
  hot: 'bg-red-500/10 text-red-500 border-red-500/20',
  warm: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  cold: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  unqualified: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

// Status badge styles
const statusStyles = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  sent: 'bg-green-500/10 text-green-500 border-green-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

// Email type labels
const emailTypeLabels: Record<string, string> = {
  welcome: 'Welcome Email',
  value_prop: 'Value Proposition',
  case_study: 'Case Study',
  demo_invite: 'Demo Invitation',
  check_in: 'Check-in',
  final: 'Final Follow-up',
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

function ScoreIndicator({ label, value, max = 100 }: { label: string; value?: number; max?: number }) {
  if (value === undefined || value === null) return null;
  
  const percentage = (value / max) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-gray-900 dark:text-white font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
        <div 
          className="h-full bg-brand-lime rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function FollowUpTimeline({ followups }: { followups: FollowUp[] }) {
  if (!followups || followups.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
        No follow-ups scheduled
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {followups.map((followup, index) => (
        <div key={followup.id} className="flex gap-3">
          {/* Timeline indicator */}
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-3 h-3 rounded-full border-2',
              followup.status === 'sent' 
                ? 'bg-green-500 border-green-500' 
                : followup.status === 'failed'
                ? 'bg-red-500 border-red-500'
                : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
            )} />
            {index < followups.length - 1 && (
              <div className="w-0.5 flex-1 bg-gray-200 dark:bg-white/[0.06] my-1" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {emailTypeLabels[followup.email_type] || followup.email_type}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {followup.sent_at 
                    ? `Sent ${formatDate(followup.sent_at)}`
                    : `Scheduled for ${formatDate(followup.scheduled_for)}`
                  }
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={cn('text-xs capitalize', statusStyles[followup.status])}
              >
                {followup.status}
              </Badge>
            </div>
            {followup.error_message && (
              <p className="text-xs text-red-500 mt-1">{followup.error_message}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeadDetailSheet({ leadId, open, onOpenChange }: LeadDetailSheetProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (leadId && open) {
      fetchLead();
    }
  }, [leadId, open]);

  const fetchLead = async () => {
    if (!leadId) return;
    
    setIsLoading(true);
    const result = await getLeadById(leadId);
    
    if (result.success && result.data) {
      setLead(result.data);
    } else {
      toast.error(result.error?.message || 'Failed to load lead details');
    }
    
    setIsLoading(false);
  };

  const handleCopyEmail = () => {
    if (lead?.email) {
      navigator.clipboard.writeText(lead.email);
      toast.success('Email copied to clipboard');
    }
  };

  const handleCopyPhone = () => {
    if (lead?.phone) {
      navigator.clipboard.writeText(lead.phone);
      toast.success('Phone copied to clipboard');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {isLoading ? (
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Separator />
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ) : lead ? (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl">{lead.full_name}</SheetTitle>
              <SheetDescription className="text-base">
                {lead.business_name}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white">{lead.email}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCopyEmail}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    </Button>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span className="text-sm text-gray-900 dark:text-white">{lead.phone}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleCopyPhone}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      </Button>
                    </div>
                  )}
                  {lead.website && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        <path d="M2 12h20" />
                      </svg>
                      <a 
                        href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-lime hover:underline"
                      >
                        {lead.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Message */}
              {lead.message && (
                <>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Message
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {lead.message}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Lead Score */}
              {lead.lead_score ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Lead Score
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={cn('text-sm capitalize', categoryStyles[lead.lead_score.category])}
                    >
                      {lead.lead_score.category}
                    </Badge>
                  </div>
                  
                  {/* Score Circle */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-200 dark:text-white/[0.06]"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(lead.lead_score.score / 100) * 226} 226`}
                          className="text-brand-lime"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {lead.lead_score.score}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      {lead.lead_score.reasoning && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {lead.lead_score.reasoning}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Score Indicators */}
                  <div className="space-y-3">
                    <ScoreIndicator 
                      label="Decision Maker Likelihood" 
                      value={lead.lead_score.decision_maker_likelihood} 
                    />
                    <ScoreIndicator 
                      label="Industry Fit" 
                      value={lead.lead_score.industry_fit_score} 
                    />
                    <ScoreIndicator 
                      label="Engagement Score" 
                      value={lead.lead_score.engagement_score} 
                    />
                  </div>

                  {/* Budget & Urgency */}
                  <div className="flex gap-2">
                    {lead.lead_score.budget_indicator && (
                      <Badge variant="outline" className="text-xs capitalize">
                        Budget: {lead.lead_score.budget_indicator}
                      </Badge>
                    )}
                    {lead.lead_score.urgency_indicator && (
                      <Badge variant="outline" className="text-xs capitalize">
                        Urgency: {lead.lead_score.urgency_indicator}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lead has not been scored yet
                  </p>
                </div>
              )}

              <Separator />

              {/* Follow-up History */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Follow-up History
                </h4>
                <FollowUpTimeline followups={lead.followups || []} />
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <Button className="w-full" disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Send Follow-up Email
                  <span className="ml-2 text-xs opacity-60">(Coming Soon)</span>
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Mark as Contacted
                  <span className="ml-2 text-xs opacity-60">(Coming Soon)</span>
                </Button>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t border-gray-200 dark:border-white/[0.06]">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Created: {formatDate(lead.created_at)}</span>
                  <span>ID: {lead.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Lead not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
