import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useCustomHooks';

const NewLoginPage = () => {
  const { login, logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Form validation
  const validate = (values) => {
    const errors = {};
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'Email address is invalid';
    }
    if (!values.password) {
      errors.password = 'Password is required';
    }
    return errors;
  };

  // Form submission handler
  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);
      const user = await login(values.email, values.password);
      
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'employee') {
        navigate('/employee/dashboard');
      } else {
        navigate('/dashboard');
      }
      
      toast.success('Welcome back! Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
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
    { email: '', password: '' },
    handleSubmit,
    validate
  );

  // If user is already logged in, show logout option
  if (currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card-neon p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-4 text-primary-400">ALREADY LOGGED IN</h2>
            <p className="text-neutral-300 mb-8">
              Welcome back, <span className="text-primary-400 font-semibold">{currentUser.firstName || currentUser.email}</span>!
              <br />You are currently signed in.
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
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
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
                <span className="text-gradient">WELCOME</span>
                <br />
                <span className="text-white">BACK</span>
              </h1>
              
              <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
                Sign in to access your dashboard and continue your journey with our premium services.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary-400">
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold">Lightning Fast Access</span>
                </div>
                <div className="flex items-center gap-3 text-secondary-400">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Secure Authentication</span>
                </div>
                <div className="flex items-center gap-3 text-accent-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">Premium Experience</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent magical-text-glow">
                  Postify Studio
                </span>
                </div>
                <span className="text-2xl font-black text-white">PostifyStudio</span>
              </div>
              <h1 className="text-4xl font-black text-gradient">SIGN IN</h1>
            </div>

            <div className="card-brutal bg-white p-8">
              <div className="lg:block hidden mb-8 text-center">
                <h2 className="text-4xl font-black text-black mb-2">SIGN IN</h2>
                <p className="text-neutral-600">Access your account</p>
              </div>

              <form onSubmit={submitForm} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-bold text-black uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === 'email' ? 'text-primary-500' : 'text-neutral-400'
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
                      className={`input-brutal pl-12 ${
                        errors.email 
                          ? 'border-red-500 focus:border-red-500' 
                          : focusedField === 'email' 
                            ? 'border-primary-500' 
                            : 'border-black'
                      }`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm font-semibold">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-bold text-black uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 transition-colors duration-200 ${
                        focusedField === 'password' ? 'text-primary-500' : 'text-neutral-400'
                      }`} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={values.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`input-brutal pl-12 pr-12 ${
                        errors.password 
                          ? 'border-red-500 focus:border-red-500' 
                          : focusedField === 'password' 
                            ? 'border-primary-500' 
                            : 'border-black'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm font-semibold">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-brutal w-full text-lg font-black uppercase tracking-wider group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="spinner-brutal w-5 h-5" />
                      SIGNING IN...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      SIGN IN
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </form>

              {/* Links */}
              <div className="mt-8 text-center space-y-4">
                <p className="text-neutral-600">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-primary-500 font-bold hover:text-primary-600 transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
                
                <Link
                  to="/"
                  className="inline-block text-neutral-500 hover:text-neutral-700 font-semibold transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NewLoginPage;
