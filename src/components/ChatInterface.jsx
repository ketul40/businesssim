import { useState, useEffect, useRef } from 'react';
import { Send, Clock, Users as UsersIcon, AlertCircle } from 'lucide-react';
import { MESSAGE_TYPES } from '../constants/states';

export default function ChatInterface({
  scenario,
  messages,
  onSendMessage,
  onTimeout,
  onExit,
  turnCount,
  isLoading
}) {
  const [inputValue, setInputValue] = useState('');
  const [isTimeoutActive, setIsTimeoutActive] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setIsTimeoutActive(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTimeout = () => {
    setIsTimeoutActive(true);
    onTimeout();
  };

  const turnsRemaining = scenario.turnLimit - turnCount;
  const isNearLimit = turnsRemaining <= 3;

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-title">
          <h2>{scenario.title}</h2>
          <span className="turn-counter" style={{ color: isNearLimit ? '#ef4444' : '#10b981' }}>
            {turnCount} / {scenario.turnLimit} turns
          </span>
        </div>
        <div className="chat-actions">
          <button className="btn btn-secondary btn-small" onClick={handleTimeout} disabled={isLoading}>
            <Clock size={16} />
            Time-out
          </button>
          <button className="btn btn-warning btn-small" onClick={onExit}>
            Exit & Score
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {/* Initial scenario context */}
        <div className="message system-message">
          <div className="message-header">
            <AlertCircle size={16} />
            <span>Scenario Brief</span>
          </div>
          <div className="message-content">
            <p><strong>Situation:</strong> {scenario.situation}</p>
            <p><strong>Your Objective:</strong> {scenario.objective}</p>
          </div>
        </div>

        {/* Chat messages */}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}-message`}>
            {msg.type === MESSAGE_TYPES.AI && (
              <div className="message-header">
                <UsersIcon size={16} />
                <span>{msg.stakeholder || 'Stakeholder'}</span>
                {msg.role && <span className="role-badge">{msg.role}</span>}
              </div>
            )}
            {msg.type === MESSAGE_TYPES.COACHING && (
              <div className="message-header coaching-header">
                <Clock size={16} />
                <span>Coaching Hint</span>
              </div>
            )}
            <div className="message-content">
              <p>{msg.content}</p>
            </div>
            {msg.timestamp && (
              <div className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="message ai-message loading">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {isTimeoutActive && !isLoading && (
          <div className="timeout-notice">
            <Clock size={16} />
            <p>Simulation paused. Review the coaching hint above, then continue when ready.</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        {turnsRemaining <= 0 ? (
          <div className="turn-limit-reached">
            <p>Turn limit reached. Generating your evaluation...</p>
          </div>
        ) : (
          <>
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              rows={2}
              disabled={isLoading}
              className="chat-input"
            />
            <button
              className="btn btn-primary btn-send"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
            >
              <Send size={20} />
              Send
            </button>
          </>
        )}
      </div>
    </div>
  );
}

