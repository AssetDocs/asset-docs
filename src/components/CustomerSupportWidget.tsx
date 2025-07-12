import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface CustomerSupportWidgetProps {
  openaiApiKey?: string;
}

const CustomerSupportWidget: React.FC<CustomerSupportWidgetProps> = ({ openaiApiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState(openaiApiKey || localStorage.getItem('openai-api-key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { toast } = useToast();

  // Listen for footer chat icon clicks
  useEffect(() => {
    const handleOpenWidget = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };

    window.addEventListener('openSupportWidget', handleOpenWidget);
    return () => window.removeEventListener('openSupportWidget', handleOpenWidget);
  }, []);

  // Context-aware help based on current route
  const getContextualWelcome = () => {
    const path = location.pathname;
    
    if (path === '/') {
      return "Hi! I'm here to help you get started with Asset Docs. Need help with property documentation or have questions about our features?";
    } else if (path.includes('/photo-upload') || path.includes('/photos')) {
      return "I can help you with photo uploads! Need assistance with organizing photos, using AI analysis, or best practices for documentation?";
    } else if (path.includes('/properties')) {
      return "I'm here to help with property management! Need help adding properties, organizing documentation, or understanding property values?";
    } else if (path.includes('/pricing')) {
      return "Have questions about our pricing plans? I can help explain the features and find the right plan for you!";
    } else if (path.includes('/account')) {
      return "Need help with your account settings, subscription, or profile management? I'm here to assist!";
    }
    
    return "Hi! I'm your Asset Docs support assistant. How can I help you today?";
  };

  // Initialize conversation when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: getContextualWelcome(),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, location.pathname]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openai-api-key', apiKey);
      setShowApiKeyInput(false);
    }
  }, [apiKey]);

  const generateContextualResponse = async (userMessage: string): Promise<string> => {
    const path = location.pathname;
    let systemContext = "You are a helpful customer support assistant for Asset Docs, a property documentation and asset management application.";
    
    // Add page-specific context
    if (path.includes('/photo-upload') || path.includes('/photos')) {
      systemContext += " The user is currently on the photo upload/management section. Help them with photo organization, AI analysis, and documentation best practices.";
    } else if (path.includes('/properties')) {
      systemContext += " The user is on the property management section. Help them with adding properties, organizing documentation, and understanding property values.";
    } else if (path.includes('/pricing')) {
      systemContext += " The user is viewing pricing information. Help them understand plan features and choose the right option.";
    } else if (path.includes('/account')) {
      systemContext += " The user is in account settings. Help them with subscription, profile, and account management.";
    }

    systemContext += " Keep responses concise, helpful, and focused on Asset Docs features. If you don't know something specific about the app, admit it and suggest they contact support.";

    if (!apiKey) {
      return "I need an OpenAI API key to provide intelligent responses. Please enter your API key in the settings above, or contact our support team directly for assistance.";
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemContext },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('OpenAI API error:', error);
      if (error instanceof Error && error.message.includes('401')) {
        return "It looks like your API key is invalid. Please check your OpenAI API key and try again.";
      }
      return "I'm having trouble connecting to our AI service. Please try again in a moment or contact support for help.";
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await generateContextualResponse(inputText);
      
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-brand-orange hover:bg-brand-orange/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-80 transition-all duration-300 shadow-xl ${isMinimized ? 'h-14' : 'h-96'} bg-white border-brand-orange/20`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-brand-orange text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">Asset Docs Support</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* API Key Input */}
            {showApiKeyInput && (
              <div className="p-3 bg-orange-50 border-b">
                <div className="text-xs text-gray-600 mb-2">
                  Enter your OpenAI API key for AI responses:
                </div>
                <div className="flex space-x-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => setShowApiKeyInput(false)}
                    disabled={!apiKey}
                    className="bg-brand-orange hover:bg-brand-orange/90"
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 p-3 h-64 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-2 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-brand-orange text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-2 rounded-lg text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isTyping}
                  size="sm"
                  className="bg-brand-orange hover:bg-brand-orange/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default CustomerSupportWidget;