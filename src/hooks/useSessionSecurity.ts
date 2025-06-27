import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface SecurityConfig {
  maxInactivityTime: number; // 5 minutes in milliseconds
  maxSessionTime: number; // 30 minutes total session time
  warningTime: number; // Show warning 1 minute before logout
}

const SECURITY_CONFIG: SecurityConfig = {
  maxInactivityTime: 5 * 60 * 1000, // 5 minutes
  maxSessionTime: 30 * 60 * 1000, // 30 minutes
  warningTime: 1 * 60 * 1000, // 1 minute warning
};

export const useSessionSecurity = (user: User | null) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  
  const lastActivityRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset activity timestamp
  const resetActivity = useCallback(() => {
    if (!user) return;
    
    lastActivityRef.current = Date.now();
    
    // Clear existing timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    
    setShowWarning(false);
    
    // Check if total session time exceeded
    const sessionDuration = Date.now() - sessionStartRef.current;
    if (sessionDuration >= SECURITY_CONFIG.maxSessionTime) {
      handleSessionExpiry('Maximum session time exceeded');
      return;
    }
    
    // Set warning timer (4 minutes from now)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(SECURITY_CONFIG.warningTime);
      
      // Start countdown
      countdownTimerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            handleSessionExpiry('Session timeout due to inactivity');
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      
    }, SECURITY_CONFIG.maxInactivityTime - SECURITY_CONFIG.warningTime);
    
    // Set logout timer (5 minutes from now)
    logoutTimerRef.current = setTimeout(() => {
      handleSessionExpiry('Session timeout due to inactivity');
    }, SECURITY_CONFIG.maxInactivityTime);
    
  }, [user]);

  // Handle session expiry
  const handleSessionExpiry = useCallback(async (reason: string) => {
    console.log('Session expired:', reason);
    
    // Clear all timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    
    setIsSessionExpired(true);
    setShowWarning(false);
    
    // Force logout
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during forced logout:', error);
    }
    
    // Clear any sensitive data from localStorage/sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Reload page to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  }, []);

  // Extend session (when user clicks "Stay logged in")
  const extendSession = useCallback(() => {
    if (!user) return;
    
    // Reset session start time
    sessionStartRef.current = Date.now();
    resetActivity();
  }, [user, resetActivity]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Throttle activity tracking to avoid excessive calls
    let activityTimeout: NodeJS.Timeout | null = null;
    
    const handleActivity = () => {
      if (activityTimeout) return;
      
      activityTimeout = setTimeout(() => {
        resetActivity();
        activityTimeout = null;
      }, 1000); // Throttle to once per second
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial setup
    resetActivity();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (activityTimeout) clearTimeout(activityTimeout);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [user, resetActivity]);

  // Browser tab/window change detection
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs/minimized - this counts as inactivity
        console.log('User switched away from app');
      } else {
        // User returned - reset activity
        resetActivity();
      }
    };

    const handleBeforeUnload = () => {
      // Clear session data when user closes browser
      localStorage.clear();
      sessionStorage.clear();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, resetActivity]);

  // Check for multiple browser sessions (security feature)
  useEffect(() => {
    if (!user) return;

    const sessionId = `session_${user.id}_${Date.now()}`;
    localStorage.setItem('currentSessionId', sessionId);

    const checkMultipleSessions = () => {
      const currentSessionId = localStorage.getItem('currentSessionId');
      if (currentSessionId !== sessionId) {
        handleSessionExpiry('Multiple browser sessions detected');
      }
    };

    // Check every 10 seconds
    const sessionCheckInterval = setInterval(checkMultipleSessions, 10000);

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [user, handleSessionExpiry]);

  return {
    showWarning,
    timeRemaining,
    isSessionExpired,
    extendSession,
    resetActivity
  };
};