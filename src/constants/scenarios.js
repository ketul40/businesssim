// Pre-built scenario templates

export const SCENARIO_TEMPLATES = [
  {
    id: 'director_project_approval',
    title: 'Convince Director on Project Direction',
    category: 'Persuasion',
    difficulty: 'Medium',
    rubricId: 'persuasion_director',
    description: 'Get buy-in from a skeptical director for a new initiative with budget constraints.',
    situation: 'You need approval for a 6-week pilot project that requires $200k investment. The director is concerned about ROI and team bandwidth.',
    objective: 'Secure approval for the pilot with clear success criteria and checkpoints.',
    turnLimit: 12,
    stakeholders: [
      {
        role: 'Director of Product',
        name: 'Alex Chen',
        personality: 'Data-driven, risk-averse, focused on quarterly targets',
        concerns: ['Budget constraints', 'Team capacity', 'Unclear ROI', 'Timeline risk'],
        motivations: ['Hitting Q4 targets', 'Board presentation prep', 'Team morale']
      }
    ],
    constraints: [
      'Budget limited to $200k for this quarter',
      'Team already at 85% capacity',
      'Board review in 8 weeks',
      'Competing priorities from sales team'
    ]
  },
  {
    id: 'monthly_business_review',
    title: 'Monthly Business Review Presentation',
    category: 'Reporting',
    difficulty: 'Hard',
    rubricId: 'monthly_business_review',
    description: 'Present monthly KPIs and strategic recommendations to executive leadership.',
    situation: 'You are presenting your department\'s monthly review. Revenue is down 8% vs target, but user engagement is up 15%.',
    objective: 'Explain performance, diagnose root causes, and get approval for corrective actions.',
    turnLimit: 15,
    stakeholders: [
      {
        role: 'VP of Operations',
        name: 'Jordan Smith',
        personality: 'Results-oriented, impatient with excuses, values accountability',
        concerns: ['Missing revenue targets', 'Resource allocation', 'Market trends'],
        motivations: ['Predictable execution', 'Clear action plans', 'No surprises']
      },
      {
        role: 'CFO',
        name: 'Sam Patel',
        personality: 'Financial rigor, questions assumptions, wants sensitivity analysis',
        concerns: ['Burn rate', 'Unit economics', 'Forecast accuracy'],
        motivations: ['Efficient capital allocation', 'Risk mitigation']
      }
    ],
    constraints: [
      'No additional headcount this quarter',
      'Must maintain 40% gross margin',
      'Cannot push Q4 commitments',
      '15-minute presentation time'
    ]
  },
  {
    id: 'difficult_peer_negotiation',
    title: 'Cross-Functional Resource Negotiation',
    category: 'Negotiation',
    difficulty: 'Medium',
    rubricId: 'persuasion_director',
    description: 'Negotiate engineering resources with a peer who has competing priorities.',
    situation: 'You need 2 engineers from the platform team for 4 weeks. The platform manager has their own roadmap commitments.',
    objective: 'Secure the engineering resources while maintaining the working relationship.',
    turnLimit: 10,
    stakeholders: [
      {
        role: 'Engineering Manager - Platform',
        name: 'Casey Rodriguez',
        personality: 'Protective of team, collaborative but firm on priorities',
        concerns: ['Team burnout', 'Platform stability', 'Own commitments'],
        motivations: ['Technical excellence', 'Team health', 'Strategic impact']
      }
    ],
    constraints: [
      'Platform team already committed to infrastructure upgrade',
      'Your launch date is fixed',
      'Cannot escalate to VP level',
      'Need to maintain peer relationship'
    ]
  }
];

export const CUSTOM_SCENARIO_TEMPLATE = {
  id: 'custom',
  title: '',
  category: 'Custom',
  difficulty: 'Medium',
  rubricId: 'persuasion_director',
  description: '',
  situation: '',
  objective: '',
  turnLimit: 12,
  stakeholders: [],
  constraints: []
};

