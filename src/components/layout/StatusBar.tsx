import React from 'react';
import { useSystem } from "../../event-system/EventCore";

export function StatusBar() {
  const { serverStatus } = useSystem();
  return (
    <div className="h-8 border-t border-nexus-border flex items-center px-4 font-mono text-[10px] tracking-widest text-nexus-subtle justify-between bg-nexus-surface/50">
      <span>SERVER: {serverStatus}</span>
      <span>READY</span>
    </div>
  );
}
