import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  UserCircleIcon,
  LockClosedIcon,
  BellIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

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
  visible: { y: 0, opacity: 1 }
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Profile = () => {
  // Clean user data without hardcoded values
  const [userData, setUserData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: null,
    position: '',
    department: '',
    joinDate: '',
    skills: [],
    bio: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    workPreferences: {
      availability: '',
      remoteWork: '',
      workHours: ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      newAssignments: true,
      taskUpdates: true,
      projectChanges: true,
      companyAnnouncements: false
    },
    app: {
      newAssignments: true,
      taskUpdates: true,
      projectChanges: true,
      companyAnnouncements: true,
      chatMessages: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // Handle profile update
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile updated successfully!');
    }, 1500);
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password changed successfully!');
    }, 1500);
  };

  // Handle notification settings update
  const handleNotificationUpdate = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Notification preferences updated!');
    }, 1000);
  };

  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={itemVariants}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </motion.div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Profile preview" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-24 w-24 text-gray-400" />
                )}
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute inset-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="text-white text-sm font-medium">Change</span>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {userData.position} • {userData.department}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {userData.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="md:ml-auto">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Employee ID</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{userData.id}</span>
                  <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Joined</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{userData.joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex border-b border-gray-200 dark:border-gray-700">
              <Tab
                className={({ selected }) =>
                  classNames(
                    'py-4 px-6 text-sm font-medium focus:outline-none',
                    selected
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )
                }
              >
                <div className="flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  <span>Personal Info</span>
                </div>
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'py-4 px-6 text-sm font-medium focus:outline-none',
                    selected
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )
                }
              >
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  <span>Work Details</span>
                </div>
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'py-4 px-6 text-sm font-medium focus:outline-none',
                    selected
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )
                }
              >
                <div className="flex items-center">
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  <span>Security</span>
                </div>
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'py-4 px-6 text-sm font-medium focus:outline-none',
                    selected
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )
                }
              >
                <div className="flex items-center">
                  <BellIcon className="h-5 w-5 mr-2" />
                  <span>Notifications</span>
                </div>
              </Tab>
            </Tab.List>
            <Tab.Panels className="p-6">
              {/* Personal Info Panel */}
              <Tab.Panel>
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={userData.firstName}
                        onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={userData.lastName}
                        onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        rows={4}
                        value={userData.bio}
                        onChange={(e) => setUserData({...userData, bio: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Brief description about yourself for your team and clients.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Address
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Street Address
                          </label>
                          <input
                            type="text"
                            id="street"
                            value={userData.address.street}
                            onChange={(e) => setUserData({
                              ...userData, 
                              address: {...userData.address, street: e.target.value}
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              City
                            </label>
                            <input
                              type="text"
                              id="city"
                              value={userData.address.city}
                              onChange={(e) => setUserData({
                                ...userData, 
                                address: {...userData.address, city: e.target.value}
                              })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              State/Province
                            </label>
                            <input
                              type="text"
                              id="state"
                              value={userData.address.state}
                              onChange={(e) => setUserData({
                                ...userData, 
                                address: {...userData.address, state: e.target.value}
                              })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              ZIP/Postal Code
                            </label>
                            <input
                              type="text"
                              id="zipCode"
                              value={userData.address.zipCode}
                              onChange={(e) => setUserData({
                                ...userData, 
                                address: {...userData.address, zipCode: e.target.value}
                              })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Country
                            </label>
                            <input
                              type="text"
                              id="country"
                              value={userData.address.country}
                              onChange={(e) => setUserData({
                                ...userData, 
                                address: {...userData.address, country: e.target.value}
                              })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Emergency Contact
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Contact Name
                          </label>
                          <input
                            type="text"
                            id="emergencyName"
                            value={userData.emergencyContact.name}
                            onChange={(e) => setUserData({
                              ...userData, 
                              emergencyContact: {...userData.emergencyContact, name: e.target.value}
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Relationship
                          </label>
                          <input
                            type="text"
                            id="relationship"
                            value={userData.emergencyContact.relationship}
                            onChange={(e) => setUserData({
                              ...userData, 
                              emergencyContact: {...userData.emergencyContact, relationship: e.target.value}
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="emergencyPhone"
                            value={userData.emergencyContact.phone}
                            onChange={(e) => setUserData({
                              ...userData, 
                              emergencyContact: {...userData.emergencyContact, phone: e.target.value}
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </Tab.Panel>

              {/* Work Details Panel */}
              <Tab.Panel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Position Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title</span>
                        <p className="text-gray-900 dark:text-white">{userData.position}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</span>
                        <p className="text-gray-900 dark:text-white">{userData.department}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Join Date</span>
                        <p className="text-gray-900 dark:text-white">{userData.joinDate}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Work Preferences
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Availability</span>
                        <p className="text-gray-900 dark:text-white">{userData.workPreferences.availability}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Remote Work</span>
                        <p className="text-gray-900 dark:text-white">{userData.workPreferences.remoteWork}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Working Hours</span>
                        <p className="text-gray-900 dark:text-white">{userData.workPreferences.workHours}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {userData.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <form className="mt-4">
                      <div>
                        <label htmlFor="newSkill" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Add New Skill
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="newSkill"
                            id="newSkill"
                            className="flex-1 min-w-0 block w-full rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Enter skill name"
                          />
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </Tab.Panel>

              {/* Security Panel */}
              <Tab.Panel>
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Change Password
                  </h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md mt-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Password Requirements</h3>
                          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Minimum 8 characters</li>
                              <li>Include at least one uppercase letter</li>
                              <li>Include at least one number</li>
                              <li>Include at least one special character</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </span>
                        ) : 'Update Password'}
                      </button>
                    </div>
                  </form>
                  
                  <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Login Sessions
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Current Session</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Windows • Chrome • IP: 192.168.1.1</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Started: Today, 09:45 AM</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      </div>
                      <button
                        type="button"
                        className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Sign out from all other devices
                      </button>
                    </div>
                  </div>
                </div>
              </Tab.Panel>

              {/* Notifications Panel */}
              <Tab.Panel>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Email Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="email-newAssignments"
                            name="email-newAssignments"
                            type="checkbox"
                            checked={notificationSettings.email.newAssignments}
                            onChange={() => setNotificationSettings({
                              ...notificationSettings,
                              email: {
                                ...notificationSettings.email,
                                newAssignments: !notificationSettings.email.newAssignments
                              }
                            })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email-newAssignments" className="font-medium text-gray-700 dark:text-gray-300">
                            New Task Assignments
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            Receive emails when you are assigned new tasks or projects.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="email-taskUpdates"
                            name="email-taskUpdates"
                            type="checkbox"
                            checked={notificationSettings.email.taskUpdates}
                            onChange={() => setNotificationSettings({
                              ...notificationSettings,
                              email: {
                                ...notificationSettings.email,
                                taskUpdates: !notificationSettings.email.taskUpdates
                              }
                            })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email-taskUpdates" className="font-medium text-gray-700 dark:text-gray-300">
                            Task Updates
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            Receive emails when there are updates to tasks you're involved in.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="email-projectChanges"
                            name="email-projectChanges"
                            type="checkbox"
                            checked={notificationSettings.email.projectChanges}
                            onChange={() => setNotificationSettings({
                              ...notificationSettings,
                              email: {
                                ...notificationSettings.email,
                                projectChanges: !notificationSettings.email.projectChanges
                              }
                            })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email-projectChanges" className="font-medium text-gray-700 dark:text-gray-300">
                            Project Changes
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            Receive emails when there are significant changes to your projects.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="email-companyAnnouncements"
                            name="email-companyAnnouncements"
                            type="checkbox"
                            checked={notificationSettings.email.companyAnnouncements}
                            onChange={() => setNotificationSettings({
                              ...notificationSettings,
                              email: {
                                ...notificationSettings.email,
                                companyAnnouncements: !notificationSettings.email.companyAnnouncements
                              }
                            })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email-companyAnnouncements" className="font-medium text-gray-700 dark:text-gray-300">
                            Company Announcements
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            Receive emails about company-wide announcements and updates.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      In-App Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="app-newAssignments"
                            name="app-newAssignments"
                            type="checkbox"
                            checked={notificationSettings.app.newAssignments}
                            onChange={() => setNotificationSettings({
                              ...notificationSettings,
                              app: {
                                ...notificationSettings.app,
                                newAssignments: !notificationSettings.app.newAssignments
                              }
                            })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="app-newAssignments" className="font-medium text-gray-700 dark:text-gray-300">
                            New Task Assignments
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            Receive in-app notifications when you are assigned new tasks.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="app-taskUpdates"
                            name="app-taskUpdates"
                            type="checkbox"
                            checked={notificationSettings.app.taskUpdates}
                            onChange={() => setNotificationSettings({
                              ...notificationSettings,
                              app: {
                                ...notificationSettings.app,
                                taskUpdates: !notificationSettings.app.taskUpdates
                              }
                            })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="app-taskUpdates" className="font-medium text-gray-700 dark:text-gray-300">
                            Task Updates
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            Receive in-app notifications about task updates.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="app-projectChanges"
                            name="app-projectChanges"
                            type="checkbox"
                            checked={notificationSettings.app.projectChanges}
                            onChange={() => setNotificationSettings({
                              ...notificationSettings,
                              app: {
                                ...notificationSettings.app,
                                projectChanges: !notificationSettings.app.projectChanges
                              }
                            })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="app-projectChanges" className="font-medium text-gray-700 dark:text-gray-300">
                            Project Changes
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            Receive in-app notifications about project changes.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="app-companyAnnouncements"
                            name="app-companyAnnouncements"
                            type="checkbox"
                            checked={notificationSettings.app.companyAnnouncements}
                            onChange={() => setNotificationSettings({
                              ...notificationSettings,
                              app: {
                                ...notificationSettings.app,
                                companyAnnouncements: !notificationSettings.app.companyAnnouncements
                              }
                            })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="app-companyAnnouncements" className="font-medium text-gray-700 dark:text-gray-300">
                            Company Announcements
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            Receive in-app notifications about company announcements.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="app-chatMessages"
                            name="app-chatMessages"
                            type="checkbox"
                            checked={notificationSettings.app.chatMessages}
                            onChange={() => setNotificationSettings({
                              ...notificationSettings,
                              app: {
                                ...notificationSettings.app,
                                chatMessages: !notificationSettings.app.chatMessages
                              }
                            })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="app-chatMessages" className="font-medium text-gray-700 dark:text-gray-300">
                            Chat Messages
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">
                            Receive in-app notifications for new chat messages.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleNotificationUpdate}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
