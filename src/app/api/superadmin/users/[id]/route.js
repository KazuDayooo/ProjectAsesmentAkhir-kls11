// src/app/api/superadmin/users/[id]/route.js
// GET    → detail user
// PUT    → update user
// DELETE → hapus user
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/superadmin';
import bcrypt from 'bcryptjs';

export async function GET(request, { params }) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const [user] = await query(
      'SELECT id, username, full_name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [params.id]
    );
    if (!user) return NextResponse.json({ success: false, error: 'User tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { full_name, email, role, is_active, password } = body;

    const [user] = await query('SELECT id FROM users WHERE id = ?', [params.id]);
    if (!user) return NextResponse.json({ success: false, error: 'User tidak ditemukan.' }, { status: 404 });

    // Cegah superadmin hapus/ubah diri sendiri ke role lain
    if (String(auth.payload.sub) === String(params.id) && role && role !== 'superadmin') {
      return NextResponse.json({ success: false, error: 'Tidak dapat mengubah role diri sendiri.' }, { status: 400 });
    }

    let sql = 'UPDATE users SET full_name = ?, email = ?, role = ?, is_active = ?, updated_at = NOW()';
    const upParams = [full_name, email || null, role, is_active ? 1 : 0];

    if (password) {
      const hash = await bcrypt.hash(password, 12);
      sql += ', password_hash = ?';
      upParams.push(hash);
    }

    sql += ' WHERE id = ?';
    upParams.push(params.id);

    await query(sql, upParams);
    return NextResponse.json({ success: true, message: 'User berhasil diupdate.' });
  } catch (err) {
    console.error('[PUT /api/superadmin/users/:id]', err);
    return NextResponse.json({ success: false, error: 'Gagal update user.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    // Cegah hapus diri sendiri
    if (String(auth.payload.sub) === String(params.id)) {
      return NextResponse.json({ success: false, error: 'Tidak dapat menghapus akun sendiri.' }, { status: 400 });
    }

    const [user] = await query('SELECT id FROM users WHERE id = ?', [params.id]);
    if (!user) return NextResponse.json({ success: false, error: 'User tidak ditemukan.' }, { status: 404 });

    await query('DELETE FROM users WHERE id = ?', [params.id]);
    return NextResponse.json({ success: true, message: 'User berhasil dihapus.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal menghapus user.' }, { status: 500 });
  }
}
