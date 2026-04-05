import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { DashboardWidgetGrid } from '@/components/dashboard/DashboardWidgets';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickStats = [
    {
      label: t('dashboard.stats.completedThisWeek'),
      value: '24',
      change: '+12%',
      changeType: 'positive' as const,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: t('dashboard.widgets.tasksInProgress'),
      value: '8',
      change: '-3%',
      changeType: 'neutral' as const,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: t('dashboard.stats.overdue'),
      value: '3',
      change: '-2',
      changeType: 'positive' as const,
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: t('dashboard.widgets.projectProgress'),
      value: '67%',
      change: '+5%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ClickUp-Inspired Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-indigo-600 p-6 lg:p-8 text-white"
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white/80" />
              <span className="text-sm text-white/70 font-medium">{getGreeting()}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {t('dashboard.welcome', { name: user?.name ?? 'User' })}
            </h1>
            <p className="text-white/70 text-sm lg:text-base max-w-md">
              {t('dashboard.overview')} — {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/kanban')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-sm font-medium transition-all duration-200 border border-white/10"
            >
              {t('tasks.newTask')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Bar - ClickUp-style metric cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className="group relative rounded-xl border bg-card p-4 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200 cursor-default"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                  stat.changeType === 'positive' ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10' : 'text-muted-foreground bg-muted'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Role-based widget grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <DashboardWidgetGrid role={user?.role} />
      </motion.div>
    </div>
  );
}
