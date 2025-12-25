require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
console.log('🔌 Connecting to MongoDB Atlas...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database: news-portal');
    seedUsers();
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('\n📝 Troubleshooting steps:');
    console.error('  1. Check your .env file exists');
    console.error('  2. Verify MONGODB_URI is correct');
    console.error('  3. Make sure <password> is replaced with actual password');
    console.error('  4. Check Network Access in MongoDB Atlas (0.0.0.0/0)');
    console.error('  5. Wait 2-3 minutes after adding IP address\n');
    process.exit(1);
  });

// MongoDB Models
const UserSchema = new mongoose.Schema({
  _id: Number,
  name: String,
  email: String
}, { _id: false });

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author_id: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  comments: [{
    id: Number,
    user_id: Number,
    text: String,
    created_at: Date
  }]
});

const User = mongoose.model('User', UserSchema);
const News = mongoose.model('News', NewsSchema);

// Seed initial users
async function seedUsers() {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.insertMany([
        { _id: 1, name: "John Doe", email: "john@example.com" },
        { _id: 2, name: "Jane Smith", email: "jane@example.com" },
        { _id: 3, name: "Bob Johnson", email: "bob@example.com" },
        { _id: 4, name: "Alice Williams", email: "alice@example.com" },
        { _id: 5, name: "Charlie Brown", email: "charlie@example.com" }
      ]);
      console.log('✅ Users seeded successfully (5 users)');
    } else {
      console.log(`✅ Users already exist (${count} users)`);
    }
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    message: 'News Portal API is running!',
    status: 'healthy',
    database: 'MongoDB Atlas',
    endpoints: {
      users: '/users',
      news: '/news'
    }
  });
});

// ----------------------------------------------------------------------------
// USER ROUTES
// ----------------------------------------------------------------------------

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    const formatted = users.map(u => ({ 
      id: u._id, 
      name: u.name, 
      email: u.email 
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: parseInt(req.params.id) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ----------------------------------------------------------------------------
// NEWS ROUTES
// ----------------------------------------------------------------------------

// Get all news (sorted by creation date, newest first)
app.get('/news', async (req, res) => {
  try {
    const news = await News.find().sort({ created_at: -1 });
    const formatted = news.map(n => ({
      id: n._id.toString(),
      title: n.title,
      body: n.body,
      author_id: n.author_id,
      created_at: n.created_at,
      comments: n.comments || []
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get single news by ID
app.get('/news/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }
    res.json({
      id: news._id.toString(),
      title: news.title,
      body: news.body,
      author_id: news.author_id,
      created_at: news.created_at,
      comments: news.comments || []
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Create new news
app.post('/news', async (req, res) => {
  try {
    const { title, body, author_id } = req.body;
    
    // Validation
    if (!title || !body || !author_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, body, author_id' 
      });
    }

    const news = new News({
      title,
      body,
      author_id,
      created_at: new Date(),
      comments: []
    });

    await news.save();

    res.status(201).json({
      id: news._id.toString(),
      title: news.title,
      body: news.body,
      author_id: news.author_id,
      created_at: news.created_at,
      comments: news.comments
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// Update news (PATCH)
app.patch('/news/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json({
      id: news._id.toString(),
      title: news.title,
      body: news.body,
      author_id: news.author_id,
      created_at: news.created_at,
      comments: news.comments || []
    });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Failed to update news' });
  }
});

// Delete news
app.delete('/news/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }
    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /',
      'GET /users',
      'GET /users/:id',
      'GET /news',
      'GET /news/:id',
      'POST /news',
      'PATCH /news/:id',
      'DELETE /news/:id'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Server running successfully!');
  console.log('📍 Local:   http://localhost:' + PORT);
  console.log('');
  console.log('📚 Available endpoints:');
  console.log('   GET    /           - Health check');
  console.log('   GET    /users      - Get all users');
  console.log('   GET    /users/:id  - Get user by ID');
  console.log('   GET    /news       - Get all news');
  console.log('   GET    /news/:id   - Get news by ID');
  console.log('   POST   /news       - Create news');
  console.log('   PATCH  /news/:id   - Update news');
  console.log('   DELETE /news/:id   - Delete news');
  console.log('');
  console.log('✅ Ready to accept requests!');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏸️  Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});
