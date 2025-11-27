import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import './App.css';

// Components - Lazy loaded for code splitting
const AuthScreen = lazy(() => import('./components/AuthScreen'));
const ScenarioSelect = lazy(() => import('./components/ScenarioSelect'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const Sidebar = lazy(() => import('./components/Sidebar'));
const Feedback = lazy(() => import('./components/Feedback'));
const ProgressDashboard = lazy(() => import('./components/ProgressDashboard'));
const ThemeToggle = lazy(() => import('./components/ThemeToggle'));

// Direct imports (not lazy loaded)
import { OfflineIndicator } from './components/OfflineIndicator';

// Hooks and utils
import { useAuth } from './hooks/useAuth';
import { useSimulation } from './hooks/useSimulation';
import { signOutUser } from './firebase/auth';
import { createSession } from './firebase/firestore';
import { getSuggestions } from './utils/aiService';

// Constants
import { SIM_STATES, SIDEBAR_TABS, MESSAGE_TYPES } from './constants/states';

// Types
import type { ScenarioTemplate, Evaluation, Message } from './types';

type AppState = typeof SIM_STATES[keyof typeof SIM_STATES];
type SidebarTab = typeof SIDEBAR_TABS[keyof typeof SIDEBAR_TABS];

function App() {
  const { user, userData, loading: authLoading, isAuthenticated, isGuest } = useAuth();
  
  // App state
  const [appState, setAppState] = useState<AppState>(SIM_STATES.SCENARIO_SELECT);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioTemplate | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  
  // Sidebar state
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>(SIDEBAR_TABS.CONTEXT);
  const [notes, setNotes] = useState('');
  
  // Evaluation state
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authReason, setAuthReason] = useState('');

  // Use simulation hook
  const simulation = useSimulation({
    scenario: selectedScenario!,
    sessionId: currentSessionId,
    onEvaluationComplete: useCallback((evaluationResult: Evaluation) => {
      setEvaluation(evaluationResult);
      setAppState(SIM_STATES.EVALUATED);
    }, []),
  });

  // Auto-exit when turn limit is reached
  useEffect(() => {
    if (
      selectedScenario &&
      simulation.turnCount >= selectedScenario.turnLimit &&
      appState === SIM_STATES.IN_SIM
    ) {
      // Automatically trigger evaluation when turn limit is reached
      handleExit();
    }
  }, [simulation.turnCount, selectedScenario, appState]);

  // Handle scenario selection
  const handleSelectScenario = useCallback(async (scenario: ScenarioTemplate) => {
    setSelectedScenario(scenario);
    simulation.clearMessages();
    setNotes('');
    setEvaluation(null);
    setSuggestions([]);
    
    // Create session in Firebase if user is authenticated
    if (user) {
      try {
        const sessionId = await createSession({
          userId: user.uid,
          scenario: scenario,
          turnLimit: scenario.turnLimit,
          settings: {
            difficulty: scenario.difficulty,
          },
        });
        setCurrentSessionId(sessionId);
      } catch (error) {
        console.error('Error creating session:', error);
      }
    }
    
    setAppState(SIM_STATES.IN_SIM);
  }, [user, simulation]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string) => {
    setSuggestions([]); // Clear suggestions after sending
    await simulation.sendMessage(content);
  }, [simulation]);

  // Handle getting suggestions
  const handleGetSuggestions = useCallback(async () => {
    setIsSuggestionsLoading(true);
    try {
      const newSuggestions = await getSuggestions({
        scenario: selectedScenario!,
        transcript: simulation.messages,
      });
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      // Note: Error handling for suggestions could be improved
      // by adding a toast notification or inline error message
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, [selectedScenario, simulation.messages]);

  // Handle timeout (coaching hint)
  const handleTimeout = useCallback(async () => {
    setAppState(SIM_STATES.TIMEOUT);
    setSuggestions([]); // Clear suggestions during timeout
    
    await simulation.requestTimeout();
    setAppState(SIM_STATES.IN_SIM);
  }, [simulation]);

  // Handle exit and evaluate
  const handleExit = useCallback(async () => {
    setAppState(SIM_STATES.EXITED);
    
    try {
      await simulation.exitSimulation();
    } catch (error) {
      console.error('Error evaluating session:', error);
      // Stay in EXITED state even on error
    }
  }, [simulation]);

  // Handle back to home
  const handleBackHome = useCallback(() => {
    setAppState(SIM_STATES.SCENARIO_SELECT);
    setSelectedScenario(null);
    simulation.clearMessages();
    setEvaluation(null);
    setCurrentSessionId(null);
    setSuggestions([]);
  }, [simulation]);

  // Handle rerun scenario
  const handleRerunScenario = useCallback(() => {
    if (selectedScenario) {
      handleSelectScenario(selectedScenario);
    }
  }, [selectedScenario, handleSelectScenario]);

  // Handle view progress
  const handleViewProgress = useCallback(() => {
    setAppState(SIM_STATES.PROGRESS_VIEW);
  }, []);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      await signOutUser();
      handleBackHome();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [handleBackHome]);

  // Function to prompt for authentication
  const promptAuth = useCallback((reason: string) => {
    setAuthReason(reason);
    setShowAuthModal(true);
  }, []);

  // Memoized user display name
  const userDisplayName = useMemo(() => {
    return userData?.displayName || user?.email || 'User';
  }, [userData?.displayName, user?.email]);

  // Auth loading
  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* App Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title" onClick={handleBackHome} style={{ cursor: 'pointer' }}>
            SkillLoops
          </h1>
          {appState !== SIM_STATES.SCENARIO_SELECT && appState !== SIM_STATES.PROGRESS_VIEW && (
            <span className="header-subtitle">{selectedScenario?.title}</span>
          )}
        </div>
        <div className="header-right">
          <Suspense fallback={<div style={{ width: '40px', height: '40px' }} />}>
            <ThemeToggle />
          </Suspense>
          {isAuthenticated ? (
            <>
              <button className="btn btn-ghost btn-small" onClick={handleViewProgress}>
                Progress
              </button>
              <div className="user-menu">
                <UserIcon size={18} />
                <span>{userDisplayName}</span>
              </div>
              <button className="btn btn-ghost btn-small" onClick={handleSignOut}>
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <span className="guest-indicator">Guest Mode</span>
              <button className="btn btn-primary btn-small" onClick={() => setShowAuthModal(true)}>
                Sign In / Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Guest Info Banner */}
      {isGuest && (
        <div className="guest-info-banner-header">
          👋 <strong>Guest Mode</strong> — Try any scenario for free. Sign up to save progress and create custom scenarios.
        </div>
      )}

      {/* Main Content */}
      <main className="app-main">
        <Suspense fallback={
          <div className="app-loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        }>
          {appState === SIM_STATES.SCENARIO_SELECT && (
            <ScenarioSelect 
              onSelectScenario={handleSelectScenario}
              isGuest={isGuest}
              onAuthRequired={promptAuth}
            />
          )}

          {appState === SIM_STATES.PROGRESS_VIEW && (
            <ProgressDashboard
              userId={user?.uid}
              onStartNewScenario={handleBackHome}
            />
          )}

          {(appState === SIM_STATES.IN_SIM || appState === SIM_STATES.TIMEOUT) && selectedScenario && (
            <div className="simulation-layout">
              <div className="simulation-main">
                <ChatInterface
                  scenario={selectedScenario}
                  messages={simulation.messages}
                  onSendMessage={handleSendMessage}
                  onTimeout={handleTimeout}
                  onExit={handleExit}
                  onGetSuggestions={handleGetSuggestions}
                  turnCount={simulation.turnCount}
                  isLoading={simulation.isLoading}
                  suggestions={suggestions}
                  isSuggestionsLoading={isSuggestionsLoading}
                />
              </div>
              <Sidebar
                scenario={selectedScenario}
                activeTab={activeSidebarTab}
                onTabChange={setActiveSidebarTab}
                notes={notes}
                onNotesChange={setNotes}
              />
            </div>
          )}

          {appState === SIM_STATES.EVALUATED && selectedScenario && (
            <Feedback
              evaluation={evaluation}
              scenario={selectedScenario}
              onBackHome={handleBackHome}
              onRerunScenario={handleRerunScenario}
              isGuest={isGuest}
              onAuthRequired={promptAuth}
            />
          )}

          {appState === SIM_STATES.EXITED && !evaluation && (
            <div className="evaluation-loading">
              <div className="spinner"></div>
              <p>Evaluating your performance...</p>
            </div>
          )}
        </Suspense>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuthModal(false)}>×</button>
            {authReason && (
              <div className="auth-reason">
                <p><strong>Sign in required:</strong> {authReason}</p>
              </div>
            )}
            <Suspense fallback={
              <div className="app-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
              </div>
            }>
              <AuthScreen onClose={() => setShowAuthModal(false)} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
