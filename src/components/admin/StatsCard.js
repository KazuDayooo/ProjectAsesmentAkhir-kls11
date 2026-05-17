"use client";
// src/components/admin/StatsCard.js

const COLORS = {
  blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
  amber: "from-amber-500 to-amber-600 shadow-amber-500/20",
  green: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
  red: "from-red-500 to-red-600 shadow-red-500/20",
};

export default function StatsCard({ label, value, icon, color = "blue" }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
        <span className="text-8xl">{icon}</span>
      </div>
      
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${COLORS[color]} shadow-lg flex items-center justify-center text-2xl text-white mb-6 relative z-10`}>
        {icon}
      </div>
      
      <div className="relative z-10">
        <p className="text-[32px] font-extrabold text-slate-800 leading-none mb-1">
          {value}
        </p>
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
