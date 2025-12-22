import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Trash2, Loader2, Send, Mic, MicOff } from 'lucide-react';
import { chatService } from '../../api/chatService.js';
import type { ChatMessage as ChatMessageType } from '../../api/chatService.js';
import { useToast } from '../../contexts/ToastContext.js';
import Button from '../UI/Button.js';
import { useSpeechToText } from '../../hooks/useSpeechToText.js';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  role?: 'buyer' | 'seller' | 'agent' | 'admin' | 'landlord' | 'guest';
  funnelStage?: 'awareness' | 'consideration' | 'decision' | 'post_purchase' | 'listing' | 'managing';
  currentPage?: string;
  propertyId?: string;
}

export const ChatWindow = ({
  isOpen,
  onClose,
  role = 'admin',
  funnelStage = 'managing',
  currentPage,
  propertyId,
}: ChatWindowProps) => {
  const { success, error: showError } = useToast();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isRecording, isTranscribing, toggleRecording } = useSpeechToText({
    language: 'auto',
    onTranscriptionComplete: (text) => {
      setInputValue(text);
    },
  });

  const loadHistory = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const history = await chatService.getHistory(conversationId);
      setMessages(history);
    } catch (error) {
      showError('Failed to Load History', 'Could not load conversation history');
    } finally {
      setLoading(false);
    }
  }, [conversationId, showError]);

  useEffect(() => {
    if (isOpen && conversationId) {
      loadHistory();
    }
  }, [isOpen, conversationId, loadHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    const userMessage: ChatMessageType = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setSending(true);

    const loadingMessage: ChatMessageType = {
      id: `loading_${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await chatService.sendMessage({
        message: userMessage.content,
        conversationId,
        language: 'en',
        role,
        funnelStage,
        context: {
          currentPage,
          propertyId,
        },
      });

      setConversationId(response.conversationId);

      const assistantMessage: ChatMessageType = {
        id: response.messageId,
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp,
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === loadingMessage.id ? assistantMessage : msg))
      );
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));
      showError('Failed to Send Message', 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClear = async () => {
    if (!conversationId) {
      setMessages([]);
      setConversationId(undefined);
      return;
    }

    try {
      await chatService.clearHistory(conversationId);
      setMessages([]);
      setConversationId(undefined);
      success('Conversation Cleared', 'Chat history has been cleared');
    } catch (error) {
      showError('Failed to Clear', 'Could not clear conversation history');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 w-[90vw] sm:w-[28rem] h-[32rem] sm:h-[35rem] bg-white border-2 border-gray-200 rounded-2xl shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
        <div>
          <h2 className="text-lg font-bold text-gray-900">AI Butler</h2>
          <p className="text-xs text-gray-600">Your admin assistant</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Close chat"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-sm mb-2">👋 Hello! I'm your AI Butler.</p>
            <p className="text-xs text-center">
              I can help you with platform moderation, user management, analytics, and more!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-900 border-2 border-gray-200'
                  }`}
                >
                  {message.content ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t-2 border-gray-200 bg-white rounded-b-2xl">
        <div className="flex gap-2 items-end">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything about platform management..."
            className="flex-1 resize-none rounded-xl border-2 border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={2}
            disabled={sending || isTranscribing}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRecording}
            disabled={sending || isTranscribing}
            className={`h-10 w-10 p-0 shrink-0 ${
              isRecording ? 'text-red-500 hover:text-red-600 hover:bg-red-50' :
              isTranscribing ? 'opacity-50 cursor-not-allowed' :
              'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title={isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Start voice input'}
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            variant="primary"
            size="md"
            className="shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

