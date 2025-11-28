# Implementation Plan

- [x] 1. Set up testing infrastructure and utilities





  - Install fast-check library for property-based testing in functions directory
  - Create test utilities for analyzing response characteristics (sentence structure, formality, patterns)
  - Set up test fixtures with sample conversations and stakeholder profiles
  - _Requirements: All (testing foundation)_

- [x] 2. Implement Conversational Pattern Library





  - Create `functions/conversationalPatterns.js` module
  - Define pattern categories: opening phrases, thinking markers, hedges, acknowledgments, transitions, workplace idioms
  - Implement `getRandomPattern()` function with state-aware selection
  - Organize patterns by emotional state (neutral, skeptical, curious, warming_up, concerned, frustrated, satisfied)
  - _Requirements: 1.1, 1.5, 6.3, 7.1, 7.2, 7.4_

- [ ]* 2.1 Write property test for conversational filler presence
  - **Property 1: Conversational filler presence**
  - **Validates: Requirements 1.1**

- [ ]* 2.2 Write unit tests for pattern library
  - Test random pattern selection returns valid patterns
  - Test state-aware pattern filtering
  - Test all pattern categories have content
  - _Requirements: 1.1, 1.5, 7.1_

- [x] 3. Implement Personality Engine





  - Create `functions/personalityEngine.js` module
  - Implement `PersonalityEngine` class with constructor accepting stakeholder
  - Create `derivePatterns()` method to map personality traits to language patterns
  - Implement personality mappings: direct, collaborative, analytical, creative, supportive, skeptical
  - Create `getLanguageInstructions()` method returning prompt instructions
  - Create `getSamplePhrases()` method returning example phrases for each personality
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 3.1 Write property test for personality-specific language patterns
  - **Property 7: Personality-specific language patterns**
  - **Validates: Requirements 3.1**

- [ ]* 3.2 Write unit tests for personality engine
  - Test pattern derivation for each personality type
  - Test language instruction generation
  - Test sample phrase retrieval
  - Test fallback to balanced personality for unknown types
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Implement Emotional State Tracker





  - Create `functions/emotionalStateTracker.js` module
  - Implement `EmotionalStateTracker` class with initialization
  - Create `analyzeTranscript()` method to determine emotional state from conversation
  - Implement state transition logic based on user responses
  - Track concerns addressed vs unaddressed
  - Create `getCurrentState()` method returning current emotional state
  - Create `getStateInstructions()` method returning prompt instructions for current state
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.4_

- [ ]* 4.1 Write property test for emotional state consistency
  - **Property 5: Emotional state consistency**
  - **Validates: Requirements 2.3**

- [ ]* 4.2 Write property test for concern acknowledgment
  - **Property 6: Concern acknowledgment**
  - **Validates: Requirements 2.4**

- [ ]* 4.3 Write unit tests for emotional state tracker
  - Test state transitions for different conversation patterns
  - Test concern tracking logic
  - Test state instruction generation
  - Test default to neutral on errors
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Implement Context Analyzer





  - Create `functions/contextAnalyzer.js` module
  - Implement `ContextAnalyzer` class with transcript initialization
  - Create `extractKeyPoints()` method to identify important statements
  - Implement `findContradictions()` method to detect user contradictions
  - Create `getReferencablePoints()` method returning points suitable for natural referencing
  - Track user commitments and whether they've been addressed
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 5.1 Write property test for context reference accuracy
  - **Property 8: Context reference accuracy**
  - **Validates: Requirements 4.1**

- [ ]* 5.2 Write property test for contradiction detection
  - **Property 9: Contradiction detection**
  - **Validates: Requirements 4.3**

- [ ]* 5.3 Write unit tests for context analyzer
  - Test key point extraction from various transcripts
  - Test contradiction detection logic
  - Test referenceable point identification
  - Test user commitment tracking
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6. Enhance buildSimulationPrompt function





  - Modify `buildSimulationPrompt()` in `functions/index.js` to accept transcript parameter
  - Integrate PersonalityEngine to get personality-specific instructions
  - Integrate EmotionalStateTracker to get current emotional state
  - Integrate ContextAnalyzer to get referenceable points
  - Integrate ConversationalPatterns to provide example phrases
  - Add few-shot examples demonstrating desired natural style
  - Add explicit instructions for contractions, informal language, and varied structure
  - Add instructions for thinking markers and hesitation patterns
  - Add instructions for workplace context and realistic references
  - Include negative instructions (what NOT to do)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1-3.5, 4.1-4.5, 6.1-6.5, 7.1-7.5, 8.2, 8.4, 9.1-9.5_

- [ ]* 6.1 Write property test for sentence structure variation
  - **Property 2: Sentence structure variation**
  - **Validates: Requirements 1.2**

- [ ]* 6.2 Write property test for contraction usage rate
  - **Property 3: Contraction usage rate**
  - **Validates: Requirements 1.3, 6.1**

- [ ]* 6.3 Write property test for phrase repetition limit
  - **Property 4: Phrase repetition limit**
  - **Validates: Requirements 1.4**

- [ ]* 6.4 Write property test for informal language prevalence
  - **Property 11: Informal language prevalence**
  - **Validates: Requirements 6.2, 6.4**

- [ ]* 6.5 Write property test for thinking marker appropriateness
  - **Property 12: Thinking marker appropriateness**
  - **Validates: Requirements 7.1**

- [x] 7. Optimize OpenAI API parameters





  - Update `simulateStakeholder` function in `functions/index.js`
  - Increase temperature from 0.9 to 1.0 for more natural variation
  - Increase max_tokens from 250 to 300 for natural flow
  - Add presence_penalty: 0.3 to discourage repetition
  - Add frequency_penalty: 0.3 to encourage varied vocabulary
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.3_

- [ ]* 7.1 Write property test for response variation across sessions
  - **Property 10: Response variation across sessions**
  - **Validates: Requirements 5.1, 5.5**

- [ ]* 7.2 Write property test for response length unpredictability
  - **Property 13: Response length unpredictability**
  - **Validates: Requirements 8.3**

- [x] 8. Add error handling and fallbacks





  - Add try-catch blocks around PersonalityEngine initialization
  - Add fallback to "balanced" personality on mapping failures
  - Add try-catch around EmotionalStateTracker with fallback to "neutral"
  - Add try-catch around ContextAnalyzer with graceful degradation
  - Add error logging for all failure scenarios
  - Ensure conversation continues even if enhancements fail
  - _Requirements: All (robustness)_

- [ ]* 8.1 Write unit tests for error handling
  - Test personality mapping fallback behavior
  - Test emotional state fallback to neutral
  - Test context analyzer graceful degradation
  - Test conversation continues on component failures
  - _Requirements: All (robustness)_

- [x] 9. Update scenario templates with enhanced stakeholder profiles (optional)




  - Add `communicationStyle` fields to stakeholder definitions in `src/constants/scenarios.ts`
  - Add `speechPatterns` fields to stakeholder definitions
  - Ensure backward compatibility with existing scenarios
  - _Requirements: 3.1-3.5_

- [x] 10. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Deploy and validate





  - Deploy updated functions to Firebase: `firebase deploy --only functions`
  - Test with actual OpenAI API calls using existing scenarios
  - Verify response quality improvements
  - Monitor function execution time and costs
  - Check Firebase Functions logs for any errors
  - _Requirements: All_

- [ ]* 11.1 Write integration tests for end-to-end conversation flows
  - Test complete conversation with enhanced prompts
  - Test all personality types produce distinct responses
  - Test emotional state transitions through conversation
  - Test context references appear naturally
  - _Requirements: All_

- [ ] 12. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
