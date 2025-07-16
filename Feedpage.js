import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMovies } from '../utils/dboperations';
import './FeedPage.css';

const FeedPage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(currentUser));
    
    // Fetch movies
    const fetchMovies = async () => {
      try {
        const movieData = await getMovies();
        setMovies(movieData);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading movies...</div>;
  }

  return (
    <div className="feed-container">
      <header className="feed-header">
        <h1>MovieGram</h1>
        <div className="user-controls">
          <span>Welcome, {user?.username}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>
      
      <div className="movies-grid">
        {movies.map(movie => (
          <Link 
            to={`/movie/${movie.id}`} 
            key={movie.id} 
            className="movie-card"
          >
            <div className="movie-poster">
              <img src={movie.posterUrl || '/api/placeholder/300/450'} alt={movie.title} />
            </div>
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p>{movie.year} • {movie.genres.join(', ')}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeedPage;