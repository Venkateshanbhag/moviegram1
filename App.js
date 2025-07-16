import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initDatabase } from './utils/dboperations';
import { LandingPage } from './components/Landingpage';
import {SignupPage} from './components/SignupPage';
import {LoginPage} from './components/Loginpage';
import {FeedPage} from './components/FeedPage';
import {MovieChat} from './components/Moviechat';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize database when app loads
    const setupDb = async () => {
      try {
        await initDatabase();
        console.log('Database initialized');
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };
    
    setupDb();
  }, []);

  // Check if user is authenticated
  const isAuthenticated = () => {
    return localStorage.getItem('currentUser') !== null;
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/feed" 
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/movie/:movieId" 
            element={
              <ProtectedRoute>
                <MovieChat />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;