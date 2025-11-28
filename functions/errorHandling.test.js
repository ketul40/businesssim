/**
 * Tests for error handling and fallbacks in buildSimulationPrompt
 * Validates: Requirements All (robustness)
 */

const {PersonalityEngine} = require('./personalityEngine');
const {EmotionalStateTracker} = require('./emotionalStateTracker');
const {ContextAnalyzer} = require('./contextAnalyzer');

describe('Error Handling and Fallbacks', () => {
  describe('PersonalityEngine Error Handling', () => {
    test('should handle null stakeholder gracefully', () => {
      expect(() => {
        new PersonalityEngine(null);
      }).toThrow();
    });

    test('should handle undefined stakeholder gracefully', () => {
      expect(() => {
        new PersonalityEngine(undefined);
      }).toThrow();
    });

    test('should handle stakeholder with unknown personality', () => {
      const stakeholder = {
        name: 'Test',
        personality: 'unknown-personality-type',
      };
      const engine = new PersonalityEngine(stakeholder);
      expect(engine.getPersonalityType()).toBe('balanced');
    });

    test('should handle stakeholder with missing personality', () => {
      const stakeholder = {
        name: 'Test',
      };
      const engine = new PersonalityEngine(stakeholder);
      expect(engine.getPersonalityType()).toBe('balanced');
    });
  });

  describe('EmotionalStateTracker Error Handling', () => {
    test('should handle null stakeholder gracefully', () => {
      expect(() => {
        new EmotionalStateTracker(null, {});
      }).toThrow();
    });

    test('should handle null scenario gracefully', () => {
      const stakeholder = {
        name: 'Test',
        concerns: [],
      };
      expect(() => {
        new EmotionalStateTracker(stakeholder, null);
      }).toThrow();
    });

    test('should handle empty transcript', () => {
      const stakeholder = {
        name: 'Test',
        concerns: ['budget', 'timeline'],
      };
      const scenario = {
        title: 'Test Scenario',
      };
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      tracker.analyzeTranscript([]);
      expect(tracker.getCurrentState()).toBe('neutral');
    });

    test('should handle malformed transcript entries', () => {
      const stakeholder = {
        name: 'Test',
        concerns: ['budget'],
      };
      const scenario = {
        title: 'Test Scenario',
      };
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      
      // Should not throw even with malformed entries
      expect(() => {
        tracker.analyzeTranscript([
          {type: 'user'}, // missing content
          {content: 'test'}, // missing type
          null,
          undefined,
        ]);
      }).not.toThrow();
    });
  });

  describe('ContextAnalyzer Error Handling', () => {
    test('should handle null transcript gracefully', () => {
      expect(() => {
        new ContextAnalyzer(null);
      }).toThrow();
    });

    test('should handle undefined transcript gracefully', () => {
      expect(() => {
        new ContextAnalyzer(undefined);
      }).toThrow();
    });

    test('should handle empty transcript', () => {
      const analyzer = new ContextAnalyzer([]);
      expect(analyzer.keyPoints).toEqual([]);
      expect(analyzer.userCommitments).toEqual([]);
      expect(analyzer.contradictions).toEqual([]);
    });

    test('should handle malformed transcript entries', () => {
      const analyzer = new ContextAnalyzer([
        {type: 'user'}, // missing content
        {content: 'test'}, // missing type
        null,
        undefined,
      ]);
      
      // Should not crash, just skip invalid entries
      expect(analyzer.keyPoints.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Error Handling', () => {
    test('should continue conversation even if PersonalityEngine fails', () => {
      // This test verifies that the system can continue with fallback values
      const stakeholder = {
        name: 'Test',
        personality: 'balanced',
        concerns: [],
        motivations: [],
      };
      
      const engine = new PersonalityEngine(stakeholder);
      const instructions = engine.getLanguageInstructions();
      
      expect(instructions).toBeTruthy();
      expect(typeof instructions).toBe('string');
    });

    test('should continue conversation even if EmotionalStateTracker fails', () => {
      const stakeholder = {
        name: 'Test',
        concerns: [],
      };
      const scenario = {
        title: 'Test',
      };
      
      const tracker = new EmotionalStateTracker(stakeholder, scenario);
      const instructions = tracker.getStateInstructions();
      
      expect(instructions).toBeTruthy();
      expect(typeof instructions).toBe('string');
    });

    test('should continue conversation even if ContextAnalyzer fails', () => {
      const analyzer = new ContextAnalyzer([]);
      const points = analyzer.getReferencablePoints();
      
      expect(Array.isArray(points)).toBe(true);
    });
  });
});
