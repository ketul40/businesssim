/**
 * User analytics tracking utilities
 */

/**
 * User action event structure
 */
export interface UserActionEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: string;
}

/**
 * User properties for analytics
 */
export interface UserProperties {
  userId?: string;
  roleLevel?: string;
  totalSessions?: number;
  averageScore?: number;
  [key: string]: any;
}

/**
 * Tracks a user action/event
 * @param action - The action name (e.g., 'scenario_selected', 'message_sent')
 * @param properties - Additional properties about the action
 */
export function trackUserAction(
  action: string,
  properties?: Record<string, any>
): void {
  const event: UserActionEvent = {
    action,
    category: properties?.category || 'user_interaction',
    label: properties?.label,
    value: properties?.value,
    properties,
    timestamp: new Date().toISOString(),
  };

  if (import.meta.env.DEV) {
    console.log('[Analytics]', event);
  }

  // In production, send to analytics service
  if (import.meta.env.PROD) {
    // TODO: Send to analytics service (e.g., Firebase Analytics, Google Analytics)
    // Example: analytics.logEvent(action, properties);
  }
}

/**
 * Sets user properties for analytics
 * @param properties - User properties to set
 */
export function setUserProperties(properties: UserProperties): void {
  if (import.meta.env.DEV) {
    console.log('[Analytics] Set User Properties', properties);
  }

  // In production, send to analytics service
  if (import.meta.env.PROD) {
    // TODO: Send to analytics service
    // Example: analytics.setUserProperties(properties);
  }
}

/**
 * Tracks page view
 * @param pageName - Name of the page/view
 * @param properties - Additional properties about the page view
 */
export function trackPageView(
  pageName: string,
  properties?: Record<string, any>
): void {
  trackUserAction('page_view', {
    category: 'navigation',
    label: pageName,
    ...properties,
  });
}

/**
 * Tracks simulation events
 */
export const simulationAnalytics = {
  /**
   * Tracks when a user starts a simulation
   */
  trackSimulationStart(scenarioId: string, scenarioTitle: string): void {
    trackUserAction('simulation_start', {
      category: 'simulation',
      label: scenarioTitle,
      scenarioId,
    });
  },

  /**
   * Tracks when a user sends a message in simulation
   */
  trackMessageSent(turnCount: number, messageLength: number): void {
    trackUserAction('message_sent', {
      category: 'simulation',
      turnCount,
      messageLength,
    });
  },

  /**
   * Tracks when a user exits a simulation
   */
  trackSimulationExit(
    scenarioId: string,
    turnCount: number,
    exitType: 'timeout' | 'manual'
  ): void {
    trackUserAction('simulation_exit', {
      category: 'simulation',
      scenarioId,
      turnCount,
      exitType,
    });
  },

  /**
   * Tracks when a user receives evaluation
   */
  trackEvaluationReceived(
    scenarioId: string,
    overallScore: number,
    turnCount: number
  ): void {
    trackUserAction('evaluation_received', {
      category: 'simulation',
      scenarioId,
      overallScore,
      turnCount,
    });
  },
};

/**
 * Tracks authentication events
 */
export const authAnalytics = {
  /**
   * Tracks successful sign in
   */
  trackSignIn(method: string): void {
    trackUserAction('sign_in', {
      category: 'authentication',
      method,
    });
  },

  /**
   * Tracks successful sign up
   */
  trackSignUp(method: string): void {
    trackUserAction('sign_up', {
      category: 'authentication',
      method,
    });
  },

  /**
   * Tracks sign out
   */
  trackSignOut(): void {
    trackUserAction('sign_out', {
      category: 'authentication',
    });
  },

  /**
   * Tracks authentication error
   */
  trackAuthError(errorCode: string): void {
    trackUserAction('auth_error', {
      category: 'authentication',
      errorCode,
    });
  },
};

/**
 * Tracks UI interaction events
 */
export const uiAnalytics = {
  /**
   * Tracks button click
   */
  trackButtonClick(buttonName: string, context?: string): void {
    trackUserAction('button_click', {
      category: 'ui_interaction',
      label: buttonName,
      context,
    });
  },

  /**
   * Tracks tab/view change
   */
  trackTabChange(tabName: string): void {
    trackUserAction('tab_change', {
      category: 'ui_interaction',
      label: tabName,
    });
  },

  /**
   * Tracks modal open
   */
  trackModalOpen(modalName: string): void {
    trackUserAction('modal_open', {
      category: 'ui_interaction',
      label: modalName,
    });
  },

  /**
   * Tracks modal close
   */
  trackModalClose(modalName: string): void {
    trackUserAction('modal_close', {
      category: 'ui_interaction',
      label: modalName,
    });
  },
};

/**
 * Tracks error events for analytics
 */
export function trackError(
  errorMessage: string,
  errorCode?: string,
  context?: Record<string, any>
): void {
  trackUserAction('error_occurred', {
    category: 'error',
    label: errorMessage,
    errorCode,
    ...context,
  });
}
