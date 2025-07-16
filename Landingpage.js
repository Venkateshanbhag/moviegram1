import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  // Sample movie posters for the collage
  const moviePosters = [
    '/api/placeholder/300/450', // These would be actual movie poster URLs in production
    '/api/placeholder/300/450',
    '/api/placeholder/300/450',
    '/api/placeholder/300/450',
    '/api/placeholder/300/450',
    '/api/placeholder/300/450',
    '/api/placeholder/300/450',
    '/api/placeholder/300/450',
    '/api/placeholder/300/450',
    '/api/placeholder/300/450',
    '/api/placeholder/300/450',
    '/api/placeholder/300/450',
  ];

  return (
    <div className="landing-container">
      <div className="overlay">
        <div className="landing-content">
          <h1 className="landing-title">MovieGram</h1>
          <p className="landing-description">
            Connect with fellow movie enthusiasts, discuss your favorite films, 
            and discover new cinematic treasures. MovieGram is the ultimate 
            social platform for everyone who lives and breathes cinema.
          </p>
          <div className="auth-buttons">
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        </div>
      </div>
      <div className="poster-collage">
        {moviePosters.map((poster, index) => (
          <div key={index} className="poster-item" style={{ 
            transform: `rotate(${Math.random() * 20 - 10}deg)`,
            zIndex: index
          }}>
            <img src={poster} alt="Movie poster" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;