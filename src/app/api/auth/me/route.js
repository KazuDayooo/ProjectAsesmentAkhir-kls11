// src/app/api/auth/me/route.js
// GET /api/auth/me — cek siapa user yang sedang login

import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';

export async function GET(request) {
  try {
    const payload = await authenticate(request);

    return NextResponse.json({
      success: true,
      user: {
        id:       payload.sub,
        username: payload.username,
        name:     payload.name,
        role:     payload.role,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Tidak terautentikasi.' },
      { status: 401 }
    );
  }
}
