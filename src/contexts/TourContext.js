"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Create the tour context
const TourContext = createContext();

// Tour steps configuration
const tourConfig = {
  dashboard: [
    {
      selector: '.home-link',
      content: 'This is the Home page where you can find information about the app and get started.',
      position: 'right',
    },
    {
      selector: '.dashboard-link',
      content: 'This is the Dashboard where you can find all Reeds - interactive educational content.',
      position: 'right',
    },
    {
      selector: '.leaderboard-link',
      content: 'Check the Leaderboard to see the top XP holders and track your progress.',
      position: 'right',
    },
    {
      selector: '.profile-link',
      content: 'View and manage your Profile information and avatar.',
      position: 'right',
    },
    {
      selector: '.feedback-link',
      content: 'Provide anonymous Feedback to help us improve your experience.',
      position: 'right',
    },
    {
      selector: '.app-tour-button',
      content: 'You can restart this tour anytime by clicking here.',
      position: 'right',
    },
    {
      selector: '.search-reed-input',
      content: 'Search for specific Reeds by title, description, category, or author.',
      position: 'bottom',
    },
    {
      selector: '.reed-card',
      content: 'Click on any Reed card to open it and start learning. Complete quizzes to earn XP!',
      position: 'top',
    }
  ],
};

export function TourProvider({ children }) {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState([]);
  const [hasSeenTour, setHasSeenTour] = useState(null); // Initialize as null to detect first load
  const pathname = usePathname();

  // Load hasSeenTour from localStorage on mount
  useEffect(() => {
    // Check if running in browser (not during SSR)
    if (typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('hasSeenTour');
      // If the value is not set at all, this is potentially a first-time user
      if (tourSeen === null) {
        setHasSeenTour(false); // New user - hasn't seen tour
        localStorage.setItem('hasSeenTour', 'false');
      } else {
        setHasSeenTour(tourSeen === 'true');
      }
    }
  }, []);

  // Set up tour based on the current path
  useEffect(() => {
    // Only proceed if hasSeenTour has been initialized (not null)
    if (hasSeenTour !== null && pathname === '/dashboard' && !hasSeenTour) {
      // Delay slightly to ensure elements are mounted
      const timer = setTimeout(() => {
        startTourInternal('dashboard');
        localStorage.setItem('hasSeenTour', 'true');
        setHasSeenTour(true);
      }, 500); // Increased delay to ensure DOM is fully ready
      
      return () => clearTimeout(timer);
    }
  }, [pathname, hasSeenTour]);

  // Internal function to actually start the tour
  const startTourInternal = (tourName) => {
    setCurrentTour(tourConfig[tourName] || []);
    setIsTourOpen(true);
  };

  const startTour = (tourName = 'dashboard') => {
    // Immediately set isTourOpen to true to provide immediate feedback
    setIsTourOpen(true);
    
    // Set up the tour with a slight delay to ensure DOM elements are ready
    setTimeout(() => {
      startTourInternal(tourName);
    }, 100);
    
    // Log for debugging
    console.log('Tour started:', tourName);
  };

  const closeTour = () => {
    setIsTourOpen(false);
    console.log('Tour closed');
  };

  const resetTourStatus = () => {
    localStorage.setItem('hasSeenTour', 'false');
    setHasSeenTour(false);
    console.log('Tour status reset');
  };

  const value = {
    isTourOpen,
    currentTour,
    startTour,
    closeTour,
    resetTourStatus,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
} 