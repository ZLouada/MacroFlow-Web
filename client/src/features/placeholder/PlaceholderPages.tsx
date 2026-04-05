import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Calendar,
  BarChart3,
  FileText,
  Target,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface PlaceholderPageProps {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  gradient: string;
}

function PlaceholderPage({ icon: Icon, titleKey, descriptionKey, gradient }: PlaceholderPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md space-y-6"
      >
        {/* Icon with gradient background */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
          className="mx-auto"
        >
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shadow-primary/20`}>
            <Icon className="h-10 w-10 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-3xl font-bold tracking-tight"
        >
          {t(titleKey)}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-muted-foreground text-lg"
        >
          {t(descriptionKey)}
        </motion.p>

        {/* Coming Soon badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Sparkles className="h-4 w-4" />
            Coming Soon
          </span>
        </motion.div>

        {/* Action button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="gap-2 mt-2"
          >
            Back to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function CalendarPage() {
  return (
    <PlaceholderPage
      icon={Calendar}
      titleKey="nav.calendar"
      descriptionKey="placeholder.calendarDesc"
      gradient="from-blue-500 to-cyan-500"
    />
  );
}

export function AnalyticsPage() {
  return (
    <PlaceholderPage
      icon={BarChart3}
      titleKey="nav.analytics"
      descriptionKey="placeholder.analyticsDesc"
      gradient="from-purple-500 to-pink-500"
    />
  );
}

export function DocsPage() {
  return (
    <PlaceholderPage
      icon={FileText}
      titleKey="nav.docs"
      descriptionKey="placeholder.docsDesc"
      gradient="from-orange-500 to-amber-500"
    />
  );
}

export function GoalsPage() {
  return (
    <PlaceholderPage
      icon={Target}
      titleKey="nav.goals"
      descriptionKey="placeholder.goalsDesc"
      gradient="from-green-500 to-emerald-500"
    />
  );
}
