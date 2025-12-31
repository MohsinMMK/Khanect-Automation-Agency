import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, ViewState } from '../types';
import { sendChatMessage } from '../services/chatbotService';
import KhanectBoltIcon from './icons/KhanectBoltIcon';
import { formatMessage } from '../utils/formatMessage';
import { TextShimmer } from './ui/TextShimmer';
import { HoverBorderGradient } from './ui/HoverBorderGradient';

interface AiConsultantProps {
    onNavigate?: (view: ViewState) => void;
}

const SUGGESTIONS = [
  "How can I save costs?",
  "Automate my workflow",
  "Book a demo",
  "What industries do you serve?",
  "Tell me about AI automation"
];

const AiConsultant: React.FC<AiConsultantProps> = ({ onNavigate }) => {
  // Text Chat State
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm your Khanect AI Assistant. How can I help you optimize your business today?" }
  ]);
  const [isTextLoading, setIsTextLoading] = useState(false);

  // Use a ref for the scrollable container
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTextLoading]);

  const handleTextSend = useCallback(async (textOverride?: string) => {
    if (isTextLoading) return;

    const textToSend = typeof textOverride === 'string' ? textOverride : input;

    if (!textToSend.trim()) {
        setInputError("Please enter a valid message.");
        return;
    }

    setInputError(null);

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Handle "Book a demo" request with custom response
    if (textToSend.toLowerCase().includes('book a demo') || textToSend.toLowerCase().includes('book demo')) {
      setIsTextLoading(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          role: 'model',
          text: "Great choice! 🎉\n\nTo book a demo with our team, please **scroll down to the contact form** on our homepage and fill in your details.\n\nOur team will get back to you within 24 hours to schedule a personalized demo session.\n\n**What you'll get:**\n- Personalized walkthrough of our AI automation solutions\n- ROI analysis for your business\n- Custom automation recommendations\n- Q&A session with our experts\n\nLooking forward to helping you transform your business! 🚀"
        }]);
        setIsTextLoading(false);
      }, 800);
      return;
    }

    setIsTextLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const { text } = await sendChatMessage(textToSend, history);
      setMessages((prev) => [...prev, { role: 'model', text: text }]);
    } catch (error) {
      // Show specific error message from the service
      const errorMessage = error instanceof Error ? error.message : "I'm having trouble connecting right now. Please check your internet connection.";
      setMessages((prev) => [...prev, { role: 'model', text: errorMessage, isError: true }]);
    } finally {
      setIsTextLoading(false);
    }
  }, [input, isTextLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (inputError && e.target.value.trim()) {
        setInputError(null);
    }
  };

  return (
    <HoverBorderGradient
      containerClassName="w-full h-full rounded-2xl"
      className="w-full h-full"
      duration={2}
    >
      <div className="w-full h-full flex flex-col overflow-hidden rounded-2xl font-sans">

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100/50 dark:border-white/5 z-10 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-lime/20 to-brand-lime/5 flex items-center justify-center border border-brand-lime/20">
                     <KhanectBoltIcon size={20} />
                </div>
                <div>
                    <TextShimmer as="h3" className="font-bold leading-tight" duration={3} spread={1.5}>Khanect AI</TextShimmer>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Assistant</span>
                    </div>
                </div>
            </div>
            {onNavigate && (
                <button
                    onClick={() => onNavigate(ViewState.LANDING)}
                    className="w-8 h-8 rounded-full text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-all duration-300 ease-fluid hover:rotate-90"
                    aria-label="Close Chat"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            )}
        </div>

        {/* Chat Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-6 relative custom-scrollbar transition-colors">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-scale-up origin-bottom`}>
                    <div className={`max-w-[85%] px-5 py-3.5 text-[14px] leading-relaxed shadow-sm transition-all duration-300 ease-fluid hover:scale-[1.01] ${
                        msg.role === 'user'
                        ? 'bg-brand-lime text-black rounded-[20px] rounded-tr-sm font-medium'
                        : 'bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-[20px] rounded-tl-sm border border-gray-100 dark:border-white/5 backdrop-blur-sm'
                    } ${msg.isError ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/10 dark:text-red-300 dark:border-red-900/20' : ''}`}>
                        {msg.role === 'user' ? msg.text : formatMessage(msg.text)}
                    </div>
                </div>
            ))}

            {isTextLoading && (
                <div className="flex justify-start animate-fade-in-up">
                    <div className="bg-white dark:bg-white/5 rounded-[20px] rounded-tl-sm px-5 py-3.5 shadow-sm border border-gray-100 dark:border-white/5 transition-colors">
                        <TextShimmer as="span" className="text-[14px] font-medium" duration={1.5} spread={2}>
                            Generating...
                        </TextShimmer>
                    </div>
                </div>
            )}

            {messages.length === 1 && !isTextLoading && (
                <div className="flex flex-wrap gap-2 mt-2 px-1 animate-fade-in-up delay-200">
                    {SUGGESTIONS.map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => handleTextSend(suggestion)}
                            className="text-xs font-medium bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full hover:border-brand-lime dark:hover:border-brand-lime hover:text-black dark:hover:text-brand-lime hover:bg-brand-lime/10 transition-all duration-300 ease-fluid hover:scale-105"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 z-10 transition-colors">
            <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-full p-1.5 flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-brand-lime/50 transition-all duration-300 ease-fluid hover:shadow-md">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none text-sm px-4"
                    disabled={isTextLoading}
                />

                <button
                    onClick={() => handleTextSend()}
                    disabled={!input.trim() || isTextLoading}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ease-fluid ${
                        input.trim() && !isTextLoading
                            ? 'bg-brand-lime text-black hover:scale-110 hover:bg-brand-limeHover shadow-lg shadow-brand-lime/20'
                            : 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }`}
                    title="Send"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
            {inputError && (
                <p className="text-xs text-red-500 mt-2 px-4">{inputError}</p>
            )}
            <div className="text-center mt-2">
                 <p className="text-[10px] text-gray-400 dark:text-gray-600">Powered by Khanect AI</p>
            </div>
        </div>
      </div>
    </HoverBorderGradient>
  );
};

export default AiConsultant;
