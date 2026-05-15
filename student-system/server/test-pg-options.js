import pg from 'pg';
import { config } from 'dotenv';
config({ path: '.env' });

let connectionString = process.env.DATABASE_URL;
if (!connectionString.includes('search_path')) {
  connectionString += (connectionString.includes('?') ? '&' : '?') + 'options=-c%20search_path=public';
}

console.log("Using URL:", connectionString.replace(/:[^:@]+@/, ':***@'));

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.query('SHOW search_path;')
  .then(res => {
    console.log("Search path is:", res.rows[0]);
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
