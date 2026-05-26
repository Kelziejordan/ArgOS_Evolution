import React, { useState, useEffect } from 'react';
import { useSystem } from "../../event-system/EventCore";
import { List, ShieldAlert, Award, FileText, Activity } from 'lucide-react';

interface WhaleTrade {
  id: string;
  asset: string;
  side: 'buy' | 'sell';
  amount: number;
  valUSD: number;
  price: number;
  timestamp: string;
}

export function OrderFlow() {
  const { marketData } = useSystem();
  const [trades, setTrades] = useState<WhaleTrade[]>([]);

  // Seed initial whale trades
  useEffect(() => {
    const assets = ['BTC', 'ETH', 'SOL'];
    const sideChoices = ['buy', 'sell'] as const;
    const initialTrades: WhaleTrade[] = [];
    
    for (let i = 0; i < 6; i++) {
      const asset = assets[Math.floor(Math.random() * assets.length)];
      const side = sideChoices[Math.floor(Math.random() * sideChoices.length)];
      const multiplier = asset === 'BTC' ? 65000 : asset === 'ETH' ? 3500 : 150;
      const amount = asset === 'BTC' ? (Math.random() * 5 + 1) : asset === 'ETH' ? (Math.random() * 30 + 10) : (Math.random() * 500 + 100);
      const valUSD = amount * multiplier;
      
      initialTrades.push({
        id: `TX-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        asset,
        side,
        amount,
        valUSD,
        price: multiplier,
        timestamp: new Date(Date.now() - i * 60000).toLocaleTimeString()
      });
    }
    setTrades(initialTrades);

    // Roll/simulate new incoming whale trades
    const interval = setInterval(() => {
      const btcRaw = marketData?.btc?.price || 64500;
      const ethRaw = marketData?.eth?.price || 3450;
      const solRaw = marketData?.sol?.price || 148;

      const randomAsset = assets[Math.floor(Math.random() * assets.length)];
      const randomSide = sideChoices[Math.floor(Math.random() * sideChoices.length)];
      const matchedPrice = randomAsset === 'BTC' ? btcRaw : randomAsset === 'ETH' ? ethRaw : solRaw;
      const amount = randomAsset === 'BTC' ? (Math.random() * 3 + 0.5) : randomAsset === 'ETH' ? (Math.random() * 20 + 5) : (Math.random() * 300 + 50);
      const valUSD = amount * matchedPrice;

      const newTrade: WhaleTrade = {
        id: `TX-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        asset: randomAsset,
        side: randomSide,
        amount,
        valUSD,
        price: matchedPrice,
        timestamp: new Date().toLocaleTimeString()
      };

      setTrades((prev) => [newTrade, ...prev.slice(0, 9)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [marketData]);

  // Compute stats
  const totalWhaleVolume = trades.reduce((sum, t) => sum + t.valUSD, 0);
  const buyVolume = trades.filter(t => t.side === 'buy').reduce((sum, t) => sum + t.valUSD, 0);
  const buyRatio = totalWhaleVolume > 0 ? (buyVolume / totalWhaleVolume) * 100 : 50;

  return (
    <div id="order-flow-panel" className="h-full flex flex-col space-y-6 overflow-y-auto w-full text-white">
      {/* Header */}
      <div className="border-b border-nexus-border/50 pb-4">
        <h1 className="text-lg font-bold tracking-widest text-white uppercase flex items-center gap-2 font-sans">
          <Activity className="w-5 h-5 text-nexus-accent" /> ORDER FLOW BLOCK TICKER
        </h1>
        <p className="text-xs text-nexus-subtle font-mono mt-1">REAL-TIME LARGE-SCALE ORDERBOOK BLOCK FILLS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Order Pressure Metrics */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border border-nexus-border/50 bg-nexus-surface/50 p-6 rounded-lg space-y-4">
            <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-nexus-subtle flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-nexus-accent" /> BUYING VS SELLING FORCE
            </h2>
            
            {/* Dynamic visual slider indicator */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-400 font-bold">BUYING (BIDS)</span>
                <span className="text-red-400 font-bold">SELLING (ASKS)</span>
              </div>
              <div className="h-4 w-full bg-nexus-surface-dark border border-nexus-border/20 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${buyRatio}%` }}></div>
                <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${100 - buyRatio}%` }}></div>
              </div>
              <div className="flex justify-between text-[11px] text-nexus-muted">
                <span>{buyRatio.toFixed(1)}% Pressure</span>
                <span>{(100 - buyRatio).toFixed(1)}% Pressure</span>
              </div>
            </div>
          </div>

          <div className="border border-nexus-border/50 bg-nexus-surface/50 p-6 rounded-lg space-y-4">
            <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-nexus-subtle">
              ORDER FLOW SUMMARY
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-nexus-border/20">
                <span className="text-nexus-muted">Whale Inflow Speed</span>
                <span className="text-white">Moderate (4.5s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-nexus-border/20">
                <span className="text-nexus-muted">Average Whale Order</span>
                <span className="text-white">$145,200</span>
              </div>
              <div className="flex justify-between py-1 border-b border-nexus-border/20">
                <span className="text-nexus-muted">Block Size Threshold</span>
                <span className="text-white">&gt; 1.0 BTC / 10 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-nexus-muted">Dominant Direction</span>
                <span className={buyRatio > 50 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {buyRatio > 50 ? 'BULLISH TILT' : 'BEARISH ACCELERATOR'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Log of Whale block transactions */}
        <div className="lg:col-span-2 border border-nexus-border/50 bg-nexus-surface/50 p-6 rounded-lg flex flex-col gap-4">
          <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-[#fff] flex items-center gap-2">
            <List className="w-4 h-4 text-nexus-accent" /> BLOCK TRANSACTION HISTORY
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nexus-border/50 text-[10px] font-mono uppercase tracking-wider text-nexus-subtle">
                  <th className="p-3">ID</th>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Side</th>
                  <th className="p-3">Size filled</th>
                  <th className="p-3">Total Value (USD)</th>
                  <th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-nexus-border/20 text-xs font-mono">
                    <td className="p-3 text-nexus-muted">{trade.id}</td>
                    <td className="p-3 text-white font-bold">{trade.asset}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        trade.side === 'buy' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      } uppercase`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="p-3 text-white">{trade.amount.toFixed(4)}</td>
                    <td className="p-3 text-nexus-accent font-bold">${trade.valUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="p-3 text-nexus-muted">{trade.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
