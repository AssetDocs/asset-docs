import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const OutsetaAuth: React.FC = () => {
  useEffect(() => {
    // Load Outseta script
    const script = document.createElement('script');
    script.src = 'https://cdn.outseta.com/outseta.min.js';
    script.setAttribute('data-options', JSON.stringify({
      domain: 'asset-docs.outseta.com',
      load: 'auth'
    }));
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-brand-blue hover:text-brand-blue/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <iframe
            src="https://asset-docs.outseta.com/auth?widgetMode=login#o-anonymous"
            style={{
              width: '100%',
              height: '500px',
              border: 'none',
              overflow: 'hidden'
            }}
            title="Outseta Sign In"
          />
        </div>
      </div>
    </div>
  );
};

export default OutsetaAuth;
