"use client";

import React from 'react';
import { TourProvider as ReactourProvider } from '@reactour/tour';
import { useTour } from '@/contexts/TourContext';
import { HelpCircle } from 'lucide-react';

// Custom styles for the tour
const tourStyles = {
  popover: (base) => ({
    ...base,
    '--reactour-accent': '#14b8a6', // Teal/primary color
    background: 'var(--background)',
    color: 'var(--foreground)',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid var(--border)',
    padding: '1rem',
  }),
  badge: (base) => ({
    ...base,
    background: 'var(--primary)',
    color: 'white',
  }),
  controls: (base) => ({
    ...base,
    marginTop: '1rem',
  }),
  button: (base) => ({
    ...base,
    color: 'var(--primary)',
    fontSize: '0.875rem',
  }),
  close: (base) => ({
    ...base,
    color: 'var(--muted-foreground)',
    right: '0.5rem',
    top: '0.5rem',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      background: 'var(--accent)',
    },
  }),
};

export default function AppTour({ children }) {
  const { isTourOpen, currentTour, closeTour } = useTour();

  return (
    <ReactourProvider
      steps={currentTour}
      isOpen={isTourOpen}
      onRequestClose={closeTour}
      styles={tourStyles}
      showNavigation={true}
      showButtons={true}
      showCloseButton={true}
      showBadge={true}
      disableInteraction={false}
      disableKeyboardNavigation={false}
      accentColor="#14b8a6"
      rounded={8}
      maskClassName="mask"
      className="helper"
      prevButton={{
        content: 'Back',
      }}
      nextButton={{
        content: 'Next',
      }}
      lastStepNextButton={{
        content: 'End',
      }}
    >
      {children}
    </ReactourProvider>
  );
}

// Export a separate App Tour Button component
export function AppTourButton({ className, children }) {
  const { startTour, resetTourStatus } = useTour();
  
  const handleStartTour = () => {
    resetTourStatus(); // Reset the tour status first
    startTour('dashboard'); // Start the dashboard tour
  };
  
  return (
    <button
      onClick={handleStartTour}
      className={className || "flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"}
    >
      {children || (
        <>
          <HelpCircle className="mr-2 h-5 w-5" />
          <span>App Tour</span>
        </>
      )}
    </button>
  );
} 