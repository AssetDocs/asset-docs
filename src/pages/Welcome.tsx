
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Video } from 'lucide-react';

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-brand-blue mb-8">
            Welcome to Asset Docs
          </h1>
          
          <p className="text-lg text-gray-700 text-center mb-10">
            Your digital safety net for property and asset documentation
          </p>
          
          <div className="mt-12 text-center">
            <p className="text-lg mb-6">
              Ready to secure your property documentation?
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-lightBlue">
                <Link to="/signup">Start Your Free Trial</Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="border-brand-blue text-brand-blue">
                <Link to="/features">Learn More About Features</Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="border-green-500 text-green-500">
                <Link to="/video-help">
                  <Video className="h-4 w-4 mr-2" />
                  Watch Video Tutorials
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Welcome;
