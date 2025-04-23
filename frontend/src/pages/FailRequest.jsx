import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/solid';

const FailRequest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { statusCode, message } = location.state || {
    statusCode: 500,
    message: 'An error occurred. Please try again later.'
  };

  const getErrorTitle = (code) => {
    switch (code) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 500:
        return 'Internal Server Error';
      case 503:
        return 'Service Unavailable';
      default:
        return 'Error';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center">
          {/* Error Icon */}
          <div className="mb-6">
            <XCircleIcon className="h-24 w-24 text-red-500" />
          </div>

          {/* Status Code */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-gray-800 mb-2">
              {statusCode}
            </h1>
            <h2 className="text-2xl font-semibold text-gray-600">
              {getErrorTitle(statusCode)}
            </h2>
          </div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <p className="text-gray-600 text-lg">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Comeback
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Back to Home
            </button>
          </div>

          {/* Technical Details (Optional) */}
          <div className="mt-8 w-full">
            <details className="cursor-pointer">
              <summary className="text-sm text-gray-600 hover:text-gray-800">
                Technical Details
              </summary>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm font-mono">
                <p>Status Code: {statusCode}</p>
                <p>Time: {new Date().toLocaleString()}</p>
                <p>Path: {location.pathname}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailRequest;
