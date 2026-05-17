'use client';
// src/components/MessageList.js

export default function MessageList({ messages, isTyping, theme, endRef }) {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 px-5 py-5 flex flex-col gap-4">
      {messages.map(msg => (
        <div key={msg.id} className={`flex flex-col gap-1 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
          {msg.type === 'agent' && (
            <div className="flex items-center gap-1.5 mb-0.5">
              <div
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                style={{ background: theme.gradient }}
              >
                {theme.avatar[0]}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">{theme.agent}</span>
            </div>
          )}

          <div
            className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed
              ${msg.type === 'user'
                ? 'text-white rounded-br-sm'
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
              }`}
            style={msg.type === 'user' ? { background: theme.color } : {}}
            dangerouslySetInnerHTML={msg.html ? { __html: msg.html } : undefined}
          >
            {msg.text || undefined}
          </div>
          <span className="text-[10px] text-slate-400">{msg.time}</span>
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div
              className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-[8px] font-bold"
              style={{ background: theme.gradient }}
            >
              {theme.avatar[0]}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{theme.agent}</span>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
            {[0, 0.2, 0.4].map((delay, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
