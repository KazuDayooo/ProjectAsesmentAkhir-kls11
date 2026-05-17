// src/app/api/superadmin/complaints/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/superadmin';

export async function PATCH(request, { params }) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { status, priority, assigned_to, note } = await request.json();
    const [complaint] = await query('SELECT id, status FROM complaints WHERE id = ?', [params.id]);
    if (!complaint) return NextResponse.json({ success: false, error: 'Laporan tidak ditemukan.' }, { status: 404 });

    const oldStatus = complaint.status;
    let sql = 'UPDATE complaints SET updated_at = NOW()';
    const upParams = [];

    if (status)      { sql += ', status = ?';      upParams.push(status); }
    if (priority)    { sql += ', priority = ?';    upParams.push(priority); }
    if (assigned_to !== undefined) { sql += ', assigned_to = ?'; upParams.push(assigned_to || null); }
    if (status === 'resolved') sql += ', resolved_at = NOW()';

    sql += ' WHERE id = ?';
    upParams.push(params.id);
    await query(sql, upParams);

    // Log perubahan status
    if (status && status !== oldStatus) {
      await query(
        'INSERT INTO status_logs (complaint_id, old_status, new_status, changed_by, note) VALUES (?, ?, ?, ?, ?)',
        [params.id, oldStatus, status, auth.payload.name || 'Super Admin', note || null]
      );
    }

    return NextResponse.json({ success: true, message: 'Laporan berhasil diupdate.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal update laporan.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const [complaint] = await query('SELECT id FROM complaints WHERE id = ?', [params.id]);
    if (!complaint) return NextResponse.json({ success: false, error: 'Laporan tidak ditemukan.' }, { status: 404 });

    // Cascade delete sudah handle complaint_messages & status_logs
    await query('DELETE FROM complaints WHERE id = ?', [params.id]);
    return NextResponse.json({ success: true, message: 'Laporan berhasil dihapus.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal menghapus laporan.' }, { status: 500 });
  }
}
