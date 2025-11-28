import { memo, useState } from 'react';
import { Clock } from 'lucide-react';
import { ChatInterfaceProps } from '../types/props';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatInterface = memo(function ChatInterface({
  scenario,
  messages,
  onSendMessage,
  onTimeout,
  onExit,
  onGetSuggestions,
  turnCount,
  isLoading,
  suggestions,
  isSuggestionsLoading
}: ChatInterfaceProps) {
  const [isTimeoutActive, setIsTimeoutActive] = useState(false);

  const handleSendMessage = (content: string) => {
    onSendMessage(content);
    setIsTimeoutActive(false);
  };

  const handleTimeout = () => {
    setIsTimeoutActive(true);
    onTimeout();
  };

  const turnsRemaining = scenario.turnLimit - turnCount;
  const isNearLimit = turnsRemaining <= 3;

  return (
    <div className="chat-interface" role="main" aria-label="Chat simulation interface">
      <div className="chat-header" role="banner">
        <div className="chat-title">
          <h2 id="scenario-title">{scenario.title}</h2>
          <span 
            className="turn-counter" 
            style={{ color: isNearLimit ? '#ef4444' : '#10b981' }}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`${turnCount} of ${scenario.turnLimit} turns used${isNearLimit ? ', approaching limit' : ''}`}
          >
            {isNearLimit && <span aria-hidden="true">⚠️ </span>}
            {turnCount} / {scenario.turnLimit} turns
          </span>
        </div>
        <div className="chat-actions" role="toolbar" aria-label="Chat actions">
          <button 
            className="btn btn-secondary btn-small" 
            onClick={handleTimeout} 
            disabled={isLoading}
            aria-label="Request a time-out for coaching"
            aria-describedby="scenario-title"
          >
            <Clock size={16} aria-hidden="true" />
            <span>Time-out</span>
          </button>
          <button 
            className="btn btn-warning btn-small" 
            onClick={onExit}
            aria-label="Exit simulation and get score"
            aria-describedby="scenario-title"
          >
            <span>Exit & Score</span>
          </button>
        </div>
      </div>

      <MessageList
        scenario={scenario}
        messages={messages}
        isLoading={isLoading}
        isTimeoutActive={isTimeoutActive}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        onGetSuggestions={onGetSuggestions}
        isLoading={isLoading}
        isSuggestionsLoading={isSuggestionsLoading}
        suggestions={suggestions}
        turnsRemaining={turnsRemaining}
        messagesLength={messages.length}
      />
    </div>
  );
});

export default ChatInterface;
