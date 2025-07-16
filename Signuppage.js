import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {registerUser}  from '../utils/dboperations';
import './AuthPages.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
    genrePreferences: []
  });
  const [error, setError] = useState('');

  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 
    'Romance', 'Sci-Fi', 'Thriller'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleGenreChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        genrePreferences: [...formData.genrePreferences, value]
      });
    } else {
      setFormData({
        ...formData,
        genrePreferences: formData.genrePreferences.filter(genre => genre !== value)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.genrePreferences.length === 0) {
      setError('Please select at least one genre preference');
      return;
    }

    try {
      await registerUser(
        formData.username,
        formData.age,
        formData.email,
        formData.password,
        formData.genrePreferences
      );
      navigate('/login');
    } catch (error) {
      setError(error.message || 'Error during registration');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Join MovieGram</h2>
        <p>Create your account to connect with movie lovers</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              min="13"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Genre Preferences</label>
            <div className="genre-checkboxes">
              {genres.map(genre => (
                <div key={genre} className="genre-checkbox">
                  <input
                    type="checkbox"
                    id={genre}
                    name="genrePreferences"
                    value={genre}
                    onChange={handleGenreChange}
                  />
                  <label htmlFor={genre}>{genre}</label>
                </div>
              ))}
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary">Sign Up</button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;