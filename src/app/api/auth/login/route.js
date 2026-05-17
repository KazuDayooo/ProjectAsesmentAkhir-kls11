// src/app/api/auth/login/route.js
// POST /api/auth/login
// Body: { username, password }

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    // Cari user di DB
    const [user] = await query(
      `SELECT id, username, full_name, role, password_hash
       FROM users
       WHERE username = ? AND is_active = 1
       LIMIT 1`,
      [username]
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    // Verifikasi password (bcrypt hash)
    // npm install bcryptjs
    const bcrypt = await import('bcryptjs');
    const valid  = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    // Buat JWT
    const token = await signToken({
      sub:      String(user.id),
      username: user.username,
      name:     user.full_name,
      role:     user.role,          // 'admin' | 'agent' | 'public'
    });

    // Set token di cookie (httpOnly) + kembalikan di body
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id:       user.id,
        username: user.username,
        name:     user.full_name,
        role:     user.role,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 8, // 8 jam (sama dengan JWT expires)
      path:     '/',
    });

    return response;
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
