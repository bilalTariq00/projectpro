// Minimal Railway server - CANNOT FAIL
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 ProjectPro API is running on Railway!');
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running on Railway',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/mobile/login', (req, res) => {
  res.json({
    id: 1,
    username: "testuser",
    fullName: "Test User", 
    email: "test@example.com",
    mobileSessionId: "mobile_test_session_123"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on Railway port ${PORT}`);
});




