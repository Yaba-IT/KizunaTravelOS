require("reflect-metadata");
const express = require("express");
const { DataSource } = require("typeorm");

const app = express();
const PORT = process.env.PORT || 4100;

const db = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB
  synchronize: false,
});

db.initialize()
  .then(() => {
    app.get('health', (_req, res) =>
      res.json({ status: 'OK', service: 'Accounting SVC' }),
    );
    app.listen(PORT, () => console.log(`Accounting SVC on :${PORT}`));
  })
  .catch((err) => {
    console.error('[Postgres] connection error', err);
    process.exit(1);
  });
