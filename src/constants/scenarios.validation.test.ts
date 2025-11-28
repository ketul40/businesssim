/**
 * Validation test for enhanced stakeholder profiles
 * Ensures backward compatibility and proper typing
 */

import { describe, it, expect } from 'vitest';
import { SCENARIO_TEMPLATES } from './scenarios';
import { Stakeholder } from '../types/models';

describe('Enhanced Stakeholder Profiles', () => {
  it('should have all scenarios with valid stakeholder definitions', () => {
    SCENARIO_TEMPLATES.forEach(scenario => {
      expect(scenario.stakeholders).toBeDefined();
      expect(Array.isArray(scenario.stakeholders)).toBe(true);
      expect(scenario.stakeholders.length).toBeGreaterThan(0);
    });
  });

  it('should maintain backward compatibility with required fields', () => {
    SCENARIO_TEMPLATES.forEach(scenario => {
      scenario.stakeholders.forEach((stakeholder: Stakeholder) => {
        // Required fields
        expect(stakeholder.role).toBeDefined();
        expect(stakeholder.name).toBeDefined();
        expect(stakeholder.relationshipType).toBeDefined();
        expect(stakeholder.personality).toBeDefined();
        expect(stakeholder.concerns).toBeDefined();
        expect(stakeholder.motivations).toBeDefined();
        
        expect(typeof stakeholder.role).toBe('string');
        expect(typeof stakeholder.name).toBe('string');
        expect(typeof stakeholder.personality).toBe('string');
        expect(Array.isArray(stakeholder.concerns)).toBe(true);
        expect(Array.isArray(stakeholder.motivations)).toBe(true);
      });
    });
  });

  it('should have optional communicationStyle fields with correct types', () => {
    SCENARIO_TEMPLATES.forEach(scenario => {
      scenario.stakeholders.forEach((stakeholder: Stakeholder) => {
        if (stakeholder.communicationStyle) {
          expect(stakeholder.communicationStyle.directness).toMatch(/^(direct|indirect|balanced)$/);
          expect(stakeholder.communicationStyle.formality).toMatch(/^(formal|casual|professional)$/);
          expect(stakeholder.communicationStyle.emotionalExpressiveness).toMatch(/^(high|medium|low)$/);
          expect(stakeholder.communicationStyle.questioningStyle).toMatch(/^(probing|supportive|challenging)$/);
        }
      });
    });
  });

  it('should have optional speechPatterns fields with correct types', () => {
    SCENARIO_TEMPLATES.forEach(scenario => {
      scenario.stakeholders.forEach((stakeholder: Stakeholder) => {
        if (stakeholder.speechPatterns) {
          expect(stakeholder.speechPatterns.averageSentenceLength).toMatch(/^(short|medium|long)$/);
          expect(typeof stakeholder.speechPatterns.usesIdioms).toBe('boolean');
          expect(typeof stakeholder.speechPatterns.usesHumor).toBe('boolean');
          expect(stakeholder.speechPatterns.thinkingPauses).toMatch(/^(frequent|occasional|rare)$/);
        }
      });
    });
  });

  it('should have enhanced profiles for all stakeholders', () => {
    let totalStakeholders = 0;
    let enhancedStakeholders = 0;

    SCENARIO_TEMPLATES.forEach(scenario => {
      scenario.stakeholders.forEach((stakeholder: Stakeholder) => {
        totalStakeholders++;
        if (stakeholder.communicationStyle && stakeholder.speechPatterns) {
          enhancedStakeholders++;
        }
      });
    });

    expect(totalStakeholders).toBeGreaterThan(0);
    expect(enhancedStakeholders).toBe(totalStakeholders);
  });

  it('should have personality-appropriate communication styles', () => {
    // Test a few specific scenarios to ensure the mappings make sense
    const teamMemberFeedback = SCENARIO_TEMPLATES.find(s => s.id === 'team_member_feedback');
    expect(teamMemberFeedback).toBeDefined();
    
    const sarah = teamMemberFeedback!.stakeholders[0];
    expect(sarah.name).toBe('Sarah Kim');
    expect(sarah.communicationStyle?.directness).toBe('indirect'); // Eager to please
    expect(sarah.communicationStyle?.emotionalExpressiveness).toBe('medium');

    const directorApproval = SCENARIO_TEMPLATES.find(s => s.id === 'director_project_approval');
    expect(directorApproval).toBeDefined();
    
    const alex = directorApproval!.stakeholders[0];
    expect(alex.name).toBe('Alex Chen');
    expect(alex.communicationStyle?.directness).toBe('direct'); // Data-driven, risk-averse
    expect(alex.communicationStyle?.emotionalExpressiveness).toBe('low');
  });
});
