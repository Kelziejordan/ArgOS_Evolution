import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, RefreshCw, Cpu, Layers } from 'lucide-react';

interface CapabilityInfo {
  metadata: {
    id: string;
    name: string;
    version: string;
    owner: string;
    category: string;
    dependencies: string[];
  };
  health: {
    state: string;
    score: number;
    uptimeMs: number;
    lastPulseTime: number;
    stalled: boolean;
    diagnostics?: Record<string, any>;
  };
}

export function ImmuneDashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [capabilities, setCapabilities] = useState<CapabilityInfo[]>([]);

  // Periodically fetch registered capabilities
  const fetchCapabilities = async () => {
    try {
      const res = await fetch('/api/capabilities');
      if (res.ok) {
        const data = await res.json();
        setCapabilities(data);
      }
    } catch (e) {
      console.error("Failed to fetch registered capabilities:", e);
    }
  };

  useEffect(() => {
    fetchCapabilities();
    const interval = setInterval(fetchCapabilities, 3000);
    return () => clearInterval(interval);
  }, []);

  const runStormTest = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/diagnostics/storm', { method: 'POST' });
      if (res.ok) {
        setResult('EVENT STORM TRIGGERED (500 events injected). Check terminal for Immune reaction.');
      }
    } catch {
      setResult('FAILED to trigger storm.');
    }
    setLoading(false);
  };

  const runReplayTest = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/diagnostics/replay', { method: 'POST' });
      if (res.ok) {
        setResult('TEMPORAL REPLAY AUDIT COMPLETED. Check terminal for lineage verification.');
      }
    } catch {
      setResult('FAILED to trigger replay.');
    }
    setLoading(false);
  };

  const runMutationTest = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/diagnostics/mutation-leak', { method: 'POST' });
      if (res.ok) {
        setResult('MUTATION LEAK TEST TRIGGERED. Evaluating state mutation confinement.');
      }
    } catch {
      setResult('FAILED to trigger mutation test.');
    }
    setLoading(false);
  };

  const formatUptime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="border border-nexus-border/50 rounded-lg bg-nexus-surface/50 p-4 h-full flex flex-col gap-4">
      <div className="flex items-center gap-2 text-nexus-subtle font-mono text-sm tracking-widest border-b border-nexus-border/50 pb-2">
        <ShieldAlert className="w-4 h-4 text-emerald-500" />
        <h2>DIAGNOSTICS & SYSTEM IMMUNOLOGY</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* stress tests */}
        <div className="bg-black/20 p-3 rounded border border-nexus-border/30 space-y-2">
          <h3 className="text-[10px] font-mono text-nexus-muted tracking-widest uppercase mb-2">Systemic Stress Tests</h3>
          
          <button 
            disabled={loading}
            onClick={runStormTest}
            className="w-full flex items-center justify-between px-3 py-2 bg-nexus-border/20 hover:bg-nexus-border/40 border border-nexus-border/50 rounded font-mono text-xs transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 text-amber-500">
              <Zap className="w-3. h-3" />
              INJECT EVENT STORM (500x)
            </span>
            <span className="text-[10px] opacity-50 block">TEST IMMUNE RATE-LIMITING</span>
          </button>
          
          <button 
            disabled={loading}
            onClick={runReplayTest}
            className="w-full flex items-center justify-between px-3 py-2 bg-nexus-border/20 hover:bg-nexus-border/40 border border-nexus-border/50 rounded font-mono text-xs transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 text-cyan-500">
              <RefreshCw className="w-3 h-3" />
              TEMPORAL REPLAY AUDIT
            </span>
            <span className="text-[10px] opacity-50 block">VERIFY DIGITAL CONTINUITY</span>
          </button>
          
          <button 
            disabled={loading}
            onClick={runMutationTest}
            className="w-full flex items-center justify-between px-3 py-2 bg-nexus-border/20 hover:bg-nexus-border/40 border border-nexus-border/50 rounded font-mono text-xs transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 text-pink-500">
              <ShieldAlert className="w-3 h-3" />
              MUTATION LEAK TEST
            </span>
            <span className="text-[10px] opacity-50 block">VALIDATE STATE CONFINEMENT</span>
          </button>
        </div>

        {/* Dynamic Registered Capabilities Monitor */}
        <div className="bg-black/20 p-3 rounded border border-nexus-border/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-mono text-nexus-muted tracking-widest uppercase">
              REGISTERED CAPABILITIES ({capabilities.length})
            </h3>
            <span className="text-[9px] font-mono text-emerald-500 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
              STANDARD v1.0
            </span>
          </div>

          <div className="space-y-2">
            {capabilities.length === 0 ? (
              <div className="text-[10px] font-mono text-nexus-muted text-center py-2">
                AWAITING_PLATFORM_ON_RAMP...
              </div>
            ) : (
              capabilities.map((cap) => (
                <div 
                  key={cap.metadata.id}
                  className="bg-black/30 border border-nexus-border/20 p-2.5 rounded flex flex-col gap-1.5 font-mono text-[10px]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 text-nexus-subtle font-bold">
                      <Cpu className="w-3 h-3 text-nexus-accent" />
                      <span>{cap.metadata.name}</span>
                    </div>
                    <span className="text-[9px] text-nexus-muted px-1 border border-nexus-border/40 rounded">
                      v{cap.metadata.version}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-1 text-nexus-muted text-[9px] pt-1 border-t border-nexus-border/10">
                    <div>Category: <span className="text-white uppercase">{cap.metadata.category}</span></div>
                    <div>Owner: <span className="text-white">{cap.metadata.owner}</span></div>
                    <div>Uptime: <span className="text-white">{formatUptime(cap.health.uptimeMs)}</span></div>
                    <div className="flex items-center gap-1">Status: 
                      <span className={`px-1 rounded-[2px] text-[8px] font-bold ${
                        cap.health.state === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                        {cap.health.state}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-nexus-log pt-1">
                    <span>Metabolic Rating:</span>
                    <span className="font-bold text-neural font-mono text-emerald-400">{cap.health.score}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {result && (
          <div className="text-[10px] font-mono text-emerald-400 bg-emerald-900/10 p-2 border border-emerald-950/20 rounded">
            &gt; {result}
          </div>
        )}
      </div>
    </div>
  );
}
