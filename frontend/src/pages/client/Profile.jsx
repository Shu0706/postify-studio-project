import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const ClientProfile = () => {
  const { currentUser, updateProfile } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    bio: '',
    avatar: '',
    website: '',
    socialMedia: {
      twitter: '',
      linkedin: '',
      instagram: ''
    },
    notifications: {
      email: true,
      sms: false,
      projectUpdates: true,
      promotions: false
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  // Simulate fetching profile data
  useEffect(() => {
    // This would be an API call in a real application
    setTimeout(() => {
      setProfileData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        company: '',
        phone: '',
        address: '',
        bio: '',
        avatar: '',
        website: '',
        socialMedia: {
          twitter: '',
          linkedin: '',
          instagram: ''
        },
        notifications: {
          email: true,
          sms: false,
          projectUpdates: true,
          promotions: false
        }
      });
      setLoading(false);
    }, 1000);
  }, [currentUser]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const [parent, child] = name.split('.');
    
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: checked
      }
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (profileData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(profileData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSaving(true);
      
      // Simulate API call to update profile
      setTimeout(() => {
        // This would be an API call in a real application
        updateProfile({
          name: profileData.name,
          email: profileData.email
        });
        
        setSaving(false);
        setSuccessMessage('Profile updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }, 1500);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'profile'
                  ? 'border-primary text-primary dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Information
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'security'
                  ? 'border-primary text-primary dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'notifications'
                  ? 'border-primary text-primary dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'billing'
                  ? 'border-primary text-primary dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('billing')}
            >
              Billing
            </button>
          </nav>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mx-6 mt-6 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-md">
            <p className="text-sm flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {successMessage}
            </p>
          </div>
        )}

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <motion.div 
            className="p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Upload */}
                <div className="md:w-1/3 flex flex-col items-center">
                  <div className="mb-4">
                    <img
                      src={profileData.avatar || 'https://via.placeholder.com/150'}
                      alt="Profile"
                      className="h-32 w-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      id="avatar"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <label
                      htmlFor="avatar"
                      className="btn-primary py-2 px-4 text-sm flex items-center cursor-pointer"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Change Photo
                    </label>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="md:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border ${
                          errors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'
                        } bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border ${
                          errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'
                        } bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={profileData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md border ${
                          errors.phone ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'
                        } bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows="3"
                      value={profileData.bio}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={profileData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Social Media
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-20 text-sm text-gray-500 dark:text-gray-400">Twitter</span>
                        <input
                          type="text"
                          name="socialMedia.twitter"
                          value={profileData.socialMedia.twitter}
                          onChange={handleChange}
                          className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="@username"
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 text-sm text-gray-500 dark:text-gray-400">LinkedIn</span>
                        <input
                          type="text"
                          name="socialMedia.linkedin"
                          value={profileData.socialMedia.linkedin}
                          onChange={handleChange}
                          className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="username"
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 text-sm text-gray-500 dark:text-gray-400">Instagram</span>
                        <input
                          type="text"
                          name="socialMedia.instagram"
                          value={profileData.socialMedia.instagram}
                          onChange={handleChange}
                          className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary px-6 py-2 flex items-center"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div 
            className="p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Change Password
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="pt-2">
                  <button className="btn-primary px-6 py-2">
                    Update Password
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Two-Factor Authentication
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              <button className="btn-primary px-6 py-2">
                Enable 2FA
              </button>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
                Danger Zone
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
                Delete Account
              </button>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div 
            className="p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Notification Preferences
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Manage how and when you receive notifications from Postify Studio.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Communication Channels
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="notifications.email"
                      name="notifications.email"
                      checked={profileData.notifications.email}
                      onChange={handleCheckboxChange}
                      className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <div className="ml-3">
                      <label htmlFor="notifications.email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Notifications
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Receive notifications via email.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="notifications.sms"
                      name="notifications.sms"
                      checked={profileData.notifications.sms}
                      onChange={handleCheckboxChange}
                      className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <div className="ml-3">
                      <label htmlFor="notifications.sms" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        SMS Notifications
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Receive notifications via text message.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Notification Types
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="notifications.projectUpdates"
                      name="notifications.projectUpdates"
                      checked={profileData.notifications.projectUpdates}
                      onChange={handleCheckboxChange}
                      className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <div className="ml-3">
                      <label htmlFor="notifications.projectUpdates" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Project Updates
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Receive notifications about project status changes, new deliverables, and feedback requests.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="notifications.promotions"
                      name="notifications.promotions"
                      checked={profileData.notifications.promotions}
                      onChange={handleCheckboxChange}
                      className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <div className="ml-3">
                      <label htmlFor="notifications.promotions" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Promotions and Offers
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Receive updates about new services, special offers, and promotional content.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button className="btn-primary px-6 py-2">
                  Save Preferences
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <motion.div 
            className="p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Billing Information
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Manage your payment methods and view your billing history.
            </p>

            <div className="mb-8">
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
                Payment Methods
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Visa ending in 4242
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Expires 12/2025
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                      Edit
                    </button>
                    <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              <button className="text-sm flex items-center text-primary hover:text-blue-700">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Payment Method
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
                Billing Address
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {profileData.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {profileData.company}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {profileData.address}
                </p>
                <div className="mt-2">
                  <button className="text-sm text-primary hover:text-blue-700">
                    Edit Address
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
                Billing History
              </h3>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        INV-2025-0142
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        June 29, 2025
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        $1,200.00
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-primary hover:text-blue-700">
                          View
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        INV-2025-0138
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        June 15, 2025
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        $1,200.00
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-primary hover:text-blue-700">
                          View
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        INV-2025-0129
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        May 30, 2025
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        $800.00
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-primary hover:text-blue-700">
                          View
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;
