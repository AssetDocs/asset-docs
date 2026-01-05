import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageCircle, Send, X, Minus } from 'lucide-react';
import { SearchService } from '@/services/SearchService';
import { useLocation, Link } from 'react-router-dom';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

const QUICK_PROMPTS = [
  "Which plan is right for me?",
  "How does this help with insurance claims?",
  "What should I document first?",
  "How does the Legacy Locker work?"
];

const WELCOME_MESSAGE = "Hi! I can help you understand how Asset Safe works, choose the right plan, or prepare your documentation. What would you like help with?";

// Comprehensive knowledge base for AI responses
const KNOWLEDGE_BASE = {
  plans: {
    keywords: ['plan', 'pricing', 'cost', 'subscription', 'price', 'tier', 'monthly', 'annual', 'right for me'],
    response: `Asset Safe offers two main plans:\n\n**Standard (Homeowner) - $12.99/month**\n• Up to 3 properties\n• 20GB storage\n• Photo, video, and document uploads\n• Legacy Locker access\n\n**Premium (Professional) - $18.99/month**\n• Unlimited properties\n• 100GB storage\n• Priority support\n• Advanced sharing features\n\nBoth plans include all core features. If you have multiple properties or need more storage, Premium is recommended. Visit our [Pricing page](/pricing) for full details.`
  },
  insurance: {
    keywords: ['insurance', 'claim', 'coverage', 'damage', 'loss', 'proof', 'documentation for insurance'],
    response: `Asset Safe helps with insurance claims by:\n\n**Before a Loss:**\n• Creating time-stamped proof of ownership\n• Documenting condition with photos/videos\n• Storing receipts and appraisals\n• Generating detailed inventory reports\n\n**After a Loss:**\n• Providing organized documentation\n• Offering exportable reports for adjusters\n• Showing pre-damage condition proof\n• Tracking claim progress\n\nMany insurance companies accept our verified documentation. Visit our [Claims page](/claims) to learn more.`
  },
  document: {
    keywords: ['document first', 'start', 'begin', 'where to start', 'what to document', 'getting started', 'first steps'],
    response: `Here's the recommended order for documenting your home:\n\n**Start with High-Value Items:**\n1. Electronics (TVs, computers, appliances)\n2. Jewelry and collectibles\n3. Furniture and art\n\n**Then Document by Room:**\n1. Living areas - wide shots + details\n2. Kitchen - appliances and contents\n3. Bedrooms - clothing, furniture\n4. Garage/storage - tools, equipment\n\n**Don't Forget:**\n• Serial numbers and model info\n• Receipts for major purchases\n• Outdoor items and landscaping\n\nUse our [Checklists](/checklists) for a complete guide!`
  },
  legacyLocker: {
    keywords: ['legacy locker', 'estate', 'inheritance', 'will', 'beneficiary', 'trusted', 'family', 'after death', 'passing'],
    response: `**Legacy Locker** is a secure vault for life's most important information:\n\n**What You Can Store:**\n• Account passwords and access codes\n• Insurance policy details\n• Attorney and advisor contacts\n• Final wishes and instructions\n• Personal messages to loved ones\n\n**Key Features:**\n• End-to-end encryption\n• Trusted delegate access\n• Recovery request system\n• Grace period protection\n\n**It's NOT:**\n• A replacement for legal documents\n• A way to bypass probate\n• Shared until you grant access\n\nLearn more on our [Legacy Locker page](/legacy-locker-info).`
  },
  security: {
    keywords: ['secure', 'security', 'privacy', 'encryption', 'safe', 'protected', 'data'],
    response: `Asset Safe uses enterprise-grade security:\n\n**Encryption:**\n• 256-bit AES encryption\n• Data encrypted in transit and at rest\n• Client-side encryption for Legacy Locker\n\n**Infrastructure:**\n• AWS cloud storage\n• SOC 2 compliant\n• GDPR ready\n• Regular security audits\n\n**Access Control:**\n• Two-factor authentication\n• Permission-based sharing\n• Audit logs for all access\n\nYour data is never sold or shared with third parties.`
  },
  howItWorks: {
    keywords: ['how does it work', 'how it works', 'what is', 'explain', 'overview', 'about'],
    response: `**Asset Safe** is a digital documentation platform for protecting what matters:\n\n**1. Document**\nUpload photos, videos, and documents of your property and belongings. Add details like purchase info, serial numbers, and values.\n\n**2. Organize**\nArrange items by property, room, or category. Use folders and tags for easy retrieval.\n\n**3. Protect**\nAll content is securely stored in the cloud with encryption. Set up Legacy Locker for estate planning.\n\n**4. Access Anytime**\nRetrieve your documentation for insurance claims, estate planning, or property sales from any device.\n\nVisit our [Features page](/features) to learn more!`
  },
  photos: {
    keywords: ['photo', 'video', 'upload', 'picture', 'image', 'camera', 'take photos'],
    response: `**Tips for Documenting with Photos:**\n\n**Best Practices:**\n• Take wide shots of each room\n• Capture close-ups of valuable items\n• Include serial numbers and labels\n• Document inside cabinets and closets\n• Use good lighting\n\n**What to Include:**\n• Brand and model visible\n• Condition details\n• Any damage or wear\n• Original packaging if available\n\nCheck our [Photography Guide](/photography-guide) for detailed tips!`
  },
  professional: {
    keywords: ['professional', 'service', 'specialist', 'expert', 'hire', 'schedule'],
    response: `We offer **Professional Documentation Services** for comprehensive home inventories:\n\n**What's Included:**\n• On-site documentation by trained specialists\n• High-quality photos and video\n• Detailed inventory creation\n• Third-party verification\n\n**Best For:**\n• High-value homes\n• Extensive collections\n• Estate preparation\n• Insurance requirements\n\n[Schedule a Professional](/schedule-professional) to get started.`
  }
};

const AskAssetSafe: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: WELCOME_MESSAGE,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasFollowedUp, setHasFollowedUp] = useState(false);
  const location = useLocation();

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3-minute inactivity follow-up
  useEffect(() => {
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Only set timer if chat is open, has user messages, and hasn't followed up yet
    const hasUserMessages = messages.some(m => m.sender === 'user');
    const lastMessage = messages[messages.length - 1];
    const lastWasBot = lastMessage?.sender === 'bot';

    if (isOpen && hasUserMessages && lastWasBot && !hasFollowedUp) {
      inactivityTimerRef.current = setTimeout(() => {
        const followUpMessage: Message = {
          id: messages.length + 1,
          text: "If you'd like, I can help you with the next step.",
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, followUpMessage]);
        setHasFollowedUp(true);
      }, 3 * 60 * 1000); // 3 minutes
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [messages, isOpen, hasFollowedUp]);

  // Hide quick prompts after first user message
  useEffect(() => {
    if (messages.length > 1 && messages.some(m => m.sender === 'user')) {
      setShowQuickPrompts(false);
    }
  }, [messages]);

  const generateResponse = (userInput: string): string => {
    const normalizedInput = userInput.toLowerCase();
    
    // Check knowledge base for matching topics
    for (const [key, topic] of Object.entries(KNOWLEDGE_BASE)) {
      if (topic.keywords.some(keyword => normalizedInput.includes(keyword))) {
        return topic.response;
      }
    }
    
    // Search website content for relevant pages
    const searchResults = SearchService.search(userInput, 3);
    if (searchResults.length > 0) {
      const suggestions = searchResults.map(r => `• [${r.title}](${r.path}) - ${r.description}`).join('\n');
      return `I found some relevant pages that might help:\n\n${suggestions}\n\nIs there something specific about these topics you'd like to know?`;
    }
    
    // Context-aware responses based on current page
    if (location.pathname.includes('/pricing')) {
      return "I see you're looking at our pricing. Our Standard plan at $12.99/month is great for most homeowners. Need help choosing between plans?";
    }
    if (location.pathname.includes('/account')) {
      return "You're in your account dashboard. I can help you upload photos, manage properties, or navigate to any feature. What would you like to do?";
    }
    
    // Default response with helpful suggestions
    return "I'm not sure about that specific topic, but I can help with:\n\n• Choosing the right plan\n• Understanding insurance claims\n• Getting started with documentation\n• Learning about Legacy Locker\n• Security and privacy questions\n\nWhat would you like to know more about?";
  };

  const handleSend = (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Generate response after a short delay
    setTimeout(() => {
      const botResponse = generateResponse(textToSend);
      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  // Render markdown-style links
  const renderMessageText = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      // Add the link
      parts.push(
        <Link 
          key={match.index} 
          to={match[2]} 
          className="text-brand-blue underline hover:text-brand-lightBlue"
          onClick={() => setIsOpen(false)}
        >
          {match[1]}
        </Link>
      );
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Collapsed state - just show the floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-brand-blue hover:bg-brand-lightBlue text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
        aria-label="Ask Asset Safe"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask Asset Safe
        </span>
      </button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="bg-brand-blue text-white rounded-lg shadow-lg overflow-hidden cursor-pointer" onClick={() => setIsMinimized(false)}>
          <div className="flex items-center justify-between p-3 gap-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium text-sm">Ask Asset Safe</span>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Full chat interface
  return (
    <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)]">
      <Card className="border border-gray-200 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-brand-blue p-3 flex items-center justify-between">
          <div className="flex items-center text-white">
            <MessageCircle className="w-5 h-5 mr-2" />
            <h3 className="font-medium text-sm">Ask Asset Safe</h3>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(true)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="h-80 overflow-y-auto p-3 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  message.sender === 'user'
                    ? 'bg-brand-blue text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {message.sender === 'bot' 
                    ? renderMessageText(message.text.replace(/\*\*([^*]+)\*\*/g, '$1'))
                    : message.text
                  }
                </div>
              </div>
            </div>
          ))}
          
          {/* Quick Prompts */}
          {showQuickPrompts && messages.length === 1 && (
            <div className="mt-3 space-y-2">
              {QUICK_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-brand-blue/5 hover:border-brand-blue transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          
          {isTyping && (
            <div className="flex justify-start mb-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[85%]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 text-sm"
            />
            <Button 
              onClick={() => handleSend()} 
              disabled={!input.trim()}
              size="sm"
              className="bg-brand-blue hover:bg-brand-lightBlue"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AskAssetSafe;
