// src/lib/db.js — koneksi MySQL untuk Next.js (App Router)
// npm install mysql2

import mysql from 'mysql2/promise';

const poolConfig = {
  host:               process.env.DB_HOST     || 'localhost',
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'konekko_services',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+07:00',       // WIB
  charset:            'utf8mb4',
};

// Singleton pool — satu pool untuk seluruh app
let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(poolConfig);
    console.log('[DB] MySQL pool created →', poolConfig.database);
  }
  return pool;
}

// Helper: jalankan query + auto-release connection
export async function query(sql, params = []) {
  const conn = await getPool().getConnection();
  try {
    const [rows] = await conn.execute(sql, params);
    return rows;
  } finally {
    conn.release();
  }
}

// Helper: transaction
export async function withTransaction(callback) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
