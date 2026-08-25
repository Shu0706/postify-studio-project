import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { serviceService } from '../../services/serviceService';

const ClientProjects = () => {
  const [projects, setProjects] = useState([]);
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

  // Fetch projects from API (show only real user projects, not demo data)
  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      setLoading(true);
      try {
        const res = await serviceService.getMyProjects();

        // Normalize various possible response shapes
        const normalized = (function normalize(r) {
          if (!r) return [];
          if (Array.isArray(r)) return r;
          if (r.data && Array.isArray(r.data.projects)) return r.data.projects;
          if (Array.isArray(r.projects)) return r.projects;
          if (Array.isArray(r.data)) return r.data;
          if (r.data && Array.isArray(r.data)) return r.data;
          return [];
        })(res);

        if (mounted) {
          setProjects(normalized);
        }
      } catch (err) {
        console.error('Failed to load user projects:', err);
        if (mounted) setProjects([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProjects();

    return () => { mounted = false; };
  }, []);

  // Filter projects based on status
  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status.toLowerCase().replace(' ', '-') === filter;
  });

  // Search projects
  const searchedProjects = filteredProjects.filter(project => {
    return project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           project.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'On Hold':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Projects</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Track the progress of your projects and collaborate with our team.
        </p>
      </div>

      {/* Filters and Search */}
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
              All Projects
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'in-progress'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'completed'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('review')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'review'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Review
            </button>
          </div>
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading projects...</p>
        </div>
      ) : searchedProjects.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <svg className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600 dark:text-gray-300">No projects found. Try changing your filters.</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {searchedProjects.map((project) => (
            <motion.div 
              key={project._id || project.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow p-4 flex items-center justify-between"
              variants={itemVariants}
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{project.name || project.title || 'Untitled Project'}</h3>
              </div>
              <div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(project.status || project.state || 'unknown')}`}>
                  {project.status || project.state || 'Unknown'}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ClientProjects;
