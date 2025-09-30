// Simple Railway-compatible server
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-mobile-session-id']
}));

app.use(express.json());

// Simple routes
app.get('/', (req, res) => {
  res.send('🚀 ProjectPro API is running on Railway!');
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ProjectPro API',
    message: 'Backend is running on Railway'
  });
});

// Mock mobile routes for testing
app.post('/api/mobile/login', (req, res) => {
  res.json({
    id: 1,
    username: "testuser",
    fullName: "Test User",
    email: "test@example.com",
    mobileSessionId: "mobile_test_session_123"
  });
});

app.post('/api/mobile/register', (req, res) => {
  res.json({
    id: 2,
    username: req.body.username || "newuser",
    fullName: req.body.fullName || "New User",
    email: req.body.email || "new@example.com"
  });
});

app.get('/api/mobile/user', (req, res) => {
  res.json({
    id: 1,
    username: "testuser",
    fullName: "Test User",
    email: "test@example.com"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on Railway port ${PORT}`);
});
