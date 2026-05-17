// src/app/api/superadmin/complaints/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/superadmin';

export async function GET(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const status      = searchParams.get('status');
    const category    = searchParams.get('category');
    const priority    = searchParams.get('priority');
    const search      = searchParams.get('search');
    const limit       = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset      = parseInt(searchParams.get('offset') || '0');

    let sql = `SELECT v.*, (SELECT COUNT(*) FROM complaint_messages cm WHERE cm.complaint_id = v.id) as message_count
               FROM v_complaints_summary v WHERE 1=1`;
    const params = [];

    if (status)   { sql += ' AND v.status = ?';        params.push(status); }
    if (category) { sql += ' AND v.category_code = ?'; params.push(category); }
    if (priority) { sql += ' AND v.priority = ?';      params.push(priority); }
    if (search) {
      sql += ' AND (v.ticket_number LIKE ? OR v.title LIKE ? OR v.reporter_name LIKE ? OR v.location_address LIKE ?)';
      const q = `%${search}%`;
      params.push(q, q, q, q);
    }

    sql += ` ORDER BY v.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const rows = await query(sql, params);

    // Count total
    let countSql = 'SELECT COUNT(*) as total FROM v_complaints_summary WHERE 1=1';
    const countParams = [];
    if (status)   { countSql += ' AND status = ?';        countParams.push(status); }
    if (category) { countSql += ' AND category_code = ?'; countParams.push(category); }
    if (priority) { countSql += ' AND priority = ?';      countParams.push(priority); }
    if (search) {
      countSql += ' AND (ticket_number LIKE ? OR title LIKE ? OR reporter_name LIKE ? OR location_address LIKE ?)';
      const q = `%${search}%`;
      countParams.push(q, q, q, q);
    }
    const [{ total }] = await query(countSql, countParams);

    return NextResponse.json({ success: true, data: rows, total, limit, offset });
  } catch (err) {
    console.error('[GET /api/superadmin/complaints]', err);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data laporan.' }, { status: 500 });
  }
}
