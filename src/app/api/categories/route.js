import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const categories = await query(`
      SELECT id, code, name, description, icon, color_hex
      FROM categories
      ORDER BY id ASC
    `);
    return NextResponse.json({ success: true, data: categories });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil kategori.' }, { status: 500 });
  }
}
