import mysql from "mysql2";

// Replace single connection with a pool to avoid app crash on connect error
const pool = mysql.createPool({
  host:  "localhost",
  user:   "neclms",
  password: "NecWeb@2025~",
  database: "conference_db",
  
});

// Export a callback-capable pool as `db` so legacy code using db.query(sql, params, cb) keeps working.
export const db = pool;


export const dbPromise = pool.promise();


export function query(sql, params, cb) {
  if (typeof cb === "function") {
    return pool.query(sql, params, cb);
  }
  return dbPromise.query(sql, params);
}

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message || err);
    console.error("Full error:", err);
    return;
  }
  console.log("✅ MySQL Pool connected...");
  connection.release();
});

