/**
 * Voice-to-Task Feature
 * 
 * Multilingual voice input for creating tasks:
 * - Arabic (ar-SA, ar-DZ) support
 * - French (fr-FR, fr-CA) support
 * - English (en-US, en-GB) support
 * - Real-time transcription
 * - AI-powered task extraction from speech
 * - Voice command recognition
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Languages,
  Volume2,
  Loader2,
  Check,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { TaskPriority, TaskStatus } from '@/types';

// ============================================================================
// Web Speech API Type Declarations
// ============================================================================

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// ============================================================================
// Types
// ============================================================================

export type SupportedLanguage = 'en-US' | 'en-GB' | 'fr-FR' | 'fr-CA' | 'ar-SA' | 'ar-DZ';

interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  language: SupportedLanguage;
}

export interface ExtractedTask {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: Date;
  assignee?: string;
  labels?: string[];
}

interface VoiceToTaskState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  language: SupportedLanguage;
  extractedTask: ExtractedTask | null;
}

// ============================================================================
// Language Configuration
// ============================================================================

export const SUPPORTED_LANGUAGES: {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'fr-CA', name: 'French (Canada)', nativeName: 'Français', flag: '🇨🇦', direction: 'ltr' },
  { code: 'ar-SA', name: 'Arabic (Saudi)', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'ar-DZ', name: 'Arabic (Algeria)', nativeName: 'العربية', flag: '🇩🇿', direction: 'rtl' },
];

// ============================================================================
// Voice Command Keywords (Multilingual)
// ============================================================================

const VOICE_COMMANDS = {
  create: {
    en: ['create', 'add', 'new', 'make'],
    fr: ['créer', 'ajouter', 'nouveau', 'nouvelle'],
    ar: ['إنشاء', 'أضف', 'جديد', 'جديدة'],
  },
  priority: {
    high: { en: ['urgent', 'high', 'important'], fr: ['urgent', 'haute', 'important'], ar: ['عاجل', 'مهم', 'عالي'] },
    medium: { en: ['medium', 'normal'], fr: ['moyenne', 'normal'], ar: ['متوسط', 'عادي'] },
    low: { en: ['low', 'minor'], fr: ['basse', 'mineur'], ar: ['منخفض', 'بسيط'] },
  },
  dueDate: {
    today: { en: ['today'], fr: ['aujourd\'hui'], ar: ['اليوم'] },
    tomorrow: { en: ['tomorrow'], fr: ['demain'], ar: ['غدا', 'غداً'] },
    nextWeek: { en: ['next week'], fr: ['semaine prochaine'], ar: ['الأسبوع القادم'] },
  },
};

// ============================================================================
// Speech Recognition Hook
// ============================================================================

interface UseSpeechRecognitionOptions {
  language?: SupportedLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (result: VoiceRecognitionResult) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition({
  language = 'en-US',
  continuous = true,
  interimResults = true,
  onResult,
  onError,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef(isListening);
  
  // Keep ref in sync with state (avoids stale closure in onend)
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);
  
  useEffect(() => {
    // Check for browser support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
    
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        if (finalTranscript || interimTranscript) {
          onResult?.({
            transcript: finalTranscript || interimTranscript,
            confidence: event.results[event.results.length - 1][0].confidence,
            isFinal: !!finalTranscript,
            language,
          });
        }
      };
      
      recognition.onerror = (event) => {
        onError?.(event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        // Use ref to get current value (avoids stale closure)
        if (isListeningRef.current && continuous) {
          // Restart if should be continuous
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, interimResults, onResult, onError]); // Removed isListening - use ref instead
  
  const start = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  }, [isListening]);
  
  const stop = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);
  
  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);
  
  return {
    isListening,
    isSupported,
    start,
    stop,
    toggle,
  };
}

// ============================================================================
// Task Extraction from Voice
// ============================================================================

export function extractTaskFromVoice(
  transcript: string,
  language: SupportedLanguage
): ExtractedTask {
  const langPrefix = language.split('-')[0] as 'en' | 'fr' | 'ar';
  
  // Check for priority keywords
  let priority: TaskPriority | undefined;
  const lowercaseTranscript = transcript.toLowerCase();
  
  if (VOICE_COMMANDS.priority.high[langPrefix]?.some(kw => lowercaseTranscript.includes(kw))) {
    priority = 'high';
  } else if (VOICE_COMMANDS.priority.medium[langPrefix]?.some(kw => lowercaseTranscript.includes(kw))) {
    priority = 'medium';
  } else if (VOICE_COMMANDS.priority.low[langPrefix]?.some(kw => lowercaseTranscript.includes(kw))) {
    priority = 'low';
  }
  
  // Check for due date keywords
  let dueDate: Date | undefined;
  const today = new Date();
  
  if (VOICE_COMMANDS.dueDate.today[langPrefix]?.some(kw => lowercaseTranscript.includes(kw))) {
    dueDate = today;
  } else if (VOICE_COMMANDS.dueDate.tomorrow[langPrefix]?.some(kw => lowercaseTranscript.includes(kw))) {
    dueDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  } else if (VOICE_COMMANDS.dueDate.nextWeek[langPrefix]?.some(kw => lowercaseTranscript.includes(kw))) {
    dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  
  return {
    title: cleanTranscriptForTitle(transcript, langPrefix),
    priority,
    dueDate,
  };
}

function cleanTranscriptForTitle(transcript: string, langPrefix: 'en' | 'fr' | 'ar'): string {
  let cleaned = transcript;
  
  // Remove create commands
  VOICE_COMMANDS.create[langPrefix]?.forEach(cmd => {
    cleaned = cleaned.replace(new RegExp(`^${cmd}\\s+(a\\s+)?(task\\s+)?`, 'i'), '');
  });
  
  // Remove priority keywords
  Object.values(VOICE_COMMANDS.priority).forEach(priorityObj => {
    priorityObj[langPrefix]?.forEach((kw: string) => {
      cleaned = cleaned.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '');
    });
  });
  
  // Remove due date keywords
  Object.values(VOICE_COMMANDS.dueDate).forEach(dateObj => {
    dateObj[langPrefix]?.forEach((kw: string) => {
      cleaned = cleaned.replace(new RegExp(`\\b(due\\s+)?${kw}\\b`, 'gi'), '');
    });
  });
  
  // Clean up whitespace
  return cleaned.trim().replace(/\s+/g, ' ');
}

// ============================================================================
// Voice Input Button Component
// ============================================================================

interface VoiceInputButtonProps {
  onTaskExtracted: (task: ExtractedTask) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceInputButton({
  onTaskExtracted,
  className,
  size = 'md',
}: VoiceInputButtonProps) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<VoiceToTaskState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    language: (i18n.language as SupportedLanguage) || 'en-US',
    extractedTask: null,
  });
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  // Ref to track component mount state
  const isMountedRef = useRef(true);
  // Ref to track processing timeout
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);
  
  const handleResult = useCallback((result: VoiceRecognitionResult) => {
    if (result.isFinal) {
      setState(prev => ({
        ...prev,
        transcript: prev.transcript + ' ' + result.transcript,
        interimTranscript: '',
      }));
    } else {
      setState(prev => ({
        ...prev,
        interimTranscript: result.transcript,
      }));
    }
  }, []);
  
  const handleError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error: error,
      isListening: false,
    }));
  }, []);
  
  const { isListening, isSupported, toggle, stop } = useSpeechRecognition({
    language: state.language,
    onResult: handleResult,
    onError: handleError,
  });
  
  // Update listening state
  useEffect(() => {
    setState(prev => ({ ...prev, isListening }));
  }, [isListening]);
  
  const handleToggle = useCallback(() => {
    if (isListening) {
      stop();
      // Process the transcript
      if (state.transcript.trim()) {
        setState(prev => ({ ...prev, isProcessing: true }));
        
        // Clear any existing timeout
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
        
        // Simulate processing delay with proper cleanup
        processingTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            const extracted = extractTaskFromVoice(state.transcript.trim(), state.language);
            setState(prev => ({
              ...prev,
              isProcessing: false,
              extractedTask: extracted,
            }));
          }
        }, 500);
      }
    } else {
      setState(prev => ({
        ...prev,
        transcript: '',
        interimTranscript: '',
        error: null,
        extractedTask: null,
      }));
      toggle();
    }
  }, [isListening, stop, state.transcript, state.language, toggle]);
  
  const handleConfirm = () => {
    if (state.extractedTask) {
      onTaskExtracted(state.extractedTask);
      setState(prev => ({
        ...prev,
        transcript: '',
        extractedTask: null,
      }));
    }
  };
  
  const handleCancel = () => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      extractedTask: null,
    }));
  };
  
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === state.language);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  
  if (!isSupported) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <MicOff className="w-4 h-4" />
        <span>{t('voice.notSupported')}</span>
      </div>
    );
  }
  
  return (
    <div className={cn('relative', className)}>
      {/* Main button */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={handleToggle}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'relative rounded-full flex items-center justify-center transition-all',
            sizeClasses[size],
            isListening
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {state.isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Mic className="w-5 h-5" />
            </motion.div>
          ) : (
            <Mic className="w-5 h-5" />
          )}
          
          {/* Listening animation rings */}
          {isListening && (
            <>
              <motion.span
                className="absolute inset-0 rounded-full bg-red-500"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.span
                className="absolute inset-0 rounded-full bg-red-500"
                animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}
        </motion.button>
        
        {/* Language selector */}
        <button
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted transition-colors text-sm"
        >
          <span>{currentLang?.flag}</span>
          <Languages className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      
      {/* Language menu */}
      <AnimatePresence>
        {showLanguageMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 end-0 z-50 p-2 rounded-xl bg-popover border shadow-xl min-w-[180px]"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setState(prev => ({ ...prev, language: lang.code }));
                  setShowLanguageMenu(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  state.language === lang.code
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                )}
              >
                <span>{lang.flag}</span>
                <span className="flex-1 text-start">{lang.nativeName}</span>
                {state.language === lang.code && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Transcription display */}
      <AnimatePresence>
        {(isListening || state.transcript || state.extractedTask) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              'absolute top-full mt-3 z-50',
              'w-80 p-4 rounded-2xl',
              'bg-popover border shadow-2xl',
              'start-0',
              currentLang?.direction === 'rtl' && 'text-right'
            )}
            dir={currentLang?.direction}
          >
            {/* Listening state */}
            {isListening && !state.extractedTask && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>{t('voice.listening')}</span>
                </div>
                
                <div className="p-3 rounded-xl bg-muted/50 min-h-[60px]">
                  <p className="text-sm">
                    {state.transcript}
                    <span className="text-muted-foreground">{state.interimTranscript}</span>
                  </p>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {t('voice.speakNow')}
                </p>
              </div>
            )}
            
            {/* Processing state */}
            {state.isProcessing && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm">{t('voice.processing')}</span>
              </div>
            )}
            
            {/* Extracted task preview */}
            {state.extractedTask && !state.isProcessing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{t('voice.taskExtracted')}</span>
                </div>
                
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                  <p className="font-medium">{state.extractedTask.title}</p>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    {state.extractedTask.priority && (
                      <span className={cn(
                        'px-2 py-0.5 rounded-full',
                        state.extractedTask.priority === 'high' && 'bg-red-100 text-red-700',
                        state.extractedTask.priority === 'medium' && 'bg-amber-100 text-amber-700',
                        state.extractedTask.priority === 'low' && 'bg-green-100 text-green-700'
                      )}>
                        {t(`priority.${state.extractedTask.priority}`)}
                      </span>
                    )}
                    
                    {state.extractedTask.dueDate && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {state.extractedTask.dueDate.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex-1 gap-1"
                  >
                    <X className="w-4 h-4" />
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirm}
                    className="flex-1 gap-1"
                  >
                    <Check className="w-4 h-4" />
                    {t('voice.createTask')}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Error state */}
            {state.error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{t(`voice.errors.${state.error}`)}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Voice Commands Help Component
// ============================================================================

export function VoiceCommandsHelp({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const langPrefix = (i18n.language?.split('-')[0] || 'en') as 'en' | 'fr' | 'ar';
  
  const examples = [
    {
      icon: '📝',
      title: t('voice.examples.createTask'),
      example: langPrefix === 'ar' 
        ? 'إنشاء مهمة مراجعة التقرير' 
        : langPrefix === 'fr'
          ? 'Créer une tâche réviser le rapport'
          : 'Create a task to review the report',
    },
    {
      icon: '🔥',
      title: t('voice.examples.urgentTask'),
      example: langPrefix === 'ar'
        ? 'مهمة عاجلة: إصلاح الخطأ'
        : langPrefix === 'fr'
          ? 'Tâche urgente: corriger le bug'
          : 'Urgent task: fix the bug',
    },
    {
      icon: '📅',
      title: t('voice.examples.dueDate'),
      example: langPrefix === 'ar'
        ? 'إنهاء العرض غداً'
        : langPrefix === 'fr'
          ? 'Finir la présentation demain'
          : 'Finish the presentation tomorrow',
    },
  ];
  
  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Mic className="w-4 h-4" />
        {t('voice.voiceCommands')}
      </h4>
      
      <div className="space-y-2">
        {examples.map((ex, i) => (
          <div
            key={i}
            className="p-3 rounded-xl bg-muted/50 space-y-1"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>{ex.icon}</span>
              <span>{ex.title}</span>
            </div>
            <p className="text-xs text-muted-foreground italic">
              &quot;{ex.example}&quot;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VoiceInputButton;
