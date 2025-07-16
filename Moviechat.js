import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getMovieChat, sendChatMessage } from '../utils/dboperations';
import './MovieChat.css';

const MovieChat = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Check if user is logged in and fetch movie details
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(currentUser));
    
    const fetchMovieData = async () => {
      try {
        const movieData = await getMovieDetails(movieId);
        setMovie(movieData);
        
        const chatHistory = await getMovieChat(movieId);
        setMessages(chatHistory);
      } catch (error) {
        console.error('Error fetching movie data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieData();
    
    // Set up polling for new messages
    const interval = setInterval(() => {
      getMovieChat(movieId).then(chatHistory => {
        setMessages(chatHistory);
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [movieId, navigate]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      const timestamp = new Date().toISOString();
      await sendChatMessage(movieId, user.id, user.username, newMessage, timestamp);
      
      // Optimistically add message to UI
      setMessages([...messages, {
        id: `temp-${Date.now()}`,
        userId: user.id,
        username: user.username,
        content: newMessage,
        timestamp
      }]);
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading movie chat...</div>;
  }

  return (
    <div className="movie-chat-container">
      <div className="movie-header">
        <button className="back-button" onClick={() => navigate('/feed')}>
          &larr; Back to Feed
        </button>
        
        <div className="movie-info">
          <img 
            src={movie.posterUrl || '/api/placeholder/150/225'} 
            alt={movie.title} 
            className="movie-thumbnail" 
          />
          <div className="movie-details">
            <h1>{movie.title}</h1>
            <p className="movie-meta">{movie.year} • {movie.director}</p>
            <p className="movie-genres">{movie.genres.join(' • ')}</p>
          </div>
        </div>
      </div>
      
      <div className="chat-section">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>Be the first to start a conversation about {movie.title}!</p>
            </div>
          ) : (
            messages.map(msg => (
              <div 
                key={msg.id} 
                className={`message ${msg.userId === user.id ? 'own-message' : ''}`}
              >
                <div className="message-header">
                  <span className="message-user">{msg.username}</span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            required
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default MovieChat;