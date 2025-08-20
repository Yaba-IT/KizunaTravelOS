/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/configs/db.js - Database connection configuration
* Manages MongoDB connection and error handling
*
* coded by farid212@Yaba-IT!
*/
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.VITE_MONGO_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI (or MONGO_URI) environment variable is not set.');
  process.exit(1);
}

mongoose.connection
  .on('connected', () => console.log('MongoDB connected'))
  .on('error', (err) => console.error(`MongoDB connection error: ${err}`))
  .on('disconnected', () => console.warn('MongoDB disconnected'));

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.error(`MongoDB connection failed: ${err}`);
    process.exit(1);
  }
};

module.exports = connectDB;
