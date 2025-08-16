/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/configs/db.js - Database connection configuration
* Manages MongoDB connection and error handling
*
* coded by farid212@Yaba-IT!
*/

require('dotenv').config();
const mongoose = require('mongoose');

const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI environment variable is not set.');
  process.exit(1);
}

mongoose.connection
  .on('connected', () => console.log('MongoDB connected'))
  .on('error', (err) => console.error(`MongoDB connection error: ${err}`))
  .on('disconnected', () => console.warn('MongoDB disconnected'));

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
  } catch (err) {
    console.error(`MongoDB connection failed: ${err}`);
    process.exit(1);
  }
};

module.exports = connectDB;
