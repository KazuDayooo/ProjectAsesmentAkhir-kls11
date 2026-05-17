// src/app/api/pengaduan/route.js
// POST  → buat laporan baru
// GET   → ambil daftar laporan (+ filter opsional)

import { NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";
import { authenticate } from "@/lib/auth";

function unauthorizedResponse(err) {
  const isAuthErr =
    err?.message?.includes("Token") || err?.code?.startsWith("ERR_JWT");
  if (isAuthErr) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }
  return null;
}

// ── GET /api/pengaduan?status=new&category=public&limit=20 ──────────────────
export async function GET(request) {
  try {
    await authenticate(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let sql = `
      SELECT
        v.*,
        (SELECT COUNT(*) FROM complaint_messages cm
         WHERE cm.complaint_id = v.id) AS message_count
      FROM v_complaints_summary v
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += " AND v.status = ?";
      params.push(status);
    }
    if (category) {
      sql += " AND v.category_code = ?";
      params.push(category);
    }

    // FIX: LIMIT & OFFSET langsung di-interpolate (bukan ? parameter)
    // Aman karena sudah di-parseInt dan dibatasi Math.min
    sql += ` ORDER BY v.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const rows = await query(sql, params);

    let countSql = `SELECT COUNT(*) AS total FROM v_complaints_summary WHERE 1=1`;
    const countParams = [];
    if (status) {
      countSql += " AND status = ?";
      countParams.push(status);
    }
    if (category) {
      countSql += " AND category_code = ?";
      countParams.push(category);
    }
    const [{ total }] = await query(countSql, countParams);

    return NextResponse.json({
      success: true,
      data: rows,
      total,
      limit,
      offset,
    });
  } catch (err) {
    const unauth = unauthorizedResponse(err);
    if (unauth) return unauth;
    console.error("[GET /api/pengaduan]", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pengaduan." },
      { status: 500 }
    );
  }
}

// ── POST /api/pengaduan ──────────────────────────────────────────────────────
export async function POST(request) {
  try {
    await authenticate(request);

    const body = await request.json();
    const {
      categoryCode,
      issueTypeId,
      fullName,
      phone,
      email,
      title,
      description,
      locationAddress,
      locationLat,
      locationLng,
      photoUrls,
    } = body;

    if (
      !categoryCode ||
      !issueTypeId ||
      !fullName ||
      !phone ||
      !title ||
      !description ||
      !locationAddress
    ) {
      return NextResponse.json(
        { success: false, error: "Field wajib tidak lengkap." },
        { status: 400 }
      );
    }

    const result = await withTransaction(async (conn) => {
      const [[cat]] = await conn.execute(
        "SELECT id FROM categories WHERE code = ?",
        [categoryCode]
      );
      if (!cat) throw new Error("Kategori tidak ditemukan.");

      const [[existReporter]] = await conn.execute(
        "SELECT id FROM reporters WHERE phone = ? LIMIT 1",
        [phone]
      );
      let reporterId;
      if (existReporter) {
        reporterId = existReporter.id;
      } else {
        const [ins] = await conn.execute(
          "INSERT INTO reporters (full_name, phone, email) VALUES (?, ?, ?)",
          [fullName, phone, email || null]
        );
        reporterId = ins.insertId;
      }

      const prefix =
        { public: "PF", edu: "EDU", safe: "SC" }[categoryCode] || "XX";
      const year = new Date().getFullYear();
      const [[{ cnt }]] = await conn.execute(
        `SELECT COUNT(*) + 1 AS cnt
         FROM complaints c JOIN categories cat ON cat.id = c.category_id
         WHERE cat.code = ? AND YEAR(c.created_at) = ?`,
        [categoryCode, year]
      );
      const ticketNum = `${prefix}-${year}-${String(cnt).padStart(3, "0")}`;

      const [comp] = await conn.execute(
        `INSERT INTO complaints
           (ticket_number, category_id, issue_type_id, reporter_id,
            title, description, location_address, location_lat, location_lng,
            photo_urls, status, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'medium')`,
        [
          ticketNum,
          cat.id,
          issueTypeId,
          reporterId,
          title,
          description,
          locationAddress,
          locationLat || null,
          locationLng || null,
          photoUrls ? JSON.stringify(photoUrls) : null,
        ]
      );
      const complaintId = comp.insertId;

      await conn.execute(
        `INSERT INTO complaint_messages (complaint_id, sender_type, sender_name, message)
         VALUES (?, 'system', 'System', ?)`,
        [
          complaintId,
          `Laporan ${ticketNum} berhasil dibuat dan diterima oleh sistem.`,
        ]
      );

      const agentNames = {
        public: "Tim Fasilitas Publik",
        edu: "Tim EduReport",
        safe: "Tim Safe City",
      };
      await conn.execute(
        `INSERT INTO complaint_messages (complaint_id, sender_type, sender_name, message)
         VALUES (?, 'agent', ?, ?)`,
        [
          complaintId,
          agentNames[categoryCode] || "Tim Konekko Services",
          "Terima kasih telah melaporkan. Laporan Anda telah kami terima dan akan segera ditindaklanjuti.",
        ]
      );

      return { complaintId, ticketNum };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Laporan berhasil dibuat.",
        ticketNumber: result.ticketNum,
        complaintId: result.complaintId,
      },
      { status: 201 }
    );
  } catch (err) {
    const unauth = unauthorizedResponse(err);
    if (unauth) return unauth;
    console.error("[POST /api/pengaduan]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal membuat laporan." },
      { status: 500 }
    );
  }
}
