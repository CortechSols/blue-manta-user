import { useState, useRef, useEffect } from "react";
import { useChatInterface } from "../../hooks/useChatInterface";
import { ChatbotAPIClient } from "../../lib/api";
import type { ChatbotAppearance } from "../../types/chatbot";
import { ArrowDownIcon, SendHorizonal, Zap } from "lucide-react";
import { CalendlyInlineWidget } from "../calendly/CalendlyInlineWidget";

interface ChatWidgetProps {
  chatbotId: number;
  apiClient: ChatbotAPIClient;
  greeting?: string;
  primaryColor?: string;
  theme?: "light" | "dark";
  appearance?: ChatbotAppearance | null;
  appearanceLoading?: boolean;
}

export function ChatWidget({
  chatbotId,
  apiClient,
  greeting = "Hello! How can I help you today?",
  theme = "light",
  appearance,
  appearanceLoading = false,
}: ChatWidgetProps) {
  const headerColor = appearance?.headerColor || "#3b82f6";
  const userMessageBubbleColor =
    appearance?.userMessageBubbleColor || "#3b82f6";
  const botMessageBubbleColor = appearance?.botMessageBubbleColor || "#f3f4f6";
  const userTextColor = appearance?.userTextColor || "#ffffff";
  const botTextColor = appearance?.botTextColor || "#000000";
  const sendButtonColor = appearance?.sendButtonColor || "#3b82f6";

  const predefinedQuestions = [
    "Schedule a call",
    "Get a qoute",
    "Ask a question",
  ];

  const [showQuickActions, setShowQuickActions] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    conversationEnded,
    sendMessage,
    restartConversation,
  } = useChatInterface(chatbotId, apiClient);

  console.log("messages: ", messages);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle clicks outside the chatbot to allow parent page interaction
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const chatWidget = document.querySelector(".chat-widget-container");

      if (chatWidget && !chatWidget.contains(target) && !isExpanded) {
        window.parent.postMessage({ type: "chatbot-click-outside" }, "*");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isExpanded]);

  // Focus input when chat expands
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  const handleSendMessage = async (messageOverride?: string) => {
    const message = messageOverride || inputMessage;
    if (!message.trim()) return;
    setInputMessage("");
    setShowQuickActions(false);

    await sendMessage(message);

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handlePredefinedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const inputBg = isDark ? "bg-gray-800" : "bg-gray-50";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const shadowColor = isDark
    ? "shadow-2xl shadow-black/50"
    : "shadow-2xl shadow-black/20";

  // Responsive dimensions
  const chatWidth = isMobile ? "100vw" : "450px"; // w-96 equivalent
  const chatHeight = isMobile ? "100vh" : "min(480px, calc(100vh - 32px))";
  const chatPosition = "fixed";
  const chatRounding = isMobile ? "" : "rounded-2xl";

  if (appearanceLoading || isLoadingHistory) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-widget-container">
      {/* Chat Toggle Button */}
      {!isExpanded && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsExpanded(true)}
            className="group relative w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 active:scale-95"
            style={{
              backgroundColor: sendButtonColor,
              color: "white",
              boxShadow: `0 8px 32px ${sendButtonColor}40`,
            }}
            aria-label="Open chat"
          >
            {/* Pulse animation */}
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ backgroundColor: sendButtonColor }}
            />

            {/* Button content */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              {appearance?.logo ? (
                <img
                  src={appearance.logo}
                  alt="Chat logo"
                  className="w-full h-full rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <svg
                  className="w-7 h-7 transition-transform group-hover:scale-110"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isExpanded && (
        <>
          {/* Mobile backdrop */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
            />
          )}

          <div
            className={`${chatPosition} ${chatRounding} ${bgColor} ${shadowColor} border ${borderColor} flex flex-col overflow-hidden z-50 transition-all duration-300`}
            style={{
              width: chatWidth,
              height: chatHeight,
              ...(isMobile
                ? { top: 0, left: 0, right: 0, bottom: 0 }
                : {
                    bottom: "16px",
                    right: "16px",
                    maxHeight: "calc(100vh - 32px)",
                    maxWidth: "calc(100vw - 32px)",
                  }),
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 text-white flex items-center justify-between relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${headerColor} 0%, ${headerColor}E6 100%)`,
              }}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/20" />
                <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-white/10" />
              </div>

              <div className="flex items-center space-x-3 relative z-10">
                {appearance?.image && (
                  <img
                    src={appearance.image}
                    alt="Chat logo"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">Chat Support</h3>
                  <p className="text-sm opacity-90">We're here to help!</p>
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="relative z-10 text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:scale-110"
                aria-label="Close chat"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent via-transparent to-gray-50/50">
              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="flex items-start space-x-3 max-w-[85%]">
                    {appearance?.image && (
                      <img
                        src={appearance.image}
                        alt="Bot avatar"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1 border-2 border-gray-200"
                      />
                    )}
                    <div
                      className="p-4 rounded-2xl rounded-tl-md shadow-sm"
                      style={{
                        backgroundColor: botMessageBubbleColor,
                        color: botTextColor,
                      }}
                    >
                      <p className="text-sm leading-relaxed">{greeting}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex animate-slideIn ${
                    message.sender === "bot" ? "justify-start" : "justify-end"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`flex items-end space-x-3 max-w-[85%] ${
                      message.sender === "visitor"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    {message.sender === "bot" && appearance?.image && (
                      <img
                        src={appearance.image}
                        alt="Bot avatar"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1 border-2 border-gray-200"
                      />
                    )}
                    <div className="flex flex-col max-w-full">
                      <div
                        className="p-4 rounded-2xl text-left shadow-sm relative"
                        style={
                          message.sender === "bot"
                            ? {
                                backgroundColor: botMessageBubbleColor,
                                color: botTextColor,
                                borderRadius: "16px 16px 16px 4px",
                              }
                            : {
                                backgroundColor: userMessageBubbleColor,
                                color: userTextColor,
                                borderRadius: "16px 16px 4px 16px",
                              }
                        }
                      >
                        <p className="text-sm leading-relaxed pr-12">
                          {message.content}
                        </p>
                        {/* WhatsApp-style timestamp */}
                        <span className="absolute bottom-[3px] right-3 text-[10px] opacity-70">
                          {formatTime(message.sentAt)}
                        </span>
                      </div>
                      {/* Calendly Widget - Outside the message bubble */}
                      {message.sender === "bot" && message.calendlyUrl && (
                        <div className="mt-3">
                          <CalendlyInlineWidget
                            url={message.calendlyUrl || ""}
                            height={isMobile ? 200 : 350}
                            onEventScheduled={(event) => {
                              console.log("Event scheduled:", event);
                              // You can add custom logic here when an event is scheduled
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="flex items-start space-x-3">
                    {appearance?.image && (
                      <img
                        src={appearance.image}
                        alt="Bot avatar"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1 border-2 border-gray-200"
                      />
                    )}
                    <div
                      className="p-4 rounded-2xl rounded-tl-md shadow-sm"
                      style={{
                        backgroundColor: botMessageBubbleColor,
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{ backgroundColor: botTextColor }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: botTextColor,
                            animationDelay: "0.1s",
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: botTextColor,
                            animationDelay: "0.2s",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex justify-center animate-fadeIn">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm shadow-sm">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conversation ended notification */}
              {conversationEnded && (
                <div className="flex justify-center animate-fadeIn">
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl text-sm shadow-sm max-w-sm">
                    <div className="text-center space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="w-5 h-5 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-medium">Conversation Ended</span>
                      </div>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Your previous conversation ended due to inactivity. A
                        new conversation has been started for you.
                      </p>
                      <button
                        onClick={restartConversation}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                      >
                        Continue Chatting
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* predefined questions section */}
            {!conversationEnded && (
              <div
                className={`border-t border-gray-200 relative ${
                  showQuickActions ? "p-4" : "p-0"
                }`}
              >
                {showQuickActions ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowQuickActions(false)}
                      className="w-fit p-2 text-xs flex justify-end items-center space-x-1 absolute -top-5 right-1"
                    >
                      <span className="sr-only">Hide quick actions</span>
                      <ArrowDownIcon className="w-6 h-6 rounded-full bg-gray-200 p-1 hover:bg-gray-300 transition-colors" />
                    </button>
                    <div className="grid grid-cols-2 gap-2 h-20 overflow-y-auto">
                      {predefinedQuestions.map((question) => (
                        <button
                          key={question}
                          className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                          onClick={() => handlePredefinedQuestion(question)}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowQuickActions(true)}
                    className="w-fit p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center space-x-2 transition-colors absolute -top-12 right-1"
                  >
                    <Zap className="w-4 h-4 ml-0 mr-0" />
                    <span className="sr-only">Show quick actions</span>
                  </button>
                )}
              </div>
            )}
            {/* Input */}
            {!conversationEnded && (
              <div
                className={`p-4 border-t ${borderColor} bg-gradient-to-r from-transparent to-gray-50/50`}
              >
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className={`w-full ${inputBg} ${textColor} border ${borderColor} place-content-center rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all duration-200 placeholder-gray-400`}
                      style={
                        {
                          "--tw-ring-color": sendButtonColor + "40",
                          minHeight: "44px",
                          maxHeight: "120px",
                        } as React.CSSProperties
                      }
                      rows={1}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="text-white rounded-xl px-4 py-3 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                    style={{
                      backgroundColor: sendButtonColor,
                      boxShadow: `0 4px 12px ${sendButtonColor}40`,
                    }}
                  >
                    <SendHorizonal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
