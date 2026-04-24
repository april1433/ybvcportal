const { Pool } = require('pg'); 
const pool = new Pool({ connectionString: 'postgresql://postgres.hblqfvihvalahwxfbriw:D3L%2CS%21erZ%2CHN4%2B7@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' }); 
pool.query('SELECT * FROM student_ledgers WHERE student_id = $1', ['2006-0031']).then(res => { console.log(JSON.stringify(res.rows, null, 2)); process.exit(0); });
