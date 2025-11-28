# Design Document: Human-Like AI Responses

## Overview

This design enhances the realism of AI stakeholder responses in BusinessSim by implementing advanced prompt engineering techniques, dynamic personality modeling, and conversational pattern generation. The solution focuses on modifying the system prompt generation and response parameters in the Firebase Functions to create more natural, emotionally nuanced, and contextually aware AI interactions.

The core approach involves:
1. Enhanced system prompt templates with personality-specific language patterns
2. Dynamic emotional state tracking throughout conversations
3. Conversational pattern libraries for natural speech elements
4. Improved context awareness and memory mechanisms
5. Optimized AI model parameters for natural variation

## Architecture

### Current Architecture
```
User Input → Firebase Function (simulateStakeholder) → OpenAI API → Response
                     ↓
              buildSimulationPrompt()
                     ↓
              Static system prompt
```

### Enhanced Architecture
```
User Input → Firebase Function (simulateStakeholder)
                     ↓
              Enhanced Prompt Builder
                     ↓
         ┌───────────┴───────────┐
         ↓                       ↓
    Personality Engine    Emotional State Tracker
         ↓                       ↓
    Pattern Library        Context Analyzer
         ↓                       ↓
         └───────────┬───────────┘
                     ↓
              Dynamic System Prompt
                     ↓
              OpenAI API (enhanced params)
                     ↓
              Natural Response
```

## Components and Interfaces

### 1. Enhanced Prompt Builder

**Location:** `functions/index.js` - `buildSimulationPrompt()`

**Purpose:** Generate dynamic, personality-driven system prompts with natural language instructions

**Interface:**
```javascript
function buildSimulationPrompt(scenario, transcript, emotionalState) {
  // Returns enhanced system prompt string
}
```

**Enhancements:**
- Personality-specific language pattern instructions
- Emotional state context
- Conversational pattern examples
- Memory and context awareness directives

### 2. Personality Engine

**Location:** `functions/personalityEngine.js` (new module)

**Purpose:** Map stakeholder personality traits to specific communication patterns

**Interface:**
```javascript
class PersonalityEngine {
  constructor(stakeholder) {
    this.stakeholder = stakeholder;
    this.patterns = this.derivePatterns();
  }
  
  derivePatterns() {
    // Returns personality-specific language patterns
  }
  
  getLanguageInstructions() {
    // Returns prompt instructions for this personality
  }
  
  getSamplePhrases() {
    // Returns example phrases for this personality
  }
}
```

**Personality Mappings:**
- **Direct**: Short sentences, assertive verbs, minimal hedging
- **Collaborative**: Inclusive pronouns, questions, building phrases
- **Analytical**: Data requests, precise terms, conditional language
- **Creative**: Metaphors, exploratory questions, possibility language
- **Supportive**: Encouraging phrases, empathy markers, validation
- **Skeptical**: Challenging questions, "but" statements, proof requests

### 3. Emotional State Tracker

**Location:** `functions/emotionalStateTracker.js` (new module)

**Purpose:** Track and update stakeholder emotional state based on conversation flow

**Interface:**
```javascript
class EmotionalStateTracker {
  constructor(stakeholder, scenario) {
    this.currentState = 'neutral';
    this.stateHistory = [];
    this.concerns = stakeholder.concerns;
    this.concernsAddressed = new Set();
  }
  
  analyzeTranscript(transcript) {
    // Analyzes conversation and updates emotional state
  }
  
  getCurrentState() {
    // Returns current emotional state descriptor
  }
  
  getStateInstructions() {
    // Returns prompt instructions for current emotional state
  }
}
```

**Emotional States:**
- `skeptical` → Use challenging questions, "but" statements
- `curious` → Use exploratory questions, "tell me more" phrases
- `warming_up` → Use acknowledgment phrases, softer language
- `concerned` → Use worry markers, risk-focused language
- `frustrated` → Use impatient markers, direct challenges
- `satisfied` → Use agreement markers, positive language

**State Transitions:**
- User addresses concern → Move toward `warming_up` or `satisfied`
- User is vague → Move toward `skeptical` or `frustrated`
- User makes strong point → Move toward `curious` or `warming_up`
- User ignores concern → Move toward `frustrated` or `concerned`

### 4. Conversational Pattern Library

**Location:** `functions/conversationalPatterns.js` (new module)

**Purpose:** Provide natural language elements for human-like responses

**Interface:**
```javascript
const ConversationalPatterns = {
  openingPhrases: {
    neutral: ['Look,', 'Here\'s the thing,', 'You know,', 'So,'],
    skeptical: ['I hear you, but', 'Hmm,', 'I\'m not sure about that,'],
    curious: ['Interesting,', 'Tell me more about', 'Help me understand'],
    // ... more states
  },
  
  thinkingMarkers: ['Let me think about that...', 'Hmm,', 'Okay, so...'],
  
  hedges: ['maybe', 'possibly', 'I\'m not entirely sure', 'potentially'],
  
  acknowledgments: ['I see what you\'re saying', 'Fair point', 'That makes sense'],
  
  transitions: ['Going back to', 'On that note', 'Speaking of which'],
  
  workplaceIdioms: ['on the same page', 'move the needle', 'circle back'],
  
  getRandomPattern(category, state = 'neutral') {
    // Returns random pattern from category
  }
};
```

### 5. Context Analyzer

**Location:** `functions/contextAnalyzer.js` (new module)

**Purpose:** Extract key points from conversation for natural referencing

**Interface:**
```javascript
class ContextAnalyzer {
  constructor(transcript) {
    this.transcript = transcript;
    this.keyPoints = [];
    this.userCommitments = [];
    this.stakeholderConcerns = [];
  }
  
  extractKeyPoints() {
    // Identifies important statements from conversation
  }
  
  findContradictions() {
    // Detects user contradictions
  }
  
  getReferencablePoints() {
    // Returns points suitable for natural referencing
  }
}
```

## Data Models

### Enhanced Stakeholder Model

```typescript
interface Stakeholder {
  role: string;
  name: string;
  relationshipType: string;
  personality: string;
  concerns: string[];
  motivations: string[];
  
  // New fields for enhanced responses
  communicationStyle?: {
    directness: 'direct' | 'indirect' | 'balanced';
    formality: 'formal' | 'casual' | 'professional';
    emotionalExpressiveness: 'high' | 'medium' | 'low';
    questioningStyle: 'probing' | 'supportive' | 'challenging';
  };
  
  speechPatterns?: {
    averageSentenceLength: 'short' | 'medium' | 'long';
    usesIdioms: boolean;
    usesHumor: boolean;
    thinkingPauses: 'frequent' | 'occasional' | 'rare';
  };
}
```

### Emotional State Model

```typescript
interface EmotionalState {
  current: 'skeptical' | 'curious' | 'warming_up' | 'concerned' | 'frustrated' | 'satisfied' | 'neutral';
  intensity: number; // 0-1
  concernsAddressed: string[];
  concernsUnaddressed: string[];
  trajectory: 'improving' | 'declining' | 'stable';
}
```

### Conversation Context Model

```typescript
interface ConversationContext {
  keyPoints: Array<{
    turn: number;
    speaker: 'user' | 'stakeholder';
    content: string;
    importance: number;
  }>;
  
  userCommitments: Array<{
    turn: number;
    commitment: string;
    addressed: boolean;
  }>;
  
  topicsDiscussed: string[];
  
  contradictions: Array<{
    turn1: number;
    turn2: number;
    description: string;
  }>;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Conversational filler presence

*For any* AI stakeholder response, the response should contain at least one conversational element (filler, hedge, thinking marker, or tone marker) when the response is longer than one sentence
**Validates: Requirements 1.1**

### Property 2: Sentence structure variation

*For any* conversation with at least 3 stakeholder responses, no two consecutive responses should have identical sentence structure patterns (measured by sentence count and average sentence length)
**Validates: Requirements 1.2**

### Property 3: Contraction usage rate

*For any* set of 10 stakeholder responses, at least 60% of applicable verb phrases should use contractions rather than full forms
**Validates: Requirements 1.3, 6.1**

### Property 4: Phrase repetition limit

*For any* conversation, no identical multi-word phrase (3+ words) should appear in more than 30% of stakeholder responses
**Validates: Requirements 1.4**

### Property 5: Emotional state consistency

*For any* conversation where a user addresses a stakeholder concern, the emotional state should shift toward more positive states (skeptical→curious, concerned→warming_up) in subsequent responses
**Validates: Requirements 2.3**

### Property 6: Concern acknowledgment

*For any* conversation where a user directly addresses a stated concern, the next stakeholder response should include acknowledgment language (appreciation, relief, or consideration markers)
**Validates: Requirements 2.4**

### Property 7: Personality-specific language patterns

*For any* two stakeholders with different personality types (e.g., "direct" vs "collaborative"), their responses to similar user inputs should exhibit measurably different language patterns (sentence length, question frequency, assertiveness markers)
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 8: Context reference accuracy

*For any* conversation where the stakeholder references a previous user statement, the reference should accurately reflect the content of that earlier statement
**Validates: Requirements 4.1, 4.2**

### Property 9: Contradiction detection

*For any* conversation where a user makes contradictory statements, the stakeholder should acknowledge the contradiction within 2 responses of the second statement
**Validates: Requirements 4.3**

### Property 10: Response variation across sessions

*For any* two different conversations with the same scenario and similar user inputs, the stakeholder responses should have less than 40% word overlap (excluding common words)
**Validates: Requirements 5.1, 5.5**

### Property 11: Informal language prevalence

*For any* stakeholder response, the formality score (measured by formal phrase count / total phrases) should be below 0.3 for professional workplace scenarios
**Validates: Requirements 6.2, 6.4**

### Property 12: Thinking marker appropriateness

*For any* stakeholder response to a complex proposal or question, the response should include thinking markers (e.g., "Hmm," "Let me think") at least 40% of the time
**Validates: Requirements 7.1**

### Property 13: Response length unpredictability

*For any* conversation with at least 5 stakeholder responses, the standard deviation of response lengths (in sentences) should be at least 0.8
**Validates: Requirements 8.3**

## Error Handling

### 1. Personality Mapping Failures

**Scenario:** Stakeholder personality string doesn't match known patterns

**Handling:**
- Fall back to "balanced" personality profile
- Log warning for review
- Continue with generic natural language patterns

### 2. Emotional State Calculation Errors

**Scenario:** Unable to determine emotional state from transcript

**Handling:**
- Default to "neutral" state
- Use generic conversational patterns
- Log error for debugging

### 3. Context Analysis Failures

**Scenario:** Cannot extract key points from transcript

**Handling:**
- Proceed without context references
- Focus on current turn only
- Maintain conversation flow

### 4. Pattern Library Access Errors

**Scenario:** Cannot load conversational patterns

**Handling:**
- Use minimal fallback patterns embedded in code
- Log critical error
- Ensure basic functionality continues

### 5. OpenAI API Errors

**Scenario:** API timeout or rate limit

**Handling:**
- Retry with exponential backoff (max 3 attempts)
- If all retries fail, return graceful error message
- Log error with context for debugging

## Testing Strategy

### Unit Testing

**Framework:** Jest (already configured in Firebase Functions)

**Test Coverage:**

1. **Personality Engine Tests**
   - Test personality pattern derivation for each personality type
   - Verify language instruction generation
   - Test sample phrase retrieval

2. **Emotional State Tracker Tests**
   - Test state transitions based on conversation patterns
   - Verify concern tracking logic
   - Test state instruction generation

3. **Conversational Pattern Library Tests**
   - Test random pattern selection
   - Verify pattern categories are complete
   - Test pattern variation

4. **Context Analyzer Tests**
   - Test key point extraction
   - Verify contradiction detection
   - Test referenceable point identification

5. **Enhanced Prompt Builder Tests**
   - Test prompt generation with various inputs
   - Verify all components are integrated
   - Test fallback behavior

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Configuration:** Each property test should run a minimum of 100 iterations

**Test Implementation:**

Each property-based test MUST be tagged with a comment explicitly referencing the correctness property in this design document using this exact format: `**Feature: human-like-ai-responses, Property {number}: {property_text}**`

Each correctness property MUST be implemented by a SINGLE property-based test.

1. **Property 1 Test: Conversational filler presence**
   - Generate random multi-sentence responses
   - Verify presence of conversational elements
   - Tag: `**Feature: human-like-ai-responses, Property 1: Conversational filler presence**`

2. **Property 2 Test: Sentence structure variation**
   - Generate random conversations with 3+ responses
   - Measure sentence structure patterns
   - Verify no consecutive identical patterns
   - Tag: `**Feature: human-like-ai-responses, Property 2: Sentence structure variation**`

3. **Property 3 Test: Contraction usage rate**
   - Generate random sets of 10 responses
   - Count contractions vs full forms
   - Verify 60% threshold
   - Tag: `**Feature: human-like-ai-responses, Property 3: Contraction usage rate**`

4. **Property 4 Test: Phrase repetition limit**
   - Generate random conversations
   - Extract multi-word phrases
   - Verify 30% repetition limit
   - Tag: `**Feature: human-like-ai-responses, Property 4: Phrase repetition limit**`

5. **Property 5 Test: Emotional state consistency**
   - Generate conversations with concern addressing
   - Track emotional state transitions
   - Verify positive trajectory
   - Tag: `**Feature: human-like-ai-responses, Property 5: Emotional state consistency**`

6. **Property 6 Test: Concern acknowledgment**
   - Generate conversations addressing concerns
   - Verify acknowledgment language presence
   - Tag: `**Feature: human-like-ai-responses, Property 6: Concern acknowledgment**`

7. **Property 7 Test: Personality-specific language patterns**
   - Generate responses for different personalities
   - Measure language pattern differences
   - Verify measurable distinctions
   - Tag: `**Feature: human-like-ai-responses, Property 7: Personality-specific language patterns**`

8. **Property 8 Test: Context reference accuracy**
   - Generate conversations with references
   - Verify reference accuracy
   - Tag: `**Feature: human-like-ai-responses, Property 8: Context reference accuracy**`

9. **Property 9 Test: Contradiction detection**
   - Generate conversations with contradictions
   - Verify detection within 2 responses
   - Tag: `**Feature: human-like-ai-responses, Property 9: Contradiction detection**`

10. **Property 10 Test: Response variation across sessions**
    - Generate multiple conversations with same scenario
    - Measure word overlap
    - Verify <40% overlap threshold
    - Tag: `**Feature: human-like-ai-responses, Property 10: Response variation across sessions**`

11. **Property 11 Test: Informal language prevalence**
    - Generate random responses
    - Calculate formality score
    - Verify <0.3 threshold
    - Tag: `**Feature: human-like-ai-responses, Property 11: Informal language prevalence**`

12. **Property 12 Test: Thinking marker appropriateness**
    - Generate responses to complex proposals
    - Count thinking marker presence
    - Verify 40% threshold
    - Tag: `**Feature: human-like-ai-responses, Property 12: Thinking marker appropriateness**`

13. **Property 13 Test: Response length unpredictability**
    - Generate conversations with 5+ responses
    - Calculate length standard deviation
    - Verify ≥0.8 threshold
    - Tag: `**Feature: human-like-ai-responses, Property 13: Response length unpredictability**`

### Integration Testing

1. **End-to-End Conversation Tests**
   - Test complete conversation flows with enhanced prompts
   - Verify natural language quality subjectively
   - Compare with baseline responses

2. **OpenAI API Integration Tests**
   - Test with actual OpenAI API calls
   - Verify response quality with enhanced parameters
   - Measure response time impact

3. **Scenario Coverage Tests**
   - Test all existing scenarios with enhanced system
   - Verify personality differences are apparent
   - Ensure no regressions in response quality

### Manual Testing & Evaluation

1. **Human Evaluation**
   - Conduct blind A/B testing with users
   - Compare enhanced vs original responses
   - Collect qualitative feedback on naturalness

2. **Personality Distinctiveness**
   - Generate responses from different personalities
   - Verify humans can distinguish personalities
   - Adjust patterns based on feedback

3. **Emotional Arc Testing**
   - Test conversations with different emotional trajectories
   - Verify state transitions feel natural
   - Adjust state transition logic as needed

## Implementation Notes

### OpenAI Parameter Optimization

Current parameters:
```javascript
{
  model: "gpt-4o-mini",
  temperature: 0.9,
  max_tokens: 250
}
```

Enhanced parameters:
```javascript
{
  model: "gpt-4o-mini",
  temperature: 1.0,  // Increased for more variation
  max_tokens: 300,   // Slightly increased for natural flow
  presence_penalty: 0.3,  // Discourage repetition
  frequency_penalty: 0.3  // Encourage varied vocabulary
}
```

### Prompt Engineering Techniques

1. **Few-Shot Examples:** Include 2-3 example responses in system prompt demonstrating desired style
2. **Negative Instructions:** Explicitly tell model what NOT to do (e.g., "Don't list all concerns at once")
3. **Persona Reinforcement:** Repeat personality traits in multiple ways throughout prompt
4. **Contextual Priming:** Begin prompt with "You are having a natural conversation..." to set tone
5. **Response Format Guidance:** Specify desired response length and structure ranges

### Performance Considerations

- **Prompt Length:** Enhanced prompts will be longer (~500-800 tokens vs current ~300)
- **API Cost Impact:** Minimal increase (~15-20% due to longer prompts)
- **Response Time:** No significant impact expected (same model, similar token generation)
- **Caching:** Consider caching personality patterns to reduce computation

### Backward Compatibility

- All changes are in Firebase Functions, no client-side changes required
- Existing scenarios will work with enhanced system
- Gradual rollout possible via feature flag
- Can A/B test enhanced vs original system

## Future Enhancements

1. **Multi-Stakeholder Conversations:** Handle scenarios with multiple stakeholders with distinct voices
2. **Cultural Communication Styles:** Add cultural context to personality patterns
3. **Adaptive Difficulty:** Adjust stakeholder challenge level based on user performance
4. **Voice Tone Indicators:** Add metadata for future voice synthesis
5. **Learning from Feedback:** Incorporate user ratings to refine patterns over time
