import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "../shared/schema.js";

let db: ReturnType<typeof drizzle> | null = null;
let isInitialized = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// Build DATABASE_URL from individual components if not provided
function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Fallback: build from individual MySQL components
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = process.env.MYSQL_PORT || '3306';
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'railway';

  return `mysql://${user}:${password}@${host}:${port}/${database}?ssl=false`;
}

export async function initDB() {
  if (isInitialized && db) {
    return db;
  }

  const databaseUrl = getDatabaseUrl();
  console.log('🔗 Attempting to connect to database...');
  
  try {
    // Create connection with retry logic
    const connection = await mysql.createConnection(databaseUrl);
    
    // Test the connection
    await connection.ping();
    
    db = drizzle(connection, { schema, mode: 'default' });
    isInitialized = true;
    connectionAttempts = 0;
    
    console.log('✅ Database connected successfully');
    return db;
  } catch (error) {
    connectionAttempts++;
    console.error(`❌ Database connection attempt ${connectionAttempts} failed:`, error);
    
    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      console.error('❌ Max database connection attempts reached. Application will run without database.');
      throw new Error(`Failed to connect to database after ${MAX_CONNECTION_ATTEMPTS} attempts`);
    }
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, 2000 * connectionAttempts));
    return initDB();
  }
}

// Graceful database initialization - don't block app startup
(async () => {
  try {
    await initDB();
  } catch (error) {
    console.error('❌ Database initialization failed, but app will continue:', error);
    // Don't throw - let the app start without database
  }
})();

export { db };
