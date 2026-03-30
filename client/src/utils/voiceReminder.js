// Voice Reminder functionality using Web Speech API
// Supports English and Hindi for TB medication reminders

export class VoiceReminder {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voices = [];
    this.isSupported = 'speechSynthesis' in window;
    
    if (this.isSupported) {
      this.loadVoices();
      // Voices may not be loaded immediately, so listen for the event
      this.synthesis.addEventListener('voiceschanged', () => {
        this.loadVoices();
      });
    }
  }

  loadVoices() {
    this.voices = this.synthesis.getVoices();
  }

  // Get appropriate voice for language
  getVoiceForLanguage(language) {
    if (!this.voices.length) {
      this.loadVoices();
    }

    let voice = null;
    
    if (language === 'hi') {
      // Try to find Hindi voice
      voice = this.voices.find(v => 
        v.lang.startsWith('hi') || 
        v.name.toLowerCase().includes('hindi') ||
        v.name.toLowerCase().includes('indian')
      );
    } else {
      // Default to English voice
      voice = this.voices.find(v => 
        v.lang.startsWith('en') && 
        (v.lang.includes('US') || v.lang.includes('GB'))
      );
    }

    // Fallback to first available voice
    return voice || this.voices[0] || null;
  }

  // Medication reminder messages in different languages
  getReminderMessages() {
    return {
      en: {
        takeYourMeds: "Time to take your TB medication! Don't forget to stay consistent with your treatment.",
        goodJob: "Great job taking your medication! Keep up the excellent work!",
        streakCongrats: "Congratulations on your medication streak! You're doing amazing!",
        missedDose: "Don't worry about missing yesterday. Take your medication today and get back on track!",
        motivational: "Every dose brings you closer to recovery. You've got this!",
        dailyReminder: "Hello! It's time for your daily TB medication. Take it now to maintain your progress.",
        encouragement: "You're fighting TB successfully! Keep taking your medication as prescribed.",
        urgentReminder: "URGENT: You've missed medication for multiple days. Please take your TB medication immediately and contact your doctor. Your health is important!"
      },
      hi: {
        takeYourMeds: "अपनी टीबी की दवा लेने का समय हो गया है! अपने इलाज में निरंतरता बनाए रखना न भूलें।",
        goodJob: "दवा लेने के लिए बहुत बढ़िया! इसी तरह अच्छा काम जारी रखें!",
        streakCongrats: "आपकी दवा की निरंतरता के लिए बधाई! आप कमाल कर रहे हैं!",
        missedDose: "कल की दवा छूटने की चिंता न करें। आज दवा लें और वापस पटरी पर आ जाएं!",
        motivational: "हर दवा आपको स्वस्थ होने के करीब ले जा रही है। आप यह कर सकते हैं!",
        dailyReminder: "नमस्ते! आपकी रोजाना की टीबी दवा का समय है। अपनी प्रगति बनाए रखने के लिए अभी लें।",
        encouragement: "आप टीबी से सफलतापूर्वक लड़ रहे हैं! डॉक्टर की सलाह अनुसार दवा लेते रहें।",
        urgentReminder: "आपातकाल: आपने कई दिनों से दवा नहीं ली है। कृपया तुरंत अपनी टीबी की दवा लें और अपने डॉक्टर से संपर्क करें। आपका स्वास्थ्य महत्वपूर्ण है!"
      }
    };
  }

  // Speak a message in the specified language
  speak(message, language = 'en', options = {}) {
    if (!this.isSupported) {
      console.warn('Speech synthesis not supported in this browser');
      return Promise.reject(new Error('Speech synthesis not supported'));
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(message);
      const voice = this.getVoiceForLanguage(language);
      
      if (voice) {
        utterance.voice = voice;
      }
      
      // Set language
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      
      // Configure speech parameters
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      this.synthesis.speak(utterance);
    });
  }

  // Speak a predefined reminder message
  speakReminder(messageType, language = 'en', options = {}) {
    const messages = this.getReminderMessages();
    const message = messages[language]?.[messageType] || messages['en'][messageType];
    
    if (!message) {
      console.error(`Unknown message type: ${messageType}`);
      return Promise.reject(new Error(`Unknown message type: ${messageType}`));
    }

    return this.speak(message, language, options);
  }

  // Set up 3-day reminder system (enhanced version)
  setupDailyReminder(time, language = 'en', callback) {
    // Parse time string (HH:MM format)
    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduleReminder = (dayCount = 1) => {
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);
      
      // If the time has passed today, schedule for tomorrow
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }
      
      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        // Send reminder based on day count
        let messageType = 'dailyReminder';
        if (dayCount === 2) messageType = 'missedDose';
        if (dayCount === 3) messageType = 'urgentReminder';
        
        this.speakReminder(messageType, language)
          .then(() => {
            if (callback) callback(dayCount);
            
            // Notify doctor if patient misses 3 days
            if (dayCount >= 3) {
              this.notifyDoctor(language);
            }
          })
          .catch(console.error);
        
        // Schedule next reminder (up to 3 days)
        if (dayCount < 3) {
          scheduleReminder(dayCount + 1);
        }
      }, timeUntilReminder);
    };

    scheduleReminder(1);
  };
  
  // Notify doctor when patient misses medication
  notifyDoctor(patientLanguage = 'en') {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.userType === 'patient') {
      // Create doctor notification
      const notification = {
        id: 'notif_' + Date.now(),
        patientId: currentUser.uid,
        patientName: currentUser.name,
        patientEmail: currentUser.email,
        type: 'missed_medication',
        message: `Patient ${currentUser.name} has missed medication for 3 consecutive days`,
        language: patientLanguage,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // Store notification for doctor
      const existingNotifications = JSON.parse(localStorage.getItem('doctor_notifications') || '[]');
      existingNotifications.push(notification);
      localStorage.setItem('doctor_notifications', JSON.stringify(existingNotifications));
      
      console.log('🚨 Doctor Notification: Patient missed 3 days of medication', notification);
    }
  }

  // Test voice functionality
  testVoice(language = 'en') {
    const testMessages = {
      en: "This is a test of the voice reminder system for TB medication adherence.",
      hi: "यह टीबी दवा पालन के लिए आवाज़ रिमाइंडर सिस्टम का परीक्षण है।"
    };

    return this.speak(testMessages[language], language);
  }

  // Get available voices for display
  getAvailableVoices() {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      isDefault: voice.default
    }));
  }

  // Stop any ongoing speech
  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

// Create singleton instance
const voiceReminder = new VoiceReminder();

export default voiceReminder;