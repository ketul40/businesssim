import { memo, useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Send, Lightbulb } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onGetSuggestions: () => void;
  isLoading: boolean;
  isSuggestionsLoading: boolean;
  suggestions: string[];
  turnsRemaining: number;
  messagesLength: number;
}

const MessageInput = memo(function MessageInput({
  onSendMessage,
  onGetSuggestions,
  isLoading,
  isSuggestionsLoading,
  suggestions,
  turnsRemaining,
  messagesLength
}: MessageInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  if (turnsRemaining <= 0) {
    return (
      <div className="chat-input-container" role="complementary" aria-label="Message input area">
        <div 
          className="turn-limit-reached" 
          role="status" 
          aria-live="polite"
          aria-atomic="true"
        >
          <p>Turn limit reached. Generating your evaluation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-input-container" role="complementary" aria-label="Message input area">
      {/* Suggestions Loading State */}
      {isSuggestionsLoading && (
        <div 
          className="suggestions-container" 
          role="region" 
          aria-label="Loading AI Suggestions" 
          aria-busy="true"
          aria-live="polite"
        >
          <div className="suggestions-header">
            <Lightbulb size={16} aria-hidden="true" />
            <span>Loading AI Suggestions...</span>
          </div>
          <div className="suggestions-list" role="list" aria-label="Loading suggestions">
            <div className="suggestion-skeleton" aria-hidden="true"></div>
            <div className="suggestion-skeleton" aria-hidden="true"></div>
            <div className="suggestion-skeleton" aria-hidden="true"></div>
          </div>
          <span className="visually-hidden">Loading suggestions, please wait</span>
        </div>
      )}
      
      {/* Suggestions Section */}
      {!isSuggestionsLoading && suggestions && suggestions.length > 0 && (
        <div 
          className="suggestions-container" 
          role="region" 
          aria-label="AI Suggestions"
          aria-describedby="suggestions-help"
        >
          <div className="suggestions-header">
            <Lightbulb size={16} aria-hidden="true" />
            <span id="suggestions-help">AI Suggestions - Click to use:</span>
          </div>
          <div className="suggestions-list" role="list" aria-label={`${suggestions.length} suggestions available`}>
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                role="listitem"
                aria-label={`Use suggestion ${idx + 1} of ${suggestions.length}: ${suggestion}`}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="input-row">
        <div className="input-wrapper">
          <label htmlFor="message-input" className="visually-hidden">
            Type your message. Press Enter to send, Shift+Enter for new line.
          </label>
          <textarea
            id="message-input"
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            rows={2}
            disabled={isLoading}
            className="chat-input"
            aria-label="Message input field"
            aria-describedby="turns-remaining character-count input-help"
            aria-required="true"
            aria-invalid={inputValue.trim().length === 0 && inputValue.length > 0}
          />
          <span id="input-help" className="visually-hidden">
            Press Enter to send your message, or Shift+Enter to add a new line
          </span>
          <div 
            id="character-count" 
            className="character-count"
            aria-live="polite"
            aria-atomic="true"
            role="status"
          >
            {inputValue.length} characters
          </div>
        </div>
        <div className="input-actions" role="group" aria-label="Message actions">
          <span id="turns-remaining" className="visually-hidden" role="status" aria-live="polite">
            {turnsRemaining} turns remaining
          </span>
          <button
            className="btn btn-secondary btn-icon"
            onClick={onGetSuggestions}
            disabled={isLoading || isSuggestionsLoading || messagesLength === 0}
            title="Get AI suggestions for your response"
            aria-label={`Get AI suggestions${messagesLength === 0 ? ' (disabled until first message)' : ''}`}
            type="button"
            aria-describedby={messagesLength === 0 ? 'hints-disabled-reason' : undefined}
          >
            <Lightbulb size={18} aria-hidden="true" />
            <span>{isSuggestionsLoading ? 'Loading...' : 'Hints'}</span>
          </button>
          {messagesLength === 0 && (
            <span id="hints-disabled-reason" className="visually-hidden">
              Hints are available after the first message exchange
            </span>
          )}
          <button
            className="btn btn-primary btn-send"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            aria-label={`Send message${!inputValue.trim() ? ' (disabled, message is empty)' : ''}`}
            type="button"
            aria-describedby="send-button-help"
          >
            <Send size={20} aria-hidden="true" />
            <span>Send</span>
          </button>
          <span id="send-button-help" className="visually-hidden">
            {!inputValue.trim() ? 'Type a message to enable send button' : 'Click to send your message'}
          </span>
        </div>
      </div>
    </div>
  );
});

export default MessageInput;
