import { useState, useEffect } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import './App.css';

// Components
import AuthScreen from './components/AuthScreen';
import ScenarioSelect from './components/ScenarioSelect';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import Feedback from './components/Feedback';
import ProgressDashboard from './components/ProgressDashboard';

// Hooks and utils
import { useAuth } from './hooks/useAuth';
import { signOutUser } from './firebase/auth';
import { createSession, updateSession } from './firebase/firestore';
import { getStakeholderResponse, getCoachingHint, evaluateSession } from './utils/aiService';

// Constants
import { SIM_STATES, SIDEBAR_TABS, MESSAGE_TYPES } from './constants/states';

function App() {
  const { user, userData, loading: authLoading, isAuthenticated, isGuest } = useAuth();
  
  // App state
  const [appState, setAppState] = useState(SIM_STATES.SCENARIO_SELECT);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  // Simulation state
  const [messages, setMessages] = useState([]);
  const [turnCount, setTurnCount] = useState(0);
  const [isAILoading, setIsAILoading] = useState(false);
  
  // Sidebar state
  const [activeSidebarTab, setActiveSidebarTab] = useState(SIDEBAR_TABS.CONTEXT);
  const [notes, setNotes] = useState('');
  
  // Evaluation state
  const [evaluation, setEvaluation] = useState(null);

  // Handle scenario selection
  const handleSelectScenario = async (scenario) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setTurnCount(0);
    setNotes('');
    setEvaluation(null);
    
    // Create session in Firebase if user is authenticated
    if (user) {
      try {
        const sessionId = await createSession({
          userId: user.uid,
          scenario: scenario,
          turnLimit: scenario.turnLimit,
          settings: {
            difficulty: scenario.difficulty
          }
        });
        setCurrentSessionId(sessionId);
      } catch (error) {
        console.error('Error creating session:', error);
      }
    }
    
    setAppState(SIM_STATES.IN_SIM);
  };

  // Handle sending a message
  const handleSendMessage = async (content) => {
    const userMessage = {
      type: MESSAGE_TYPES.USER,
      content,
      timestamp: new Date().toISOString()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setTurnCount(turnCount + 1);
    
    // Update session in Firebase
    if (currentSessionId) {
      try {
        await updateSession(currentSessionId, {
          transcript: newMessages,
          turnCount: turnCount + 1
        });
      } catch (error) {
        console.error('Error updating session:', error);
      }
    }
    
    // Get AI response
    setIsAILoading(true);
    try {
      const response = await getStakeholderResponse(
        { scenario: selectedScenario, transcript: newMessages, turnCount: turnCount + 1 },
        content
      );
      
      const aiMessage = {
        type: MESSAGE_TYPES.AI,
        content: response.message,
        stakeholder: response.stakeholder,
        role: response.role,
        timestamp: response.timestamp
      };
      
      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      
      // Update session again with AI response
      if (currentSessionId) {
        await updateSession(currentSessionId, {
          transcript: updatedMessages
        });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        type: MESSAGE_TYPES.SYSTEM,
        content: `Error: ${error.message || 'Unable to get AI response. Check console for details.'}`,
        timestamp: new Date().toISOString()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsAILoading(false);
    }
  };

  // Handle timeout (coaching hint)
  const handleTimeout = async () => {
    setAppState(SIM_STATES.TIMEOUT);
    setIsAILoading(true);
    
    try {
      const hint = await getCoachingHint({
        scenario: selectedScenario,
        transcript: messages,
        turnCount
      });
      
      const coachingMessage = {
        type: MESSAGE_TYPES.COACHING,
        content: hint,
        timestamp: new Date().toISOString()
      };
      
      setMessages([...messages, coachingMessage]);
    } catch (error) {
      console.error('Error getting coaching hint:', error);
    } finally {
      setIsAILoading(false);
      setAppState(SIM_STATES.IN_SIM);
    }
  };

  // Handle exit and evaluate
  const handleExit = async () => {
    setAppState(SIM_STATES.EXITED);
    setIsAILoading(true);
    
    try {
      // Update session status
      if (currentSessionId) {
        await updateSession(currentSessionId, {
          completedAt: new Date(),
          state: 'EXITED'
        });
      }
      
      // Get evaluation
      const evaluationResult = await evaluateSession(currentSessionId, {
        scenario: selectedScenario,
        transcript: messages
      });
      
      setEvaluation(evaluationResult);
      setAppState(SIM_STATES.EVALUATED);
    } catch (error) {
      console.error('Error evaluating session:', error);
    } finally {
      setIsAILoading(false);
    }
  };

  // Handle back to home
  const handleBackHome = () => {
    setAppState(SIM_STATES.SCENARIO_SELECT);
    setSelectedScenario(null);
    setMessages([]);
    setTurnCount(0);
    setEvaluation(null);
    setCurrentSessionId(null);
  };

  // Handle rerun scenario
  const handleRerunScenario = () => {
    if (selectedScenario) {
      handleSelectScenario(selectedScenario);
    }
  };

  // Handle view progress
  const handleViewProgress = () => {
    setAppState(SIM_STATES.PROGRESS_VIEW);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      handleBackHome();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // State for auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authReason, setAuthReason] = useState('');

  // Auth loading
  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Function to prompt for authentication
  const promptAuth = (reason) => {
    setAuthReason(reason);
    setShowAuthModal(true);
  };

  return (
    <div className="app">
      {/* App Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title" onClick={handleBackHome} style={{ cursor: 'pointer' }}>
            BusinessSim
          </h1>
          {appState !== SIM_STATES.SCENARIO_SELECT && appState !== SIM_STATES.PROGRESS_VIEW && (
            <span className="header-subtitle">{selectedScenario?.title}</span>
          )}
        </div>
        <div className="header-right">
          {isAuthenticated ? (
            <>
              <button className="btn btn-ghost btn-small" onClick={handleViewProgress}>
                Progress
              </button>
              <div className="user-menu">
                <UserIcon size={18} />
                <span>{userData?.displayName || user?.email}</span>
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

      {/* Main Content */}
      <main className="app-main">
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

        {(appState === SIM_STATES.IN_SIM || appState === SIM_STATES.TIMEOUT) && (
          <div className="simulation-layout">
            <div className="simulation-main">
              <ChatInterface
                scenario={selectedScenario}
                messages={messages}
                onSendMessage={handleSendMessage}
                onTimeout={handleTimeout}
                onExit={handleExit}
                turnCount={turnCount}
                isLoading={isAILoading}
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

        {appState === SIM_STATES.EVALUATED && (
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
            <AuthScreen onClose={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
