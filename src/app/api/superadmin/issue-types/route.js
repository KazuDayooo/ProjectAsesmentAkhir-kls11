// src/app/api/superadmin/issue-types/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/superadmin';

export async function GET(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id');

    let sql = `
      SELECT it.*, cat.name as category_name, cat.color_hex,
             COUNT(c.id) as complaint_count
      FROM issue_types it
      JOIN categories cat ON cat.id = it.category_id
      LEFT JOIN complaints c ON c.issue_type_id = it.id
      WHERE 1=1
    `;
    const params = [];
    if (category_id) { sql += ' AND it.category_id = ?'; params.push(category_id); }
    sql += ' GROUP BY it.id ORDER BY it.category_id ASC, it.sort_order ASC';

    const types = await query(sql, params);
    return NextResponse.json({ success: true, data: types });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil issue types.' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { category_id, label, sort_order = 0 } = await request.json();
    if (!category_id || !label) {
      return NextResponse.json({ success: false, error: 'category_id dan label wajib diisi.' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO issue_types (category_id, label, sort_order) VALUES (?, ?, ?)',
      [category_id, label, sort_order]
    );
    return NextResponse.json({ success: true, message: 'Issue type berhasil dibuat.', id: result.insertId }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal membuat issue type.' }, { status: 500 });
  }
}
