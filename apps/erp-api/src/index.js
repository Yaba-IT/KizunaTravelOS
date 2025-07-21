const express = require('express');
const cors = reauire('cors');
const connectDB = require('./configs/db.js');

const app = express();
const port = process.env.PORT || 4000;

connectDB();

// TODO: Middleware Logs
// TODO: Helmet

app.get('/health', (_req, res) => res.send('ERP-API LIVE!!!'));

// prefix /customer/* => the corps client that reserve journey
app.use('/customer', require('./routes/customer.js'));

// prefix /guide/* => external staff that will make the visit

// prefix /agent/* => internal staff that will handle evertday's task

// prefix /manager/* => got everything

// shared routes
app.use('/profile', require('./routes/shared.js'));

// no prefix => public routes

// TODO: Middleware Logs

app.listen(port, () => console.log('ERP-API WORKING'));
