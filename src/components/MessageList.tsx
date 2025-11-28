import { memo, useRef, useEffect, useState } from 'react';
import { UsersIcon, AlertCircle, Clock, User, ArrowDown } from 'lucide-react';
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      const hasEnoughMessages = messages.length > 5;
      
      setShowScrollButton(!isNearBottom && hasEnoughMessages);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Check initial state
      handleScroll();
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [messages.length]);

  return (
    <div 
      className="chat-messages" 
      ref={messagesContainerRef}
      role="log" 
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions"
      aria-label="Conversation messages"
      tabIndex={0}
    >
      {/* Initial scenario context */}
      <div className="message system-message" role="article" aria-label="Scenario brief">
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
      {messages.map((msg, idx) => {
        const messageTypeLabel = msg.type === MESSAGE_TYPES.USER ? 'Your message' :
                                 msg.type === MESSAGE_TYPES.AI ? `Message from ${msg.stakeholder || 'Stakeholder'}` :
                                 msg.type === MESSAGE_TYPES.COACHING ? 'Coaching hint' :
                                 'System message';
        
        return (
          <div 
            key={idx} 
            className={`message ${msg.type}-message`} 
            role="article" 
            aria-label={messageTypeLabel}
            tabIndex={0}
          >
            {msg.type === MESSAGE_TYPES.USER && (
              <div className="message-avatar message-avatar-user" aria-hidden="true" role="presentation">
                <User size={20} />
              </div>
            )}
            {msg.type === MESSAGE_TYPES.AI && (
              <>
                <div className="message-avatar message-avatar-ai" aria-hidden="true" role="presentation">
                  <UsersIcon size={20} />
                </div>
                <div className="message-header">
                  <span>{msg.stakeholder || 'Stakeholder'}</span>
                  {msg.role && <span className="role-badge" aria-label={`Role: ${msg.role}`}>{msg.role}</span>}
                </div>
              </>
            )}
            {msg.type === MESSAGE_TYPES.COACHING && (
              <div className="message-header coaching-header">
                <Clock size={16} aria-hidden="true" />
                <span>Coaching Hint</span>
              </div>
            )}
            {msg.type === MESSAGE_TYPES.SYSTEM && (
              <div className="message-header">
                <AlertCircle size={16} aria-hidden="true" />
                <span className="visually-hidden">System message</span>
              </div>
            )}
            <div className="message-content">
              <p>{msg.content}</p>
            </div>
            {msg.timestamp && (
              <div 
                className="message-timestamp" 
                aria-label={`Sent at ${new Date(msg.timestamp).toLocaleTimeString()}`}
                role="text"
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        );
      })}

      {isLoading && (
        <div 
          className="message ai-message loading" 
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
          aria-label="AI is typing a response"
        >
          <div className="message-content">
            <div className="typing-indicator" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="visually-hidden">AI is typing</span>
          </div>
        </div>
      )}

      {isTimeoutActive && !isLoading && (
        <div 
          className="timeout-notice" 
          role="status" 
          aria-live="polite"
          aria-atomic="true"
        >
          <Clock size={16} aria-hidden="true" />
          <p>Simulation paused. Review the coaching hint above, then continue when ready.</p>
        </div>
      )}

      <div ref={messagesEndRef} aria-hidden="true" />

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          className="scroll-to-bottom"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom of messages"
          title="Scroll to bottom"
          type="button"
        >
          <ArrowDown size={20} aria-hidden="true" />
          <span className="visually-hidden">Scroll to bottom</span>
        </button>
      )}
    </div>
  );
});

export default MessageList;
