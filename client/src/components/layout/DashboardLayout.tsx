import { useState, useCallback, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GanttChart,
  Settings,
  Menu,
  X,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  Globe,
  LogOut,
  Search,
  Command,
  Plus,
  Home,
  FolderKanban,
  Star,
  HelpCircle,
  ChevronDown,
  Check,
  Moon,
  Sun,
  Monitor,
  MessageSquare,
  Calendar,
  Target,
  Zap,
  FileText,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage, SupportedLanguage } from '@/lib/i18n';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { useCommandBar } from '@/components/ai/CommandBar';

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  key: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

// ============================================================================
// Navigation Items
// ============================================================================

const MAIN_NAV_ITEMS: NavItem[] = [
  { key: 'home', icon: Home, path: '/dashboard' },
  { key: 'kanban', icon: FolderKanban, path: '/kanban' },
  { key: 'gantt', icon: GanttChart, path: '/gantt' },
  { key: 'calendar', icon: Calendar, path: '/calendar', badge: 3 },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  { key: 'analytics', icon: BarChart3, path: '/analytics' },
  { key: 'docs', icon: FileText, path: '/docs' },
  { key: 'goals', icon: Target, path: '/goals' },
];

// ============================================================================
// Sidebar Component
// ============================================================================

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLanguage, languages } = useLanguage();
  
  const isRTL = languages[currentLanguage]?.dir === 'rtl';
  const [favoritesOpen, setFavoritesOpen] = useState(true);

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <NavLink
        key={item.key}
        to={item.path}
        onClick={onMobileClose}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
          'hover:bg-accent/80',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground',
          collapsed && 'justify-center px-2'
        )}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className={cn(
              'absolute inset-y-1 w-1 rounded-full bg-primary',
              isRTL ? 'end-0' : 'start-0'
            )}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        
        <Icon className={cn(
          'h-5 w-5 shrink-0 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )} />
        
        {!collapsed && (
          <>
            <span className="flex-1">{t(`nav.${item.key}`)}</span>
            {item.badge && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                {item.badge}
              </span>
            )}
          </>
        )}
        
        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className={cn(
            'absolute z-50 hidden group-hover:block',
            'px-2 py-1 text-xs font-medium rounded-md',
            'bg-popover text-popover-foreground border shadow-md',
            isRTL ? 'end-full me-2' : 'start-full ms-2'
          )}>
            {t(`nav.${item.key}`)}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn(
          'fixed inset-y-0 z-50 flex flex-col bg-card border-e',
          'lg:relative lg:translate-x-0',
          mobileOpen
            ? 'translate-x-0'
            : isRTL
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0',
          isRTL ? 'end-0' : 'start-0'
        )}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <img src="/macroflow.png" alt="MacroFlow" className="h-8 w-auto object-contain" />
            </motion.div>
          )}
          
          {collapsed && (
            <div className="mx-auto flex items-center justify-center">
              <img src="/macroflow.png" alt="MacroFlow" className="h-8 w-8 object-contain" />
            </div>
          )}

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Desktop collapse button */}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapse(true)}
              className="hidden lg:flex h-8 w-8"
            >
              {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Quick Create Button */}
        <div className="p-3">
          <Button
            onClick={() => navigate('/kanban')}
            className={cn(
              'w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90',
              'shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30',
              collapsed && 'px-0'
            )}
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span>{t('tasks.newTask')}</span>}
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
          {/* Main Section */}
          <div className="space-y-1">
            {MAIN_NAV_ITEMS.map(renderNavItem)}
          </div>

          {/* Favorites Section */}
          {!collapsed && (
            <div className="mt-6">
              <button
                onClick={() => setFavoritesOpen(!favoritesOpen)}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <Star className="h-3.5 w-3.5" />
                <span className="flex-1 text-start">{t('common.favorites') || 'Favorites'}</span>
                <ChevronDown className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  favoritesOpen && 'rotate-180'
                )} />
              </button>
              
              <AnimatePresence>
                {favoritesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 py-1">
                      {SECONDARY_NAV_ITEMS.map(renderNavItem)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="border-t p-3 space-y-2">
          {/* Help */}
          <button
            onClick={() => { navigate('/settings'); onMobileClose(); }}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground',
              'hover:bg-accent hover:text-foreground transition-colors',
              collapsed && 'justify-center px-2'
            )}
          >
            <HelpCircle className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{t('common.help') || 'Help & Support'}</span>}
          </button>

          {/* Settings */}
          <NavLink
            to="/settings"
            onClick={onMobileClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
              'hover:bg-accent transition-colors',
              isActive ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground',
              collapsed && 'justify-center px-2'
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{t('nav.settings')}</span>}
          </NavLink>

          {/* User Profile (collapsed shows avatar only) */}
          {user && (
            <div className={cn(
              'flex items-center gap-3 rounded-lg p-2',
              'bg-muted/50',
              collapsed && 'justify-center'
            )}>
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-sm font-medium text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
              </div>
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t(`roles.${user.role}`)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Expand button when collapsed */}
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapse(false)}
              className="w-full"
            >
              {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </motion.aside>
    </>
  );
}

// ============================================================================
// Header Component
// ============================================================================

function Header({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { open: openCommandBar } = useCommandBar();
  const { theme, setTheme } = useTheme();
  
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = () => {
      setShowLanguageMenu(false);
      setShowUserMenu(false);
      setShowNotifications(false);
    };
    if (showLanguageMenu || showUserMenu || showNotifications) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showLanguageMenu, showUserMenu, showNotifications]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle language change
  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await changeLanguage(lang);
    setShowLanguageMenu(false);
  };

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New task assigned', message: 'You have been assigned to "API Integration"', time: '2m ago', unread: true },
    { id: '2', title: 'Comment on task', message: 'Alice commented on "Design Review"', time: '1h ago', unread: true },
    { id: '3', title: 'Sprint completed', message: 'Sprint 12 has been completed successfully', time: '3h ago', unread: false },
  ]);

  // Mark all notifications read
  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }, []);

  // Mark single notification read
  const handleNotificationClick = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  }, []);

  // Send feedback handler
  const handleSendFeedback = useCallback(() => {
    window.open('mailto:feedback@macroflow.io?subject=MacroFlow Feedback', '_blank');
    setShowUserMenu(false);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 gap-4">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMobileMenuOpen}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search / Command Bar */}
      <button
        onClick={openCommandBar}
        className={cn(
          'hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl flex-1 max-w-md',
          'bg-muted/50 hover:bg-muted border border-transparent hover:border-border/50',
          'text-muted-foreground hover:text-foreground',
          'transition-all duration-200 group'
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="text-sm flex-1 text-start truncate">
          {t('commandBar.placeholder') || 'Search or type a command...'}
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-mono bg-background rounded border">
          <Command className="h-2.5 w-2.5" />
          <span>K</span>
        </kbd>
      </button>

      <div className="flex-1 md:hidden" />

      {/* Header Actions */}
      <div className="flex items-center gap-1">
        {/* AI Assistant */}
        <Button
          variant="ghost"
          size="icon"
          onClick={openCommandBar}
          className="relative group"
          title="AI Assistant"
        >
          <Zap className="h-5 w-5 text-primary" />
          <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600 text-[9px] font-bold text-white">
            AI
          </span>
        </Button>

        {/* Language Switcher */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setShowLanguageMenu(!showLanguageMenu);
              setShowUserMenu(false);
              setShowNotifications(false);
            }}
            className="relative"
            title={t('settings.language')}
          >
            <Globe className="h-5 w-5" />
          </Button>
          
          <AnimatePresence>
            {showLanguageMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute end-0 top-full z-50 mt-2 w-48 rounded-xl border bg-popover p-1.5 shadow-xl"
              >
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('settings.language')}
                </div>
                {(Object.entries(languages) as [SupportedLanguage, typeof languages[SupportedLanguage]][]).map(([code, config]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      'hover:bg-accent',
                      currentLanguage === code && 'bg-accent'
                    )}
                  >
                    <span className="text-lg">{config.flagEmoji}</span>
                    <span className="flex-1 text-start">{config.nativeName}</span>
                    <span className="text-xs text-muted-foreground uppercase">{config.flag}</span>
                    {currentLanguage === code && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={`Theme: ${theme}`}
        >
          {theme === 'light' && <Sun className="h-5 w-5" />}
          {theme === 'dark' && <Moon className="h-5 w-5" />}
          {theme === 'system' && <Monitor className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
              setShowLanguageMenu(false);
              setShowUserMenu(false);
            }}
            className="relative"
            title={t('common.notifications')}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute end-0 top-full z-50 mt-2 w-80 rounded-xl border bg-popover shadow-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h3 className="font-semibold">{t('common.notifications')}</h3>
                  <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={handleMarkAllRead}>
                    Mark all read
                  </Button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.id)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-accent',
                        notif.unread && 'bg-primary/5'
                      )}
                    >
                      <div className={cn(
                        'mt-1 h-2 w-2 rounded-full shrink-0',
                        notif.unread ? 'bg-primary' : 'bg-transparent'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notif.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t p-2">
                  <Button variant="ghost" className="w-full text-sm" onClick={() => { setShowNotifications(false); navigate('/dashboard'); }}>
                    {t('common.viewAll')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setShowUserMenu(!showUserMenu);
              setShowLanguageMenu(false);
              setShowNotifications(false);
            }}
            className="relative"
            title={t('common.profile')}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-sm font-medium text-white">
              {user?.name.charAt(0).toUpperCase() || 'U'}
            </div>
          </Button>
          
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute end-0 top-full z-50 mt-2 w-64 rounded-xl border bg-popover shadow-xl overflow-hidden"
              >
                {/* User Info */}
                {user && (
                  <div className="px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-sm font-medium text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent transition-colors"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{t('common.profile')}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent transition-colors"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>{t('nav.settings')}</span>
                  </button>
                  
                  <button
                    onClick={handleSendFeedback}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Send Feedback</span>
                  </button>
                </div>
                
                <div className="border-t p-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('common.logout')}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// Main Layout Component
// ============================================================================

export function DashboardLayout() {
  const { t } = useTranslation();
  const { currentLanguage, languages } = useLanguage();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRTL = languages[currentLanguage]?.dir === 'rtl';

  return (
    <div className={cn('flex h-screen bg-background', isRTL && 'flex-row-reverse')}>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:rounded-md focus:m-2"
      >
        {t('a11y.skipToMain')}
      </a>

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header onMobileMenuOpen={() => setMobileMenuOpen(true)} />

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-auto p-4 lg:p-6"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
