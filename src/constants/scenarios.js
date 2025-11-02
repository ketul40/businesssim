// Pre-built scenario templates

export const SCENARIO_TEMPLATES = [
  {
    id: 'team_member_feedback',
    title: 'Provide Constructive Feedback to Team Member',
    category: 'Communication',
    difficulty: 'Easy',
    rubricId: 'persuasion_director',
    description: 'Have a constructive 1-on-1 conversation about missed deadlines with a junior team member.',
    situation: 'Sarah, a junior analyst on your team, has missed the last two weekly report deadlines. She\'s talented but seems overwhelmed. You want to address this while maintaining her confidence and motivation.',
    objective: 'Understand the root cause of the delays and agree on a plan to get back on track.',
    turnLimit: 8,
    stakeholders: [
      {
        role: 'Junior Business Analyst',
        name: 'Sarah Kim',
        relationshipType: 'direct_report',
        personality: 'Eager to please, hardworking, sometimes takes on too much',
        concerns: ['Not wanting to disappoint', 'Managing workload', 'Learning new tools'],
        motivations: ['Career growth', 'Team contribution', 'Skill development']
      }
    ],
    constraints: [
      'Cannot extend deadlines for weekly reports',
      'Team depends on her analysis for planning',
      'Want to maintain psychological safety',
      'No budget for additional tools or training right now'
    ]
  },
  {
    id: 'manager_status_update',
    title: 'Weekly Status Update with Manager',
    category: 'Reporting',
    difficulty: 'Easy',
    rubricId: 'persuasion_director',
    description: 'Provide a clear status update to your manager on an ongoing project.',
    situation: 'You\'re leading a customer onboarding improvement project. Progress is on track, but you\'ve identified a potential delay in the design phase due to stakeholder feedback. Your manager wants a quick status check.',
    objective: 'Communicate progress clearly, flag the potential delay, and propose next steps.',
    turnLimit: 6,
    stakeholders: [
      {
        role: 'Senior Manager',
        name: 'Chris Martinez',
        relationshipType: 'stakeholder',
        personality: 'Supportive, outcome-focused, appreciates proactive communication',
        concerns: ['Project timeline', 'Stakeholder alignment', 'Customer impact'],
        motivations: ['Smooth execution', 'Team development', 'Customer satisfaction']
      }
    ],
    constraints: [
      'Original deadline is in 3 weeks',
      'Customer demo scheduled for end of month',
      'Design team has multiple projects',
      'This is a 15-minute standup conversation'
    ]
  },
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
        relationshipType: 'stakeholder',
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
        relationshipType: 'stakeholder',
        personality: 'Results-oriented, impatient with excuses, values accountability',
        concerns: ['Missing revenue targets', 'Resource allocation', 'Market trends'],
        motivations: ['Predictable execution', 'Clear action plans', 'No surprises']
      },
      {
        role: 'CFO',
        name: 'Sam Patel',
        relationshipType: 'stakeholder',
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
    id: 'delegate_stretch_assignment',
    title: 'Delegate a Stretch Assignment to Direct Report',
    category: 'Leadership',
    difficulty: 'Easy',
    rubricId: 'persuasion_director',
    description: 'Assign a challenging project to a team member to help them grow professionally.',
    situation: 'You need to delegate leading the Q1 planning process to Marcus, a mid-level team member. This is a visible project that will stretch his skills but could be a great development opportunity.',
    objective: 'Delegate the project effectively while building confidence and providing appropriate support.',
    turnLimit: 8,
    stakeholders: [
      {
        role: 'Senior Analyst',
        name: 'Marcus Thompson',
        relationshipType: 'direct_report',
        personality: 'Capable and analytical, but sometimes hesitant to step into leadership roles',
        concerns: ['Taking on too much responsibility', 'Making mistakes in front of leadership', 'Having enough support'],
        motivations: ['Career advancement', 'Learning new skills', 'Proving himself']
      }
    ],
    constraints: [
      'Project needs to start in 2 weeks',
      'You\'ll be available for guidance but not day-to-day oversight',
      'Stakeholders include director-level participants',
      'This is a 6-week commitment'
    ]
  },
  {
    id: 'recognize_high_performer',
    title: 'Recognition Conversation with High Performer',
    category: 'Leadership',
    difficulty: 'Easy',
    rubricId: 'persuasion_director',
    description: 'Have a meaningful conversation recognizing exceptional performance and discussing career growth.',
    situation: 'Priya has consistently exceeded expectations this quarter, delivering the analytics dashboard ahead of schedule and mentoring junior team members. You want to recognize her contributions and discuss her career aspirations.',
    objective: 'Provide genuine recognition and understand her career goals to retain top talent.',
    turnLimit: 7,
    stakeholders: [
      {
        role: 'Senior Data Analyst',
        name: 'Priya Sharma',
        relationshipType: 'direct_report',
        personality: 'High-achiever, self-motivated, values meaningful work and growth opportunities',
        concerns: ['Career progression', 'Continued learning', 'Making real impact'],
        motivations: ['Professional growth', 'Technical challenges', 'Leadership opportunities']
      }
    ],
    constraints: [
      'No immediate promotion slots available',
      'Budget for raises locked until next quarter',
      'Want to prevent her from looking elsewhere',
      'Need to be authentic and specific in recognition'
    ]
  },
  {
    id: 'team_conflict_resolution',
    title: 'Mediate Conflict Between Team Members',
    category: 'Conflict Resolution',
    difficulty: 'Medium',
    rubricId: 'persuasion_director',
    description: 'Address tension between two team members that\'s affecting team dynamics.',
    situation: 'Two team members, Jamie and Taylor, have been clashing over project approaches. Jamie feels Taylor dismisses their ideas, while Taylor thinks Jamie is too slow to make decisions. The tension is affecting the whole team.',
    objective: 'Facilitate a constructive conversation to resolve the conflict and establish better collaboration.',
    turnLimit: 12,
    stakeholders: [
      {
        role: 'Product Designer',
        name: 'Jamie Lee',
        relationshipType: 'direct_report',
        personality: 'Creative and detail-oriented, values being heard and collaborative process',
        concerns: ['Ideas being dismissed', 'Feeling disrespected', 'Quality of final work'],
        motivations: ['Creating great user experiences', 'Team harmony', 'Professional respect']
      },
      {
        role: 'Product Manager',
        name: 'Taylor Morgan',
        relationshipType: 'direct_report',
        personality: 'Results-driven and decisive, values speed and efficiency',
        concerns: ['Meeting deadlines', 'Endless debate cycles', 'Team velocity'],
        motivations: ['Shipping features', 'User impact', 'Team productivity']
      }
    ],
    constraints: [
      'Both are valuable team members',
      'Major release in 3 weeks requires their collaboration',
      'Cannot reassign them to different projects',
      'Need to preserve both working relationships'
    ]
  },
  {
    id: 'peer_constructive_feedback',
    title: 'Give Peer Feedback on Collaboration Style',
    category: 'Peer Feedback',
    difficulty: 'Medium',
    rubricId: 'persuasion_director',
    description: 'Provide constructive feedback to a peer about communication patterns affecting cross-team work.',
    situation: 'Your peer Devon, a fellow manager from the Marketing team, often misses cross-functional meetings and responds to requests late. This is creating friction with your team who depends on Marketing inputs for launches.',
    objective: 'Address the issue constructively while maintaining a positive peer relationship.',
    turnLimit: 9,
    stakeholders: [
      {
        role: 'Marketing Manager',
        name: 'Devon Park',
        relationshipType: 'peer',
        personality: 'Creative and big-picture focused, sometimes scattered with details',
        concerns: ['Being overcommitted', 'Maintaining good reputation', 'Team priorities'],
        motivations: ['Campaign success', 'Cross-functional relationships', 'Creative excellence']
      }
    ],
    constraints: [
      'You have no authority over Devon',
      'Marketing team is genuinely stretched thin',
      'Your teams need to collaborate on upcoming launch',
      'Want to keep relationship collaborative, not adversarial'
    ]
  },
  {
    id: 'peer_project_kickoff',
    title: 'Peer Collaboration: Joint Project Kickoff',
    category: 'Collaboration',
    difficulty: 'Easy',
    rubricId: 'persuasion_director',
    description: 'Align with a peer manager on roles, responsibilities, and approach for a joint initiative.',
    situation: 'You and Riley, a peer manager from Customer Success, are co-leading a customer feedback improvement initiative. You need to align on project scope, ownership areas, and how you\'ll work together.',
    objective: 'Establish clear roles, shared goals, and a strong working relationship for the project.',
    turnLimit: 8,
    stakeholders: [
      {
        role: 'Customer Success Manager',
        name: 'Riley Johnson',
        relationshipType: 'peer',
        personality: 'Collaborative and customer-focused, values clear communication and shared ownership',
        concerns: ['Duplication of effort', 'Clear accountability', 'Customer impact'],
        motivations: ['Customer satisfaction', 'Efficient collaboration', 'Project success']
      }
    ],
    constraints: [
      'Project timeline is 8 weeks',
      'Both teams have other commitments',
      'Executive visibility on this initiative',
      'Need to establish communication cadence'
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
        relationshipType: 'peer',
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

