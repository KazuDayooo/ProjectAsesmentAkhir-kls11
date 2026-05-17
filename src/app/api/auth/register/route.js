// src/app/api/auth/register/route.js
// POST /api/auth/register
// Endpoint publik — tidak perlu login
// Role selalu 'public', tidak bisa diubah dari sini

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const SALT_ROUNDS = 12;

export async function POST(request) {
  try {
    const { username, fullName, password } = await request.json();

    // Validasi input
    if (!username || !fullName || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Username, nama lengkap, dan password wajib diisi.",
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

    // Cek username sudah ada
    const [existing] = await query(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Username sudah digunakan, coba username lain.",
        },
        { status: 409 }
      );
    }

    // Hash password dengan bcrypt
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Simpan ke DB — role selalu 'public'
    const result = await query(
      `INSERT INTO users (username, full_name, role, password_hash, is_active)
       VALUES (?, ?, 'public', ?, 1)`,
      [username, fullName, passwordHash]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Akun berhasil dibuat.",
        userId: result.insertId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
