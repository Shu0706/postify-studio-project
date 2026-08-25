import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useCustomHooks';

const NewSignupPage = () => {
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
      
      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password
      };
      
      const user = await signup(userData);
      navigate('/dashboard');
      toast.success('Account created successfully! Welcome aboard!');
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
    ];
    
    checks.forEach(check => {
      if (check.test) strength++;
    });
    
    return { strength, checks };
  };

  const passwordStrength = getPasswordStrength(values.password);

  // If user is already logged in, show logout option
  if (currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card-neon p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-4 text-primary-400">ALREADY SIGNED IN</h2>
            <p className="text-neutral-300 mb-8">
              Welcome, <span className="text-primary-400 font-semibold">{currentUser.firstName || currentUser.email}</span>!
              <br />You already have an active account.
            </p>
            <div className="space-y-4">
              <Link
                to="/dashboard"
                className="btn-neon w-full block text-center py-3"
              >
                GO TO DASHBOARD
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-3 px-6 border-2 border-red-500 text-red-400 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white text-black overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-secondary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-accent-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent magical-text-glow">
                  Postify Studio
                </span>
              </div>
              <h1 className="text-4xl font-black text-gradient">JOIN US</h1>
            </div>

            <div className="card-brutal bg-black text-white p-8">
              <div className="lg:block hidden mb-8 text-center">
                <h2 className="text-4xl font-black text-white mb-2">CREATE ACCOUNT</h2>
                <p className="text-neutral-400">Join the revolution</p>
              </div>

              <form onSubmit={submitForm} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-bold text-white uppercase tracking-wider">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 transition-colors duration-200 ${
                          focusedField === 'firstName' ? 'text-primary-400' : 'text-neutral-400'
                        }`} />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        value={values.firstName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField(null)}
                        className={`input-neon pl-12 ${
                          errors.firstName 
                            ? 'border-red-500' 
                            : focusedField === 'firstName' 
                              ? 'border-primary-400' 
                              : 'border-primary-400'
                        }`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-400 text-sm font-semibold">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-bold text-white uppercase tracking-wider">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 transition-colors duration-200 ${
                          focusedField === 'lastName' ? 'text-primary-400' : 'text-neutral-400'
                        }`} />
                      </div>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        value={values.lastName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                        className={`input-neon pl-12 ${
                          errors.lastName 
                            ? 'border-red-500' 
                            : focusedField === 'lastName' 
                              ? 'border-primary-400' 
                              : 'border-primary-400'
                        }`}
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-400 text-sm font-semibold">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-bold text-white uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === 'email' ? 'text-primary-400' : 'text-neutral-400'
                      }`} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`input-neon pl-12 ${
                        errors.email 
                          ? 'border-red-500' 
                          : focusedField === 'email' 
                            ? 'border-primary-400' 
                            : 'border-primary-400'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm font-semibold">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-bold text-white uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === 'password' ? 'text-primary-400' : 'text-neutral-400'
                      }`} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={values.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`input-neon pl-12 pr-12 ${
                        errors.password 
                          ? 'border-red-500' 
                          : focusedField === 'password' 
                            ? 'border-primary-400' 
                            : 'border-primary-400'
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-neutral-400 hover:text-primary-400 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-neutral-400 hover:text-primary-400 transition-colors" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {values.password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, index) => (
                          <div
                            key={index}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              index < passwordStrength.strength
                                ? passwordStrength.strength === 1
                                  ? 'bg-red-500'
                                  : passwordStrength.strength === 2
                                  ? 'bg-yellow-500'
                                  : passwordStrength.strength === 3
                                  ? 'bg-blue-500'
                                  : 'bg-green-500'
                                : 'bg-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs space-y-1">
                        {passwordStrength.checks.map((check, index) => (
                          <div key={index} className={`flex items-center gap-2 ${check.test ? 'text-green-400' : 'text-neutral-400'}`}>
                            {check.test ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            <span>{check.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="text-red-400 text-sm font-semibold">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-white uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === 'confirmPassword' ? 'text-primary-400' : 'text-neutral-400'
                      }`} />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className={`input-neon pl-12 pr-12 ${
                        errors.confirmPassword 
                          ? 'border-red-500' 
                          : focusedField === 'confirmPassword' 
                            ? 'border-primary-400' 
                            : 'border-primary-400'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-neutral-400 hover:text-primary-400 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-neutral-400 hover:text-primary-400 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm font-semibold">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-neon w-full text-lg font-black uppercase tracking-wider group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="spinner w-5 h-5" />
                      CREATING ACCOUNT...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      CREATE ACCOUNT
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </form>

              {/* Links */}
              <div className="mt-8 text-center space-y-4">
                <p className="text-neutral-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary-400 font-bold hover:text-primary-300 transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
                
                <Link
                  to="/"
                  className="inline-block text-neutral-500 hover:text-neutral-300 font-semibold transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gradient-to-br from-black via-neutral-900 to-black text-white">
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-black bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent magical-text-glow">
                  Postify Studio
                </span>
              </div>
              
              <h1 className="text-6xl font-black mb-6 leading-tight">
                <span className="text-gradient">JOIN THE</span>
                <br />
                <span className="text-white">REVOLUTION</span>
              </h1>
              
              <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
                Create your account and unlock access to premium services, exclusive features, and a world of possibilities.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary-400">
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold">Instant Access to Premium Features</span>
                </div>
                <div className="flex items-center gap-3 text-secondary-400">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Bank-Level Security Protection</span>
                </div>
                <div className="flex items-center gap-3 text-accent-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">24/7 Premium Support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSignupPage;
