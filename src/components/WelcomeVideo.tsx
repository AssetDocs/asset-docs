
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Camera, Shield, FileImage, Database, Check, BarChart } from 'lucide-react';

const WelcomeVideo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Animation sequence timing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 5000); // Each step shows for 5 seconds
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStep, isPlaying]);
  
  // Animation steps content
  const steps = [
    {
      title: "Welcome to AssetDocs",
      description: "Your digital safety net for property and asset documentation",
      icon: Shield,
      color: "text-brand-blue"
    },
    {
      title: "Document Your Assets",
      description: "Take photos of your possessions using our mobile app or upload existing images",
      icon: Camera,
      color: "text-brand-orange"
    },
    {
      title: "AI Recognition",
      description: "Our AI automatically identifies items in your photos and assigns estimated values",
      icon: Database,
      color: "text-green-500"
    },
    {
      title: "Store Receipts",
      description: "Link purchase receipts to your items for accurate valuation and proof of ownership",
      icon: FileImage,
      color: "text-purple-500"
    },
    {
      title: "Secure Storage",
      description: "All your documentation is securely stored with enterprise-grade encryption",
      icon: Shield,
      color: "text-brand-blue"
    },
    {
      title: "Generate Reports",
      description: "Create comprehensive reports for insurance claims, estate planning, or property sales",
      icon: BarChart,
      color: "text-indigo-500"
    },
    {
      title: "Get Started Today",
      description: "Your property documentation journey begins with a free 14-day trial",
      icon: Check,
      color: "text-brand-orange"
    }
  ];
  
  const handlePlayPause = () => {
    if (!isPlaying) {
      setCurrentStep(0); // Reset to beginning when started
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleSkip = (step: number) => {
    setCurrentStep(step);
    setIsPlaying(false);
  };
  
  // Progress percentage
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Video controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handlePlayPause} 
            size="sm"
            variant="outline"
            className="focus:outline-none"
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
        <div className="flex space-x-1">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSkip(index)}
              className={`w-3 h-3 rounded-full ${
                currentStep === index ? "bg-brand-blue" : "bg-gray-300"
              }`}
              aria-label={`Skip to step ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Animation container */}
      <div className="p-6 relative min-h-[450px] flex items-center justify-center">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-brand-blue transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Current step content */}
        <div 
          className={`text-center animate-fade-in max-w-2xl w-full p-6 ${
            isPlaying ? "animate-enter" : ""
          }`}
        >
          <div className="flex justify-center mb-8">
            {React.createElement(steps[currentStep].icon, {
              className: `w-24 h-24 ${steps[currentStep].color}`,
              strokeWidth: 1.5
            })}
          </div>
          
          <h2 className="text-3xl font-bold mb-6 text-brand-blue">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-xl text-gray-700">
            {steps[currentStep].description}
          </p>
          
          {/* Animation elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-blue opacity-5 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange opacity-5 rounded-full -ml-32 -mb-32" />
            
            {/* Animated elements */}
            <div className={`
              absolute transition-all duration-1000 
              ${currentStep === 1 ? "opacity-100 top-1/2 right-10" : "opacity-0 top-1/2 right-0"}
            `}>
              <Camera className="w-16 h-16 text-gray-300" />
            </div>
            
            <div className={`
              absolute transition-all duration-1000
              ${currentStep === 2 ? "opacity-100 bottom-20 left-1/4" : "opacity-0 bottom-0 left-1/4"}
            `}>
              <Database className="w-12 h-12 text-gray-300" />
            </div>
            
            <div className={`
              absolute transition-all duration-1000
              ${currentStep === 3 ? "opacity-100 top-20 left-1/4" : "opacity-0 top-0 left-1/4"}
            `}>
              <FileImage className="w-12 h-12 text-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeVideo;
