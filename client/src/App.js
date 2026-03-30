import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import pages and components
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import LoadingSpinner from './components/LoadingSpinner';

// Import Firebase utilities
import { auth, initializeMockData, firestore } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Seed demo data into Firestore once
    initializeMockData();

    // ✅ Listen to real Firebase auth state
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch full profile from Firestore
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};

          const fullUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name || firebaseUser.email,
            userType: userData.userType || 'patient',
            ...userData
          };

          setUser(fullUser);
          auth.currentUser = fullUser;
        } catch (err) {
          console.error('Error fetching user profile:', err);
          // ✅ Fallback: still log user in even if Firestore fetch fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.email,
            userType: 'patient'
          });
        }
      } else {
        setUser(null);
        auth.currentUser = null;
      }
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    auth.currentUser = userData;
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App min-h-screen bg-gray-50">
      <Router>
        <div className="min-h-screen">
          {/* Navigation Header */}
          {user && (
            <nav className="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 text-white shadow-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold">🏥 TB Adherence App</h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-pink-200">
                      Welcome, {user.name || user.email}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-medium">
                      {user.userType === 'doctor' ? '👨‍⚕️ Doctor' : '🧑‍⚕️ Patient'}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          )}

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  user ?
                    <Navigate to={user.userType === 'doctor' ? '/doctor' : '/patient'} /> :
                    <Login onLogin={handleLogin} />
                }
              />

              {/* Protected Routes */}
              <Route
                path="/patient"
                element={
                  user && user.userType === 'patient' ?
                    <PatientDashboard user={user} /> :
                    <Navigate to="/login" />
                }
              />

              <Route
                path="/doctor"
                element={
                  user && user.userType === 'doctor' ?
                    <DoctorDashboard user={user} /> :
                    <Navigate to="/login" />
                }
              />

              {/* Root redirect */}
              <Route
                path="/"
                element={
                  user ?
                    <Navigate to={user.userType === 'doctor' ? '/doctor' : '/patient'} /> :
                    <Navigate to="/login" />
                }
              />

              {/* 404 fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-gray-800 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">TB Adherence App</h3>
                <p className="text-gray-300 mb-4">
                  Empowering TB patients with gamified medication adherence tracking
                </p>
                <div className="text-sm text-gray-400">
                  <p>📱 Optimized for mobile and low-bandwidth environments</p>
                  <p>🗣️ Voice reminders in multiple languages</p>
                  <p>🎮 Gamified experience to boost motivation</p>
                  <p>📊 Real-time monitoring for healthcare providers</p>
                </div>
                <div className="mt-6 text-xs text-gray-500">
                  <p>Built for Health-Tech Hackathon • Demo Version</p>
                  <p className="mt-2">
                    Demo Credentials:<br />
                    Patient: dhimanayush025@gmail.com / password123<br />
                    Doctor: aadilkhanxxxx@gmail.com / password123
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;