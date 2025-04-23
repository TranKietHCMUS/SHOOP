import React from 'react';

const ProcessingRequest = ({ message }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Loading Animation */}
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute top-0 left-0 right-0 bottom-0">
              <div className="w-full h-full border-4 border-gray-200 rounded-full" />
              <div className="absolute inset-0">
                <div className="w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
            Processing request
          </h2>
          <p className="text-gray-600 text-center mb-4">
            {message}
          </p>
          <div className="text-sm text-gray-500 text-center">
            This process may take a few seconds...
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingRequest; 