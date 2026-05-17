'use client';
// src/components/InputBar.js
import { useState } from 'react';
import { Paperclip, Send } from "lucide-react";

export default function InputBar({ theme, quickReplies, onQuickReply, onSend }) {
  const [value, setValue] = useState('');

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  }

  return (
    <div className="bg-white border-t border-slate-200">
      {/* Quick replies */}
      <div className="px-5 pt-3 flex gap-2 flex-wrap">
        {quickReplies.map(q => (
          <button
            key={q}
            onClick={() => onQuickReply(q)}
            className="px-4 py-1.5 rounded-full border-[1.5px] text-[12px] font-semibold transition-all hover:text-white"
            style={{
              borderColor: theme.color,
              color: theme.color,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.color; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = theme.color; }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Text input */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-end gap-2 bg-slate-50 border-[1.5px] border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-400 transition-colors">
          <textarea
            className="flex-1 bg-transparent resize-none outline-none text-[13px] text-slate-800 placeholder:text-slate-400 max-h-28 leading-relaxed"
            placeholder="Ketik pesan atau nomor tiket..."
            rows={1}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 transition">
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              onClick={submit}
              disabled={!value.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-default"
              style={{ background: theme.color }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
