import React from 'react';
import { useSystem } from "../../event-system/EventCore";
import { Cpu, Activity, Server } from 'lucide-react';

export function MarketPulse() {
  const { isAutoBotActive } = useSystem();
  return (
    <div className="border border-nexus-border/50 rounded-lg bg-nexus-surface/50 p-4 flex flex-wrap items-center justify-between gap-4 col-span-12">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-nexus-accent/15 border border-nexus-accent/35 rounded text-nexus-accent animate-pulse">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-mono text-xs font-bold tracking-widest text-white leading-none uppercase">
            Ecosystem Telemetry Pulse
          </h3>
          <span className="text-[10px] font-mono text-nexus-muted mt-1 block">
            Real-time status check for registered capabilities and decoupled nodes
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {/* Core Metabolic Rate */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-nexus-muted tracking-wider uppercase">Metabolic Load</span>
          <span className="text-xs font-mono font-bold text-nexus-accent mt-0.5">14.2 ms / cycle</span>
        </div>

        {/* Isolation Sandbox */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-nexus-muted tracking-wider uppercase">Sandbox Containment</span>
          <span className={`text-xs font-mono font-bold mt-0.5 ${isAutoBotActive ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isAutoBotActive ? 'HARDENED / SECURE' : 'STANDARD MONITORING'}
          </span>
        </div>

        {/* Global Connection state */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-nexus-muted tracking-wider uppercase">API Gateway Throughput</span>
          <span className="text-xs font-mono font-bold text-white mt-0.5">rpc-v2: conformed</span>
        </div>

        {/* Security Certificate indicator */}
        <div className="flex items-center gap-2 bg-nexus-border/20 px-3 py-1 rounded border border-nexus-border/40">
          <Server className="w-3.5 h-3.5 text-nexus-accent" />
          <span className="text-[9px] font-mono text-white tracking-widest uppercase">REG_SECURE: PASS</span>
        </div>
      </div>
    </div>
  );
}
