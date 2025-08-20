/* Yaba-IT/KizunaTravelOS
 *
 * scripts/fix-user-indexes.js - Script to fix user indexes
 *
 * coded by farid212@Yaba-IT!
 */

const mongoose = require('mongoose');
require('dotenv/config');
const User = require('../src/models/User');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const indexes = await mongoose.connection.db.collection('users').indexes();
  console.log(indexes);

  // Drop the extra schema-level one if present
  try {
    await mongoose.connection.db.collection('users').dropIndex('email_1');
    console.log('Dropped email_1 index');
  } catch (e) {
    console.log('email_1 not present or already dropped:', e.message);
  }

  // Align with schema
  await User.syncIndexes();
  console.log('Synced indexes');
  await mongoose.disconnect();
})();