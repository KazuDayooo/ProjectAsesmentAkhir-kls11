// src/lib/superadmin.js — helper autentikasi superadmin
import { authenticate } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Verifikasi request: harus terautentikasi + role superadmin.
 * Gunakan di setiap API route superadmin.
 * @returns payload JWT jika valid, atau NextResponse 401/403
 */
export async function requireSuperAdmin(request) {
  try {
    const payload = await authenticate(request);
    if (payload.role !== 'superadmin') {
      return {
        error: NextResponse.json(
          { success: false, error: 'Forbidden. Hanya superadmin yang dapat mengakses.' },
          { status: 403 }
        ),
      };
    }
    return { payload };
  } catch {
    return {
      error: NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      ),
    };
  }
}
