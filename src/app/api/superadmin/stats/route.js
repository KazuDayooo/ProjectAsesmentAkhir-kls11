// src/app/api/superadmin/stats/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/superadmin';

export async function GET(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    // Total complaints per status
    const statusStats = await query(`
      SELECT status, COUNT(*) as total
      FROM complaints GROUP BY status
    `);

    // Total complaints per kategori
    const categoryStats = await query(`
      SELECT cat.name, cat.code, cat.color_hex, COUNT(c.id) as total
      FROM categories cat
      LEFT JOIN complaints c ON c.category_id = cat.id
      GROUP BY cat.id, cat.name, cat.code, cat.color_hex
    `);

    // Total complaints per bulan (6 bulan terakhir)
    const monthlyStats = await query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        DATE_FORMAT(created_at, '%b %Y') AS label,
        COUNT(*) AS total
      FROM complaints
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month, label
      ORDER BY month ASC
    `);

    // Total users per role
    const userStats = await query(`
      SELECT role, COUNT(*) as total, SUM(is_active) as active
      FROM users GROUP BY role
    `);

    // Summary counts
    const [{ totalComplaints }] = await query(`SELECT COUNT(*) as totalComplaints FROM complaints`);
    const [{ totalUsers }]      = await query(`SELECT COUNT(*) as totalUsers FROM users`);
    const [{ totalCategories }] = await query(`SELECT COUNT(*) as totalCategories FROM categories`);
    const [{ newToday }]        = await query(`
      SELECT COUNT(*) as newToday FROM complaints
      WHERE DATE(created_at) = CURDATE()
    `);
    const [{ avgResolutionHours }] = await query(`
      SELECT ROUND(AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)), 1) as avgResolutionHours
      FROM complaints WHERE resolved_at IS NOT NULL
    `);

    return NextResponse.json({
      success: true,
      data: {
        summary: { totalComplaints, totalUsers, totalCategories, newToday, avgResolutionHours },
        statusStats,
        categoryStats,
        monthlyStats,
        userStats,
      },
    });
  } catch (err) {
    console.error('[GET /api/superadmin/stats]', err);
    return NextResponse.json({ success: false, error: 'Gagal mengambil statistik.' }, { status: 500 });
  }
}
