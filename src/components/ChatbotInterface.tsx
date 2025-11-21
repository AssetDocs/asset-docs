
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageCircle, Send } from 'lucide-react';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

const ChatbotInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm the AssetSafe AI assistant. How can I help you with property documentation or asset valuation today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response after a short delay
    setTimeout(() => {
      const botResponse = generateBotResponse(input);
      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const normalizedInput = userInput.toLowerCase();
    
    // Simple response logic based on keywords
    if (normalizedInput.includes('pricing') || normalizedInput.includes('cost') || normalizedInput.includes('price')) {
      return "AssetSafe offers two pricing tiers: our Standard (Homeowner) plan at $12.99/month for up to 3 properties with 25GB storage, and our Premium (Professional) plan at $18.99/month for unlimited properties with 100GB storage. Both plans include a 30-day free trial and comprehensive asset documentation features. You can view all pricing details on our Pricing page.";
    }
    
    if (normalizedInput.includes('value') || normalizedInput.includes('valuation')) {
      return "You can document your items with photos and manually input values or upload professional appraisals. This creates a comprehensive inventory for insurance and planning purposes.";
    }
    
    if (normalizedInput.includes('secure') || normalizedInput.includes('security') || normalizedInput.includes('privacy')) {
      return "Security is our top priority at AssetSafe. We use enterprise-grade encryption, secure cloud storage, and strict access controls to protect your data. All information is encrypted both in transit and at rest. We never share your data with third parties without your explicit consent.";
    }
    
    if (normalizedInput.includes('insurance') || normalizedInput.includes('claim')) {
      return "AssetSafe documentation is designed specifically to expedite insurance claims. Our detailed reports include proof of ownership, condition documentation, and value assessments. Many insurance companies accept our third-party verified documentation as valid evidence for claims processing.";
    }
    
    if (normalizedInput.includes('receipt') || normalizedInput.includes('purchase')) {
      return "Our receipt integration feature allows you to upload receipts and automatically match them with items in your inventory. The AI recognizes product information from receipts and links them to corresponding items, creating a comprehensive record with both visual documentation and proof of purchase.";
    }
    
    if (normalizedInput.includes('free') || normalizedInput.includes('trial')) {
      return "Yes! We offer a 14-day free trial. This gives you full access to all features so you can experience the benefits of AssetSafe before committing to a subscription.";
    }
    
    if (normalizedInput.includes('how') && normalizedInput.includes('work')) {
      return "AssetSafe works by allowing you to document your assets through photos, videos, or 3D virtual tours. Our AI technology identifies items, categorizes them, and assigns market values. You can organize items by location, category, or custom tags. All documentation is securely stored in the cloud and accessible whenever you need it.";
    }
    
    if (normalizedInput.includes('professional') || normalizedInput.includes('service')) {
      return "For high-value assets or complete home documentation, we offer professional documentation services. Our trained specialists will visit your location and create comprehensive documentation including detailed photos, videos, and 3D virtual tours with professional equipment. This service includes third-party verification for insurance and legal purposes.";
    }
    
    if (normalizedInput.includes('hello') || normalizedInput.includes('hi') || normalizedInput.includes('hey')) {
      return "Hello! How can I help you with property documentation or asset valuation today?";
    }
    
    // Default response
    return "I don't have specific information about that. Could you try phrasing your question differently? I'm happy to help with questions about our asset documentation, security features, or subscription plans.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Card className="border border-gray-200 rounded-lg shadow-md overflow-hidden">
      <div className="bg-brand-blue p-4">
        <div className="flex items-center text-white">
          <MessageCircle className="w-6 h-6 mr-2" />
          <h3 className="font-medium">AssetSafe Assistant</h3>
        </div>
      </div>
      
      <div className="h-96 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-brand-blue text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <p>{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
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
      
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask me anything about AssetSafe..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim()}
            className="bg-brand-blue hover:bg-brand-lightBlue"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatbotInterface;
