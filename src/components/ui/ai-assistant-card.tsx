import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  BotIcon,
  SendIcon,
  SparklesIcon,
  ZapIcon,
  CalendarIcon,
  HelpCircleIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/types";
import { sendChatMessage } from "@/services/chatbotService";
import { formatMessage } from "@/utils/formatMessage";
import { TextShimmer } from "@/components/ui/TextShimmer";
import KhanectBoltIcon from "@/components/icons/KhanectBoltIcon";
import { AnimatedMessage } from "./AnimatedMessage";

interface AiAssistantCardProps {
  onClose?: () => void;
}

const SUGGESTIONS = [
  { icon: ZapIcon, label: "Automate workflow", color: "text-brand-lime" },
  { icon: SparklesIcon, label: "Save costs", color: "text-purple-500" },
  { icon: CalendarIcon, label: "Book a demo", color: "text-blue-500" },
  { icon: HelpCircleIcon, label: "What industries?", color: "text-orange-500" },
];

export function AiAssistantCard({ onClose }: AiAssistantCardProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ref to track messages without causing useCallback recreation
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  const handleSend = useCallback(
    async (textOverride?: string) => {
      if (isLoading) return;

      const textToSend = typeof textOverride === "string" ? textOverride : input;

      if (!textToSend.trim()) return;

      const userMsg: ChatMessage = { role: "user", text: textToSend };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      // Handle "Book a demo" request with custom response
      if (
        textToSend.toLowerCase().includes("book a demo") ||
        textToSend.toLowerCase().includes("book demo")
      ) {
        setIsLoading(true);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              text: "Great choice!\n\nTo book a demo with our team, please **scroll down to the contact form** on our homepage and fill in your details.\n\nOur team will get back to you within 24 hours to schedule a personalized demo session.\n\n**What you'll get:**\n- Personalized walkthrough of our AI automation solutions\n- ROI analysis for your business\n- Custom automation recommendations\n- Q&A session with our experts",
            },
          ]);
          setIsLoading(false);
        }, 800);
        return;
      }

      setIsLoading(true);

      try {
        // Use ref to avoid stale closure
        const history = messagesRef.current.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));

        const { text } = await sendChatMessage(textToSend, history);
        setMessages((prev) => [...prev, { role: "model", text: text }]);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "I'm having trouble connecting right now. Please check your internet connection.";
        setMessages((prev) => [
          ...prev,
          { role: "model", text: errorMessage, isError: true },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading] // Removed messages - using ref instead
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <Card className="flex h-full w-full flex-col gap-0 p-0 shadow-xl border-0 bg-white dark:bg-[#0f0f11] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-lime/20 to-brand-lime/5 flex items-center justify-center border border-brand-lime/20">
            <KhanectBoltIcon size={18} />
          </div>
          <div>
            <TextShimmer
              as="h3"
              className="text-sm font-semibold leading-tight"
              duration={3}
              spread={1.5}
            >
              Khanect AI
            </TextShimmer>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-pulse"></span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                Online
              </span>
            </div>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Close chat"
          >
            <XIcon className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-0 min-h-0">
        {/* Welcome Screen or Chat Messages */}
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center flex-1 space-y-6 p-6">
            {/* Logo */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-lg border border-white/10">
              <KhanectBoltIcon size={28} className="text-brand-lime" />
            </div>

            {/* Welcome Text */}
            <div className="flex flex-col space-y-2 text-center">
              <h2 className="text-lg font-medium text-muted-foreground">
                Welcome to
              </h2>
              <h3 className="text-xl font-semibold tracking-tight">
                Khanect AI Assistant
              </h3>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                I'm here to help you explore AI automation solutions for your
                business. Ask me anything!
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {SUGGESTIONS.map((suggestion, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="h-8 cursor-pointer gap-1.5 text-xs rounded-lg hover:bg-brand-lime/10 hover:border-brand-lime/30 transition-colors border border-transparent"
                  onClick={() => handleSend(suggestion.label)}
                >
                  <suggestion.icon
                    aria-hidden="true"
                    className={`size-3.5 ${suggestion.color}`}
                  />
                  {suggestion.label}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div
            ref={chatContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } animate-scale-up origin-bottom`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand-lime text-black rounded-2xl rounded-tr-sm font-medium"
                      : "bg-secondary text-foreground rounded-2xl rounded-tl-sm"
                  } ${
                    msg.isError
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : ""
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.text
                  ) : (
                    <AnimatedMessage text={msg.text} />
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <TextShimmer
                    as="span"
                    className="text-sm font-medium"
                    duration={1.5}
                    spread={2}
                  >
                    Thinking...
                  </TextShimmer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="shrink-0 border-t border-border/50">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={isLoading}
              aria-label="Type your message"
              className="min-h-[80px] max-h-[120px] resize-none rounded-none border-none py-3 ps-4 pe-12 shadow-none focus-visible:ring-0 bg-transparent"
            />

            <Button
              size="icon"
              className={`absolute end-2 bottom-2 size-8 rounded-lg transition-all ${
                input.trim() && !isLoading
                  ? "bg-brand-lime text-black hover:bg-brand-limeHover"
                  : "bg-muted text-muted-foreground"
              }`}
              disabled={!input.trim() || isLoading}
              onClick={() => handleSend()}
              aria-label={isLoading ? "Sending message" : "Send message"}
            >
              <SendIcon className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-t border-border/30">
            <p className="text-[10px] text-muted-foreground">
              Powered by Khanect AI
            </p>
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className="h-5 text-[10px] px-1.5 font-normal"
              >
                <BotIcon className="size-3 mr-1" />
                AI
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AiAssistantCard;
