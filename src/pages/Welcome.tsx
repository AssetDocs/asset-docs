
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Video } from 'lucide-react';

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          {/* Main prominent card */}
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border-4 border-brand-blue">
            <div className="mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-brand-blue mb-4">
                Account Created Successfully!
              </h1>
            </div>
            
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-yellow-800 mb-3">
                📧 Check Your Email Now
              </h2>
              <p className="text-lg text-yellow-900 mb-2">
                We've sent a verification email to your inbox.
              </p>
              <p className="text-base text-yellow-800">
                Please click the verification link to activate your account and complete your subscription setup.
              </p>
            </div>
            
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 font-semibold">
                <strong>💡 Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
              </p>
            </div>
            
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Welcome;
