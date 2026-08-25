import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-700 font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
