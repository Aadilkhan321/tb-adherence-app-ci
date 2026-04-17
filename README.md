# 🏥 TB Medication Adherence App

> **Empowering TB patients through gamified medication tracking and multilingual voice reminders**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.2.0-blue.svg)](https://reactjs.org/)

A comprehensive web application designed for health-tech hackathons, focusing on improving tuberculosis (TB) treatment adherence through gamification, voice reminders, and real-time monitoring.

## 🌟 Features

### 🎮 **Gamified Patient Experience**
- **Daily Medication Logging**: Simple one-click medication tracking
- **Streak Tracking**: Visual progress with consecutive days counter
- **Badge System**: Unlock achievements for consistent adherence
- **Progress Visualization**: Interactive progress bars and completion tracking
- **Motivational Messages**: Personalized encouragement based on performance

### 🗣️ **AI Voice Reminders**
- **Multilingual Support**: English and Hindi voice prompts
- **Web Speech API Integration**: Browser-based text-to-speech
- **Customizable Timing**: Set personalized reminder schedules
- **Interactive Testing**: Test voice reminders with different languages

### 👨‍⚕️ **Doctor Dashboard**
- **Patient Monitoring**: Real-time adherence statistics and analytics
- **Visual Analytics**: Charts and graphs powered by Chart.js
- **Risk Assessment**: Identify patients needing intervention
- **Treatment Timeline**: Track patient progress over time
- **Batch Actions**: Send reminders and manage multiple patients

### 🌐 **Accessibility & Performance**
- **Mobile-Responsive Design**: Optimized for all device sizes
- **Low-Bandwidth Optimization**: Minimal asset loading
- **PWA Capabilities**: Offline functionality and app-like experience
- **Cross-Browser Support**: Works on modern browsers with graceful degradation

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git** (for cloning the repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tb-adherence-app.git
   cd tb-adherence-app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client and server dependencies
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   # Start both client and server concurrently
   npm run dev
   ```

4. **Open your browser**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000/api/health`

## 🎯 Demo Credentials

### Quick Access
- **Patient Demo**: `patient@demo.com` / `password123`
- **Doctor Demo**: `doctor@demo.com` / `password123`

### Pre-loaded Data
The app includes mock data for 4 patients with varying adherence patterns:
- **John Doe** (Patient Demo): 7-day streak, excellent adherence
- **Priya Sharma**: 3-day streak, good adherence, Hindi language preference
- **Maria Garcia**: Recent lapse, needs attention
- **Ahmed Hassan**: 14-day streak, consistent champion

## 📁 Project Structure

```
tb-adherence-app/
├── client/                 # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Main application pages
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main App component
│   │   ├── index.js        # React entry point
│   │   ├── firebase.js     # Mock Firebase configuration
│   │   └── index.css       # Global styles
│   └── package.json
├── server/                 # Node.js/Express backend
│   ├── routes/             # API route handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Data models
│   ├── server.js           # Express server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
├── docker-compose.yml      # Docker development setup
├── Dockerfile              # Container configuration
├── vercel.json             # Vercel deployment config
├── netlify.toml           # Netlify deployment config
├── package.json           # Root package configuration
└── README.md              # This file
```

## 🛠️ Development

### Available Scripts

#### Root Level
```bash
npm run dev          # Start both client and server in development mode
npm run client       # Start only the React client
npm run server       # Start only the Express server
npm run build        # Build client for production
npm run install-all  # Install dependencies for both client and server
```

#### Client (`cd client/`)
```bash
npm start           # Start React development server
npm run build       # Build for production
npm test            # Run tests
```

#### Server (`cd server/`)
```bash
npm run dev         # Start server with nodemon (auto-reload)
npm start           # Start server in production mode
```

### Environment Configuration

1. **Copy environment template**
   ```bash
   cp server/.env.example server/.env
   ```

2. **Update configuration** (optional for demo)
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_secret_key_here
   ```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Patient Management
- `GET /api/patients/:patientId` - Get patient details
- `GET /api/doctor/:doctorId/patients` - Get doctor's patients

### Medication Tracking
- `POST /api/medication/log` - Log medication intake
- `GET /api/medication/logs/:patientId` - Get medication history

### Analytics
- `GET /api/analytics/adherence/:patientId` - Get adherence statistics

### Voice & Notifications
- `POST /api/voice/test` - Test voice reminder
- `POST /api/notifications/reminder` - Send medication reminder

### Health Check
- `GET /api/health` - Server health status

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure environment variables** in Vercel dashboard

### Netlify

1. **Connect repository** to Netlify
2. **Build settings** are configured in `netlify.toml`
3. **Deploy** automatically on push to main branch

### Docker

1. **Build image**
   ```bash
   docker build -t tb-adherence-app .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 -p 5000:5000 tb-adherence-app
   ```

3. **Using Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 🎪 Demo Guide for Judges

### 1. Login Experience (2 minutes)
1. **Visit the application** at your deployed URL
2. **Try Patient Demo**: Click "Patient Demo" → Sign In
3. **Explore the gamified dashboard** with existing streak and badges
4. **Test medication logging**: Click "Take Medication" button
5. **Experience voice reminders**: Test voice reminder in different languages

### 2. Doctor Dashboard (3 minutes)
1. **Logout** and **Login as Doctor**: Click "Doctor Demo" → Sign In
2. **View patient analytics**: Observe charts and adherence statistics
3. **Examine patient details**: Click on different patients to see trends
4. **Review risk assessment**: Note high-risk vs. excellent adherence patients

### 3. Key Innovation Points (2 minutes)
1. **Gamification**: Show badge system and streak mechanics
2. **Multilingual Voice**: Demonstrate Hindi voice reminders
3. **Real-time Analytics**: Highlight Chart.js visualizations
4. **Mobile Responsiveness**: Test on different screen sizes
5. **Low-bandwidth Design**: Explain optimization strategies

### 4. Technical Architecture (1 minute)
1. **Frontend**: React with Tailwind CSS for rapid development
2. **Backend**: Express.js with mock data for demo reliability
3. **Voice Integration**: Web Speech API for accessibility
4. **Data Visualization**: Chart.js for healthcare analytics
5. **Deployment**: Vercel/Netlify ready with Docker support

## 🌍 Global Impact & Scalability

### Target Demographics
- **Primary**: TB patients in multilingual regions (India, Southeast Asia)
- **Secondary**: Healthcare providers in resource-limited settings
- **Tertiary**: Public health organizations tracking treatment outcomes

### Scalability Features
- **Language Extensibility**: Easy addition of new languages
- **Badge System**: Configurable achievement criteria
- **Analytics Engine**: Adaptable to different health metrics
- **API Architecture**: Ready for mobile app integration
- **Database Agnostic**: Easily switch from mock to real database

### Real-world Deployment Considerations
- **Database Integration**: PostgreSQL/MongoDB for production
- **Authentication**: JWT tokens with refresh mechanism
- **Push Notifications**: Integration with Firebase Cloud Messaging
- **SMS Reminders**: Twilio integration for areas with limited internet
- **Offline Support**: Service Workers for PWA functionality

## 🔐 Security Features

- **Helmet.js**: Security headers and XSS protection
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Express-validator for data sanitization
- **CORS Configuration**: Controlled cross-origin requests
- **Environment Variables**: Sensitive data protection
- **HIPAA Considerations**: Mock compliance for demo purposes

## 📊 Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Asset Minification**: Optimized build process
- **CDN Integration**: Tailwind CSS via CDN for fast loading
- **Lighthouse Score**: Optimized for Core Web Vitals
- **Bundle Analysis**: Webpack bundle optimization

## 🧪 Testing Strategy

### Frontend Testing
```bash
cd client
npm test                    # Run Jest unit tests
npm run test:coverage      # Generate coverage report
```

### Backend Testing
```bash
cd server
npm test                   # Run API endpoint tests
npm run test:integration   # Run integration tests
```

### End-to-End Testing
```bash
npm run test:e2e          # Run Cypress tests (if configured)
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **World Health Organization** - TB treatment guidelines
- **React Community** - Component libraries and best practices
- **Chart.js Team** - Data visualization capabilities
- **Tailwind CSS** - Rapid UI development framework
- **Vercel/Netlify** - Deployment platform support

## 📞 Support & Contact

- **Demo Issues**: Check browser console for voice API support
- **Technical Questions**: Review API documentation in server/server.js
- **Feature Requests**: Open an issue with [Feature] tag
- **Security Concerns**: Contact maintainers directly

---

**🏆 Built for Health-Tech Hackathons with ❤️**

*This application demonstrates the power of combining modern web technologies with healthcare innovation to create impactful solutions for global health challenges.*# CI/CD Test
# CI/CD Test
