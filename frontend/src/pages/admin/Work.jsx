import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Mock data for work submissions
const MOCK_SUBMISSIONS = [
  { 
    id: 1, 
    taskId: 4,
    taskTitle: 'SEO Performance Optimization', 
    client: 'SkyTravel Adventures',
    submittedBy: {
      id: 4,
      name: 'Sarah Williams',
      position: 'SEO Specialist'
    },
    submittedAt: '2025-06-26T14:35:00',
    status: 'Pending Review',
    attachments: [
      { name: 'SEO_Audit_Report.pdf', type: 'pdf', size: '2.4 MB' },
      { name: 'Keyword_Analysis.xlsx', type: 'excel', size: '1.8 MB' }
    ],
    comments: [
      {
        author: 'Sarah Williams',
        role: 'Employee',
        text: 'I\'ve completed the SEO audit and implemented initial on-page optimizations. The attached report details all findings and recommendations for further improvements.',
        timestamp: '2025-06-26T14:35:00'
      }
    ]
  },
  { 
    id: 2, 
    taskId: 7,
    taskTitle: 'Product Photography for New Collection', 
    client: 'SportyGear',
    submittedBy: {
      id: 9,
      name: 'Robert Taylor',
      position: 'Motion Designer'
    },
    submittedAt: '2025-06-25T11:20:00',
    status: 'Pending Review',
    attachments: [
      { name: 'Product_Photos_Final.zip', type: 'zip', size: '245.6 MB' },
      { name: 'Photo_Editing_Notes.pdf', type: 'pdf', size: '1.2 MB' }
    ],
    comments: [
      {
        author: 'Robert Taylor',
        role: 'Employee',
        text: 'Completed the product photography session for the new athletic shoe line. The zip file contains all edited photos in both high-res and web-optimized formats.',
        timestamp: '2025-06-25T11:20:00'
      }
    ]
  },
  { 
    id: 3, 
    taskId: 9,
    taskTitle: 'Business Cards and Stationery Design', 
    client: 'LegalEdge Associates',
    submittedBy: {
      id: 1,
      name: 'John Doe',
      position: 'Senior Graphic Designer'
    },
    submittedAt: '2025-06-24T16:45:00',
    status: 'Approved',
    attachments: [
      { name: 'Business_Cards_Final.pdf', type: 'pdf', size: '8.5 MB' },
      { name: 'Letterhead_Final.pdf', type: 'pdf', size: '3.2 MB' },
      { name: 'Envelope_Design.pdf', type: 'pdf', size: '2.8 MB' }
    ],
    comments: [
      {
        author: 'John Doe',
        role: 'Employee',
        text: 'Finalized business card and stationery designs based on the approved branding guidelines. All files are print-ready with crop marks and bleeds.',
        timestamp: '2025-06-24T16:45:00'
      },
      {
        author: 'Lisa Moore',
        role: 'Admin',
        text: 'Designs look excellent, the client has approved. Please proceed with sending the files to the printer.',
        timestamp: '2025-06-25T09:15:00'
      }
    ]
  },
  { 
    id: 4, 
    taskId: 6,
    taskTitle: 'Monthly Newsletter Design', 
    client: 'BookLovers Club',
    submittedBy: {
      id: 11,
      name: 'Thomas Martin',
      position: 'Illustrator'
    },
    submittedAt: '2025-06-23T10:10:00',
    status: 'Revisions Requested',
    attachments: [
      { name: 'Newsletter_Draft_v1.pdf', type: 'pdf', size: '5.2 MB' },
      { name: 'Custom_Illustrations.ai', type: 'illustrator', size: '18.7 MB' }
    ],
    comments: [
      {
        author: 'Thomas Martin',
        role: 'Employee',
        text: 'First draft of the monthly newsletter with custom illustrations for the featured books section.',
        timestamp: '2025-06-23T10:10:00'
      },
      {
        author: 'Lisa Moore',
        role: 'Admin',
        text: 'The illustrations look great, but we need to adjust the color scheme to better match the client\'s branding. Also, please add more whitespace around the text sections for better readability.',
        timestamp: '2025-06-24T14:30:00'
      }
    ]
  },
  { 
    id: 5, 
    taskId: 2,
    taskTitle: 'Summer Collection Social Media Campaign', 
    client: 'FashionHub',
    submittedBy: {
      id: 6,
      name: 'Emily Davis',
      position: 'Social Media Manager'
    },
    submittedAt: '2025-06-22T15:55:00',
    status: 'Approved',
    attachments: [
      { name: 'Social_Media_Calendar.xlsx', type: 'excel', size: '1.9 MB' },
      { name: 'Content_Package.zip', type: 'zip', size: '125.3 MB' }
    ],
    comments: [
      {
        author: 'Emily Davis',
        role: 'Employee',
        text: 'Completed social media campaign plan with content calendar and all creative assets for Instagram and TikTok.',
        timestamp: '2025-06-22T15:55:00'
      },
      {
        author: 'Jane Smith',
        role: 'Employee',
        text: 'I\'ve added the copy for all posts in the content calendar. Everything is ready to launch according to the schedule.',
        timestamp: '2025-06-23T09:20:00'
      },
      {
        author: 'Lisa Moore',
        role: 'Admin',
        text: 'Campaign looks fantastic! The client has approved and is excited about the launch. Great work team!',
        timestamp: '2025-06-24T11:05:00'
      }
    ]
  }
];

const AdminWork = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewComment, setReviewComment] = useState('');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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

  // Simulate fetching data
  useEffect(() => {
    // This would be an API call in a real application
    setTimeout(() => {
      setSubmissions(MOCK_SUBMISSIONS);
      setFilteredSubmissions(MOCK_SUBMISSIONS);
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter submissions based on status and search
  useEffect(() => {
    let result = [...submissions];
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(sub => {
        if (filter === 'pending') return sub.status === 'Pending Review';
        if (filter === 'approved') return sub.status === 'Approved';
        if (filter === 'revisions') return sub.status === 'Revisions Requested';
        return true;
      });
    }
    
    // Apply search
    if (search) {
      const searchTerm = search.toLowerCase();
      result = result.filter(sub => 
        sub.taskTitle.toLowerCase().includes(searchTerm) ||
        sub.client.toLowerCase().includes(searchTerm) ||
        sub.submittedBy.name.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredSubmissions(result);
  }, [filter, search, submissions]);

  // Handle submission review
  const handleReviewSubmission = (status) => {
    if (!selectedSubmission) return;
    
    // This would be an API call in a real application
    const now = new Date().toISOString();
    const updatedSubmissions = submissions.map(sub => {
      if (sub.id === selectedSubmission.id) {
        // Add admin comment if provided
        const updatedComments = reviewComment.trim() 
          ? [...sub.comments, {
              author: 'Lisa Moore', // In a real app, this would be the current admin user
              role: 'Admin',
              text: reviewComment.trim(),
              timestamp: now
            }]
          : sub.comments;
        
        return {
          ...sub,
          status,
          comments: updatedComments
        };
      }
      return sub;
    });
    
    setSubmissions(updatedSubmissions);
    setSelectedSubmission({
      ...selectedSubmission,
      status,
      comments: reviewComment.trim() 
        ? [...selectedSubmission.comments, {
            author: 'Lisa Moore', // In a real app, this would be the current admin user
            role: 'Admin',
            text: reviewComment.trim(),
            timestamp: now
          }]
        : selectedSubmission.comments
    });
    setReviewComment('');
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to determine status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Revisions Requested':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Function to determine file icon based on type
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return (
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'excel':
        return (
          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'zip':
        return (
          <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
      case 'illustrator':
        return (
          <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Work Review
        </h1>
      </div>

      {/* Stats cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {submissions.length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              <span className="font-medium">+3</span> this week
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {submissions.filter(sub => sub.status === 'Pending Review').length}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              Needs attention
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {submissions.filter(sub => sub.status === 'Approved').length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              Ready for delivery
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission list */}
        <div className="lg:col-span-1">
          {/* Filters and search */}
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Work
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filter === 'pending'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filter === 'approved'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter('revisions')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filter === 'revisions'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Revisions
              </button>
            </div>
            <div>
              <input
                type="text"
                placeholder="Search submissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-[calc(100vh-320px)] overflow-y-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-300">No submissions found.</p>
              </div>
            ) : (
              <div>
                {filteredSubmissions.map((submission) => (
                  <motion.div 
                    key={submission.id}
                    variants={itemVariants}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedSubmission?.id === submission.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{submission.taskTitle}</h3>
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusBadgeColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {submission.client} • Submitted by {submission.submittedBy.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(submission.submittedAt)} • {submission.attachments.length} attachment(s)
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Submission details */}
        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-[calc(100vh-240px)] overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedSubmission.taskTitle}
                    </h2>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Client: {selectedSubmission.client}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Submitted by: {selectedSubmission.submittedBy.name} ({selectedSubmission.submittedBy.position})
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Submitted on: {formatDate(selectedSubmission.submittedAt)}
                    </div>
                  </div>
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedSubmission.status)}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
              </div>

              {/* Attachments */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Attachments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSubmission.attachments.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {getFileIcon(file.type)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{file.size}</div>
                      </div>
                      <button className="ml-auto text-primary hover:text-blue-700">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments and discussion */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Comments & Feedback
                </h3>
                <div className="space-y-4 mb-4">
                  {selectedSubmission.comments.map((comment, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 mr-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          comment.role === 'Admin' 
                            ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300' 
                            : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                        }`}>
                          {comment.author.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">{comment.author}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            comment.role === 'Admin' 
                              ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300' 
                              : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                          }`}>
                            {comment.role}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                            {formatDate(comment.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          {comment.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add Your Feedback
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                    placeholder="Enter your feedback or comments..."
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-6 flex justify-end space-x-3">
                {selectedSubmission.status === 'Pending Review' && (
                  <>
                    <button
                      onClick={() => handleReviewSubmission('Revisions Requested')}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                    >
                      Request Revisions
                    </button>
                    <button
                      onClick={() => handleReviewSubmission('Approved')}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                  </>
                )}
                {selectedSubmission.status === 'Revisions Requested' && (
                  <button
                    onClick={() => handleReviewSubmission('Approved')}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Approve
                  </button>
                )}
                {selectedSubmission.status === 'Approved' && (
                  <button
                    onClick={() => handleReviewSubmission('Revisions Requested')}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    Request Revisions
                  </button>
                )}
                <button
                  onClick={() => {
                    // Handle send to client action
                    // This would be an API call in a real application
                    alert('Sending to client would happen here');
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Send to Client
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex flex-col items-center justify-center h-[calc(100vh-240px)]">
              <svg className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Select a submission to review</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                Click on any submission from the list to view details, download attachments, and provide feedback or approval.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWork;
