import React, { useState } from 'react';
import { useSystem } from "../../event-system/EventCore";
import { AlertTriangle, TrendingDown, TrendingUp, Info, Activity } from 'lucide-react';

export function LiquidationMap() {
  const { marketData } = useSystem();
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'ETH' | 'SOL'>('BTC');

  const btcPrice = marketData?.btc?.price || 64500;
  const ethPrice = marketData?.eth?.price || 3450;
  const solPrice = marketData?.sol?.price || 148;

  const currentPrice = selectedAsset === 'BTC' ? btcPrice : selectedAsset === 'ETH' ? ethPrice : solPrice;

  // Let's seed clusters of leverages (10x, 25x, 50x, 100x) that trigger liquidations
  const longLeverageClusters = [
    { label: '50-100x Longs', price: currentPrice * 0.99, liquidations: 12400000, triggerDistance: '1.0%' },
    { label: '25x Longs', price: currentPrice * 0.96, liquidations: 45800000, triggerDistance: '4.0%' },
    { label: '10x Longs', price: currentPrice * 0.90, liquidations: 98100000, triggerDistance: '10.0%' },
  ];

  const shortLeverageClusters = [
    { label: '50-100x Shorts', price: currentPrice * 1.01, liquidations: 16100000, triggerDistance: '1.0%' },
    { label: '25x Shorts', price: currentPrice * 1.04, liquidations: 38200000, triggerDistance: '4.0%' },
    { label: '10x Shorts', price: currentPrice * 1.10, liquidations: 84300000, triggerDistance: '10.0%' },
  ];

  const totalAggLongLiqs = longLeverageClusters.reduce((sum, c) => sum + c.liquidations, 0);
  const totalAggShortLiqs = shortLeverageClusters.reduce((sum, c) => sum + c.liquidations, 0);

  return (
    <div id="liquidation-map-panel" className="h-full flex flex-col space-y-6 overflow-y-auto w-full text-white">
      {/* Top Asset Select Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-nexus-border/50 pb-4 gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-widest text-white uppercase flex items-center gap-2 font-sans">
            <AlertTriangle className="w-5 h-5 text-nexus-accent animate-pulse" /> LIQUIDATION MAP
          </h1>
          <p className="text-xs text-nexus-subtle font-mono mt-1">LEVERAGED EXPOSURE CLUSTERS & CASUALTY CORRIDORS</p>
        </div>
        <div className="flex gap-2 font-mono">
          {(['BTC', 'ETH', 'SOL'] as const).map((asset) => (
            <button
              key={asset}
              onClick={() => setSelectedAsset(asset)}
              className={`px-4 py-2 text-xs font-bold rounded border ${
                selectedAsset === asset
                  ? 'bg-nexus-accent/20 border-nexus-accent text-white'
                  : 'bg-nexus-surface/50 border-nexus-border/30 text-nexus-subtle hover:text-white'
              } transition-all duration-300`}
            >
              {asset}
            </button>
          ))}
        </div>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-nexus-border/50 bg-nexus-surface/50 p-4 rounded-lg flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-nexus-subtle tracking-widest">Active Mark Price</span>
          <span className="text-2xl font-bold font-mono text-white">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="border border-nexus-border/50 bg-emerald-500/5 p-4 rounded-lg flex flex-col gap-1 border-emerald-500/30">
          <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-widest">Aggregate Long Risk</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            ${(totalAggLongLiqs / 1000000).toFixed(1)}M
          </span>
        </div>
        <div className="border border-nexus-border/50 bg-red-500/5 p-4 rounded-lg flex flex-col gap-1 border-red-500/30">
          <span className="text-[10px] font-mono uppercase text-red-400 tracking-widest">Aggregate Short Risk</span>
          <span className="text-2xl font-bold font-mono text-red-400">
            ${(totalAggShortLiqs / 1000000).toFixed(1)}M
          </span>
        </div>
      </div>

      {/* Main Liquidation Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Long Liquidation Cascades (Downside Danger Zone) */}
        <div className="border border-nexus-border/50 bg-nexus-surface/50 p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between border-b border-nexus-border/20 pb-3">
            <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-[#10b981] flex items-center gap-2">
              <TrendingDown className="w-4 h-4" /> LONG LIQUIDATION BRACKETS
            </h2>
            <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">DOWNSIDE TARGETS</span>
          </div>

          <div className="space-y-4">
            {longLeverageClusters.map((cluster, i) => (
              <div key={i} className="space-y-1.5 font-mono">
                <div className="flex justify-between text-xs text-nexus-subtle">
                  <span>{cluster.label} (at -{cluster.triggerDistance})</span>
                  <span className="font-bold text-emerald-400">${cluster.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="h-6 w-full bg-nexus-surface-dark border border-nexus-border/20 rounded relative flex items-center px-3 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-emerald-500/10 transition-all duration-300" style={{ width: `${Math.min(100, (cluster.liquidations / 100000000) * 100)}%` }}></div>
                  <span className="text-xs text-white z-10 font-bold">${(cluster.liquidations / 1000000).toFixed(2)}M at risk</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-nexus-muted font-mono flex items-center gap-1">
            <Info className="w-3 text-nexus-subtle" /> If price retraces down, long positions in these buckets will sell off automatically, accelerating downside cascades.
          </p>
        </div>

        {/* Short Liquidation Cascades (Upside Short Squeeze) */}
        <div className="border border-nexus-border/50 bg-nexus-surface/50 p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between border-b border-nexus-border/20 pb-3">
            <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-red-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> SHORT LIQUIDATION BRACKETS
            </h2>
            <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">UPSIDE SQUEEZE</span>
          </div>

          <div className="space-y-4">
            {shortLeverageClusters.map((cluster, i) => (
              <div key={i} className="space-y-1.5 font-mono">
                <div className="flex justify-between text-xs text-nexus-subtle">
                  <span>{cluster.label} (at +{cluster.triggerDistance})</span>
                  <span className="font-bold text-red-400">${cluster.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="h-6 w-full bg-nexus-surface-dark border border-nexus-border/20 rounded relative flex items-center px-3 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-red-500/10 transition-all duration-300" style={{ width: `${Math.min(100, (cluster.liquidations / 100000000) * 100)}%` }}></div>
                  <span className="text-xs text-white z-10 font-bold">${(cluster.liquidations / 1000000).toFixed(2)}M at risk</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-nexus-muted font-mono flex items-center gap-1">
            <Info className="w-3 text-nexus-subtle" /> Price increases above these barriers force shorts to panic cover (exit by buying), fueling sharp upward squeezes.
          </p>
        </div>

      </div>

    </div>
  );
}
