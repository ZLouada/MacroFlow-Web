/**
 * Smart Summary Component
 * 
 * AI-powered component that generates concise summaries of recent activity,
 * comments, and status changes.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  GitCommit,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateSmartSummary, type AISummary } from '@/lib/ai';

// ============================================================================
// Types
// ============================================================================

interface SmartSummaryProps {
  className?: string;
  title?: string;
  context?: 'project' | 'sprint' | 'team' | 'personal';
}

interface ActivityItem {
  type: 'comment' | 'status_change' | 'assignment' | 'creation';
  content: string;
  timestamp: Date;
  user: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const generateMockActivities = (): ActivityItem[] => {
  const activities: ActivityItem[] = [
    { type: 'status_change', content: 'Task "API Integration" moved to Done', timestamp: new Date(), user: 'Alice' },
    { type: 'comment', content: 'Great progress on the design review!', timestamp: new Date(), user: 'Bob' },
    { type: 'status_change', content: 'Task "Bug fix #234" moved to Review', timestamp: new Date(), user: 'Charlie' },
    { type: 'assignment', content: 'Task "Documentation" assigned to Diana', timestamp: new Date(), user: 'Alice' },
    { type: 'comment', content: 'Need more details on the requirements', timestamp: new Date(), user: 'Salma' },
    { type: 'creation', content: 'New task "Performance optimization" created', timestamp: new Date(), user: 'Bob' },
    { type: 'status_change', content: 'Task "Landing page" marked as blocked', timestamp: new Date(), user: 'Charlie' },
    { type: 'comment', content: 'Approved the new feature design', timestamp: new Date(), user: 'Alice' },
    { type: 'status_change', content: '5 tasks completed this sprint', timestamp: new Date(), user: 'System' },
    { type: 'comment', content: 'Dependencies resolved, ready to proceed', timestamp: new Date(), user: 'Diana' },
  ];
  
  return activities;
};

// ============================================================================
// Sub-components
// ============================================================================

interface SentimentBadgeProps {
  sentiment: AISummary['sentiment'];
}

function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const { t } = useTranslation();
  
  const config = {
    positive: {
      icon: TrendingUp,
      label: t('summary.sentiments.positive'),
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    neutral: {
      icon: GitCommit,
      label: t('summary.sentiments.neutral'),
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    negative: {
      icon: AlertCircle,
      label: t('summary.sentiments.negative'),
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    },
  };
  
  const { icon: Icon, label, className } = config[sentiment];
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      className
    )}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SmartSummary({ className, title, context = 'project' }: SmartSummaryProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Fetch AI summary
  const { data: summary, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['ai-summary', context],
    queryFn: async () => {
      const activities = generateMockActivities();
      return generateSmartSummary(activities);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Copy summary to clipboard
  const copyToClipboard = async () => {
    if (!summary) return;
    
    const text = [
      '📊 AI Summary',
      '',
      '📌 Key Points:',
      ...summary.bulletPoints.map(bp => `• ${bp}`),
      '',
      '🎯 Action Items:',
      ...summary.actionItems.map(ai => `• ${ai}`),
    ].join('\n');
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-300',
      isExpanded ? 'ring-2 ring-primary/20' : '',
      className
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {title || t('summary.title')}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn(
                'h-3.5 w-3.5',
                isFetching && 'animate-spin'
              )} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              {t('summary.generating')}
            </span>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {/* Sentiment & Topics */}
            <div className="flex flex-wrap items-center gap-2">
              <SentimentBadge sentiment={summary.sentiment} />
              {summary.keyTopics.map(topic => (
                <span
                  key={topic}
                  className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
                >
                  {topic}
                </span>
              ))}
            </div>
            
            {/* Bullet Points */}
            <div className="space-y-2">
              {summary.bulletPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm">{point}</p>
                </motion.div>
              ))}
            </div>
            
            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t space-y-4">
                    {/* Action Items */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {t('summary.actionItems')}
                      </h4>
                      <ul className="space-y-2">
                        {summary.actionItems.map((item, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="text-primary">→</span>
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Copy button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="w-full"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 me-2" />
                          {t('common.copied')}
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 me-2" />
                          {t('summary.copyToClipboard')}
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            {t('summary.noData')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default SmartSummary;
