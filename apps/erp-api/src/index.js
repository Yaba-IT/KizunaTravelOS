const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 4000;

app.get('/health', (_req,res) => res.json({ status: 'OK', service: 'ERP API' }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`ERP API running on localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('[Mongo] unable to connect:', err);
    process.exit(1);
  });
