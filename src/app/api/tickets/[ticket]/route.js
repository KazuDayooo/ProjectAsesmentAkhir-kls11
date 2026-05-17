// src/app/api/tickets/[ticket]/route.js
// GET  → detail tiket + riwayat chat
// POST → kirim pesan baru ke tiket
// PATCH → update status tiket

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticate } from '@/lib/auth';

function unauthorizedResponse(err) {
  const isAuthErr = err?.message?.includes('Token') || err?.code?.startsWith('ERR_JWT');
  if (isAuthErr) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }
  return null;
}

// ── GET /api/tickets/PF-2024-001 ────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    await authenticate(request);

    const { ticket } = params;

    const [complaint] = await query(
      'SELECT * FROM v_complaints_summary WHERE ticket_number = ?',
      [ticket]
    );
    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Tiket tidak ditemukan.' },
        { status: 404 }
      );
    }

    const messages = await query(
      `SELECT id, sender_type, sender_name, message, is_read, created_at
       FROM complaint_messages
       WHERE complaint_id = ?
       ORDER BY created_at ASC`,
      [complaint.id]
    );

    const logs = await query(
      `SELECT old_status, new_status, changed_by, note, created_at
       FROM status_logs
       WHERE complaint_id = ?
       ORDER BY created_at ASC`,
      [complaint.id]
    );

    return NextResponse.json({ success: true, data: { complaint, messages, logs } });
  } catch (err) {
    const unauth = unauthorizedResponse(err);
    if (unauth) return unauth;
    console.error('[GET /api/tickets/:ticket]', err);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data tiket.' },
      { status: 500 }
    );
  }
}

// ── POST /api/tickets/PF-2024-001 ───────────────────────────────────────────
export async function POST(request, { params }) {
  try {
    await authenticate(request);

    const { ticket } = params;
    const { senderType = 'user', senderName, message } = await request.json();

    if (!senderName || !message) {
      return NextResponse.json(
        { success: false, error: 'senderName dan message wajib diisi.' },
        { status: 400 }
      );
    }

    const [complaint] = await query(
      'SELECT id FROM complaints WHERE ticket_number = ?',
      [ticket]
    );
    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Tiket tidak ditemukan.' },
        { status: 404 }
      );
    }

    const result = await query(
      `INSERT INTO complaint_messages (complaint_id, sender_type, sender_name, message)
       VALUES (?, ?, ?, ?)`,
      [complaint.id, senderType, senderName, message]
    );

    return NextResponse.json({
      success:   true,
      messageId: result.insertId,
    }, { status: 201 });
  } catch (err) {
    const unauth = unauthorizedResponse(err);
    if (unauth) return unauth;
    console.error('[POST /api/tickets/:ticket]', err);
    return NextResponse.json(
      { success: false, error: 'Gagal mengirim pesan.' },
      { status: 500 }
    );
  }
}

// ── PATCH /api/tickets/PF-2024-001 ──────────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    const user = await authenticate(request);

    // Hanya admin atau agent yang boleh update status
    if (!['admin', 'agent'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Hanya admin/agent yang dapat mengubah status.' },
        { status: 403 }
      );
    }

    const { ticket } = params;
    const { status, assignedTo, note, changedBy } = await request.json();

    const [complaint] = await query(
      'SELECT id, status FROM complaints WHERE ticket_number = ?',
      [ticket]
    );
    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Tiket tidak ditemukan.' },
        { status: 404 }
      );
    }

    const oldStatus = complaint.status;

    let sql = 'UPDATE complaints SET status = ?, updated_at = NOW()';
    const upParams = [status];
    if (assignedTo) { sql += ', assigned_to = ?'; upParams.push(assignedTo); }
    if (status === 'resolved') { sql += ', resolved_at = NOW()'; }
    sql += ' WHERE id = ?';
    upParams.push(complaint.id);

    await query(sql, upParams);

    await query(
      `INSERT INTO status_logs (complaint_id, old_status, new_status, changed_by, note)
       VALUES (?, ?, ?, ?, ?)`,
      [complaint.id, oldStatus, status, changedBy || user.name, note || null]
    );

    return NextResponse.json({ success: true, message: 'Status berhasil diperbarui.' });
  } catch (err) {
    const unauth = unauthorizedResponse(err);
    if (unauth) return unauth;
    console.error('[PATCH /api/tickets/:ticket]', err);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status.' },
      { status: 500 }
    );
  }
}
