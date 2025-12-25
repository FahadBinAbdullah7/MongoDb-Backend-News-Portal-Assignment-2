// Test MongoDB Connection
// Run: node test-connection.js

require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n🔍 Testing MongoDB Atlas Connection...\n');

// Check if .env file is loaded
if (!process.env.MONGODB_URI) {
  console.log('❌ ERROR: MONGODB_URI not found in .env file!');
  console.log('\n📝 Steps to fix:');
  console.log('  1. Make sure .env file exists in this folder');
  console.log('  2. Make sure it contains: MONGODB_URI=your-connection-string');
  console.log('  3. Make sure no spaces around the = sign');
  process.exit(1);
}

// Show (partial) connection string for debugging
const connStr = process.env.MONGODB_URI;
const safeConnStr = connStr.substring(0, 30) + '***' + connStr.substring(connStr.lastIndexOf('@'));
console.log('📍 Connection string (password hidden):');
console.log('  ', safeConnStr);
console.log('');

// Check for common mistakes
console.log('🔍 Checking for common issues...\n');

let hasIssues = false;

if (connStr.includes('<password>')) {
  console.log('❌ ERROR: You forgot to replace <password> with your actual password!');
  hasIssues = true;
}

if (!connStr.includes('/news-portal?')) {
  console.log('⚠️  WARNING: Connection string might be missing /news-portal');
  console.log('   Should be: ...mongodb.net/news-portal?retryWrites...');
  hasIssues = true;
}

if (connStr.includes('@') && connStr.indexOf('@') !== connStr.lastIndexOf('@')) {
  console.log('⚠️  WARNING: Special character @ in password needs to be encoded as %40');
  hasIssues = true;
}

if (connStr.includes(' ')) {
  console.log('❌ ERROR: Connection string contains spaces! Remove all spaces.');
  hasIssues = true;
}

if (!hasIssues) {
  console.log('✅ No obvious issues found in connection string format\n');
}

// Try to connect
console.log('🔌 Attempting to connect to MongoDB Atlas...\n');

const timeout = setTimeout(() => {
  console.log('⏰ Connection is taking too long...');
  console.log('\n📝 This usually means:');
  console.log('  1. IP address not whitelisted in MongoDB Atlas');
  console.log('  2. Wrong password');
  console.log('  3. Network/firewall blocking connection');
  console.log('  4. MongoDB cluster not running');
  console.log('\n💡 Steps to fix:');
  console.log('  1. Go to MongoDB Atlas → Network Access');
  console.log('  2. Add IP address: 0.0.0.0/0');
  console.log('  3. Wait 2-3 minutes');
  console.log('  4. Try again');
}, 15000);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    clearTimeout(timeout);
    console.log('✅ SUCCESS! MongoDB Atlas connected!\n');
    console.log('🎉 Your connection string is correct!');
    console.log('🎉 Your IP is whitelisted!');
    console.log('🎉 Your credentials are valid!\n');
    console.log('✅ You can now run: npm run dev');
    process.exit(0);
  })
  .catch((err) => {
    clearTimeout(timeout);
    console.log('❌ FAILED! Could not connect to MongoDB Atlas\n');
    console.log('Error message:', err.message);
    console.log('\n📝 Common solutions:\n');
    
    if (err.message.includes('authentication failed')) {
      console.log('  ❌ WRONG PASSWORD');
      console.log('     → Go to MongoDB Atlas → Database Access');
      console.log('     → Edit user → Reset password');
      console.log('     → Update .env file with new password');
    } else if (err.message.includes('connect ETIMEDOUT') || err.message.includes('connect ECONNREFUSED')) {
      console.log('  ❌ IP NOT WHITELISTED or NETWORK BLOCKED');
      console.log('     → Go to MongoDB Atlas → Network Access');
      console.log('     → Add IP Address: 0.0.0.0/0');
      console.log('     → Wait 2-3 minutes and try again');
    } else if (err.message.includes('Invalid connection string')) {
      console.log('  ❌ CONNECTION STRING FORMAT WRONG');
      console.log('     → Check your .env file');
      console.log('     → Should be: mongodb+srv://user:pass@cluster.mongodb.net/database?options');
    } else {
      console.log('  ℹ️  Unknown error. Full details below:');
      console.log('\n' + err.stack);
    }
    
    console.log('\n💡 Need help? Check FIX_CONNECTION_TIMEOUT.md\n');
    process.exit(1);
  });
