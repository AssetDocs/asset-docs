import { useEffect } from 'react';

const OutsetaProfile: React.FC = () => {
  useEffect(() => {
    // Redirect to Outseta profile page
    window.location.href = 'https://asset-docs.outseta.com/profile#o-authenticated';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-blue mx-auto mb-4"></div>
        <p className="text-brand-blue text-lg">Redirecting to your profile...</p>
      </div>
    </div>
  );
};

export default OutsetaProfile;
