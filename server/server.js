const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-deployment-domain.vercel.app'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Mock database for demo purposes
// In a real application, you would use a proper database like PostgreSQL, MongoDB, etc.
let mockDatabase = {
  users: {
    'patient@demo.com': {
      uid: 'patient1',
      email: 'patient@demo.com',
      name: 'John Doe',
      userType: 'patient',
      passwordHash: 'mock_hash_patient', // In real app, use bcrypt
      createdAt: new Date().toISOString()
    },
    'doctor@demo.com': {
      uid: 'doctor1',
      email: 'doctor@demo.com',
      name: 'Dr. Sarah Smith',
      userType: 'doctor',
      passwordHash: 'mock_hash_doctor', // In real app, use bcrypt
      createdAt: new Date().toISOString()
    }
  },
  patients: {},
  medicationLogs: {},
  appointments: {}
};

// Utility functions
const findUserByEmail = (email) => {
  return mockDatabase.users[email] || null;
};

const createUser = (userData) => {
  const user = {
    uid: 'user_' + Date.now(),
    ...userData,
    createdAt: new Date().toISOString()
  };
  mockDatabase.users[userData.email] = user;
  return user;
};

// Validation middleware
const validateAuth = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const validateMedicationLog = [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('taken').isBoolean().withMessage('Taken status must be a boolean')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TB Adherence App Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication endpoints
app.post('/api/auth/login', validateAuth, handleValidationErrors, (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Mock authentication - in real app, use bcrypt to compare hashed passwords
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Simple password check for demo (use bcrypt.compare in production)
    if (password !== 'password123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Return user data without password
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

app.post('/api/auth/register', validateAuth, handleValidationErrors, (req, res) => {
  try {
    const { email, password, name, userType = 'patient' } = req.body;
    
    // Check if user already exists
    if (findUserByEmail(email)) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user (in real app, hash password with bcrypt)
    const newUser = createUser({
      email,
      passwordHash: `mock_hash_${Date.now()}`, // Use bcrypt in production
      name,
      userType
    });

    const { passwordHash, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Patient endpoints
app.get('/api/patients/:patientId', (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Mock patient data retrieval
    const patient = mockDatabase.patients[patientId];
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      patient
    });

  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patient data'
    });
  }
});

app.get('/api/doctor/:doctorId/patients', (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Mock: Get all patients assigned to this doctor
    const doctorPatients = Object.values(mockDatabase.patients)
      .filter(patient => patient.doctorId === doctorId);

    res.status(200).json({
      success: true,
      patients: doctorPatients
    });

  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patients'
    });
  }
});

// Medication logging endpoints
app.post('/api/medication/log', validateMedicationLog, handleValidationErrors, (req, res) => {
  try {
    const { patientId, taken, timestamp = new Date().toISOString() } = req.body;
    
    const logId = `${patientId}_${new Date(timestamp).toISOString().split('T')[0]}`;
    
    const medicationLog = {
      id: logId,
      patientId,
      taken,
      timestamp,
      createdAt: new Date().toISOString()
    };

    mockDatabase.medicationLogs[logId] = medicationLog;

    res.status(201).json({
      success: true,
      message: 'Medication logged successfully',
      log: medicationLog
    });

  } catch (error) {
    console.error('Error logging medication:', error);
    res.status(500).json({
      success: false,
      message: 'Server error logging medication'
    });
  }
});

app.get('/api/medication/logs/:patientId', (req, res) => {
  try {
    const { patientId } = req.params;
    const { startDate, endDate, limit = 30 } = req.query;
    
    // Mock: Get medication logs for patient
    const patientLogs = Object.values(mockDatabase.medicationLogs)
      .filter(log => log.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      logs: patientLogs
    });

  } catch (error) {
    console.error('Error fetching medication logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching medication logs'
    });
  }
});

// Analytics endpoints
app.get('/api/analytics/adherence/:patientId', (req, res) => {
  try {
    const { patientId } = req.params;
    const { days = 30 } = req.query;
    
    // Mock adherence calculation
    const patientLogs = Object.values(mockDatabase.medicationLogs)
      .filter(log => log.patientId === patientId)
      .filter(log => {
        const logDate = new Date(log.timestamp);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        return logDate >= cutoffDate;
      });

    const totalDays = parseInt(days);
    const adherenceDays = patientLogs.filter(log => log.taken).length;
    const adherenceRate = totalDays > 0 ? (adherenceDays / totalDays * 100) : 0;

    res.status(200).json({
      success: true,
      analytics: {
        patientId,
        totalDays,
        adherenceDays,
        adherenceRate: Math.round(adherenceRate * 100) / 100,
        period: `${days} days`
      }
    });

  } catch (error) {
    console.error('Error calculating adherence:', error);
    res.status(500).json({
      success: false,
      message: 'Server error calculating adherence'
    });
  }
});

// Voice reminder endpoints
app.post('/api/voice/test', (req, res) => {
  try {
    const { language = 'en', messageType = 'dailyReminder' } = req.body;
    
    // Mock voice reminder test
    res.status(200).json({
      success: true,
      message: 'Voice reminder test initiated',
      language,
      messageType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Voice reminder test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error testing voice reminder'
    });
  }
});

// Notification endpoints
app.post('/api/notifications/reminder', (req, res) => {
  try {
    const { patientId, message, language = 'en' } = req.body;
    
    // Mock notification sending
    console.log(`Sending reminder to patient ${patientId}: ${message} (${language})`);
    
    res.status(200).json({
      success: true,
      message: 'Reminder sent successfully',
      patientId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending reminder'
    });
  }
});

// Generic error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/patients/:patientId',
      'GET /api/doctor/:doctorId/patients',
      'POST /api/medication/log',
      'GET /api/medication/logs/:patientId',
      'GET /api/analytics/adherence/:patientId',
      'POST /api/voice/test',
      'POST /api/notifications/reminder'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🏥 TB Adherence App Server');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💊 Health Check: http://localhost:${PORT}/api/health`);
  console.log('\n📋 Available Demo Credentials:');
  console.log('   Patient: patient@demo.com / password123');
  console.log('   Doctor: doctor@demo.com / password123');
  console.log('\n✨ Features Enabled:');
  console.log('   - Mock Authentication');
  console.log('   - Medication Logging');
  console.log('   - Patient Analytics');
  console.log('   - Voice Reminders');
  console.log('   - Doctor Dashboard APIs');
  console.log('   - Security Middleware');
  console.log('\n');
});

module.exports = app;