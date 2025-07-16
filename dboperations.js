// Database operations for MovieGram
import { openDatabase } from './dbConfig';
import bcrypt from 'bcryptjs';

// Initialize database
export const initDatabase = async () => {
  const db = await openDatabase();
  
  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      age INTEGER NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create user preferences table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      genre TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // Create movies table with sample data
  await db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year INTEGER NOT NULL,
      director TEXT,
      poster_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create movie genres table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS movie_genres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      genre TEXT NOT NULL,
      FOREIGN KEY (movie_id) REFERENCES movies (id)
    )
  `);
  
  // Create chat messages table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      timestamp TIMESTAMP NOT NULL,
      FOREIGN KEY (movie_id) REFERENCES movies (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // Insert sample movies if none exist
  const movieCount = await db.get(`SELECT COUNT(*) as count FROM movies`);
  
  if (movieCount.count === 0) {
    const sampleMovies = [
      { 
        title: 'Inception', 
        year: 2010, 
        director: 'Christopher Nolan',
        genres: ['Sci-Fi', 'Action', 'Thriller']
      },
      { 
        title: 'The Shawshank Redemption', 
        year: 1994, 
        director: 'Frank Darabont',
        genres: ['Drama']
      },
      { 
        title: 'Pulp Fiction', 
        year: 1994, 
        director: 'Quentin Tarantino',
        genres: ['Crime', 'Drama']
      },
      { 
        title: 'The Dark Knight', 
        year: 2008, 
        director: 'Christopher Nolan',
        genres: ['Action', 'Crime', 'Drama']
      },
      { 
        title: 'Parasite', 
        year: 2019, 
        director: 'Bong Joon-ho',
        genres: ['Thriller', 'Drama', 'Comedy']
      },
      { 
        title: 'The Godfather', 
        year: 1972, 
        director: 'Francis Ford Coppola',
        genres: ['Crime', 'Drama']
      }
    ];
    
    for (const movie of sampleMovies) {
      const result = await db.run(
        `INSERT INTO movies (title, year, director) VALUES (?, ?, ?)`,
        [movie.title, movie.year, movie.director]
      );
      
      const movieId = result.lastID;
      
      for (const genre of movie.genres) {
        await db.run(
          `INSERT INTO movie_genres (movie_id, genre) VALUES (?, ?)`,
          [movieId, genre]
        );
      }
    }
  }
};

// User registration
export const registerUser = async (username, age, email, password, genrePreferences) => {
  const db = await openDatabase();
  
  // Check if username or email already exists
  const existingUser = await db.get(
    `SELECT * FROM users WHERE username = ? OR email = ?`,
    [username, email]
  );
  
  if (existingUser) {
    throw new Error('Username or email already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Insert user
  const result = await db.run(
    `INSERT INTO users (username, age, email, password) VALUES (?, ?, ?, ?)`,
    [username, age, email, hashedPassword]
  );
  
  const userId = result.lastID;
  
  // Insert genre preferences
  for (const genre of genrePreferences) {
    await db.run(
      `INSERT INTO user_preferences (user_id, genre) VALUES (?, ?)`,
      [userId, genre]
    );
  }
  
  return { userId, username };
};

// User login
export const loginUser = async (username, password) => {
  const db = await openDatabase();
  
  // Get user by username
  const user = await db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username]
  );
  
  if (!user) {
    return null;
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    return null;
  }
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    age: user.age
  };
};

// Get movies
export const getMovies = async () => {
  const db = await openDatabase();
  
  const movies = await db.all(`SELECT * FROM movies ORDER BY title`);
  
  // Get genres for each movie
  for (const movie of movies) {
    const genres = await db.all(
      `SELECT genre FROM movie_genres WHERE movie_id = ?`,
      [movie.id]
    );
    
    movie.genres = genres.map(g => g.genre);
    movie.posterUrl = movie.poster_url; // Normalize field name
  }
  
  return movies;
};

// Get movie details
export const getMovieDetails = async (movieId) => {
  const db = await openDatabase();
  
  const movie = await db.get(
    `SELECT * FROM movies WHERE id = ?`,
    [movieId]
  );
  
  if (!movie) {
    throw new Error('Movie not found');
  }
  
  // Get genres
  const genres = await db.all(
    `SELECT genre FROM movie_genres WHERE movie_id = ?`,
    [movieId]
  );
  
  movie.genres = genres.map(g => g.genre);
  movie.posterUrl = movie.poster_url; // Normalize field name
  
  return movie;
};

// Get movie chat messages
export const getMovieChat = async (movieId) => {
  const db = await openDatabase();
  
  const messages = await db.all(
    `SELECT cm.id, cm.user_id, u.username, cm.content, cm.timestamp 
     FROM chat_messages cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.movie_id = ?
     ORDER BY cm.timestamp`,
    [movieId]
  );
  
  return messages;
};

// Send chat message
export const sendChatMessage = async (movieId, userId, username, content, timestamp) => {
  const db = await openDatabase();
  
  const result = await db.run(
    `INSERT INTO chat_messages (movie_id, user_id, content, timestamp) 
     VALUES (?, ?, ?, ?)`,
    [movieId, userId, content, timestamp]
  );
  
  return {
    id: result.lastID,
    movieId,
    userId,
    username,
    content,
    timestamp
  };
};