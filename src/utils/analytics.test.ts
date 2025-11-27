import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  trackUserAction,
  setUserProperties,
  trackPageView,
  simulationAnalytics,
  authAnalytics,
  uiAnalytics,
  trackError,
  type UserActionEvent,
  type UserProperties,
} from './analytics';

describe('analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('trackUserAction', () => {
    it('should track user action with minimal properties', () => {
      trackUserAction('test_action');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'test_action',
          category: 'user_interaction',
          timestamp: expect.any(String),
        })
      );
    });

    it('should track user action with custom properties', () => {
      trackUserAction('button_click', {
        category: 'ui',
        label: 'submit_button',
        value: 1,
        customProp: 'custom_value',
      });

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'button_click',
          category: 'ui',
          label: 'submit_button',
          value: 1,
          properties: expect.objectContaining({
            customProp: 'custom_value',
          }),
        })
      );
    });

    it('should include timestamp in ISO format', () => {
      trackUserAction('test_action');

      const call = (console.log as any).mock.calls[0];
      const event = call[1] as UserActionEvent;
      
      expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('setUserProperties', () => {
    it('should set user properties', () => {
      const properties: UserProperties = {
        userId: 'user123',
        roleLevel: 'manager',
        totalSessions: 10,
        averageScore: 85.5,
      };

      setUserProperties(properties);

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics] Set User Properties',
        properties
      );
    });

    it('should handle minimal user properties', () => {
      const properties: UserProperties = {
        userId: 'user123',
      };

      setUserProperties(properties);

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics] Set User Properties',
        properties
      );
    });

    it('should handle custom user properties', () => {
      const properties: UserProperties = {
        userId: 'user123',
        customField: 'custom_value',
        anotherField: 42,
      };

      setUserProperties(properties);

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics] Set User Properties',
        properties
      );
    });
  });

  describe('trackPageView', () => {
    it('should track page view with page name', () => {
      trackPageView('home');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'page_view',
          category: 'navigation',
          label: 'home',
        })
      );
    });

    it('should track page view with additional properties', () => {
      trackPageView('scenario_select', {
        referrer: 'dashboard',
        sessionId: 'session123',
      });

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'page_view',
          category: 'navigation',
          label: 'scenario_select',
          properties: expect.objectContaining({
            referrer: 'dashboard',
            sessionId: 'session123',
          }),
        })
      );
    });
  });

  describe('simulationAnalytics', () => {
    it('should track simulation start', () => {
      simulationAnalytics.trackSimulationStart('scenario123', 'Test Scenario');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'simulation_start',
          category: 'simulation',
          label: 'Test Scenario',
          properties: expect.objectContaining({
            scenarioId: 'scenario123',
          }),
        })
      );
    });

    it('should track message sent', () => {
      simulationAnalytics.trackMessageSent(5, 150);

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'message_sent',
          category: 'simulation',
          properties: expect.objectContaining({
            turnCount: 5,
            messageLength: 150,
          }),
        })
      );
    });

    it('should track simulation exit', () => {
      simulationAnalytics.trackSimulationExit('scenario123', 8, 'manual');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'simulation_exit',
          category: 'simulation',
          properties: expect.objectContaining({
            scenarioId: 'scenario123',
            turnCount: 8,
            exitType: 'manual',
          }),
        })
      );
    });

    it('should track evaluation received', () => {
      simulationAnalytics.trackEvaluationReceived('scenario123', 85.5, 10);

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'evaluation_received',
          category: 'simulation',
          properties: expect.objectContaining({
            scenarioId: 'scenario123',
            overallScore: 85.5,
            turnCount: 10,
          }),
        })
      );
    });
  });

  describe('authAnalytics', () => {
    it('should track sign in', () => {
      authAnalytics.trackSignIn('google');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'sign_in',
          category: 'authentication',
          properties: expect.objectContaining({
            method: 'google',
          }),
        })
      );
    });

    it('should track sign up', () => {
      authAnalytics.trackSignUp('email');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'sign_up',
          category: 'authentication',
          properties: expect.objectContaining({
            method: 'email',
          }),
        })
      );
    });

    it('should track sign out', () => {
      authAnalytics.trackSignOut();

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'sign_out',
          category: 'authentication',
        })
      );
    });

    it('should track auth error', () => {
      authAnalytics.trackAuthError('auth/invalid-email');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'auth_error',
          category: 'authentication',
          properties: expect.objectContaining({
            errorCode: 'auth/invalid-email',
          }),
        })
      );
    });
  });

  describe('uiAnalytics', () => {
    it('should track button click', () => {
      uiAnalytics.trackButtonClick('submit_button', 'form');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'button_click',
          category: 'ui_interaction',
          label: 'submit_button',
          properties: expect.objectContaining({
            context: 'form',
          }),
        })
      );
    });

    it('should track button click without context', () => {
      uiAnalytics.trackButtonClick('menu_button');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'button_click',
          category: 'ui_interaction',
          label: 'menu_button',
        })
      );
    });

    it('should track tab change', () => {
      uiAnalytics.trackTabChange('progress');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'tab_change',
          category: 'ui_interaction',
          label: 'progress',
        })
      );
    });

    it('should track modal open', () => {
      uiAnalytics.trackModalOpen('scenario_details');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'modal_open',
          category: 'ui_interaction',
          label: 'scenario_details',
        })
      );
    });

    it('should track modal close', () => {
      uiAnalytics.trackModalClose('scenario_details');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'modal_close',
          category: 'ui_interaction',
          label: 'scenario_details',
        })
      );
    });
  });

  describe('trackError', () => {
    it('should track error with message only', () => {
      trackError('Something went wrong');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'error_occurred',
          category: 'error',
          label: 'Something went wrong',
        })
      );
    });

    it('should track error with error code', () => {
      trackError('Network error', 'ERR_NETWORK');

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'error_occurred',
          category: 'error',
          label: 'Network error',
          properties: expect.objectContaining({
            errorCode: 'ERR_NETWORK',
          }),
        })
      );
    });

    it('should track error with context', () => {
      trackError('API error', 'ERR_API', {
        component: 'ChatInterface',
        userId: 'user123',
      });

      expect(console.log).toHaveBeenCalledWith(
        '[Analytics]',
        expect.objectContaining({
          action: 'error_occurred',
          category: 'error',
          label: 'API error',
          properties: expect.objectContaining({
            errorCode: 'ERR_API',
            component: 'ChatInterface',
            userId: 'user123',
          }),
        })
      );
    });
  });
});
