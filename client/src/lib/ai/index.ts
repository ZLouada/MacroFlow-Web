/**
 * AI/LLM Integration Layer (Mock Implementation)
 * 
 * This module provides a simulated AI interface for natural language processing,
 * smart summaries, and predictive workload analysis.
 * 
 * In production, replace the mock functions with actual LLM API calls.
 */

import type { Task, TaskStatus, TaskPriority } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface AICommand {
  action: 'move' | 'create' | 'update' | 'delete' | 'assign' | 'notify' | 'search' | 'summarize';
  taskId?: string;
  taskTitle?: string;
  targetStatus?: TaskStatus;
  assignee?: string;
  priority?: TaskPriority;
  dueDate?: string;
  message?: string;
  searchQuery?: string;
  confidence: number;
}

export interface AICommandResult {
  success: boolean;
  command: AICommand;
  message: string;
  suggestions?: string[];
}

export interface WorkloadAnalysis {
  userId: string;
  userName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  tasksDueIn48h: number;
  totalActiveTasks: number;
  overdueTasks: number;
  averageCompletionRate: number;
  recommendation: string;
}

export interface AISummary {
  bulletPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  keyTopics: string[];
  actionItems: string[];
}

// ============================================================================
// Natural Language Command Parser (Mock)
// ============================================================================

const COMMAND_PATTERNS = [
  {
    pattern: /move\s+(?:the\s+)?["']?([^"']+)["']?\s+(?:task\s+)?to\s+["']?(done|todo|in\s*progress|review|blocked)["']?/i,
    action: 'move' as const,
  },
  {
    pattern: /create\s+(?:a\s+)?(?:new\s+)?task\s+["']?([^"']+)["']?/i,
    action: 'create' as const,
  },
  {
    pattern: /assign\s+["']?([^"']+)["']?\s+to\s+([a-zA-Z]+)/i,
    action: 'assign' as const,
  },
  {
    pattern: /notify\s+([a-zA-Z]+)\s+(?:about\s+)?["']?([^"']+)["']?/i,
    action: 'notify' as const,
  },
  {
    pattern: /search\s+(?:for\s+)?["']?([^"']+)["']?/i,
    action: 'search' as const,
  },
  {
    pattern: /delete\s+(?:the\s+)?["']?([^"']+)["']?\s*(?:task)?/i,
    action: 'delete' as const,
  },
  {
    pattern: /set\s+(?:the\s+)?priority\s+(?:of\s+)?["']?([^"']+)["']?\s+to\s+(low|medium|high|urgent)/i,
    action: 'update' as const,
  },
  {
    pattern: /summarize\s+(?:the\s+)?(?:recent\s+)?(?:activity|changes|comments)/i,
    action: 'summarize' as const,
  },
];

const STATUS_MAP: Record<string, TaskStatus> = {
  'done': 'done',
  'todo': 'todo',
  'to do': 'todo',
  'in progress': 'inProgress',
  'inprogress': 'inProgress',
  'review': 'review',
  'blocked': 'blocked',
};

export async function parseNaturalLanguageCommand(input: string): Promise<AICommand | null> {
  // Simulate AI processing delay
  await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
  
  const normalizedInput = input.toLowerCase().trim();
  
  for (const { pattern, action } of COMMAND_PATTERNS) {
    const match = normalizedInput.match(pattern);
    if (match) {
      switch (action) {
        case 'move': {
          const taskTitle = match[1].trim();
          const statusRaw = match[2].toLowerCase().replace(/\s+/g, '');
          const targetStatus = STATUS_MAP[statusRaw] || STATUS_MAP[match[2].toLowerCase()];
          return {
            action: 'move',
            taskTitle,
            targetStatus,
            confidence: 0.92,
          };
        }
        case 'create': {
          return {
            action: 'create',
            taskTitle: match[1].trim(),
            confidence: 0.95,
          };
        }
        case 'assign': {
          return {
            action: 'assign',
            taskTitle: match[1].trim(),
            assignee: match[2].trim(),
            confidence: 0.88,
          };
        }
        case 'notify': {
          return {
            action: 'notify',
            assignee: match[1].trim(),
            message: match[2].trim(),
            confidence: 0.85,
          };
        }
        case 'search': {
          return {
            action: 'search',
            searchQuery: match[1].trim(),
            confidence: 0.98,
          };
        }
        case 'delete': {
          return {
            action: 'delete',
            taskTitle: match[1].trim(),
            confidence: 0.75, // Lower confidence for destructive actions
          };
        }
        case 'update': {
          return {
            action: 'update',
            taskTitle: match[1].trim(),
            priority: match[2].toLowerCase() as TaskPriority,
            confidence: 0.90,
          };
        }
        case 'summarize': {
          return {
            action: 'summarize',
            confidence: 0.95,
          };
        }
      }
    }
  }
  
  // Try fuzzy matching for common intents
  if (normalizedInput.includes('help') || normalizedInput.includes('what can')) {
    return null; // Return null to show help
  }
  
  return null;
}

// ============================================================================
// Command Suggestions
// ============================================================================

export function getCommandSuggestions(input: string): string[] {
  const suggestions = [
    'Move "Task name" to Done',
    'Create a new task "Task description"',
    'Assign "Task name" to John',
    'Notify Sarah about "Project update"',
    'Search for "design review"',
    'Set priority of "Task name" to high',
    'Summarize recent activity',
  ];
  
  if (!input.trim()) {
    return suggestions.slice(0, 5);
  }
  
  const normalizedInput = input.toLowerCase();
  return suggestions
    .filter(s => s.toLowerCase().includes(normalizedInput))
    .slice(0, 5);
}

// ============================================================================
// Predictive Workload Analysis (Mock)
// ============================================================================

export async function analyzeWorkload(
  tasks: Task[],
  users: { id: string; name: string }[]
): Promise<WorkloadAnalysis[]> {
  await new Promise(r => setTimeout(r, 500));
  
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  
  return users.map(user => {
    const userTasks = tasks.filter(t => t.assigneeId === user.id);
    const activeTasks = userTasks.filter(t => t.status !== 'done');
    const overdueTasks = userTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    );
    const tasksDueIn48h = userTasks.filter(t =>
      t.dueDate && new Date(t.dueDate) <= in48h && new Date(t.dueDate) > now && t.status !== 'done'
    ).length;
    
    // Calculate risk level
    let riskLevel: WorkloadAnalysis['riskLevel'] = 'low';
    let recommendation = 'Workload is balanced. Keep up the great work!';
    
    if (tasksDueIn48h >= 10 || overdueTasks.length >= 5) {
      riskLevel = 'critical';
      recommendation = `High burnout risk detected. Consider reassigning ${Math.ceil(tasksDueIn48h / 2)} tasks or extending deadlines.`;
    } else if (tasksDueIn48h >= 7 || overdueTasks.length >= 3) {
      riskLevel = 'high';
      recommendation = 'Heavy workload approaching. Prioritize critical tasks and consider delegation.';
    } else if (tasksDueIn48h >= 4 || overdueTasks.length >= 1) {
      riskLevel = 'medium';
      recommendation = 'Moderate workload. Stay focused on upcoming deadlines.';
    }
    
    // Mock completion rate
    const completedTasks = userTasks.filter(t => t.status === 'done').length;
    const averageCompletionRate = userTasks.length > 0 
      ? Math.round((completedTasks / userTasks.length) * 100) 
      : 100;
    
    return {
      userId: user.id,
      userName: user.name,
      riskLevel,
      tasksDueIn48h,
      totalActiveTasks: activeTasks.length,
      overdueTasks: overdueTasks.length,
      averageCompletionRate,
      recommendation,
    };
  });
}

// ============================================================================
// Smart Summaries (Mock)
// ============================================================================

interface ActivityItem {
  type: 'comment' | 'status_change' | 'assignment' | 'creation';
  content: string;
  timestamp: Date;
  user: string;
}

export async function generateSmartSummary(
  activities: ActivityItem[]
): Promise<AISummary> {
  await new Promise(r => setTimeout(r, 800));
  
  // Mock AI-generated summary
  const recentActivities = activities.slice(0, 20);
  
  // Analyze sentiment (mock)
  const positiveKeywords = ['completed', 'done', 'great', 'approved', 'merged'];
  const negativeKeywords = ['blocked', 'failed', 'delayed', 'issue', 'bug'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  recentActivities.forEach(activity => {
    const content = activity.content.toLowerCase();
    positiveKeywords.forEach(kw => { if (content.includes(kw)) positiveCount++; });
    negativeKeywords.forEach(kw => { if (content.includes(kw)) negativeCount++; });
  });
  
  const sentiment: AISummary['sentiment'] = 
    positiveCount > negativeCount ? 'positive' : 
    negativeCount > positiveCount ? 'negative' : 'neutral';
  
  // Generate mock bullet points
  const bulletPoints = [
    `${recentActivities.filter(a => a.type === 'status_change').length} tasks changed status in the last 24 hours`,
    `Team velocity is ${sentiment === 'positive' ? 'above' : sentiment === 'negative' ? 'below' : 'at'} average`,
    `${recentActivities.filter(a => a.type === 'comment').length} new comments added across all tasks`,
  ];
  
  // Extract key topics (mock)
  const keyTopics = ['Sprint Progress', 'Bug Fixes', 'Feature Development'];
  
  // Generate action items (mock)
  const actionItems = [
    'Review pending pull requests before EOD',
    'Update task estimates for next sprint planning',
    'Follow up on blocked tasks with dependencies',
  ];
  
  return {
    bulletPoints,
    sentiment,
    keyTopics,
    actionItems,
  };
}

// ============================================================================
// Voice-to-Text Processing (Mock - for Arabic/French support)
// ============================================================================

export interface VoiceTranscription {
  text: string;
  language: 'en' | 'ar' | 'fr';
  confidence: number;
}

export async function transcribeVoice(
  _audioBlob: Blob,
  preferredLanguage: 'en' | 'ar' | 'fr' = 'en'
): Promise<VoiceTranscription> {
  // Mock transcription - in production, use Web Speech API or cloud service
  await new Promise(r => setTimeout(r, 1500));
  
  const mockTranscriptions: Record<string, string> = {
    en: 'Create a new task for the landing page design',
    ar: 'أنشئ مهمة جديدة لتصميم الصفحة الرئيسية',
    fr: 'Créer une nouvelle tâche pour la conception de la page d\'accueil',
  };
  
  return {
    text: mockTranscriptions[preferredLanguage],
    language: preferredLanguage,
    confidence: 0.87,
  };
}

// ============================================================================
// Offline Queue for AI Operations
// ============================================================================

interface QueuedAIOperation {
  id: string;
  type: 'command' | 'summary' | 'analysis';
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

const offlineQueue: QueuedAIOperation[] = [];

export function queueAIOperation(operation: Omit<QueuedAIOperation, 'id' | 'timestamp' | 'retryCount'>): string {
  const id = `ai-op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  offlineQueue.push({
    ...operation,
    id,
    timestamp: Date.now(),
    retryCount: 0,
  });
  return id;
}

export function getQueuedOperations(): QueuedAIOperation[] {
  return [...offlineQueue];
}

export function clearQueuedOperation(id: string): void {
  const index = offlineQueue.findIndex(op => op.id === id);
  if (index !== -1) {
    offlineQueue.splice(index, 1);
  }
}
