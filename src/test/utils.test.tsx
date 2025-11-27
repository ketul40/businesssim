import { describe, it, expect } from 'vitest';
import { renderWithProviders, waitForCondition, createMockUser, createMockScenario, createMockMessage, createMockSession } from './utils';

describe('Test Utilities', () => {
  describe('renderWithProviders', () => {
    it('should render a component', () => {
      const TestComponent = () => <div>Test</div>;
      const { getByText } = renderWithProviders(<TestComponent />);
      expect(getByText('Test')).toBeInTheDocument();
    });

    it('should render components with props', () => {
      const TestComponent = ({ text }: { text: string }) => <div>{text}</div>;
      const { getByText } = renderWithProviders(<TestComponent text="Hello" />);
      expect(getByText('Hello')).toBeInTheDocument();
    });
  });

  describe('waitForCondition', () => {
    it('should resolve when condition becomes true', async () => {
      let value = false;
      setTimeout(() => { value = true; }, 100);
      
      await expect(
        waitForCondition(() => value, 1000, 50)
      ).resolves.toBeUndefined();
    });

    it('should timeout if condition never becomes true', async () => {
      await expect(
        waitForCondition(() => false, 200, 50)
      ).rejects.toThrow('Timeout waiting for condition');
    });
  });

  describe('createMockUser', () => {
    it('should create a mock user with default values', () => {
      const user = createMockUser();
      expect(user).toHaveProperty('uid');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('displayName');
      expect(user.uid).toBe('test-user-id');
      expect(user.email).toBe('test@example.com');
    });

    it('should allow overriding default values', () => {
      const user = createMockUser({ uid: 'custom-id', email: 'custom@example.com' });
      expect(user.uid).toBe('custom-id');
      expect(user.email).toBe('custom@example.com');
    });
  });

  describe('createMockScenario', () => {
    it('should create a mock scenario with default values', () => {
      const scenario = createMockScenario();
      expect(scenario).toHaveProperty('id');
      expect(scenario).toHaveProperty('title');
      expect(scenario).toHaveProperty('category');
      expect(scenario).toHaveProperty('difficulty');
      expect(scenario.difficulty).toBe('Medium');
    });

    it('should allow overriding default values', () => {
      const scenario = createMockScenario({ title: 'Custom Scenario', difficulty: 'Hard' });
      expect(scenario.title).toBe('Custom Scenario');
      expect(scenario.difficulty).toBe('Hard');
    });
  });

  describe('createMockMessage', () => {
    it('should create a mock message with default values', () => {
      const message = createMockMessage();
      expect(message).toHaveProperty('type');
      expect(message).toHaveProperty('content');
      expect(message).toHaveProperty('timestamp');
      expect(message.type).toBe('user');
    });

    it('should allow overriding default values', () => {
      const message = createMockMessage({ type: 'ai', content: 'AI response' });
      expect(message.type).toBe('ai');
      expect(message.content).toBe('AI response');
    });
  });

  describe('createMockSession', () => {
    it('should create a mock session with default values', () => {
      const session = createMockSession();
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('userId');
      expect(session).toHaveProperty('scenario');
      expect(session).toHaveProperty('transcript');
      expect(session).toHaveProperty('turnCount');
      expect(session.state).toBe('IN_SIM');
    });

    it('should allow overriding default values', () => {
      const session = createMockSession({ state: 'EVALUATED', turnCount: 5 });
      expect(session.state).toBe('EVALUATED');
      expect(session.turnCount).toBe(5);
    });
  });
});
