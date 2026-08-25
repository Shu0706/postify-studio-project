import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ClientDownloads = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  // Simulate fetching files
  useEffect(() => {
    // This would be an API call in a real application
    setTimeout(() => {
      setFiles([
        {
          id: 1,
          name: 'Website_Mockup_Final.pdf',
          description: 'Final website design mockup with all pages',
          projectName: 'Website Redesign',
          size: '12.5 MB',
          type: 'pdf',
          uploadedBy: 'Sarah Johnson',
          uploadDate: '2025-06-18',
          category: 'design'
        },
        {
          id: 2,
          name: 'Content_Strategy_Q3.docx',
          description: 'Content strategy document for Q3 marketing campaigns',
          projectName: 'Content Marketing Strategy',
          size: '2.8 MB',
          type: 'document',
          uploadedBy: 'Michael Chen',
          uploadDate: '2025-06-20',
          category: 'document'
        },
        {
          id: 3,
          name: 'Logo_Files_Package.zip',
          description: 'Complete logo package with different formats and variations',
          projectName: 'Brand Identity Development',
          size: '45.3 MB',
          type: 'archive',
          uploadedBy: 'Emma Wilson',
          uploadDate: '2025-06-15',
          category: 'design'
        },
        {
          id: 4,
          name: 'SEO_Audit_Report.pdf',
          description: 'Comprehensive SEO audit report with recommendations',
          projectName: 'SEO Optimization',
          size: '8.2 MB',
          type: 'pdf',
          uploadedBy: 'Alex Thompson',
          uploadDate: '2025-06-21',
          category: 'report'
        },
        {
          id: 5,
          name: 'Social_Media_Calendar_July.xlsx',
          description: 'Social media content calendar for July campaigns',
          projectName: 'Social Media Campaign',
          size: '3.6 MB',
          type: 'spreadsheet',
          uploadedBy: 'Jessica Williams',
          uploadDate: '2025-06-25',
          category: 'document'
        },
        {
          id: 6,
          name: 'E-commerce_Integration_Guide.pdf',
          description: 'Technical documentation for e-commerce platform integration',
          projectName: 'E-commerce Integration',
          size: '5.4 MB',
          type: 'pdf',
          uploadedBy: 'David Lee',
          uploadDate: '2025-06-10',
          category: 'report'
        },
        {
          id: 7,
          name: 'Website_Analytics_June.pdf',
          description: 'Monthly analytics report for June website performance',
          projectName: 'Website Redesign',
          size: '4.1 MB',
          type: 'pdf',
          uploadedBy: 'Michael Chen',
          uploadDate: '2025-06-30',
          category: 'report'
        },
        {
          id: 8,
          name: 'Brand_Guidelines_v2.pdf',
          description: 'Updated brand guidelines with new color palette and typography',
          projectName: 'Brand Identity Development',
          size: '15.8 MB',
          type: 'pdf',
          uploadedBy: 'Emma Wilson',
          uploadDate: '2025-06-22',
          category: 'design'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter files based on category
  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true;
    return file.category === filter;
  });

  // Search files
  const searchedFiles = filteredFiles.filter(file => {
    return file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           file.projectName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get file icon based on type
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'document':
        return (
          <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'spreadsheet':
        return (
          <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
          </svg>
        );
      case 'archive':
        return (
          <svg className="h-8 w-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
            <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Downloads</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Access and download project files and documents.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Files
            </button>
            <button
              onClick={() => setFilter('design')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'design'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Design Files
            </button>
            <button
              onClick={() => setFilter('document')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'document'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setFilter('report')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'report'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Reports
            </button>
          </div>
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Files List */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading files...</p>
        </div>
      ) : searchedFiles.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <svg className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-300">No files found. Try changing your filters.</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {searchedFiles.map((file) => (
            <motion.div 
              key={file.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              variants={itemVariants}
            >
              <div className="p-6">
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{file.description}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Project: {file.projectName}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Uploaded: {file.uploadDate}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    By: {file.uploadedBy}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{file.size}</span>
                    <button className="btn-primary py-2 px-4 text-sm flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ClientDownloads;
