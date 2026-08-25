import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Fade, Slide } from 'react-awesome-reveal';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useCustomHooks';

const SignupPage = () => {
  const { signup, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Form validation
  const validate = (values) => {
    const errors = {};
    
    if (!values.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!values.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email address is invalid';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(values.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  // Form submission handler
  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);
      
      // Create user data object (role is always client for signup)
      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password
      };
      
      // Call signup API
      const user = await signup(userData);
      
      // Redirect to client dashboard
      navigate('/dashboard');
      
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out');
    // Force page reload to clear any state
    window.location.reload();
  };

  // Custom hook for form handling
  const { values, errors, handleChange, handleSubmit: submitForm } = useForm(
    { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
    handleSubmit,
    validate
  );

  // Password strength checker
  const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = [
      { test: password.length >= 6, label: 'At least 6 characters' },
      { test: /[a-z]/.test(password), label: 'Lowercase letter' },
      { test: /[A-Z]/.test(password), label: 'Uppercase letter' },
      { test: /\d/.test(password), label: 'Number' },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), label: 'Special character' }
    ];
    
    checks.forEach(check => {
      if (check.test) strength++;
    });
    
    return { strength, checks };
  };

  const passwordStrength = getPasswordStrength(values.password);

  const AnimatedInput = ({ id, name, type, placeholder, icon: Icon, value, onChange, error, autoComplete }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className={`h-5 w-5 transition-colors duration-200 ${focusedField === name ? 'text-blue-500' : 'text-gray-400'}`} />
      </div>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField(null)}
        className={`w-full pl-12 pr-12 py-4 bg-white/50 dark:bg-gray-800/50 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-0 ${
          error 
            ? 'border-red-300 focus:border-red-500' 
            : focusedField === name 
              ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
        placeholder={placeholder}
      />
      {(name === 'password' || name === 'confirmPassword') && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
          onClick={() => {
            if (name === 'password') {
              setShowPassword(!showPassword);
            } else {
              setShowConfirmPassword(!showConfirmPassword);
            }
          }}
        >
          {((name === 'password' && showPassword) || (name === 'confirmPassword' && showConfirmPassword)) ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          )}
        </button>
      )}
      {error && (
        <motion.p 
          className="text-red-500 text-sm mt-2 ml-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-10 -right-10 w-96 h-96 bg-gradient-to-r from-pink-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -360],
            x: [0, -60, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1.3, 1, 1.3],
            rotate: [-360, 0],
            x: [60, 0, 60],
            y: [-60, 0, -60],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <motion.div 
        className="max-w-md w-full space-y-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Glassmorphism container */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 relative">
          {/* Header */}
          <Fade direction="down" delay={200}>
            <div className="text-center">
              <motion.div 
                className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Join us today or{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-200"
                >
                  sign in to existing account
                </Link>
              </p>
            </div>
          </Fade>
        
          {currentUser ? (
            <Slide direction="up" delay={300}>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
                <div className="text-center mb-4">
                  <div className="text-purple-700 dark:text-purple-300 font-medium">You are already logged in as:</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{currentUser.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">({currentUser.email})</div>
                  <div className="text-sm font-medium mt-2 capitalize bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full inline-block">
                    Role: {currentUser.role}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <motion.button
                    onClick={() => {
                      switch (currentUser.role) {
                        case 'admin':
                          navigate('/admin');
                          break;
                        case 'employee':
                          navigate('/employee/dashboard');
                          break;
                        case 'client':
                        default:
                          navigate('/dashboard');
                          break;
                      }
                    }}
                    className="flex-1 group relative overflow-hidden py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </motion.button>
                  <motion.button
                    onClick={handleLogout}
                    className="flex-1 py-3 px-6 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Logout
                  </motion.button>
                </div>
              </div>
            </Slide>
          ) : (
            <Slide direction="up" delay={400}>
              <form className="mt-8 space-y-6" onSubmit={(e) => {
                e.preventDefault();
                submitForm(e);
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <AnimatedInput
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={values.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      icon={User}
                      error={errors.firstName}
                    />
                    
                    <AnimatedInput
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={values.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      icon={User}
                      error={errors.lastName}
                    />
                  </div>
                  
                  <AnimatedInput
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    icon={Mail}
                    error={errors.email}
                  />
                  
                  <div className="space-y-2">
                    <AnimatedInput
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={values.password}
                      onChange={handleChange}
                      placeholder="Password"
                      icon={Lock}
                      error={errors.password}
                    />
                    
                    {/* Password strength indicator */}
                    {values.password && (
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                i < passwordStrength.strength
                                  ? passwordStrength.strength <= 2
                                    ? 'bg-red-400'
                                    : passwordStrength.strength <= 3
                                    ? 'bg-yellow-400'
                                    : 'bg-green-400'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs space-y-1">
                          {passwordStrength.checks.map((check, i) => (
                            <div key={i} className={`flex items-center space-x-2 ${check.test ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                              <Check className={`h-3 w-3 ${check.test ? 'opacity-100' : 'opacity-30'}`} />
                              <span>{check.label}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <AnimatedInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    icon={Lock}
                    error={errors.confirmPassword}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center">
                    {isLoading ? (
                      <motion.div
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <ArrowRight className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    )}
                    Create Account
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </form>
            </Slide>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
