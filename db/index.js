const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

const query = async (rawQuery) => {
  return new Promise((res, rej) => {
    pool.query(rawQuery, (err, result) => {
      if (err) rej(err);
      res(result?.rows);
    });
  });
};

module.exports = { query };
