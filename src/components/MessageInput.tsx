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
      <div className="chat-input-container">
        <div className="turn-limit-reached" role="status" aria-live="polite">
          <p>Turn limit reached. Generating your evaluation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-input-container">
      {/* Suggestions Section */}
      {suggestions && suggestions.length > 0 && (
        <div className="suggestions-container" role="region" aria-label="AI Suggestions">
          <div className="suggestions-header">
            <Lightbulb size={16} aria-hidden="true" />
            <span>AI Suggestions - Click to use:</span>
          </div>
          <div className="suggestions-list" role="list">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                role="listitem"
                aria-label={`Use suggestion: ${suggestion}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="input-row">
        <label htmlFor="message-input" className="visually-hidden">
          Type your message
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
          aria-label="Message input"
          aria-describedby="turns-remaining"
        />
        <div className="input-actions">
          <span id="turns-remaining" className="visually-hidden">
            {turnsRemaining} turns remaining
          </span>
          <button
            className="btn btn-secondary btn-icon"
            onClick={onGetSuggestions}
            disabled={isLoading || isSuggestionsLoading || messagesLength === 0}
            title="Get AI suggestions"
            aria-label="Get AI suggestions"
          >
            <Lightbulb size={18} aria-hidden="true" />
            {isSuggestionsLoading ? 'Loading...' : 'Hints'}
          </button>
          <button
            className="btn btn-primary btn-send"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
          >
            <Send size={20} aria-hidden="true" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
});

export default MessageInput;
