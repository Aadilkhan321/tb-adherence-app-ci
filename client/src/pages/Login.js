import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { auth } from '../firebase';

// Tooltip component for feature descriptions
const Tooltip = ({ children, text, position = 'top' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm transition-opacity duration-300 ${
          position === 'top' ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2' :
          position === 'bottom' ? 'top-full mt-2 left-1/2 transform -translate-x-1/2' :
          'left-full ml-2 top-1/2 transform -translate-y-1/2'
        }`}>
          {text}
          <div className={`tooltip-arrow absolute ${
            position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2' :
            position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2' :
            'right-full top-1/2 transform -translate-y-1/2'
          }`}></div>
        </div>
      )}
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    userType: 'patient'
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // ✅ Login with real Firebase
        const result = await auth.signInWithEmailAndPassword(formData.email, formData.password);
        toast.success(`Welcome back, ${result.user.name || result.user.email}!`);
        onLogin(result.user);
      } else {
        // ✅ Sign up — saves name & userType to Firestore
        const result = await auth.createUserWithEmailAndPassword(
          formData.email,
          formData.password,
          { name: formData.name, userType: formData.userType }
        );
        toast.success('Account created successfully!');
        onLogin(result.user);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Updated with your real Firebase demo credentials
  const fillDemoCredentials = (userType) => {
    if (userType === 'patient') {
      setFormData({
        ...formData,
        email: 'dhimanayush025@gmail.com',
        password: 'password123'
      });
    } else {
      setFormData({
        ...formData,
        email: 'aadilkhanxxxx@gmail.com',
        password: 'password123'
      });
    }
    toast(`Demo ${userType} credentials filled!`, {
      icon: 'ℹ️',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-md w-full mx-4 relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-4xl font-bold text-white mb-2 animate-pulse">🏥 TB Adherence App</h1>
          <p className="text-pink-200 animate-fade-in-up">Empowering TB patients through gamified medication tracking</p>
        </div>

        {/* Main Login Card */}
        <div className="bg-black bg-opacity-30 backdrop-blur-lg border border-gray-700 rounded-lg shadow-2xl p-8 animate-slide-up">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-pink-200 mt-2">
              {isLogin 
                ? 'Sign in to continue your TB treatment journey' 
                : 'Join us in fighting TB together'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-pink-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-pink-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-pink-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-pink-300 mb-1">
                  Account Type
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="patient" className="bg-gray-800 text-white">Patient</option>
                  <option value="doctor" className="bg-gray-800 text-white">Doctor</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full loading-spinner mr-2"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded-md border border-gray-600">
            <p className="text-sm text-pink-200 mb-3 text-center font-medium">
              Demo Credentials - Quick Access:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Tooltip text="Experience TB medication tracking with gamification, voice reminders, and progress visualization">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('patient')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-3 rounded text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium"
                >
                  👨‍⚕️ Patient Demo
                </button>
              </Tooltip>
              <Tooltip text="Monitor TB patients, generate reports, send bulk reminders, and view analytics dashboard">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('doctor')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-3 rounded text-sm hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 font-medium"
                >
                  🏥 Doctor Demo
                </button>
              </Tooltip>
            </div>
            {/* ✅ Updated demo credential hints */}
            <div className="mt-3 text-xs text-gray-400 text-center">
              <p>Patient: dhimanayush025@gmail.com</p>
              <p>Doctor: aadilkhanxxxx@gmail.com</p>
              <p>Password: password123</p>
            </div>
          </div>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-pink-300 hover:text-white transition-colors duration-200 font-medium"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>

        {/* Features List with Tooltips and Animation */}
        <div className="mt-8 text-center text-white animate-fade-in-up">
          <h3 className="text-lg font-semibold text-pink-200 mb-4">Why Choose Our Platform?</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Tooltip text="Streak tracking, badges, progress bars, and motivational rewards to keep patients engaged">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 bg-opacity-20 backdrop-blur-sm border border-purple-400 border-opacity-30 rounded-lg p-4 hover:scale-105 transition-transform duration-200 cursor-pointer animate-bounce-subtle">
                <div className="text-3xl mb-2 animate-pulse">🎮</div>
                <div className="font-medium">Gamified Experience</div>
                <div className="text-xs text-purple-200 mt-1">Badges & Streaks</div>
              </div>
            </Tooltip>
            <Tooltip text="Multilingual voice reminders using Web Speech API in English and Hindi for better accessibility">
              <div className="bg-gradient-to-br from-pink-600 to-purple-600 bg-opacity-20 backdrop-blur-sm border border-pink-400 border-opacity-30 rounded-lg p-4 hover:scale-105 transition-transform duration-200 cursor-pointer animate-bounce-subtle animation-delay-1000">
                <div className="text-3xl mb-2 animate-pulse">🗣️</div>
                <div className="font-medium">Voice Reminders</div>
                <div className="text-xs text-pink-200 mt-1">English & Hindi</div>
              </div>
            </Tooltip>
            <Tooltip text="Real-time analytics, charts, and comprehensive reporting for healthcare providers">
              <div className="bg-gradient-to-br from-gray-600 to-purple-600 bg-opacity-20 backdrop-blur-sm border border-gray-400 border-opacity-30 rounded-lg p-4 hover:scale-105 transition-transform duration-200 cursor-pointer animate-bounce-subtle animation-delay-2000">
                <div className="text-3xl mb-2 animate-pulse">📊</div>
                <div className="font-medium">Progress Tracking</div>
                <div className="text-xs text-gray-200 mt-1">Real-time Analytics</div>
              </div>
            </Tooltip>
            <Tooltip text="Built for diverse populations with support for multiple languages and low-bandwidth environments">
              <div className="bg-gradient-to-br from-purple-600 to-gray-600 bg-opacity-20 backdrop-blur-sm border border-purple-400 border-opacity-30 rounded-lg p-4 hover:scale-105 transition-transform duration-200 cursor-pointer animate-bounce-subtle animation-delay-3000">
                <div className="text-3xl mb-2 animate-pulse">🌍</div>
                <div className="font-medium">Multilingual Support</div>
                <div className="text-xs text-purple-200 mt-1">Global Accessibility</div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;