import React from 'react';

export function AssetRow({ label, value, delta, status, onClick }: any) {
  return (
    <div onClick={onClick} className="flex justify-between items-center text-[10px] font-mono cursor-pointer hover:bg-nexus-border/50 p-1 rounded">
      <span className="text-nexus-muted">{label}</span>
      <div className="flex gap-2">
        <span>${value}</span>
        <span className={delta >= 0 ? "text-emerald-500" : "text-red-500"}>{delta >= 0 ? '+' : ''}{delta}%</span>
      </div>
    </div>
  );
}
