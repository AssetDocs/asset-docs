import React from 'react';

const ScrollProgressCue: React.FC = () => {
  return (
    <div className="py-10 bg-gradient-to-r from-transparent via-gray-100 to-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4">
          <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-gray-300" />
          <p className="text-center text-gray-500 italic text-sm md:text-base">
            You're halfway through — here's why Asset Safe is different.
          </p>
          <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default ScrollProgressCue;
