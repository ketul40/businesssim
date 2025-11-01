// Rubric definitions for scenario evaluation

export const RUBRICS = {
  PERSUASION_DIRECTOR: {
    id: 'persuasion_director',
    name: 'Persuasion to a Director',
    criteria: [
      {
        name: 'Framing & Stakeholder Alignment',
        weight: 0.20,
        description: 'Opens with shared goal, names director\'s constraints/motives without guessing feelings.',
        anchors: {
          1: 'No alignment',
          3: 'Partial alignment',
          5: 'Explicit alignment + constraints integrated'
        }
      },
      {
        name: 'Evidence & ROI',
        weight: 0.25,
        description: 'Uses relevant metrics, baseline vs. delta, payback or NPV.',
        anchors: {
          1: 'No metrics',
          3: 'Some metrics but not tied to decision',
          5: 'Clear ROI math and sensitivity'
        }
      },
      {
        name: 'Risk & Mitigation',
        weight: 0.20,
        description: 'Identifies top 2–3 risks, offers mitigations with owners/checkpoints.',
        anchors: {
          1: 'Ignores risk',
          3: 'Lists risks without mitigation',
          5: 'Specific mitigations and kill-criteria'
        }
      },
      {
        name: 'Objection Handling',
        weight: 0.15,
        description: 'Surfaces and addresses the director\'s likely objections with brevity.',
        anchors: {
          1: 'Defensive/rambling',
          3: 'Addresses but verbose',
          5: 'Concise, steel-man responses'
        }
      },
      {
        name: 'Ask & Next Steps',
        weight: 0.20,
        description: 'Crisp, time-bound ask with success metrics and review date.',
        anchors: {
          1: 'Vague',
          3: 'Some specificity',
          5: 'Specific pilot plan + decision gate'
        }
      }
    ]
  },
  MONTHLY_BUSINESS_REVIEW: {
    id: 'monthly_business_review',
    name: 'Monthly Business Review',
    criteria: [
      {
        name: 'Signal vs Noise',
        weight: 0.20,
        description: 'Headline first; 3–5 KPIs; benchmarks vs target and vs last period.',
        anchors: {
          1: 'No clear structure',
          3: 'Some KPIs, unclear benchmarks',
          5: 'Clear headline, benchmarked KPIs'
        }
      },
      {
        name: 'Causality & Diagnosis',
        weight: 0.25,
        description: 'Clear drivers/attribution; distinguishes correlation vs. cause.',
        anchors: {
          1: 'No analysis',
          3: 'Surface-level correlation',
          5: 'Deep causal analysis with evidence'
        }
      },
      {
        name: 'Decision & Trade-offs',
        weight: 0.20,
        description: 'Presents 2–3 options with impact, cost, risk.',
        anchors: {
          1: 'No options presented',
          3: 'Options without trade-off analysis',
          5: 'Clear options with impact/cost/risk'
        }
      },
      {
        name: 'Accountability & Plan',
        weight: 0.20,
        description: 'Owners, dates, milestones, counter-metrics.',
        anchors: {
          1: 'No plan',
          3: 'Vague timeline',
          5: 'Specific owners, dates, milestones'
        }
      },
      {
        name: 'Executive Read',
        weight: 0.15,
        description: 'Brevity, structure, anticipates board-level questions.',
        anchors: {
          1: 'Verbose, unstructured',
          3: 'Structured but wordy',
          5: 'Concise, anticipates questions'
        }
      }
    ]
  }
};

export const SCORE_LABELS = {
  0: { min: 0, max: 49, label: 'Needs Work', color: '#ef4444' },
  1: { min: 50, max: 69, label: 'Developing', color: '#f59e0b' },
  2: { min: 70, max: 84, label: 'Proficient', color: '#3b82f6' },
  3: { min: 85, max: 100, label: 'Strong', color: '#10b981' }
};

export function getScoreLabel(score) {
  for (const level of Object.values(SCORE_LABELS)) {
    if (score >= level.min && score <= level.max) {
      return level;
    }
  }
  return SCORE_LABELS[0];
}

