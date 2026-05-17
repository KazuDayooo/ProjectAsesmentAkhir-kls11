// src/app/api/superadmin/users/route.js
// GET  → list users
// POST → buat user baru
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/superadmin';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const role   = searchParams.get('role');
    const search = searchParams.get('search');

    let sql = `SELECT id, username, full_name, email, role, is_active, created_at, updated_at FROM users WHERE 1=1`;
    const params = [];

    if (role)   { sql += ' AND role = ?';                         params.push(role); }
    if (search) { sql += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
                  const q = `%${search}%`;
                  params.push(q, q, q); }

    sql += ' ORDER BY created_at DESC';
    const users = await query(sql, params);

    return NextResponse.json({ success: true, data: users });
  } catch (err) {
    console.error('[GET /api/superadmin/users]', err);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data user.' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { username, password, full_name, email, role } = await request.json();

    if (!username || !password || !full_name || !role) {
      return NextResponse.json({ success: false, error: 'Field wajib tidak lengkap.' }, { status: 400 });
    }

    const validRoles = ['superadmin', 'admin', 'agent', 'public'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: 'Role tidak valid.' }, { status: 400 });
    }

    // Cek username sudah ada
    const [existing] = await query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Username sudah digunakan.' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (username, password_hash, full_name, email, role, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [username, password_hash, full_name, email || null, role]
    );

    return NextResponse.json({
      success: true,
      message: 'User berhasil dibuat.',
      userId: result.insertId,
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/superadmin/users]', err);
    return NextResponse.json({ success: false, error: 'Gagal membuat user.' }, { status: 500 });
  }
}
