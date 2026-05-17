'use client';
// src/components/ChatHeader.js
import { Ticket, Pin, Info, X } from "lucide-react";

export default function ChatHeader({ theme, ticket, onReset }) {
  return (
    <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3 shadow-sm">
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0"
        style={{ background: theme.gradient }}
      >
        {theme.avatar}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-slate-800">{theme.agent}</p>
        <p className="text-[11px] text-green-600 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {theme.statusText}
        </p>
      </div>

      {/* Ticket badge */}
      {ticket && (
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
          <Ticket className="w-3.5 h-3.5" /> {ticket}
        </span>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-center text-slate-500">
          <Pin className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-center text-slate-500">
          <Info className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-center text-sm"
          title="Reset chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
