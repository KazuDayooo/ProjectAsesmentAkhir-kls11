// src/app/api/users/route.js
// POST  → buat user baru (password otomatis di-hash dengan bcrypt)
// GET   → list semua user (khusus admin)
//
// Cara pakai:
//   POST /api/users
//   Body: { username, fullName, password, role }
//
// Role yang valid: 'admin' | 'agent' | 'public'

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { authenticate } from "@/lib/auth";

const SALT_ROUNDS = 12; // Semakin tinggi = semakin aman, tapi lebih lambat

// ── GET /api/users ──────────────────────────────────────────
export async function GET(request) {
  try {
    const user = await authenticate(request);

    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. Hanya admin yang dapat melihat daftar user.",
        },
        { status: 403 }
      );
    }

    const users = await query(
      `SELECT id, username, full_name, role, is_active, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ success: true, data: users });
  } catch (err) {
    console.error("[GET /api/users]", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data user." },
      { status: 500 }
    );
  }
}

// ── POST /api/users ─────────────────────────────────────────
export async function POST(request) {
  try {
    const requestingUser = await authenticate(request);

    // Hanya admin yang boleh buat user baru
    if (requestingUser.role !== "superadmin") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. Hanya admin yang dapat membuat user baru.",
        },
        { status: 403 }
      );
    }

    const {
      username,
      fullName,
      password,
      role = "public",
    } = await request.json();

    // Validasi input
    if (!username || !fullName || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "username, fullName, dan password wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!["superadmin", "admin", "public"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Role tidak valid. Gunakan: admin, agent, atau public.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    // Cek username sudah ada atau belum
    const [existing] = await query(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Username sudah digunakan." },
        { status: 409 }
      );
    }

    // ✅ AUTO HASH PASSWORD dengan bcrypt
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Simpan ke DB
    const result = await query(
      `INSERT INTO users (username, full_name, role, password_hash, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [username, fullName, role, passwordHash]
    );

    return NextResponse.json(
      {
        success: true,
        message: "User berhasil dibuat.",
        userId: result.insertId,
        user: { id: result.insertId, username, fullName, role },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/users]", err);
    return NextResponse.json(
      { success: false, error: "Gagal membuat user." },
      { status: 500 }
    );
  }
}
