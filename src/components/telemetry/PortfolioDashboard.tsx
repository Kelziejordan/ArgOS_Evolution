import React, { useEffect, useState } from "react";
import { Activity, XCircle, TrendingUp, TrendingDown, DollarSign, Crosshair, AlertTriangle } from "lucide-react";
import { useSystem } from "../../event-system/EventCore";

interface Position {
  id: string;
  signalId: number;
  asset: string;
  side: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  positionValue: number;
  entryTime: number;
  stopLoss: number;
  takeProfit: number;
  riskAmount: number;
  rewardAmount: number;
  status: string;
  pnl?: number;
  pnlPercent?: number;
}

interface PortfolioState {
  totalEquity: number;
  availableCash: number;
  totalExposure: number;
  positions: Position[];
  activePositions: number;
  netPnL: number;
  maxDrawdown: number;
  winRate: number;
}

export function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioState | null>(null);
  const [memory, setMemory] = useState<any>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemState, setSystemState] = useState<any>(null);
  const { addAssistantMessage } = useSystem();

  const fetchPortfolio = async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
      }
    } catch (e) {
      console.warn("Could not fetch portfolio metrics.");
    }
  };

  const fetchMemory = async () => {
    try {
      const res = await fetch("/api/signal-memory");
      if (res.ok) {
        const data = await res.json();
        setMemory(data);
      }
    } catch (e) {
      console.warn("Could not fetch signal memory metrics.");
    }
  };

  const fetchApprovals = async () => {
    try {
      const res = await fetch("/api/approvals/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingApprovals(data);
      }
    } catch (e) {
      console.warn("Could not fetch pending approvals.");
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        setSystemState(await res.json());
      }
    } catch (e) {}
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchPortfolio();
      await fetchMemory();
      await fetchApprovals();
      await fetchHealth();
      setIsLoading(false);
    };
    
    fetchData();

    const intervalId = setInterval(() => {
      fetchPortfolio();
      fetchApprovals();
      fetchHealth();
    }, 5000); // refresh portfolio & approvals every 5s

    const memoryIntervalId = setInterval(() => {
      fetchMemory();
    }, 60000); // refresh memory every minute

    return () => {
      clearInterval(intervalId);
      clearInterval(memoryIntervalId);
    };
  }, []);

  const handleApprove = async (token: string) => {
    addAssistantMessage(`AUTHORIZING HIGH-RISK SIGNAL TOKEN: ${token}`);
    try {
      const res = await fetch(`/api/approve/${token}`, { method: 'POST' });
      if (res.ok) {
        addAssistantMessage(`SIGNAL APPROVED SUCCESSFULLY.`);
        fetchApprovals();
        fetchPortfolio();
      } else {
        addAssistantMessage(`ERROR: FAILED TO APPROVE SIGNAL.`);
      }
    } catch (e) {
      addAssistantMessage(`ERROR: FAILED TO APPROVE SIGNAL.`);
    }
  };

  const handleClosePosition = async (id: string) => {
    addAssistantMessage(`MANUAL AORTA CLOSE INITIATED FOR POS: ${id}`);
    try {
      await fetch(`/api/close-position/${id}`, { method: 'POST' });
      fetchPortfolio();
    } catch (e) {
      addAssistantMessage(`ERROR: FAILED TO CLOSE POSITION ${id}`);
    }
  };

  const handleCloseAll = async () => {
    addAssistantMessage(`EMERGENCY: CLOSING ALL POSITIONS.`);
    try {
      await fetch(`/api/close-all`, { method: 'POST' });
      fetchPortfolio();
    } catch (e) {
      addAssistantMessage(`ERROR: FAILED TO CLOSE ALL POSITIONS`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full border border-nexus-border/50 rounded-lg bg-nexus-surface/50">
        <div className="flex flex-col items-center space-y-4">
          <Activity className="w-8 h-8 text-nexus-accent animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-nexus-subtle">SYNCING PORTFOLIO METRICS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto w-full">
      {systemState && systemState.dryRunMode && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-3 rounded-lg flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-3">
             <AlertTriangle className="w-5 h-5 animate-pulse" />
             <div>
               <h3 className="font-bold text-sm tracking-wider">DRY-RUN / PAPER TRADING ACTIVATED</h3>
               <p className="text-xs opacity-80 font-mono mt-0.5">System logic is alive. Real-world capital execution is disconnected.</p>
             </div>
          </div>
          <span className="text-[10px] font-mono border border-amber-500/30 px-2 py-1 rounded bg-amber-500/5">SAFE MODE</span>
        </div>
      )}
      
      {systemState && !systemState.dryRunMode && systemState.liveTradingEnabled && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
           <AlertTriangle className="w-5 h-5 animate-pulse" />
           <div>
             <h3 className="font-bold text-sm tracking-wider">LIVE TRADING ACTIVATED: CAPITAL AT RISK</h3>
             <p className="text-xs opacity-80 font-mono mt-0.5">Execution engine is routed directly to exchange APIs.</p>
           </div>
        </div>
      )}
      
      {/* Portfolio Top level metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Equity" value={`$${portfolio?.totalEquity.toFixed(2) || '0.00'}`} icon={<DollarSign className="w-4 h-4 text-emerald-500" />} />
        <MetricCard title="Available Cash" value={`$${portfolio?.availableCash.toFixed(2) || '0.00'}`} icon={<DollarSign className="w-4 h-4 text-nexus-accent" />} />
        <MetricCard title="Total Exposure" value={`$${portfolio?.totalExposure.toFixed(2) || '0.00'}`} />
        <MetricCard title="Net PNL" value={`$${portfolio?.netPnL.toFixed(2) || '0.00'}`} trend={portfolio && portfolio.netPnL >= 0 ? "up" : "down"} />
        <MetricCard title="Win Rate" value={`${portfolio?.winRate.toFixed(1) || '0.0'}%`} icon={<Crosshair className="w-4 h-4 text-emerald-500" />} />
        <MetricCard title="Max Drawdown" value={`${portfolio?.maxDrawdown.toFixed(2) || '0.00'}%`} icon={<AlertTriangle className="w-4 h-4 text-red-500" />} />
        <MetricCard title="Active Positions" value={`${portfolio?.activePositions || '0'}`} />
      </div>

      {/* Pending Approvals Table */}
      {pendingApprovals.length > 0 && (
        <div className="border border-nexus-border/50 rounded-lg bg-nexus-surface/50 p-6 flex flex-col gap-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" /> PENDING APPROVALS
              </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nexus-border/50 text-[10px] font-mono uppercase tracking-wider text-nexus-subtle">
                  <th className="p-3">Signal</th>
                  <th className="p-3">Token</th>
                  <th className="p-3">Generated At</th>
                  <th className="p-3">Expires At</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((req) => (
                  <tr key={req.token} className="border-b border-nexus-border/20 text-xs font-mono">
                    <td className="p-3 text-white font-medium">{req.data?.signalTitle || req.type}</td>
                    <td className="p-3 text-nexus-muted">{req.token}</td>
                    <td className="p-3 text-nexus-muted">{new Date(req.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 text-nexus-muted">{new Date(req.timestamp + 300000).toLocaleTimeString()}</td>
                    <td className="p-3">
                      <button 
                        onClick={() => handleApprove(req.token)}
                        className="px-3 py-1 bg-nexus-accent/10 border border-nexus-accent/30 text-nexus-accent text-[10px] font-mono tracking-widest uppercase hover:bg-nexus-accent/20 transition-colors rounded">
                          APPROVE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Positions Table */}
      <div className="border border-nexus-border/50 rounded-lg bg-nexus-surface/50 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Activity className="w-4 h-4" /> ACTIVE POSITIONS
            </h2>
            {portfolio && portfolio.activePositions > 0 && (
                <button 
                  onClick={handleCloseAll}
                  className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-mono tracking-widest uppercase hover:bg-red-500/20 transition-colors rounded">
                    EMERGENCY CLOSE ALL
                </button>
            )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-nexus-border/50 text-[10px] font-mono uppercase tracking-wider text-nexus-subtle">
                <th className="p-3">Asset</th>
                <th className="p-3">Pos Size</th>
                <th className="p-3">Entry</th>
                <th className="p-3">Current/Exposure</th>
                <th className="p-3">SL / TP</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolio?.positions.map((pos) => (
                <tr key={pos.id} className="border-b border-nexus-border/20 text-xs font-mono">
                  <td className="p-3 text-white font-medium">{pos.asset} ({pos.side})</td>
                  <td className="p-3 text-nexus-muted">{pos.quantity.toFixed(4)}</td>
                  <td className="p-3 text-white">${pos.entryPrice.toFixed(2)}</td>
                  <td className="p-3 text-nexus-accent">${pos.positionValue.toFixed(2)}</td>
                  <td className="p-3">
                    <span className="text-red-400">SL: ${pos.stopLoss.toFixed(2)}</span>
                    <br/>
                    <span className="text-emerald-400">TP: ${pos.takeProfit.toFixed(2)}</span>
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={() => handleClosePosition(pos.id)}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors transition px-2 py-1 bg-red-400/10 rounded">
                        <XCircle className="w-3 h-3" />
                        <span className="text-[10px] uppercase tracking-wider">Close</span>
                    </button>
                  </td>
                </tr>
              ))}
              {(!portfolio?.positions || portfolio.positions.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-nexus-subtle text-[10px] uppercase tracking-widest font-mono">NO ACTIVE POSITIONS</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signal Memory Learning Status */}
      <div className="border border-nexus-border/50 rounded-lg bg-nexus-surface/50 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <Activity className="w-4 h-4" /> ADAPTIVE SIGNAL MEMORY
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-nexus-border/50 text-[10px] font-mono uppercase tracking-wider text-nexus-subtle">
                <th className="p-3">Signal Type</th>
                <th className="p-3">Win Rate</th>
                <th className="p-3">Generated</th>
                <th className="p-3">Executed</th>
                <th className="p-3">Wins / Losses</th>
                <th className="p-3">Profit Factor</th>
              </tr>
            </thead>
            <tbody>
              {memory && Object.entries(memory).map(([title, stats]: [string, any]) => (
                <tr key={title} className="border-b border-nexus-border/20 text-xs font-mono">
                  <td className="p-3 text-white font-medium">{title}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`${stats.winRate > 0.55 ? 'text-emerald-400' : stats.winRate < 0.45 ? 'text-red-400' : 'text-nexus-muted'}`}>
                          {(stats.winRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-nexus-muted">{stats.generated}</td>
                  <td className="p-3 text-nexus-muted">{stats.executed}</td>
                  <td className="p-3">
                      <span className="text-emerald-400">{stats.wins}</span> / <span className="text-red-400">{stats.losses}</span>
                  </td>
                  <td className="p-3 text-nexus-accent">{stats.profitFactor.toFixed(2)}</td>
                </tr>
              ))}
              {!memory && Object.keys(memory || {}).length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-nexus-subtle text-[10px] uppercase tracking-widest font-mono">AWAITING SIGNAL ANALYSIS...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string, icon?: React.ReactNode, trend?: "up" | "down" }) {
  return (
    <div className="border border-nexus-border/50 bg-nexus-surface/50 p-4 rounded-lg flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-nexus-subtle">{title}</h3>
        {icon}
      </div>
      <div className="flex items-center gap-2">
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
          <span className={`text-xl font-mono ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-white'}`}>
             {value}
          </span>
      </div>
    </div>
  );
}
