import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import voiceReminder from '../utils/voiceReminder';
import TBChatbot from '../components/TBChatbot';
import SocialNetwork from '../components/SocialNetwork';
import MedicationVisualization from '../components/MedicationVisualization';
import BlockchainRecords from '../components/BlockchainRecords';
import IoTPillDispenser from '../components/IoTPillDispenser';
import DrugInteractionChecker from '../components/DrugInteractionChecker';
import PredictiveAnalytics from '../components/PredictiveAnalytics';

const PatientDashboard = ({ user }) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayTaken, setTodayTaken] = useState(false);
  const [language, setLanguage] = useState('en');
  const [reminderTime, setReminderTime] = useState('09:00');

  // Badge configurations
  const badgeTypes = {
    '7-Day Streak': { icon: '🔥', color: 'bg-orange-500', description: 'Took medication 7 days in a row' },
    '14-Day Streak': { icon: '⭐', color: 'bg-yellow-500', description: 'Took medication 14 days in a row' },
    '30-Day Streak': { icon: '👑', color: 'bg-purple-500', description: 'Took medication 30 days in a row' },
    'Early Bird': { icon: '🌅', color: 'bg-blue-500', description: 'Consistently takes medication in the morning' },
    'Consistent Champion': { icon: '🏆', color: 'bg-green-600', description: 'Outstanding medication adherence' },
    'Getting Started': { icon: '🌱', color: 'bg-green-400', description: 'Started your TB treatment journey' },
    'Milestone Master': { icon: '🎯', color: 'bg-red-500', description: 'Reached important treatment milestones' }
  };

  useEffect(() => {
    loadPatientData();
    checkTodayMedication();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPatientData = async () => {
    try {
      // Get patient data from localStorage (simulating Firestore)
      const patientDoc = localStorage.getItem(`patients_${user.uid}`);
      if (patientDoc) {
        const data = JSON.parse(patientDoc);
        setPatientData(data);
        setLanguage(data.language || 'en');
      } else {
        // Create new patient record
        const newPatientData = {
          id: user.uid,
          name: user.name,
          email: user.email,
          currentStreak: 0,
          totalDays: 0,
          lastMedication: null,
          treatmentStartDate: new Date().toISOString(),
          badges: ['Getting Started'],
          language: 'en'
        };
        localStorage.setItem(`patients_${user.uid}`, JSON.stringify(newPatientData));
        setPatientData(newPatientData);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const checkTodayMedication = () => {
    const today = new Date().toISOString().split('T')[0];
    const medicationLog = localStorage.getItem(`medication_logs_${user.uid}_${today}`);
    setTodayTaken(!!medicationLog);
  };

  const takeMedication = async () => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const logId = `${user.uid}_${today}`;

      // Save medication log
      const medicationLog = {
        id: logId,
        patientId: user.uid,
        date: now.toISOString(),
        taken: true,
        timestamp: now.toISOString()
      };

      localStorage.setItem(`medication_logs_${logId}`, JSON.stringify(medicationLog));

      // Update patient data
      const updatedData = {
        ...patientData,
        lastMedication: now.toISOString(),
        currentStreak: patientData.currentStreak + 1,
        totalDays: patientData.totalDays + 1
      };

      // Check for new badges
      const newBadges = checkForNewBadges(updatedData);
      if (newBadges.length > 0) {
        updatedData.badges = [...new Set([...updatedData.badges, ...newBadges])];
        newBadges.forEach(badge => {
          toast.success(`🎉 New Badge Earned: ${badge}!`, { duration: 5000 });
        });
      }

      localStorage.setItem(`patients_${user.uid}`, JSON.stringify(updatedData));
      setPatientData(updatedData);
      setTodayTaken(true);

      // Play congratulatory voice message
      voiceReminder.speakReminder('goodJob', language).catch(console.error);
      
      toast.success('Medication logged successfully! 🎉');

      // Check for streak milestones
      if (updatedData.currentStreak % 7 === 0 && updatedData.currentStreak > 0) {
        setTimeout(() => {
          voiceReminder.speakReminder('streakCongrats', language).catch(console.error);
        }, 2000);
      }

    } catch (error) {
      console.error('Error logging medication:', error);
      toast.error('Failed to log medication');
    }
  };

  const checkForNewBadges = (data) => {
    const newBadges = [];
    const existingBadges = data.badges || [];

    // Streak badges
    if (data.currentStreak >= 7 && !existingBadges.includes('7-Day Streak')) {
      newBadges.push('7-Day Streak');
    }
    if (data.currentStreak >= 14 && !existingBadges.includes('14-Day Streak')) {
      newBadges.push('14-Day Streak');
    }
    if (data.currentStreak >= 30 && !existingBadges.includes('30-Day Streak')) {
      newBadges.push('30-Day Streak');
    }

    // Consistency badge
    if (data.totalDays >= 30 && data.currentStreak >= 20 && !existingBadges.includes('Consistent Champion')) {
      newBadges.push('Consistent Champion');
    }

    // Early bird badge (if taking medication before 11 AM)
    const hour = new Date().getHours();
    if (hour < 11 && !existingBadges.includes('Early Bird')) {
      newBadges.push('Early Bird');
    }

    // Milestone badge
    if (data.totalDays >= 60 && !existingBadges.includes('Milestone Master')) {
      newBadges.push('Milestone Master');
    }

    return newBadges;
  };

  const testVoiceReminder = () => {
    voiceReminder.speakReminder('dailyReminder', language)
      .then(() => {
        toast.success('Voice reminder test completed!');
      })
      .catch(() => {
        toast.error('Voice reminder not supported in your browser');
      });
  };

  const motivationalMessages = {
    en: [
      "You're doing great! Every dose counts towards your recovery.",
      "Keep up the excellent work! Your consistency is paying off.",
      "You're fighting TB like a champion! Stay strong.",
      "Your dedication to treatment is inspiring. Keep going!",
      "Each medication taken is a victory against TB!"
    ],
    hi: [
      "आप बहुत अच्छा कर रहे हैं! हर दवा आपकी सेहत के लिए महत्वपूर्ण है।",
      "बेहतरीन काम जारी रखें! आपकी निरंतरता रंग ला रही है।",
      "आप TB से जैसे योद्धा की तरह लड़ रहे हैं! मजबूत रहें।",
      "इलाज के प्रति आपका समर्पण प्रेरणादायक है। चलते रहें!",
      "ली गई हर दवा TB के खिलाफ एक जीत है!"
    ]
  };

  const getRandomMotivationalMessage = () => {
    const messages = motivationalMessages[language] || motivationalMessages.en;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-yellow-600';
    if (streak >= 7) return 'text-orange-600';
    if (streak >= 3) return 'text-green-600';
    return 'text-blue-600';
  };

  const getProgressPercentage = () => {
    const totalTreatmentDays = 180; // 6 months
    return Math.min((patientData?.totalDays || 0) / totalTreatmentDays * 100, 100);
  };

  if (loading || !patientData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {patientData.name}! 👋
          </h1>
          <p className="text-gray-600">{getRandomMotivationalMessage()}</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Streak */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Current Streak</h3>
                <p className={`text-3xl font-bold ${getStreakColor(patientData.currentStreak)}`}>
                  {patientData.currentStreak} days
                </p>
                <p className="text-sm text-gray-500">Keep it going! 🔥</p>
              </div>
              <div className="text-4xl">
                {patientData.currentStreak >= 7 ? '🔥' : '📈'}
              </div>
            </div>
          </div>

          {/* Total Days */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Total Days</h3>
                <p className="text-3xl font-bold text-primary">{patientData.totalDays}</p>
                <p className="text-sm text-gray-600">days of treatment</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Progress</h3>
              <span className="text-sm text-gray-500">{getProgressPercentage().toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">6-month treatment goal</p>
          </div>
        </div>

        {/* Today's Medication */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Today's Medication
            </h2>
            
            {todayTaken ? (
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-green-600 mb-2">
                  Great job! You've taken your medication today.
                </h3>
                <p className="text-gray-600">
                  Taken at {new Date(patientData.lastMedication).toLocaleTimeString()}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Come back tomorrow to continue your streak! 💪
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">💊</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Time to take your TB medication
                </h3>
                <button
                  onClick={takeMedication}
                  className="bg-primary text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-secondary transition-colors focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 pulse"
                >
                  ✨ Take Medication ✨
                </button>
                <p className="text-gray-500 text-sm mt-4">
                  Click when you've taken your medication
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Achievements 🏆</h2>
          
          {patientData.badges && patientData.badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {patientData.badges.map((badge, index) => {
                const badgeConfig = badgeTypes[badge];
                return (
                  <div key={index} className={`${badgeConfig?.color || 'bg-gray-500'} text-white p-4 rounded-lg text-center`}>
                    <div className="text-3xl mb-2">{badgeConfig?.icon || '🎖️'}</div>
                    <h3 className="font-semibold text-sm mb-1">{badge}</h3>
                    <p className="text-xs opacity-90">{badgeConfig?.description || 'Achievement unlocked!'}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Take your first medication to earn your first badge! 🌟
            </p>
          )}
        </div>

        {/* Voice Reminders Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Voice Reminders 🗣️</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language Preference
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={testVoiceReminder}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              🔊 Test Voice Reminder
            </button>
            <p className="text-gray-500 text-sm mt-2">
              Click to hear a sample reminder in your selected language
            </p>
          </div>
        </div>

        {/* Treatment Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Treatment Timeline 📅</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Treatment Started</h3>
                <p className="text-green-600 text-sm">
                  {new Date(patientData.treatmentStartDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {patientData.currentStreak >= 7 && (
              <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🔥</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800">First Week Milestone</h3>
                  <p className="text-orange-600 text-sm">Completed your first 7-day streak!</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg opacity-60">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">○</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">6-Month Completion</h3>
                <p className="text-blue-600 text-sm">
                  Target: Complete full TB treatment course
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* AR/VR Medication Visualization */}
        <div className="mb-8">
          <MedicationVisualization patient={patientData} />
        </div>
        
        {/* Social Support Network */}
        <div className="mb-8">
          <SocialNetwork patient={patientData} />
        </div>
        
        {/* Blockchain Treatment Records */}
        <div className="mb-8">
          <BlockchainRecords patient={patientData} />
        </div>
        
        {/* IoT Smart Pill Dispenser */}
        <div className="mb-8">
          <IoTPillDispenser patient={patientData} />
        </div>
        
        {/* IoT Smart Pill Dispenser */}
        <div className="mb-8">
          <IoTPillDispenser patient={patientData} />
        </div>
        
        {/* AI Drug Interaction Checker */}
        <div className="mb-8">
          <DrugInteractionChecker patient={patientData} />
        </div>
        
        {/* Predictive Analytics */}
        <div className="mb-8">
          <PredictiveAnalytics patient={patientData} />
        </div>
      </div>
      
      {/* AI Chatbot */}
      <TBChatbot patient={patientData} />
    </div>
  );
};

export default PatientDashboard;
