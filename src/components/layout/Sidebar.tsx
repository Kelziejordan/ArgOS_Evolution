
import React, { ReactNode } from "react";
import { Terminal, Globe, Activity, BarChart3, Flame, Shield, Compass } from "lucide-react";
import { useSystem } from "../../event-system/EventCore";
import { AssetRow } from "../ui/AssetRow";
import { PairState } from "../../anatomy/types";

export function Sidebar({ activeModule, setActiveModule }: { activeModule: string, setActiveModule: (s: string) => void }) {
  const { marketData, user, aggressionMatrix, setAggressionMatrix, isAutoBotActive, setIsAutoBotActive, addAssistantMessage } = useSystem();

  return (
    <aside className="w-64 border-r border-nexus-border flex flex-col bg-nexus-surface hidden md:flex">
      <div className="p-6 border-b border-nexus-border bg-nexus-surface">
        <h1 className="text-xs font-bold uppercase tracking-widest text-nexus-accent">argOS Evolution v2.0</h1>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
          <span className="text-sm font-medium">Core Platform Active</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        <SidebarGroup title="Platform Registry">
          <SidebarItem id="command-hall-nav" icon={<Terminal className="w-4 h-4" />} label="Command Hall" active={activeModule === "Command Hall"} onClick={() => setActiveModule("Command Hall")} />
          <SidebarItem icon={<Activity className="w-4 h-4" />} label="Event Pipeline" active={activeModule === "Event Pipeline"} onClick={() => setActiveModule("Event Pipeline")} />
          <SidebarItem 
            id="risk-shield-nav"
            icon={<Shield className="w-4 h-4" />} 
            label="Immune Guard" 
            active={activeModule === "Immune System"} 
            onClick={() => setActiveModule("Immune System")} 
            className="border-[#8fa2bc]"
          />
        </SidebarGroup>

        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-nexus-subtle mb-3 px-1">Global Parameters</h3>
          <div className="px-1 space-y-4 pt-1">
            <MetricSlider label="Telemetry Frequency" value={aggressionMatrix.risk} unit="Hz" onChange={(v) => setAggressionMatrix({...aggressionMatrix, risk: v})} />
            <MetricSlider label="Sandbox Level" value={aggressionMatrix.neuralDepth} unit="depth" min={1} max={64} onChange={(v) => setAggressionMatrix({...aggressionMatrix, neuralDepth: v})} />
            
            <button 
              onClick={() => {
                setIsAutoBotActive(!isAutoBotActive);
                addAssistantMessage(isAutoBotActive ? "SECURITY_LOCKDOWN: SHIELD DEACTIVATED. RUNNING STANDARD PROTOCOLS." : "SECURITY_LOCKDOWN APPROVED. HARDSHELL MODE SIGNED AND SEALED.");
              }}
              className={`w-full py-2 rounded text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${isAutoBotActive ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-nexus-accent/10 border-nexus-accent/50 text-nexus-accent hover:bg-nexus-accent/20'}`}
            >
              {isAutoBotActive ? "Disarm Confinement" : "Security Lockdown"}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-nexus-border/50">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-nexus-subtle mb-3 px-1">Ecosystem Status</h3>
          <div className="space-y-2 px-1">
            <div className="flex flex-col gap-1 p-2 bg-nexus-border/15 border border-nexus-border/40 rounded">
              <span className="text-[10px] font-mono text-white leading-none">ArgOS Core Engine</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[8px] font-mono px-1 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase rounded leading-normal">
                  FROZEN / SOLID
                </span>
                <span className="text-[8px] font-mono text-nexus-muted">ID: AG-2.0</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 p-2 bg-nexus-border/15 border border-nexus-border/40 rounded">
              <span className="text-[10px] font-mono text-white leading-none">Quantitative Trading</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[8px] font-mono px-1 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase rounded leading-normal">
                  ACTIVE BRANCH
                </span>
                <span className="text-[8px] font-mono text-nexus-muted">ID: QT-0.4</span>
              </div>
            </div>

            <div 
              onClick={() => setActiveModule("Life OS Engine")}
              className={`flex flex-col gap-1 p-2 rounded border transition-all cursor-pointer ${
                activeModule === "Life OS Engine"
                  ? 'bg-nexus-accent/20 border-nexus-accent/50 shadow-[0_0_8px_rgba(59,130,246,0.25)]'
                  : 'bg-nexus-border/15 border-nexus-border/40 hover:border-nexus-border/80 hover:bg-nexus-border/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-white leading-none flex items-center gap-1.5 font-medium">
                  <Compass className="w-3.5 h-3.5 text-nexus-accent shrink-0" />
                  Life OS Calibration
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[8px] font-mono px-1 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase rounded leading-normal">
                  ACTIVE BRANCH
                </span>
                <span className="text-[8px] font-mono text-nexus-muted">ID: LO-0.9</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6 text-[10px] text-nexus-log font-mono border-t border-nexus-border">
        AUTH_ID: {user?.uid.slice(0, 8) || "GUEST"}
      </div>
    </aside>
  );
}

function SidebarGroup({ title, children }: { title: string, children: ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-[0.2em] text-nexus-subtle mb-3 px-1">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, id, className = "" }: { icon: ReactNode, label: string, active: boolean, onClick: () => void, id?: string, className?: string }) {
  return (
    <div 
      id={id}
      onClick={onClick}
      className={`px-3 py-2 rounded text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-3 ${active ? 'bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/30' : 'text-nexus-muted hover:bg-nexus-border hover:text-white'} ${className}`}
    >
      {icon}
      {label}
    </div>
  );
}

function MetricSlider({ label, value, unit, min = 0, max = 100, onChange }: { label: string, value: number, unit: string, min?: number, max?: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5 text-[9px] uppercase tracking-wider text-nexus-log font-mono">
      <div className="flex justify-between">
        <span>{label}</span>
        <span>{value}{unit}</span>
      </div>
      <input 
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-nexus-accent h-1 bg-nexus-dark rounded-full cursor-pointer" 
      />
    </div>
  );
}
