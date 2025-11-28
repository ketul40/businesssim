/**
 * Tests for Conversational Pattern Library
 * Requirements: 1.1, 1.5, 6.3, 7.1, 7.2, 7.4
 */

const {
  openingPhrases,
  thinkingMarkers,
  hedges,
  acknowledgments,
  transitions,
  workplaceIdioms,
  getRandomPattern,
  getEmotionalStates,
  getPatternCategories,
} = require("./conversationalPatterns");

describe("Conversational Pattern Library", () => {
  describe("Pattern Data Structures", () => {
    test("openingPhrases should have all emotional states", () => {
      const expectedStates = [
        "neutral",
        "skeptical",
        "curious",
        "warming_up",
        "concerned",
        "frustrated",
        "satisfied",
      ];

      expectedStates.forEach((state) => {
        expect(openingPhrases[state]).toBeDefined();
        expect(Array.isArray(openingPhrases[state])).toBe(true);
        expect(openingPhrases[state].length).toBeGreaterThan(0);
      });
    });

    test("thinkingMarkers should be a non-empty array", () => {
      expect(Array.isArray(thinkingMarkers)).toBe(true);
      expect(thinkingMarkers.length).toBeGreaterThan(0);
    });

    test("hedges should be a non-empty array", () => {
      expect(Array.isArray(hedges)).toBe(true);
      expect(hedges.length).toBeGreaterThan(0);
    });

    test("acknowledgments should have neutral, positive, and skeptical types", () => {
      expect(acknowledgments.neutral).toBeDefined();
      expect(acknowledgments.positive).toBeDefined();
      expect(acknowledgments.skeptical).toBeDefined();
      expect(Array.isArray(acknowledgments.neutral)).toBe(true);
      expect(Array.isArray(acknowledgments.positive)).toBe(true);
      expect(Array.isArray(acknowledgments.skeptical)).toBe(true);
    });

    test("transitions should be a non-empty array", () => {
      expect(Array.isArray(transitions)).toBe(true);
      expect(transitions.length).toBeGreaterThan(0);
    });

    test("workplaceIdioms should be a non-empty array", () => {
      expect(Array.isArray(workplaceIdioms)).toBe(true);
      expect(workplaceIdioms.length).toBeGreaterThan(0);
    });
  });

  describe("getRandomPattern", () => {
    test("should return a valid opening phrase for neutral state", () => {
      const pattern = getRandomPattern("openingPhrases", "neutral");
      expect(pattern).toBeDefined();
      expect(typeof pattern).toBe("string");
      expect(openingPhrases.neutral).toContain(pattern);
    });

    test("should return a valid opening phrase for skeptical state", () => {
      const pattern = getRandomPattern("openingPhrases", "skeptical");
      expect(pattern).toBeDefined();
      expect(typeof pattern).toBe("string");
      expect(openingPhrases.skeptical).toContain(pattern);
    });

    test("should return a valid thinking marker", () => {
      const pattern = getRandomPattern("thinkingMarkers");
      expect(pattern).toBeDefined();
      expect(typeof pattern).toBe("string");
      expect(thinkingMarkers).toContain(pattern);
    });

    test("should return a valid hedge", () => {
      const pattern = getRandomPattern("hedges");
      expect(pattern).toBeDefined();
      expect(typeof pattern).toBe("string");
      expect(hedges).toContain(pattern);
    });

    test("should return positive acknowledgment for satisfied state", () => {
      const pattern = getRandomPattern("acknowledgments", "satisfied");
      expect(pattern).toBeDefined();
      expect(typeof pattern).toBe("string");
      expect(acknowledgments.positive).toContain(pattern);
    });

    test("should return skeptical acknowledgment for skeptical state", () => {
      const pattern = getRandomPattern("acknowledgments", "skeptical");
      expect(pattern).toBeDefined();
      expect(typeof pattern).toBe("string");
      expect(acknowledgments.skeptical).toContain(pattern);
    });

    test("should return a valid transition", () => {
      const pattern = getRandomPattern("transitions");
      expect(pattern).toBeDefined();
      expect(typeof pattern).toBe("string");
      expect(transitions).toContain(pattern);
    });

    test("should return a valid workplace idiom", () => {
      const pattern = getRandomPattern("workplaceIdioms");
      expect(pattern).toBeDefined();
      expect(typeof pattern).toBe("string");
      expect(workplaceIdioms).toContain(pattern);
    });

    test("should fall back to neutral state for unknown state", () => {
      const pattern = getRandomPattern("openingPhrases", "unknown_state");
      expect(pattern).toBeDefined();
      expect(typeof pattern).toBe("string");
      expect(openingPhrases.neutral).toContain(pattern);
    });

    test("should return null for unknown category", () => {
      const pattern = getRandomPattern("unknownCategory");
      expect(pattern).toBeNull();
    });

    test("should return different patterns on multiple calls (randomness)", () => {
      const patterns = new Set();
      // Call 20 times to get different patterns
      for (let i = 0; i < 20; i++) {
        const pattern = getRandomPattern("openingPhrases", "neutral");
        patterns.add(pattern);
      }
      // Should have at least 2 different patterns (very likely with 20 calls)
      expect(patterns.size).toBeGreaterThan(1);
    });
  });

  describe("getEmotionalStates", () => {
    test("should return all emotional states", () => {
      const states = getEmotionalStates();
      expect(Array.isArray(states)).toBe(true);
      expect(states).toContain("neutral");
      expect(states).toContain("skeptical");
      expect(states).toContain("curious");
      expect(states).toContain("warming_up");
      expect(states).toContain("concerned");
      expect(states).toContain("frustrated");
      expect(states).toContain("satisfied");
    });
  });

  describe("getPatternCategories", () => {
    test("should return all pattern categories", () => {
      const categories = getPatternCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories).toContain("openingPhrases");
      expect(categories).toContain("thinkingMarkers");
      expect(categories).toContain("hedges");
      expect(categories).toContain("acknowledgments");
      expect(categories).toContain("transitions");
      expect(categories).toContain("workplaceIdioms");
    });
  });

  describe("State-aware pattern selection", () => {
    test("should return different patterns for different emotional states", () => {
      const neutralPattern = getRandomPattern("openingPhrases", "neutral");
      const skepticalPattern = getRandomPattern("openingPhrases", "skeptical");

      // Verify they come from different arrays
      expect(openingPhrases.neutral).toContain(neutralPattern);
      expect(openingPhrases.skeptical).toContain(skepticalPattern);

      // Note: They might occasionally be the same if arrays overlap,
      // but they should come from their respective state arrays
    });

    test("should map warming_up state to positive acknowledgments", () => {
      const pattern = getRandomPattern("acknowledgments", "warming_up");
      expect(acknowledgments.positive).toContain(pattern);
    });

    test("should map frustrated state to skeptical acknowledgments", () => {
      const pattern = getRandomPattern("acknowledgments", "frustrated");
      expect(acknowledgments.skeptical).toContain(pattern);
    });
  });
});
