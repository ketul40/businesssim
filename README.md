# SkillLoops 🎯

**AI-Powered Workplace Scenario Practice Platform**

Practice high-stakes workplace conversations with intelligent AI stakeholders, receive rubric-based feedback, and develop critical business communication skills.

---

## 🌟 Overview

SkillLoops lets you rehearse tough workplace situations through guided role-play with AI, then receive transparent, rubric-based feedback and targeted practice drills. Perfect for:

- Preparing for high-stakes meetings
- Convincing directors on project directions
- Running monthly business reviews
- Negotiating cross-functional resources
- Developing persuasion and communication skills

## 🚀 Key Features

### 📝 Scenario Library
- **Pre-built Templates**: Director persuasion, business reviews, peer negotiations
- **Custom Scenarios**: Create your own workplace situations
- **Realistic Contexts**: Stakeholders with motivations, concerns, and personality traits

### 💬 Interactive Role-Play
- **AI Stakeholders**: Realistic responses based on personality and context
- **Coaching Hints**: Real-time guidance with "Time-out" button
- **Turn Limits**: Encourages concise, strategic communication
- **Context Upload**: Add slides, KPIs, or documents for AI reference

### 📊 Rubric-Based Evaluation
- **Transparent Scoring**: Clear criteria with 1-5 scale anchors
- **Weighted Metrics**: Evidence & ROI (25%), Risk Management (20%), etc.
- **Moments That Mattered**: Highlight pivotal conversation points
- **Missed Opportunities**: Specific areas for improvement

### 🎓 Practice Drills
- **Targeted Exercises**: Address specific weaknesses
- **Time-Bound**: 10-15 minute focused practice sessions
- **Skill Building**: ROI rehearsal, risk mitigation, concise asks

### 📈 Progress Tracking
- **Performance History**: Track scores over time
- **Skill Radar**: Visualize development across criteria
- **Session Archive**: Review past simulations and feedback

---

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **AI**: OpenAI API (via Firebase Functions)
- **Testing**: Vitest + React Testing Library + fast-check (Property-Based Testing)
- **Styling**: Custom CSS with modern gradients and animations
- **Icons**: Lucide React

---

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account (for backend services)
- TypeScript 5.0+ (included in dependencies)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/ketul40/businesssim.git
   cd skillloop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Enable Cloud Storage
   - Enable Cloud Functions

4. **Set up environment variables**
   
   Copy `env.example.txt` to `.env.local` and fill in your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

---

## 🧪 Testing

### Running Tests

The project includes comprehensive unit tests, integration tests, and property-based tests:

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test complete user flows
- **Property-Based Tests**: Verify correctness properties across many inputs

See [TESTING.md](./docs/TESTING.md) for detailed testing documentation.

### TypeScript Type Checking

```bash
# Check types without emitting files
npm run type-check
```

---

## 🏗️ Project Structure

```
SkillLoops/
├── src/
│   ├── components/          # React components (TypeScript)
│   │   ├── AuthScreen.tsx   # Authentication UI
│   │   ├── ScenarioSelect.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Feedback.tsx
│   │   ├── ProgressDashboard.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── *.test.tsx       # Component tests
│   │
│   ├── constants/           # App constants
│   │   ├── scenarios.ts     # Scenario templates
│   │   ├── rubrics.js       # Evaluation rubrics
│   │   └── states.ts        # State machine
│   │
│   ├── firebase/            # Firebase integration (TypeScript)
│   │   ├── config.ts        # Firebase initialization
│   │   ├── auth.js          # Authentication methods
│   │   ├── firestore.ts     # Database operations
│   │   └── storage.js       # File upload/download
│   │
│   ├── hooks/               # Custom React hooks (TypeScript)
│   │   ├── useAuth.js       # Auth state management
│   │   ├── useSimulation.ts # Simulation logic
│   │   ├── useFirestore.ts  # Firestore operations
│   │   ├── useDebounce.ts   # Value debouncing
│   │   ├── useLocalStorage.ts # localStorage sync
│   │   └── useOnlineStatus.ts # Network status
│   │
│   ├── utils/               # Utility functions (TypeScript)
│   │   ├── aiService.js     # AI simulation & evaluation
│   │   ├── errorHandling.ts # Error utilities
│   │   ├── errorLogging.ts  # Error logging
│   │   ├── analytics.ts     # Analytics tracking
│   │   └── performanceMonitoring.ts # Performance tracking
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── models.ts        # Data models
│   │   ├── props.ts         # Component props
│   │   └── api.ts           # API types
│   │
│   ├── test/                # Test utilities
│   │   ├── setup.ts         # Test configuration
│   │   ├── utils.tsx        # Test helpers
│   │   └── integration/     # Integration tests
│   │
│   ├── App.tsx              # Main app component
│   ├── App.css              # Styles
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
│
├── docs/                    # Documentation
│   ├── TESTING.md           # Testing guide
│   ├── HOOKS.md             # Custom hooks documentation
│   └── ARCHITECTURE.md      # Architecture decisions
│
├── index.html
├── package.json
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── vitest.config.ts         # Vitest configuration
└── README.md
```

---

## 🎮 How to Use

### 1. **Sign In / Sign Up**
- Create an account or sign in with Google
- Your progress is automatically saved

### 2. **Choose a Scenario**
- Browse pre-built templates
- Or create your own custom scenario
- Review stakeholder details and constraints

### 3. **Run the Simulation**
- Chat with AI stakeholders in real-time
- Use "Time-out" button for coaching hints
- Upload context files (slides, KPIs) as needed
- Track turn count to stay concise

### 4. **Get Feedback**
- Exit when ready to receive evaluation
- Review rubric-based scores (0-100)
- Read "Moments That Mattered" analysis
- Identify missed opportunities

### 5. **Practice & Improve**
- Complete targeted drill exercises
- Reflect on provided prompts
- Re-run scenarios with harder difficulty
- Track progress over time

---

## 🔐 Firebase Setup (Detailed)

### Firestore Collections

The app uses the following Firestore structure:

```
users/
  {userId}/
    - email, displayName, roleLevel, totalSessions, averageScore

scenarios/
  {scenarioId}/
    - title, category, difficulty, rubricId, situation, objective, etc.

sessions/
  {sessionId}/
    - userId, scenario, transcript, turnCount, startedAt, completedAt

evaluations/
  {evaluationId}/
    - sessionId, rubricId, overall_score, criterion_scores, drills, etc.

assets/
  {assetId}/
    - sessionId, type, url, createdAt

analytics_daily/
  {analyticsId}/
    - userId, date, sessions, avg_score, time_in_sim
```

### Firebase Functions

For full AI functionality, deploy Firebase Functions:

```javascript
// functions/index.js (example)
const functions = require('firebase-functions');
const OpenAI = require('openai');

exports.simulateStakeholder = functions.https.onCall(async (data, context) => {
  // Call OpenAI API with scenario context
  // Return stakeholder response
});

exports.evaluateSession = functions.https.onCall(async (data, context) => {
  // Call OpenAI API with transcript and rubric
  // Return evaluation with scores and feedback
});

exports.getCoachingHint = functions.https.onCall(async (data, context) => {
  // Generate coaching hint based on current state
});
```

Deploy with:
```bash
firebase deploy --only functions
```

---

## 📋 Available Rubrics

### A) Persuasion to a Director
- **Framing & Stakeholder Alignment** (20%)
- **Evidence & ROI** (25%)
- **Risk & Mitigation** (20%)
- **Objection Handling** (15%)
- **Ask & Next Steps** (20%)

### B) Monthly Business Review
- **Signal vs Noise** (20%)
- **Causality & Diagnosis** (25%)
- **Decision & Trade-offs** (20%)
- **Accountability & Plan** (20%)
- **Executive Read** (15%)

---

## 🎨 Customization

### Adding New Scenarios

Edit `src/constants/scenarios.js`:

```javascript
export const SCENARIO_TEMPLATES = [
  {
    id: 'your_scenario_id',
    title: 'Your Scenario Title',
    category: 'Negotiation',
    difficulty: 'Medium',
    rubricId: 'persuasion_director',
    description: 'Brief description',
    situation: 'Detailed context...',
    objective: 'Your goal...',
    turnLimit: 12,
    stakeholders: [/* ... */],
    constraints: [/* ... */]
  }
];
```

### Creating New Rubrics

Edit `src/constants/rubrics.js`:

```javascript
export const RUBRICS = {
  YOUR_RUBRIC: {
    id: 'your_rubric',
    name: 'Your Rubric Name',
    criteria: [
      {
        name: 'Criterion Name',
        weight: 0.25,
        description: 'What this measures...',
        anchors: {
          1: 'Low performance',
          3: 'Medium performance',
          5: 'High performance'
        }
      }
    ]
  }
};
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase init hosting
firebase deploy --only hosting
```

### Deploy Full Stack

```bash
firebase deploy
```

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Quick Reference](./docs/QUICK_REFERENCE.md)** - Common commands and patterns at a glance
- **[Testing Guide](./docs/TESTING.md)** - How to run and write tests
- **[Custom Hooks](./docs/HOOKS.md)** - Documentation for all custom React hooks
- **[Architecture Decisions](./docs/ARCHITECTURE.md)** - ADRs and design decisions
- **[TypeScript Setup](./docs/TYPESCRIPT_SETUP.md)** - TypeScript configuration and patterns

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **OpenAI** for powerful language models
- **Firebase** for backend infrastructure
- **Lucide** for beautiful icons
- **React** and **Vite** communities

---

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Contact: [your-email@example.com]

---

## 🗺️ Roadmap

- [ ] Advanced analytics and skill radar visualization
- [ ] Voice-based simulation mode
- [ ] Multi-stakeholder scenarios with switching
- [ ] Team collaboration features
- [ ] Integration with calendar for scheduled practice
- [ ] Mobile app (React Native)
- [ ] Retrieval-augmented generation for context files
- [ ] Custom LLM fine-tuning for specific industries

---

**Built with ❤️ by SkillLoops - Master workplace conversations**
