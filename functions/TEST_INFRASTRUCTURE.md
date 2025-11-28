# Testing Infrastructure for Human-Like AI Responses

This document describes the testing infrastructure set up for property-based testing of human-like AI responses.

## Overview

The testing infrastructure consists of:
1. **fast-check** - Property-based testing library
2. **Jest** - Test runner and assertion library
3. **Test Utilities** - Functions for analyzing response characteristics
4. **Test Fixtures** - Sample data for testing

## Installation

Dependencies are already added to `package.json`. To install:

```bash
cd functions
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test testUtils.test.js
```

## Test Utilities (`testUtils.js`)

Provides functions for analyzing AI response characteristics:

### Sentence Structure Analysis
```javascript
const { analyzeSentenceStructure } = require('./testUtils');

const result = analyzeSentenceStructure("This is a sentence. This is another.");
// Returns: { sentenceCount, averageLength, lengths, pattern, sentences }
```

### Formality Score
```javascript
const { calculateFormalityScore } = require('./testUtils');

const score = calculateFormalityScore("I would like to inquire...");
// Returns: 0-1 (higher = more formal)
```

### Conversational Fillers
```javascript
const { detectConversationalFillers } = require('./testUtils');

const result = detectConversationalFillers("Hmm, you know, that's interesting.");
// Returns: { hasFillers, fillers, count, types }
```

### Contraction Analysis
```javascript
const { analyzeContractions } = require('./testUtils');

const result = analyzeContractions("I'm not sure we're ready.");
// Returns: { contractionCount, fullFormCount, totalApplicable, contractionRate }
```

### Repeated Phrases
```javascript
const { findRepeatedPhrases } = require('./testUtils');

const result = findRepeatedPhrases(text, 3); // min 3 words
// Returns: { repeatedPhrases, maxRepetitions }
```

### Thinking Markers
```javascript
const { detectThinkingMarkers } = require('./testUtils');

const result = detectThinkingMarkers("Hmm, let me think...");
// Returns: { hasThinkingMarkers, markers, count }
```

### Response Length Variation
```javascript
const { analyzeResponseLengthVariation } = require('./testUtils');

const result = analyzeResponseLengthVariation([response1, response2, ...]);
// Returns: { mean, stdDev, min, max, lengths }
```

### Word Overlap
```javascript
const { calculateWordOverlap } = require('./testUtils');

const overlap = calculateWordOverlap(text1, text2);
// Returns: 0-1 (overlap percentage, excluding common words)
```

## Test Fixtures (`testFixtures.js`)

Provides sample data for testing:

### Sample Stakeholders
```javascript
const { sampleStakeholders } = require('./testFixtures');

// Available personalities:
// - direct (Alex Chen, VP of Engineering)
// - collaborative (Sarah Martinez, Product Manager)
// - analytical (Dr. James Wilson, Data Science Lead)
// - creative (Maya Patel, Design Director)
// - skeptical (Robert Kim, CFO)
// - supportive (Linda Thompson, HR Director)

const stakeholder = sampleStakeholders.direct;
```

### Sample Scenarios
```javascript
const { sampleScenarios } = require('./testFixtures');

// Available scenarios:
// - budgetRequest
// - teamExpansion
// - productPitch
// - designReview

const scenario = sampleScenarios.budgetRequest;
```

### Sample Transcripts
```javascript
const { sampleTranscripts } = require('./testFixtures');

// Available transcripts:
// - natural (conversational, informal)
// - formal (professional, structured)
// - withConcernAddressing (shows concern acknowledgment)
// - withContradiction (user contradicts themselves)
// - emotionalProgression (shows emotional state changes)

const transcript = sampleTranscripts.natural;
```

### Sample Responses
```javascript
const { sampleResponses } = require('./testFixtures');

// Available response sets:
// - withFillers (contains conversational fillers)
// - withoutFillers (formal, no fillers)
// - withContractions (uses contractions)
// - withoutContractions (full forms only)
// - varyingLengths (different response lengths)
// - repetitive (repeated phrases)

const responses = sampleResponses.withFillers;
```

### Arbitrary Generators (for fast-check)
```javascript
const fc = require('fast-check');
const { arbitraryStakeholder, arbitraryTranscript, arbitraryResponse } = require('./testFixtures');

// Generate random stakeholder
fc.assert(
  fc.property(arbitraryStakeholder(fc), (stakeholder) => {
    // Test with random stakeholder
  })
);

// Generate random transcript
fc.assert(
  fc.property(arbitraryTranscript(fc), (transcript) => {
    // Test with random transcript
  })
);

// Generate random response
fc.assert(
  fc.property(arbitraryResponse(fc), (response) => {
    // Test with random response
  })
);
```

## Writing Property-Based Tests

Example property-based test:

```javascript
const fc = require('fast-check');
const { detectConversationalFillers } = require('./testUtils');

describe('Property: Conversational filler presence', () => {
  test('multi-sentence responses should contain fillers', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 20, maxLength: 100 }), { minLength: 2, maxLength: 5 }),
        (sentences) => {
          const response = sentences.join('. ') + '.';
          const result = detectConversationalFillers(response);
          
          // Property: Multi-sentence responses should have fillers
          if (sentences.length > 1) {
            return result.hasFillers;
          }
          return true;
        }
      ),
      { numRuns: 100 } // Run 100 iterations
    );
  });
});
```

## Test Organization

```
functions/
├── testUtils.js              # Analysis functions
├── testUtils.test.js         # Unit tests for utilities
├── testFixtures.js           # Sample data and generators
├── testFixtures.test.js      # Unit tests for fixtures
├── jest.config.js            # Jest configuration
└── [feature].test.js         # Feature-specific tests
```

## Next Steps

1. Implement conversational pattern library
2. Implement personality engine
3. Write property-based tests for each correctness property
4. Integrate with buildSimulationPrompt function

## References

- [fast-check documentation](https://github.com/dubzzz/fast-check)
- [Jest documentation](https://jestjs.io/)
- Design document: `.kiro/specs/human-like-ai-responses/design.md`
- Requirements: `.kiro/specs/human-like-ai-responses/requirements.md`
