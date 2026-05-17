'use client';
// src/components/ReportForm.js
import { useState } from 'react';

const ISSUE_TYPES = {
  public: ['Jalan Rusak / Berlubang','Lampu Jalan Mati','Trotoar Rusak','Drainase / Selokan Tersumbat','Taman Tidak Terawat','Jembatan Rusak','Halte Bus Rusak','Lainnya'],
  edu:    ['Fasilitas Sekolah Rusak','Guru Sering Tidak Hadir','Pungutan Tidak Resmi','Kekurangan Buku / APD','Kekerasan di Lingkungan Sekolah','Akreditasi / Administrasi','Lainnya'],
  safe:   ['Tindak Kriminal','Penipuan / Kejahatan Siber','Parkir Liar','Gangguan Ketertiban Umum','Penyalahgunaan Narkoba','Vandalisme / Coret-coretan','Lainnya'],
};

// issueTypeId mapping (sesuai urutan di DB: public=1-8, edu=9-15, safe=16-22)
const ISSUE_TYPE_OFFSETS = { public: 1, edu: 9, safe: 16 };

export default function ReportForm({ theme, categoryCode, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '',
    issueTypeLabel: '', issueTypeId: '',
    title: '', description: '', locationAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const types = ISSUE_TYPES[categoryCode] || [];
  const offset = ISSUE_TYPE_OFFSETS[categoryCode] || 1;

  function set(field, val) { setForm(p => ({ ...p, [field]: val })); }

  function handleIssueType(e) {
    const idx = e.target.selectedIndex - 1; // -1 karena ada placeholder
    set('issueTypeLabel', e.target.value);
    set('issueTypeId', idx >= 0 ? offset + idx : '');
  }

  async function handleSubmit() {
    const { fullName, phone, issueTypeId, title, description, locationAddress } = form;
    if (!fullName || !phone || !issueTypeId || !title || !description || !locationAddress) {
      alert('Mohon lengkapi semua field yang wajib (*).');
      return;
    }
    setLoading(true);
    await onSubmit({ ...form, issueTypeId: Number(issueTypeId) });
    setLoading(false);
  }

  const input = 'w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-700 outline-none focus:border-blue-400 transition-colors';
  const label = 'block text-[11px] font-semibold text-slate-500 mb-1';

  return (
    <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 overflow-y-auto max-h-[460px]">
      <h3 className="text-[13px] font-bold text-slate-700 flex items-center gap-2 mb-3">
        📋 Form Pengaduan
        <span className="text-[10px] font-normal text-slate-400">(* wajib diisi)</span>
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={label}>Nama Lengkap *</label>
          <input className={input} placeholder="Nama Anda" value={form.fullName} onChange={e=>set('fullName',e.target.value)} />
        </div>
        <div>
          <label className={label}>No. Telepon *</label>
          <input className={input} placeholder="08xxxxxxxxxx" value={form.phone} onChange={e=>set('phone',e.target.value)} />
        </div>
      </div>

      <div className="mb-3">
        <label className={label}>Email (opsional)</label>
        <input className={input} placeholder="email@contoh.com" type="email" value={form.email} onChange={e=>set('email',e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={label}>Jenis Masalah *</label>
          <select className={input} value={form.issueTypeLabel} onChange={handleIssueType}>
            <option value="">Pilih jenis masalah...</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Lokasi *</label>
          <input className={input} placeholder="Nama jalan / wilayah" value={form.locationAddress} onChange={e=>set('locationAddress',e.target.value)} />
        </div>
      </div>

      <div className="mb-3">
        <label className={label}>Judul Laporan *</label>
        <input className={input} placeholder="Ringkasan singkat masalah" value={form.title} onChange={e=>set('title',e.target.value)} />
      </div>

      <div className="mb-4">
        <label className={label}>Deskripsi Detail *</label>
        <textarea
          className={`${input} resize-none`}
          rows={3}
          placeholder="Jelaskan masalah secara detail: kapan terjadi, seberapa parah, dampaknya..."
          value={form.description}
          onChange={e=>set('description',e.target.value)}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-500 hover:bg-slate-50 transition"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 rounded-lg text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          style={{ background: theme.color }}
        >
          {loading ? '⏳ Mengirim...' : '📤 Kirim Laporan'}
        </button>
      </div>
    </div>
  );
}
