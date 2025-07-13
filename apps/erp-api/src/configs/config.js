require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

module.exports = {
  supabase: createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY),
  mongoUri: process.env.VITE_MONGO_URI,
};
