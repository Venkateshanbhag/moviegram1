// Database configuration
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open database connection
export const openDatabase = async () => {
  return open({
    filename: './moviegram.db',
    driver: sqlite3.Database
  });
};