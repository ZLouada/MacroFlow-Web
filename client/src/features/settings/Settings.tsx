import { useTranslation } from 'react-i18next';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Globe, Moon, Sun, Monitor, Check } from 'lucide-react';

export default function Settings() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  const themeOptions = [
    { value: 'light', icon: Sun, label: t('settings.themes.light') },
    { value: 'dark', icon: Moon, label: t('settings.themes.dark') },
    { value: 'system', icon: Monitor, label: t('settings.themes.system') },
  ] as const;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.general')}</p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.appearance')}</CardTitle>
          <CardDescription>
            Customize the appearance of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              {t('settings.theme')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Icon className={cn('h-6 w-6', isActive && 'text-primary')} />
                    <span className="text-sm font-medium">{option.label}</span>
                    {isActive && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              {t('settings.language')}
            </label>
            <div className="space-y-2">
              {Object.entries(languages).map(([code, config]) => {
                const isActive = currentLanguage === code;

                return (
                  <button
                    key={code}
                    onClick={() => changeLanguage(code as keyof typeof SUPPORTED_LANGUAGES)}
                    className={cn(
                      'flex items-center justify-between w-full p-3 rounded-lg border transition-colors',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div className="text-start">
                        <p className="font-medium">{config.nativeName}</p>
                        <p className="text-sm text-muted-foreground">{config.name}</p>
                      </div>
                    </div>
                    {isActive && <Check className="h-5 w-5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RTL Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">RTL Preview</CardTitle>
          <CardDescription>
            Current direction: <code className="bg-muted px-1 rounded">{languages[currentLanguage]?.dir}</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <p className="text-sm">
              {currentLanguage === 'ar' ? (
                'هذا النص يظهر من اليمين إلى اليسار'
              ) : currentLanguage === 'fr' ? (
                'Ce texte s\'affiche de gauche à droite'
              ) : (
                'This text displays from left to right'
              )}
            </p>
            <div className="flex gap-2">
              <Button size="sm">{t('common.save')}</Button>
              <Button size="sm" variant="outline">{t('common.cancel')}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
