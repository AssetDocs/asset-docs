import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: 'storage-alert',
    title: 'Welcome to Your Dashboard!',
    content: 'This shows your current storage usage. Keep track of how much space you have left.',
    position: 'bottom'
  },
  {
    target: 'account-header',
    title: 'Account Overview',
    content: 'Here you can see your account details and quick actions like generating QR codes.',
    position: 'bottom'
  },
  {
    target: 'tabs-content',
    title: 'Navigate Your Features',
    content: 'Use these tabs to access different sections: Overview, Floor Plans, Asset Values, and more.',
    position: 'top'
  },
  {
    target: 'app-downloads',
    title: 'Mobile Apps',
    content: 'Download our mobile apps to manage your assets on the go!',
    position: 'bottom'
  }
];

interface DashboardTourProps {
  isVisible: boolean;
  onClose: () => void;
}

const DashboardTour: React.FC<DashboardTourProps> = ({ isVisible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tourPosition, setTourPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      const targetElement = document.getElementById(tourSteps[currentStep].target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const position = tourSteps[currentStep].position;
        
        let top = 0;
        let left = 0;

        switch (position) {
          case 'bottom':
            top = rect.bottom + window.scrollY + 10;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'top':
            top = rect.top + window.scrollY - 10;
            left = rect.left + window.scrollX + rect.width / 2;
            break;
          case 'right':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.right + window.scrollX + 10;
            break;
          case 'left':
            top = rect.top + window.scrollY + rect.height / 2;
            left = rect.left + window.scrollX - 10;
            break;
        }

        setTourPosition({ top, left });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, isVisible]);

  if (!isVisible) return null;

  const currentTourStep = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  const nextStep = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Tour tooltip */}
      <div 
        className="fixed z-50 bg-white rounded-lg shadow-xl p-6 max-w-sm transform -translate-x-1/2 -translate-y-full"
        style={{ 
          top: tourPosition.top, 
          left: tourPosition.left,
          ...(currentTourStep.position === 'top' && { transform: 'translateX(-50%) translateY(-100%)' }),
          ...(currentTourStep.position === 'bottom' && { transform: 'translateX(-50%)' }),
          ...(currentTourStep.position === 'left' && { transform: 'translateX(-100%) translateY(-50%)' }),
          ...(currentTourStep.position === 'right' && { transform: 'translateY(-50%)' })
        }}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{currentTourStep.title}</h3>
          <Button variant="ghost" size="sm" onClick={skipTour}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-gray-600 mb-4">{currentTourStep.content}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {currentStep + 1} of {tourSteps.length}
          </span>
          
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button variant="outline" size="sm" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            
            {isLastStep ? (
              <Button size="sm" onClick={skipTour} className="bg-brand-blue hover:bg-brand-blue/90">
                Finish Tour
              </Button>
            ) : (
              <Button size="sm" onClick={nextStep} className="bg-brand-blue hover:bg-brand-blue/90">
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
        
        <button 
          onClick={skipTour}
          className="text-sm text-gray-400 hover:text-gray-600 mt-2 block mx-auto"
        >
          Skip Tour
        </button>
      </div>
    </>
  );
};

export default DashboardTour;