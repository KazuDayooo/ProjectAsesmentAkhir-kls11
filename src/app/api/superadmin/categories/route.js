// src/app/api/superadmin/categories/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/superadmin';

export async function GET(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const categories = await query(`
      SELECT c.*, COUNT(it.id) as issue_type_count,
             COUNT(DISTINCT comp.id) as complaint_count
      FROM categories c
      LEFT JOIN issue_types it ON it.category_id = c.id
      LEFT JOIN complaints comp ON comp.category_id = c.id
      GROUP BY c.id ORDER BY c.id ASC
    `);
    return NextResponse.json({ success: true, data: categories });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil kategori.' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { code, name, description, icon, color_hex } = await request.json();

    if (!code || !name || !description || !icon || !color_hex) {
      return NextResponse.json({ success: false, error: 'Field wajib tidak lengkap.' }, { status: 400 });
    }

    const [existing] = await query('SELECT id FROM categories WHERE code = ?', [code]);
    if (existing) return NextResponse.json({ success: false, error: 'Kode kategori sudah ada.' }, { status: 409 });

    const result = await query(
      'INSERT INTO categories (code, name, description, icon, color_hex) VALUES (?, ?, ?, ?, ?)',
      [code, name, description, icon, color_hex]
    );

    return NextResponse.json({ success: true, message: 'Kategori berhasil dibuat.', categoryId: result.insertId }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal membuat kategori.' }, { status: 500 });
  }
}
