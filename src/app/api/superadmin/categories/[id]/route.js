// src/app/api/superadmin/categories/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/superadmin';

export async function PUT(request, { params }) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { name, description, icon, color_hex } = await request.json();
    const [cat] = await query('SELECT id FROM categories WHERE id = ?', [params.id]);
    if (!cat) return NextResponse.json({ success: false, error: 'Kategori tidak ditemukan.' }, { status: 404 });

    await query(
      'UPDATE categories SET name = ?, description = ?, icon = ?, color_hex = ? WHERE id = ?',
      [name, description, icon, color_hex, params.id]
    );
    return NextResponse.json({ success: true, message: 'Kategori berhasil diupdate.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal update kategori.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const [[{ count }]] = await query('SELECT COUNT(*) as count FROM complaints WHERE category_id = ?', [params.id]);
    if (count > 0) {
      return NextResponse.json(
        { success: false, error: `Tidak dapat menghapus kategori yang memiliki ${count} laporan.` },
        { status: 400 }
      );
    }
    await query('DELETE FROM categories WHERE id = ?', [params.id]);
    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal menghapus kategori.' }, { status: 500 });
  }
}
