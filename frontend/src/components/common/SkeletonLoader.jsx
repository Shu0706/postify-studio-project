import React from 'react';

/**
 * Skeleton loader component for content placeholders during loading
 * @param {object} props - Component props
 * @param {string} props.type - Type of skeleton (card, list, table, text)
 * @param {number} props.count - Number of skeleton items to display
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.height - Height of the skeleton
 * @param {string} props.width - Width of the skeleton
 */
const SkeletonLoader = ({ 
  type = 'card', 
  count = 1, 
  className = '', 
  height, 
  width 
}) => {
  const getSkeletonStyle = () => {
    const style = {};
    if (height) style.height = height;
    if (width) style.width = width;
    return style;
  };

  const renderSkeleton = (type, index) => {
    switch (type) {
      case 'card':
        return (
          <div 
            key={index}
            className={`bg-gray-200 rounded-md animate-pulse ${className}`}
            style={getSkeletonStyle()}
          >
            <div className="h-40 bg-gray-300 rounded-t-md"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-8 bg-gray-300 rounded w-1/3 mt-4"></div>
            </div>
          </div>
        );
        
      case 'list':
        return (
          <div 
            key={index}
            className={`bg-gray-200 rounded-md p-4 mb-2 animate-pulse ${className}`}
            style={getSkeletonStyle()}
          >
            <div className="flex">
              <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
              <div className="ml-4 flex-grow">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="h-6 w-6 bg-gray-300 rounded"></div>
            </div>
          </div>
        );
        
      case 'table':
        return (
          <div 
            key={index}
            className={`bg-gray-200 rounded-md animate-pulse ${className}`}
            style={getSkeletonStyle()}
          >
            <div className="h-10 bg-gray-300 rounded-t-md mb-2"></div>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 mb-1 flex">
                <div className="h-full w-1/6 bg-gray-300 mr-1"></div>
                <div className="h-full w-2/6 bg-gray-300 mr-1"></div>
                <div className="h-full w-2/6 bg-gray-300 mr-1"></div>
                <div className="h-full w-1/6 bg-gray-300"></div>
              </div>
            ))}
          </div>
        );
        
      case 'text':
      default:
        return (
          <div 
            key={index}
            className={`animate-pulse ${className}`}
            style={getSkeletonStyle()}
          >
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/6"></div>
          </div>
        );
    }
  };

  return (
    <>
      {Array(count).fill(0).map((_, index) => renderSkeleton(type, index))}
    </>
  );
};

export default SkeletonLoader;
