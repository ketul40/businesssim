/**
 * Example integration of monitoring utilities in the application
 * 
 * This file demonstrates how to integrate performance monitoring,
 * analytics tracking, and error logging throughout the application.
 */

import {
  initMonitoring,
  setMonitoringUser,
  clearMonitoringUser,
  measurePerformance,
  measurePerformanceAsync,
  trackPageView,
  simulationAnalytics,
  authAnalytics,
  uiAnalytics,
  logError,
} from './monitoring';

/**
 * 1. Initialize monitoring when the app starts
 * 
 * Add this to your main.tsx or App.tsx initialization:
 */
export function initializeAppMonitoring() {
  initMonitoring({
    enablePerformanceTracking: true,
    enableAnalytics: true,
    enableErrorTracking: true,
    debug: import.meta.env.DEV,
  });
}

/**
 * 2. Track user authentication
 * 
 * Call this when a user signs in:
 */
export function handleUserSignIn(userId: string, method: string, userProfile: any) {
  // Track the sign-in event
  authAnalytics.trackSignIn(method);

  // Set user properties for all subsequent events
  setMonitoringUser(userId, {
    roleLevel: userProfile.roleLevel,
    totalSessions: userProfile.totalSessions,
    averageScore: userProfile.averageScore,
  });
}

/**
 * 3. Track user sign out
 * 
 * Call this when a user signs out:
 */
export function handleUserSignOut() {
  authAnalytics.trackSignOut();
  clearMonitoringUser();
}

/**
 * 4. Track page views
 * 
 * Call this when navigating between views:
 */
export function handlePageNavigation(pageName: string) {
  trackPageView(pageName);
}

/**
 * 5. Track simulation events
 * 
 * Example usage in simulation flow:
 */
export function handleSimulationStart(scenarioId: string, scenarioTitle: string) {
  simulationAnalytics.trackSimulationStart(scenarioId, scenarioTitle);
}

export function handleMessageSent(turnCount: number, messageContent: string) {
  simulationAnalytics.trackMessageSent(turnCount, messageContent.length);
}

export function handleSimulationExit(
  scenarioId: string,
  turnCount: number,
  exitType: 'timeout' | 'manual'
) {
  simulationAnalytics.trackSimulationExit(scenarioId, turnCount, exitType);
}

export function handleEvaluationReceived(
  scenarioId: string,
  overallScore: number,
  turnCount: number
) {
  simulationAnalytics.trackEvaluationReceived(scenarioId, overallScore, turnCount);
}

/**
 * 6. Track UI interactions
 * 
 * Example usage for button clicks:
 */
export function handleButtonClick(buttonName: string, context?: string) {
  uiAnalytics.trackButtonClick(buttonName, context);
}

export function handleTabChange(tabName: string) {
  uiAnalytics.trackTabChange(tabName);
}

/**
 * 7. Measure performance of expensive operations
 * 
 * Example: Measuring synchronous operations
 */
export function processExpensiveData(data: any[]) {
  return measurePerformance('process_data', () => {
    // Your expensive operation here
    return data.map((item) => ({
      ...item,
      processed: true,
    }));
  });
}

/**
 * Example: Measuring asynchronous operations
 */
export async function fetchAndProcessData(url: string) {
  return measurePerformanceAsync('fetch_and_process', async () => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  });
}

/**
 * 8. Error handling with monitoring
 * 
 * Example: Catching and logging errors
 */
export async function handleApiCall(endpoint: string) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // Log the error with context
    logError(error as Error, {
      component: 'ApiService',
      action: 'fetch',
      endpoint,
    });
    throw error;
  }
}

/**
 * 9. Integration in React components
 * 
 * Example component with monitoring:
 */
/*
import { useEffect } from 'react';
import { trackPageView, uiAnalytics, logError } from './utils/monitoring';

function ScenarioSelectComponent() {
  useEffect(() => {
    // Track page view when component mounts
    trackPageView('scenario_select');
  }, []);

  const handleScenarioClick = (scenarioId: string) => {
    try {
      // Track the interaction
      uiAnalytics.trackButtonClick('scenario_card', scenarioId);
      
      // Your logic here
      selectScenario(scenarioId);
    } catch (error) {
      logError(error as Error, {
        component: 'ScenarioSelect',
        action: 'select_scenario',
        scenarioId,
      });
    }
  };

  return (
    // Your component JSX
  );
}
*/

/**
 * 10. Integration in custom hooks
 * 
 * Example hook with performance monitoring:
 */
/*
import { useEffect, useState } from 'react';
import { measurePerformanceAsync, logError } from './utils/monitoring';

function useSimulation(scenarioId: string) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content: string) => {
    setLoading(true);
    try {
      // Measure the performance of the API call
      const response = await measurePerformanceAsync(
        'send_simulation_message',
        async () => {
          return await fetch('/api/simulation/message', {
            method: 'POST',
            body: JSON.stringify({ scenarioId, content }),
          });
        }
      );

      const data = await response.json();
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      logError(error as Error, {
        component: 'useSimulation',
        action: 'send_message',
        scenarioId,
      });
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessage };
}
*/
