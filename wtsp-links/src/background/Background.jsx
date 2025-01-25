import React from 'react';

const Background = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white">
      {/* Add some shadow to make the content stand out */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Background;
