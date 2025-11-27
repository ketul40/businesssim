import { memo, useRef, useEffect } from 'react';
import { UsersIcon, AlertCircle, Clock } from 'lucide-react';
import { Message, ScenarioTemplate } from '../types/models';
import { MESSAGE_TYPES } from '../constants/states';

interface MessageListProps {
  scenario: ScenarioTemplate;
  messages: Message[];
  isLoading: boolean;
  isTimeoutActive: boolean;
}

const MessageList = memo(function MessageList({
  scenario,
  messages,
  isLoading,
  isTimeoutActive
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-messages" role="log" aria-live="polite" aria-label="Conversation messages">
      {/* Initial scenario context */}
      <div className="message system-message" role="article">
        <div className="message-header">
          <AlertCircle size={16} aria-hidden="true" />
          <span>Scenario Brief</span>
        </div>
        <div className="message-content">
          <p><strong>Situation:</strong> {scenario.situation}</p>
          <p><strong>Your Objective:</strong> {scenario.objective}</p>
        </div>
      </div>

      {/* Chat messages */}
      {messages.map((msg, idx) => (
        <div key={idx} className={`message ${msg.type}-message`} role="article" aria-label={`${msg.type} message`}>
          {msg.type === MESSAGE_TYPES.AI && (
            <div className="message-header">
              <UsersIcon size={16} aria-hidden="true" />
              <span>{msg.stakeholder || 'Stakeholder'}</span>
              {msg.role && <span className="role-badge">{msg.role}</span>}
            </div>
          )}
          {msg.type === MESSAGE_TYPES.COACHING && (
            <div className="message-header coaching-header">
              <Clock size={16} aria-hidden="true" />
              <span>Coaching Hint</span>
            </div>
          )}
          <div className="message-content">
            <p>{msg.content}</p>
          </div>
          {msg.timestamp && (
            <div className="message-timestamp" aria-label={`Sent at ${new Date(msg.timestamp).toLocaleTimeString()}`}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="message ai-message loading" role="status" aria-live="polite" aria-label="AI is typing">
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
        <div className="timeout-notice" role="status" aria-live="polite">
          <Clock size={16} aria-hidden="true" />
          <p>Simulation paused. Review the coaching hint above, then continue when ready.</p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
});

export default MessageList;
