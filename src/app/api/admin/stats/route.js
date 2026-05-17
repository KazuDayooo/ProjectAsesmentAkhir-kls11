// src/app/api/admin/stats/route.js
// GET /api/admin/stats
// Statistik untuk dashboard admin

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { authenticate } from "@/lib/auth";

export async function GET(request) {
  try {
    const user = await authenticate(request);
    if (!["admin", "agent"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden." },
        { status: 403 }
      );
    }

    // Total per status
    const statusRows = await query(
      `SELECT status, COUNT(*) as count FROM complaints GROUP BY status`
    );
    const byStatus = {};
    statusRows.forEach((r) => {
      byStatus[r.status] = r.count;
    });

    // Total keseluruhan
    const [{ total }] = await query(`SELECT COUNT(*) as total FROM complaints`);

    // Per kategori
    const catRows = await query(
      `SELECT cat.code, cat.name, COUNT(*) as total
       FROM complaints c
       JOIN categories cat ON cat.id = c.category_id
       GROUP BY cat.id`
    );

    return NextResponse.json({
      success: true,
      data: {
        total,
        new: byStatus["new"] || 0,
        in_review: byStatus["in_review"] || 0,
        in_progress: byStatus["in_progress"] || 0,
        resolved: byStatus["resolved"] || 0,
        rejected: byStatus["rejected"] || 0,
        closed: byStatus["closed"] || 0,
        by_category: catRows,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil statistik." },
      { status: 500 }
    );
  }
}
