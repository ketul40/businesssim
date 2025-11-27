import { ScenarioTemplate, Message, Evaluation } from './models';

// App Component Props
export interface AppProps {}

// ChatInterface Component Props
export interface ChatInterfaceProps {
  scenario: ScenarioTemplate;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onTimeout: () => void;
  onExit: () => void;
  onGetSuggestions: () => void;
  turnCount: number;
  isLoading: boolean;
  suggestions: string[];
  isSuggestionsLoading: boolean;
}

// ScenarioSelect Component Props
export interface ScenarioSelectProps {
  onSelectScenario: (scenario: ScenarioTemplate) => void;
  isGuest: boolean;
  onAuthRequired: (reason: string) => void;
}

// Feedback Component Props
export interface FeedbackProps {
  evaluation: Evaluation | null;
  scenario: ScenarioTemplate;
  onBackHome: () => void;
  onRerunScenario: () => void;
  isGuest: boolean;
  onAuthRequired?: (reason: string) => void;
}

// Sidebar Component Props
export interface SidebarProps {
  scenario: ScenarioTemplate;
  activeTab: string;
  onTabChange: (tab: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onFileUpload?: (file: File) => void;
}

// AuthScreen Component Props
export interface AuthScreenProps {
  onClose?: () => void;
}

// ProgressDashboard Component Props
export interface ProgressDashboardProps {
  userId: string | undefined;
  onStartNewScenario: () => void;
}

// ThemeToggle Component Props
export interface ThemeToggleProps {}

// Session with Evaluation (for ProgressDashboard)
export interface SessionWithEvaluation {
  id: string;
  scenario?: ScenarioTemplate;
  startedAt?: {
    toDate: () => Date;
  };
  evaluation?: Evaluation;
}
