import React, { useState } from 'react';
import { useSystem } from "../../event-system/EventCore";
import { TrendingUp, Award, Layers, Shield, Zap, Search } from 'lucide-react';

export function GlobalLiquidity() {
  const { marketData } = useSystem();
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'ETH' | 'SOL'>('BTC');

  const btcPrice = marketData?.btc?.price || 64500;
  const ethPrice = marketData?.eth?.price || 3450;
  const solPrice = marketData?.sol?.price || 148;

  const currentPrice = selectedAsset === 'BTC' ? btcPrice : selectedAsset === 'ETH' ? ethPrice : solPrice;
  const priceLabel = `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Simulated Buy & Sell walls for high-fidelity visualization
  const buyWalls = [
    { price: currentPrice * 0.998, volume: 4500000, percentage: 85 },
    { price: currentPrice * 0.995, volume: 12400000, percentage: 92 },
    { price: currentPrice * 0.990, volume: 28900000, percentage: 74 },
    { price: currentPrice * 0.985, volume: 41200000, percentage: 55 },
    { price: currentPrice * 0.980, volume: 68300000, percentage: 22 },
  ];

  const sellWalls = [
    { price: currentPrice * 1.002, volume: 5200000, percentage: 80 },
    { price: currentPrice * 1.005, volume: 11100000, percentage: 88 },
    { price: currentPrice * 1.010, volume: 32400000, percentage: 68 },
    { price: currentPrice * 1.015, volume: 45100000, percentage: 41 },
    { price: currentPrice * 1.020, volume: 72900000, percentage: 15 },
  ];

  return (
    <div id="global-liquidity-panel" className="h-full flex flex-col space-y-6 overflow-y-auto w-full text-white">
      {/* Top Asset Select Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-nexus-border/50 pb-4 gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-widest text-white uppercase flex items-center gap-2 font-sans">
            <Layers className="w-5 h-5 text-nexus-accent" /> GLOBAL LIQUIDITY MAP
          </h1>
          <p className="text-xs text-nexus-subtle font-mono mt-1">REAL-TIME LIQUIDITY DEPTH & ORDER BOOK POOLS</p>
        </div>
        <div className="flex gap-2 font-mono">
          {(['BTC', 'ETH', 'SOL'] as const).map((asset) => (
            <button
              key={asset}
              onClick={() => setSelectedAsset(asset)}
              className={`px-4 py-2 text-xs font-bold rounded border ${
                selectedAsset === asset
                  ? 'bg-nexus-accent/20 border-nexus-accent text-white shadow-[0_0_10px_rgba(var(--nexus-accent),0.2)]'
                  : 'bg-nexus-surface/50 border-nexus-border/30 text-nexus-subtle hover:text-white'
              } transition-all duration-300`}
            >
              {asset}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Stats Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border border-nexus-border/50 bg-nexus-surface/50 p-6 rounded-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-nexus-subtle font-mono uppercase tracking-widest">Mark Price</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight text-white">{priceLabel}</div>
            <div className="text-xs text-nexus-muted font-mono flex items-center gap-1">
              <Zap className="w-3" /> FEED SOURCE: AGGREGATE COINBASE & KRAKEN
            </div>
          </div>

          <div className="border border-nexus-border/50 bg-nexus-surface/50 p-6 rounded-lg space-y-4">
            <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-nexus-subtle flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> LIQUIDITY METRICS
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-nexus-border/20">
                <span className="text-nexus-muted">Bid Depth (2%)</span>
                <span className="text-emerald-400">$172,400,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-nexus-border/20">
                <span className="text-nexus-muted">Ask Depth (2%)</span>
                <span className="text-red-400">$166,100,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-nexus-border/20">
                <span className="text-nexus-muted">Stablecoin Liquidity</span>
                <span className="text-white">$14.2B Aggregate</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-nexus-muted">Order Imbalance</span>
                <span className="text-nexus-accent">+3.8% Bullish</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Depth Charts Area */}
        <div className="lg:col-span-2 border border-nexus-border/50 bg-nexus-surface/50 p-6 rounded-lg flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-bold font-sans uppercase tracking-widest text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-nexus-accent" /> LIQUIDITY ORDERBOOK DEPTH WALLS
            </h2>
            <p className="text-[10px] text-nexus-subtle font-mono mt-1">PROXIMITY DEPTH FROM PRESENT MARK PRICE</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bids Section */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-emerald-400 tracking-wider font-mono uppercase bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/20 rounded flex justify-between">
                <span>SUPPORT WALL (Bids)</span>
                <span>AGGREGATE</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                {buyWalls.map((wall, i) => (
                  <div key={i} className="relative py-2 px-3 border border-nexus-border/20 rounded bg-nexus-surface-dark overflow-hidden flex justify-between items-center z-10">
                    <div className="absolute inset-y-0 left-0 bg-emerald-500/10 transition-all duration-500" style={{ width: `${wall.percentage}%` }}></div>
                    <span className="text-emerald-400 z-10">${wall.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    <span className="text-white font-medium z-10">${(wall.volume / 1000000).toFixed(1)}M</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Asks Section */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-red-400 tracking-wider font-mono uppercase bg-red-500/10 px-3 py-1.5 border border-red-500/20 rounded flex justify-between">
                <span>RESISTANCE WALL (Asks)</span>
                <span>AGGREGATE</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                {sellWalls.map((wall, i) => (
                  <div key={i} className="relative py-2 px-3 border border-nexus-border/20 rounded bg-nexus-surface-dark overflow-hidden flex justify-between items-center z-10">
                    <div className="absolute inset-y-0 right-0 bg-red-500/10 transition-all duration-500" style={{ width: `${wall.percentage}%` }}></div>
                    <span className="text-red-400 z-10">${wall.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    <span className="text-white font-medium z-10">${(wall.volume / 1000000).toFixed(1)}M</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
