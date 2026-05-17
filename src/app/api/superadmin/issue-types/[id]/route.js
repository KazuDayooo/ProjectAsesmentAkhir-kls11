// src/app/api/superadmin/issue-types/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/superadmin';

export async function PUT(request, { params }) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { label, sort_order } = await request.json();
    await query('UPDATE issue_types SET label = ?, sort_order = ? WHERE id = ?', [label, sort_order ?? 0, params.id]);
    return NextResponse.json({ success: true, message: 'Issue type berhasil diupdate.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal update issue type.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const [[{ count }]] = await query('SELECT COUNT(*) as count FROM complaints WHERE issue_type_id = ?', [params.id]);
    if (count > 0) {
      return NextResponse.json({ success: false, error: `Tidak dapat menghapus, digunakan oleh ${count} laporan.` }, { status: 400 });
    }
    await query('DELETE FROM issue_types WHERE id = ?', [params.id]);
    return NextResponse.json({ success: true, message: 'Issue type berhasil dihapus.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal menghapus issue type.' }, { status: 500 });
  }
}
