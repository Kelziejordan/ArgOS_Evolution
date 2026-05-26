import React, { useState } from 'react';
import { useSystem } from "../../event-system/EventCore";
import { Gauge, Info, Activity, ShieldAlert, Award } from 'lucide-react';

export function VolatilityModule() {
  const { marketData } = useSystem();
  const [selectedPeriod, setSelectedPeriod] = useState<'1H' | '4H' | '24H'>('24H');

  const btcVol = marketData?.btc?.volatility || 2.4;
  const ethVol = marketData?.eth?.volatility || 3.1;
  const solVol = marketData?.sol?.volatility || 4.8;

  // Real-time atmospheric metrics from useSystem
  const quantumInstability = marketData?.quantumInstability || 0.12;

  // Seed historic volatility expansion/contraction points for outstanding visual representation
  const volHistory = [
    { hour: '04:00', vol: 2.1, isBreakout: false },
    { hour: '08:00', vol: 2.5, isBreakout: false },
    { hour: '12:00', vol: 4.8, isBreakout: true }, // Volatility spike!
    { hour: '16:00', vol: 3.2, isBreakout: false },
    { hour: '20:00', vol: 1.8, isBreakout: false },
    { hour: 'now', vol: (solVol + btcVol) / 2, isBreakout: false }
  ];

  return (
    <div id="volatility-panel" className="h-full flex flex-col space-y-6 overflow-y-auto w-full text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-nexus-border/50 pb-4 gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-widest text-white uppercase flex items-center gap-2 font-sans">
            <Gauge className="w-5 h-5 text-nexus-accent" /> VOLATILITY EXPANSION INDEX
          </h1>
          <p className="text-xs text-nexus-subtle font-mono mt-1">REAL-TIME STANDARD DEVIATIONS & QUANTUM BREAKOUT RISK</p>
        </div>
        <div className="flex gap-2 font-mono">
          {(['1H', '4H', '24H'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 text-xs font-bold rounded border ${
                selectedPeriod === period
                  ? 'bg-nexus-accent/25 border-nexus-accent text-white font-bold'
                  : 'bg-nexus-surface/50 border-nexus-border/30 text-nexus-subtle hover:text-white'
              } transition-all duration-300`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Stats Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border border-nexus-border/50 bg-nexus-surface/50 p-6 rounded-lg space-y-4">
            <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-nexus-subtle flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-nexus-accent" /> COEFF VAL BY FINANCIAL ASSET
            </h2>
            <div className="space-y-4 font-mono text-xs">
              
              {/* BTC volatility */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-nexus-muted">BTC Daily Realized Vol</span>
                  <span className="text-white font-bold">{btcVol.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-nexus-surface-dark h-2 rounded overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(btcVol / 10) * 100}%` }}></div>
                </div>
              </div>

              {/* ETH volatility */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-nexus-muted">ETH Daily Realized Vol</span>
                  <span className="text-white font-bold">{ethVol.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-nexus-surface-dark h-2 rounded overflow-hidden">
                  <div className="bg-nexus-accent h-full transition-all duration-500" style={{ width: `${(ethVol / 10) * 100}%` }}></div>
                </div>
              </div>

              {/* SOL volatility */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-nexus-muted">SOL Daily Realized Vol</span>
                  <span className="text-[#a855f7] font-bold">{solVol.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-nexus-surface-dark h-2 rounded overflow-hidden">
                  <div className="bg-[#a855f7] h-full transition-all duration-500" style={{ width: `${(solVol / 10) * 100}%` }}></div>
                </div>
              </div>

            </div>
          </div>

          <div className="border border-nexus-border/50 bg-nexus-surface/50 p-6 rounded-lg space-y-4">
            <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-nexus-subtle">
              ATMOSPHERIC REACTION RISK
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-nexus-border/20">
                <span className="text-nexus-muted">Quantum Instability</span>
                <span className="text-amber-400 font-bold">{(quantumInstability * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-nexus-border/20">
                <span className="text-nexus-muted">Macro Regime Mode</span>
                <span className="text-[#a855f7] font-bold">MEAN REVERTING</span>
              </div>
              <div className="flex justify-between">
                <span className="text-nexus-muted">Risk Exposure Level</span>
                <span className="text-emerald-400 font-bold">STABLE SHIELDED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Custom SVG Line Graph representation */}
        <div className="lg:col-span-2 border border-nexus-border/50 bg-nexus-surface/50 p-6 rounded-lg flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-nexus-accent animate-pulse" /> VOLATILITY TIMELINE COEFFICIENTS
            </h2>
            <p className="text-[10px] text-nexus-subtle font-mono mt-1">VOLATILITY WAVE PROFILE INDEXED OVER MULTIPLE ROTATIONS</p>
          </div>

          {/* SVG Line / Bar custom chart for complete zero-dependency compatibility and peak aesthetic style */}
          <div className="relative h-60 w-full bg-nexus-surface-dark/40 border border-nexus-border/20 rounded-md p-4 flex flex-col justify-end">
            <div className="absolute inset-x-0 top-0 bottom-8 flex justify-between px-6 pointer-events-none">
              <div className="border-r border-nexus-border/10 h-full w-px"></div>
              <div className="border-r border-nexus-border/10 h-full w-px"></div>
              <div className="border-r border-nexus-border/10 h-full w-px"></div>
              <div className="border-r border-nexus-border/10 h-full w-px"></div>
              <div className="border-r border-nexus-border/10 h-full w-px"></div>
            </div>
            
            {/* Custom SVG Drawing */}
            <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="vol-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(var(--nexus-accent),0.4)" />
                  <stop offset="100%" stopColor="rgba(var(--nexus-accent),0)" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              
              {/* Path Area */}
              <path
                d="M 20 130 Q 100 110, 180 40 T 340 90 T 500 120 L 500 150 L 20 150 Z"
                fill="url(#vol-grad)"
              />
              {/* Trendline */}
              <path
                d="M 20 130 Q 100 110, 180 40 T 340 90 T 500 120"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                className="transition-all duration-1000"
              />
              
              {/* Highlight Nodes */}
              <circle cx="180" cy="40" r="5" fill="#f43f5e" className="animate-pulse" />
              <circle cx="500" cy="120" r="4" fill="#06b6d4" />
            </svg>
            
            <div className="flex justify-between font-mono text-[9px] text-nexus-subtle mt-4 px-2 select-none border-t border-nexus-border/20 pt-2">
              <span>04:00 (CONTRACTION)</span>
              <span>12:00 (EXPANSION PEAK)</span>
              <span>NOW (STABLEREGIME)</span>
            </div>
          </div>
          
          <div className="text-[10px] text-nexus-muted font-mono flex items-center gap-1">
            <Info className="w-3 text-nexus-subtle" /> High-frequency expansion indicates impending trend changes or volatility breakout corridors.
          </div>
        </div>

      </div>

    </div>
  );
}
