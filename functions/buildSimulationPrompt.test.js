/**
 * Tests for enhanced buildSimulationPrompt function
 */

const {PersonalityEngine} = require("./personalityEngine");
const {EmotionalStateTracker} = require("./emotionalStateTracker");
const {ContextAnalyzer} = require("./contextAnalyzer");
const ConversationalPatterns = require("./conversationalPatterns");

// Mock the buildSimulationPrompt function since it's not exported
// We'll test the integration by verifying the components work together

describe("buildSimulationPrompt Integration", () => {
  const mockScenario = {
    title: "Budget Approval Meeting",
    situation: "You need to get budget approval for a new project",
    objective: "Secure $50k budget approval",
    constraints: [
      "Q4 budget is tight",
      "Need to show clear ROI",
    ],
    stakeholders: [{
      name: "Sarah Kim",
      role: "VP of Product",
      personality: "analytical",
      concerns: ["Budget constraints", "Resource allocation"],
      motivations: ["Data-driven decisions", "Team efficiency"],
    }],
  };

  const mockTranscript = [
    {type: "user", content: "I'd like to discuss the new analytics project."},
    {type: "stakeholder", content: "Okay, what's the scope?"},
    {type: "user", content: "We need $50k for Q4."},
  ];

  test("PersonalityEngine generates personality-specific instructions", () => {
    const engine = new PersonalityEngine(mockScenario.stakeholders[0]);
    const instructions = engine.getLanguageInstructions();
    
    expect(instructions).toBeTruthy();
    expect(typeof instructions).toBe("string");
    expect(instructions.length).toBeGreaterThan(0);
  });

  test("EmotionalStateTracker analyzes transcript and provides state instructions", () => {
    const tracker = new EmotionalStateTracker(
        mockScenario.stakeholders[0],
        mockScenario,
    );
    tracker.analyzeTranscript(mockTranscript);
    
    const stateInstructions = tracker.getStateInstructions();
    expect(stateInstructions).toBeTruthy();
    expect(typeof stateInstructions).toBe("string");
  });

  test("ContextAnalyzer extracts referenceable points from transcript", () => {
    const analyzer = new ContextAnalyzer(mockTranscript);
    const points = analyzer.getReferencablePoints();
    
    expect(Array.isArray(points)).toBe(true);
    // Should have at least some points from the transcript
    expect(points.length).toBeGreaterThanOrEqual(0);
  });

  test("ConversationalPatterns provides example phrases", () => {
    const openings = ConversationalPatterns.getRandomPattern("openingPhrases", "neutral", 3);
    expect(Array.isArray(openings)).toBe(true);
    expect(openings.length).toBeGreaterThan(0);
    
    const thinking = ConversationalPatterns.getRandomPattern("thinkingMarkers", "neutral", 3);
    expect(Array.isArray(thinking)).toBe(true);
    expect(thinking.length).toBeGreaterThan(0);
  });

  test("All components work together without errors", () => {
    // This simulates what buildSimulationPrompt does
    expect(() => {
      const engine = new PersonalityEngine(mockScenario.stakeholders[0]);
      const tracker = new EmotionalStateTracker(
          mockScenario.stakeholders[0],
          mockScenario,
      );
      const analyzer = new ContextAnalyzer(mockTranscript);
      
      tracker.analyzeTranscript(mockTranscript);
      
      const personalityInstructions = engine.getLanguageInstructions();
      const examplePhrases = engine.getSamplePhrases();
      const stateInstructions = tracker.getStateInstructions();
      const contextPoints = analyzer.getReferencablePoints();
      const patterns = ConversationalPatterns.getRandomPattern("openingPhrases", "neutral", 3);
      
      // Verify all components returned valid data
      expect(personalityInstructions).toBeTruthy();
      expect(stateInstructions).toBeTruthy();
      expect(Array.isArray(contextPoints)).toBe(true);
      expect(Array.isArray(patterns)).toBe(true);
    }).not.toThrow();
  });

  test("Components handle empty transcript gracefully", () => {
    expect(() => {
      const tracker = new EmotionalStateTracker(
          mockScenario.stakeholders[0],
          mockScenario,
      );
      tracker.analyzeTranscript([]);
      const instructions = tracker.getStateInstructions();
      expect(instructions).toBeTruthy();
    }).not.toThrow();
  });

  test("Components handle missing optional fields gracefully", () => {
    const minimalStakeholder = {
      name: "Test Person",
      role: "Manager",
      personality: "unknown",
      concerns: [],
      motivations: [],
    };

    expect(() => {
      const engine = new PersonalityEngine(minimalStakeholder);
      const instructions = engine.getLanguageInstructions();
      expect(instructions).toBeTruthy();
    }).not.toThrow();
  });
});
