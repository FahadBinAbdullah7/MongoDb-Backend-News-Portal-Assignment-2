// migrate-db-to-mongodb.js
// Run: node migrate-db-to-mongodb.js

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

console.log('🔄 Migrating data from db.json to MongoDB...\n');

// Read db.json
const dbJsonPath = path.join(__dirname, '..', 'news-portal', 'db.json');

if (!fs.existsSync(dbJsonPath)) {
  console.log('❌ db.json not found at:', dbJsonPath);
  console.log('💡 No migration needed - you can start fresh with MongoDB!');
  process.exit(0);
}

const dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

console.log('📄 Found db.json with:');
console.log('   Users:', dbData.users?.length || 0);
console.log('   News:', dbData.news?.length || 0);
console.log('');

// Define schemas
const UserSchema = new mongoose.Schema({
  _id: Number,
  name: String,
  email: String
}, { _id: false });

const NewsSchema = new mongoose.Schema({
  title: String,
  body: String,
  author_id: Number,
  created_at: Date,
  comments: [{
    id: Number,
    user_id: Number,
    text: String,
    created_at: Date
  }]
});

const User = mongoose.model('User', UserSchema);
const News = mongoose.model('News', NewsSchema);

// Connect and migrate
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Migrate users
    if (dbData.users && dbData.users.length > 0) {
      console.log('👥 Migrating users...');
      await User.deleteMany({}); // Clear existing
      await User.insertMany(dbData.users);
      console.log(`   ✅ Migrated ${dbData.users.length} users\n`);
    }
    
    // Migrate news
    if (dbData.news && dbData.news.length > 0) {
      console.log('📰 Migrating news...');
      await News.deleteMany({}); // Clear existing
      
      // Convert dates
      const newsWithDates = dbData.news.map(article => ({
        ...article,
        created_at: new Date(article.created_at),
        comments: article.comments?.map(comment => ({
          ...comment,
          created_at: new Date(comment.created_at)
        })) || []
      }));
      
      await News.insertMany(newsWithDates);
      console.log(`   ✅ Migrated ${dbData.news.length} news articles\n`);
    }
    
    console.log('🎉 Migration complete!');
    console.log('\n📊 MongoDB now contains:');
    console.log('   Users:', await User.countDocuments());
    console.log('   News:', await News.countDocuments());
    console.log('\n✅ You can now use MongoDB backend!');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  });
