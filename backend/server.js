require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow CORS in dev and simple self-host
app.use(cors({
  origin: true,
  credentials: true,
}));
app.options('*', cors());
app.use(express.json());

// Placeholder for user data
const users = {
  'admin': { role: 'admin', password: 'admin' },
  'user': { role: 'user', password: 'user' },
};

const path = require('path');

// --- API Routes ---

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (user && user.password === password) {
    console.log(`Login successful for ${username}`);
    res.json({ 
      message: 'Login successful!',
      token: `fake-token-for-${username}`,
      user: {
        username: username,
        role: user.role
      }
    });
  } else {
    console.log(`Login failed for ${username}`);
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Placeholder for tasks
app.get('/api/tasks', (req, res) => {
  // In a real app, you would fetch this from a database
  res.json([]);
});

// --- Serve React App ---
const buildPath = path.join(__dirname, '../apps/web/dist');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
