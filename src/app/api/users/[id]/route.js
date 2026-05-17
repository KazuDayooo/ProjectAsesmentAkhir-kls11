// src/app/api/users/[id]/route.js
// PATCH → update user (termasuk ganti password — otomatis di-hash)
// DELETE → hapus / nonaktifkan user

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { authenticate } from "@/lib/auth";

const SALT_ROUNDS = 12;

// ── PATCH /api/users/:id ─────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    const requestingUser = await authenticate(request);

    const targetId = parseInt(params.id);

    // Admin bisa edit semua user; user biasa hanya bisa edit diri sendiri
    const isSelf = String(requestingUser.sub) === String(targetId);
    if (requestingUser.role !== "admin" && !isSelf) {
      return NextResponse.json(
        { success: false, error: "Forbidden." },
        { status: 403 }
      );
    }

    const { fullName, password, role, isActive } = await request.json();

    const [targetUser] = await query(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [targetId]
    );
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    const setClauses = [];
    const values = [];

    if (fullName) {
      setClauses.push("full_name = ?");
      values.push(fullName);
    }

    // ✅ AUTO HASH saat ganti password
    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { success: false, error: "Password minimal 8 karakter." },
          { status: 400 }
        );
      }
      const bcrypt = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      setClauses.push("password_hash = ?");
      values.push(passwordHash);
    }

    // Hanya admin yang bisa ubah role dan status aktif
    if (requestingUser.role === "admin") {
      if (role) {
        if (!["admin", "agent", "public"].includes(role)) {
          return NextResponse.json(
            { success: false, error: "Role tidak valid." },
            { status: 400 }
          );
        }
        setClauses.push("role = ?");
        values.push(role);
      }
      if (typeof isActive === "boolean") {
        setClauses.push("is_active = ?");
        values.push(isActive ? 1 : 0);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada field yang diupdate." },
        { status: 400 }
      );
    }

    setClauses.push("updated_at = NOW()");
    values.push(targetId);

    await query(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = ?`,
      values
    );

    return NextResponse.json({
      success: true,
      message: "User berhasil diupdate.",
    });
  } catch (err) {
    console.error("[PATCH /api/users/:id]", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate user." },
      { status: 500 }
    );
  }
}

// ── DELETE /api/users/:id ────────────────────────────────────
// Soft delete: set is_active = 0, tidak hapus dari DB
export async function DELETE(request, { params }) {
  try {
    const requestingUser = await authenticate(request);

    if (requestingUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. Hanya admin yang dapat menghapus user.",
        },
        { status: 403 }
      );
    }

    const targetId = parseInt(params.id);

    // Jangan bisa hapus diri sendiri
    if (String(requestingUser.sub) === String(targetId)) {
      return NextResponse.json(
        { success: false, error: "Tidak dapat menghapus akun sendiri." },
        { status: 400 }
      );
    }

    await query(
      "UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?",
      [targetId]
    );

    return NextResponse.json({
      success: true,
      message: "User berhasil dinonaktifkan.",
    });
  } catch (err) {
    console.error("[DELETE /api/users/:id]", err);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus user." },
      { status: 500 }
    );
  }
}
