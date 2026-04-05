import { useState, useCallback, useEffect } from 'react';
import { Joyride, type Step, type EventData, type Controls, STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// ONBOARDING STORE
// =============================================================================

interface OnboardingState {
  hasCompletedTour: boolean;
  currentStep: number;
  isActive: boolean;
  tourType: 'main' | 'simulation' | 'reports' | null;
  setHasCompletedTour: (completed: boolean) => void;
  setCurrentStep: (step: number) => void;
  startTour: (type: 'main' | 'simulation' | 'reports') => void;
  endTour: () => void;
  resetTour: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedTour: false,
      currentStep: 0,
      isActive: false,
      tourType: null,
      setHasCompletedTour: (completed) => set({ hasCompletedTour: completed }),
      setCurrentStep: (step) => set({ currentStep: step }),
      startTour: (type) => set({ isActive: true, tourType: type, currentStep: 0 }),
      endTour: () => set({ isActive: false, tourType: null }),
      resetTour: () => set({ hasCompletedTour: false, currentStep: 0, isActive: false, tourType: null }),
    }),
    {
      name: 'macroflow-onboarding',
    }
  )
);

// =============================================================================
// TOUR STEPS DEFINITIONS
// =============================================================================

export function useOnboardingSteps(): Step[] {
  const { t } = useTranslation();
  
  // Main application tour steps
  const mainTourSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{t('onboarding.welcome.title')}</h3>
          <p className="text-gray-600 dark:text-gray-300">{t('onboarding.welcome.description')}</p>
        </div>
      ),
      placement: 'center',
      skipBeacon: true,
    },
    {
      target: '[data-tour="simulation-controls"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('onboarding.simulation.title')}</h3>
          <p className="text-gray-600 dark:text-gray-300">{t('onboarding.simulation.description')}</p>
        </div>
      ),
      placement: 'bottom',
      skipBeacon: true,
    },
    {
      target: '[data-tour="charts"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('onboarding.charts.title')}</h3>
          <p className="text-gray-600 dark:text-gray-300">{t('onboarding.charts.description')}</p>
        </div>
      ),
      placement: 'top',
      skipBeacon: true,
    },
    {
      target: '[data-tour="export"]',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('onboarding.export.title')}</h3>
          <p className="text-gray-600 dark:text-gray-300">{t('onboarding.export.description')}</p>
        </div>
      ),
      placement: 'left',
      skipBeacon: true,
    },
  ];
  
  return mainTourSteps;
}

// =============================================================================
// ONBOARDING PROVIDER COMPONENT
// =============================================================================

interface OnboardingProviderProps {
  children: React.ReactNode;
  autoStart?: boolean;
}

export function OnboardingProvider({ children, autoStart = false }: OnboardingProviderProps) {
  const { hasCompletedTour, isActive, currentStep, setHasCompletedTour, setCurrentStep, endTour, startTour } = useOnboardingStore();
  const steps = useOnboardingSteps();
  const [run, setRun] = useState(false);
  const { t } = useTranslation();

  // Auto-start tour for new users
  useEffect(() => {
    if (autoStart && !hasCompletedTour && !isActive) {
      const timer = setTimeout(() => {
        startTour('main');
      }, 1000); // Delay to let the page render
      return () => clearTimeout(timer);
    }
  }, [autoStart, hasCompletedTour, isActive, startTour]);

  // Sync run state with store
  useEffect(() => {
    setRun(isActive);
  }, [isActive]);

  const handleJoyrideEvent = useCallback((data: EventData, controls: Controls) => {
    const { status, action, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setHasCompletedTour(true);
      endTour();
      setRun(false);
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Update step index after the step or if target not found
      setCurrentStep(index + (action === ACTIONS.PREV ? -1 : 1));
    }
    
    // Use controls if needed for programmatic tour management
    void controls;
  }, [setHasCompletedTour, endTour, setCurrentStep]);

  return (
    <>
      {children}
      <Joyride
        steps={steps}
        run={run}
        stepIndex={currentStep}
        continuous
        scrollToFirstStep
        onEvent={handleJoyrideEvent}
        locale={{
          back: t('onboarding.back'),
          close: t('onboarding.finish'),
          last: t('onboarding.finish'),
          next: t('onboarding.next'),
          skip: t('onboarding.skip'),
        }}
        options={{
          showProgress: true,
          buttons: ['back', 'skip', 'primary'],
          primaryColor: '#6366f1',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          backgroundColor: '#ffffff',
          textColor: '#374151',
        }}
        styles={{
          tooltip: {
            borderRadius: '12px',
            padding: '16px',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipTitle: {
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '8px',
          },
          tooltipContent: {
            padding: '8px 0',
          },
          buttonPrimary: {
            backgroundColor: '#6366f1',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
          },
          buttonBack: {
            color: '#6b7280',
            marginRight: '8px',
          },
          buttonSkip: {
            color: '#9ca3af',
          },
        }}
      />
    </>
  );
}

// =============================================================================
// TRIGGER BUTTON COMPONENT
// =============================================================================

interface StartTourButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function StartTourButton({ className, children }: StartTourButtonProps) {
  const { t } = useTranslation();
  const { startTour, hasCompletedTour } = useOnboardingStore();
  
  return (
    <button
      onClick={() => startTour('main')}
      className={className || 'flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors'}
      aria-label={hasCompletedTour ? 'Restart tour' : 'Start tour'}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {children || (hasCompletedTour ? t('onboarding.skip') : t('onboarding.welcome.title'))}
    </button>
  );
}

// =============================================================================
// HOOK FOR MANUAL TOUR CONTROL
// =============================================================================

export function useOnboarding() {
  const store = useOnboardingStore();
  
  return {
    isActive: store.isActive,
    currentStep: store.currentStep,
    hasCompletedTour: store.hasCompletedTour,
    tourType: store.tourType,
    startTour: store.startTour,
    endTour: store.endTour,
    resetTour: store.resetTour,
    goToStep: store.setCurrentStep,
  };
}

export default OnboardingProvider;
