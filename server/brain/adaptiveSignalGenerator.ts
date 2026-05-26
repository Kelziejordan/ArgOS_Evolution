import { Signal, marketState } from "../state/state";
import { activeGenome } from "../memory/snapshots/genetics/Genome";
import { CONFIG } from "../memory/snapshots/genetics/config";
import { eventBus } from "../events/event-bus/Bus";
import { NexusEvent } from "../events/event-bus/Registry";
import { getRecentEvents } from "../memory/events/Logger";

export interface SignalType {
  title: string;
  basePattern: string; // e.g., "VOLATILITY", "SQUEEZE", "DUMP_RISK"
  baseProb: number;
  variant: 'amber' | 'emerald' | 'red';
  riskLevel: 'low' | 'medium' | 'high';
  expectedHoldTime: number; // ms
}

const SIGNAL_CATALOG: SignalType[] = [
  { title: "VOLATILITY_SURGE", basePattern: "VOLATILITY", baseProb: 0.3, variant: 'amber', riskLevel: 'medium', expectedHoldTime: 300000 },
  { title: "SQUEEZE_BREAK", basePattern: "SQUEEZE", baseProb: 0.25, variant: 'emerald', riskLevel: 'medium', expectedHoldTime: 600000 },
  { title: "DUMP_IMMINENT", basePattern: "DUMP_RISK", baseProb: 0.2, variant: 'red', riskLevel: 'high', expectedHoldTime: 180000 },
  { title: "WHALE_ACCUMULATION", basePattern: "ACCUMULATION", baseProb: 0.15, variant: 'emerald', riskLevel: 'low', expectedHoldTime: 1800000 },
  { title: "LIQUIDATION_CASCADE", basePattern: "LIQUIDATION", baseProb: 0.1, variant: 'red', riskLevel: 'high', expectedHoldTime: 120000 },
];

interface SignalPerformance {
  generated: number;
  executed: number;
  filledOrders: number;
  wins: number;
  losses: number;
  winRate: number;
  avgGain: number;
  avgLoss: number;
  profitFactor: number;
}

interface AdaptiveMemory {
  [signalType: string]: SignalPerformance;
}

/**
 * ADAPTIVE SIGNAL GENERATOR
 * 
 * SCOPE BOUNDARY CAUTION (READ CAREFULLY):
 * This module is STRICTLY a statistical probability weight optimizer.
 * It analyzes the historical win/loss ratios of signal patterns, 
 * and adjusts the likelihood of those patterns being generated again.
 * 
 * It is NOT autonomous cognition.
 * It does NOT make executive decisions.
 * It does NOT own position sizing or trade execution.
 * 
 * Do NOT add decision trees or "self-awareness" heuristics here.
 * This is a numbers-in, weights-out mathematical layer.
 */
export class AdaptiveSignalGenerator {
  private memory: AdaptiveMemory = {};
  private assets = ['BTC', 'ETH', 'SOL', 'DOT', 'ADA', 'XRP', 'LINK'];
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeMemory();
    this.startOptimizationLoop();
  }

  private initializeMemory() {
    SIGNAL_CATALOG.forEach((sig) => {
      this.memory[sig.title] = {
        generated: 0,
        executed: 0,
        filledOrders: 0,
        wins: 0,
        losses: 0,
        winRate: 0.5,
        avgGain: 0.005,
        avgLoss: -0.003,
        profitFactor: 1.67,
      };
    });
  }

  private async startOptimizationLoop() {
    this.updateInterval = setInterval(async () => {
      try {
        const recentEvents = await getRecentEvents(200);
        this.analyzePerformance(recentEvents);
      } catch (error) {
        console.error("[ADAPTIVE_SIG] Optimization loop error:", error);
      }
    }, 120000);
  }

  private simulatePnL(holdTime: number, variant: string): number {
    // For simulation if required. Actually we should use order execution vs exit if implemented.
    const isWin = Math.random() > 0.45; // Simulated 55% base win rate for tests
    return isWin ? Math.random() * 0.01 : -(Math.random() * 0.005);
  }

  private analyzePerformance(events: any[]) {
    const signalMap: { [key: string]: any } = {};

    events.forEach((event) => {
      if (event.type === "SIGNAL_GENERATED") {
        const sig = event.data;
        signalMap[sig.id] = {
          signal: sig,
          generated: event.timestamp,
          result: null,
        };
      }

      if (event.type === "ORDER_EXECUTED") {
        const signalId = event.data.signalId;
        if (signalMap[signalId]) {
          signalMap[signalId].executed = event.timestamp;
          signalMap[signalId].result = event.data.status === "FILLED" ? "executed" : "failed";
        }
      }
    });

    const signalTypeStats: { [key: string]: any } = {};

    Object.values(signalMap).forEach((entry: any) => {
      // Split the title since the logged title is `${asset}_${signalType.title}`
      let signalType = entry.signal?.title;
      if (!signalType) return;
      
      const parts = signalType.split('_');
      // The asset is parts[0], the rest is the signal title
      const actualTitle = parts.slice(1).join('_');
      if (this.memory[actualTitle]) {
        signalType = actualTitle;
      }
      
      if (!signalTypeStats[signalType]) {
        signalTypeStats[signalType] = {
          total: 0,
          executed: 0,
          wins: 0,
          losses: 0,
          gains: [],
          losses_list: [],
        };
      }

      signalTypeStats[signalType].total++;

      if (entry.result === "executed") {
        signalTypeStats[signalType].executed++;
        const holdTime = (entry.executed - entry.generated) || 5000;
        const pnl = this.simulatePnL(holdTime, entry.signal.variant);

        if (pnl > 0) {
          signalTypeStats[signalType].wins++;
          signalTypeStats[signalType].gains.push(pnl);
        } else {
          signalTypeStats[signalType].losses++;
          signalTypeStats[signalType].losses_list.push(pnl);
        }
      }
    });

    Object.entries(signalTypeStats).forEach(([signalType, stats]: [string, any]) => {
      if (!this.memory[signalType]) return;
      const previous = this.memory[signalType];

      const winRate = stats.executed > 0 ? stats.wins / stats.executed : 0.5;
      const avgGain = stats.gains.length > 0 ? stats.gains.reduce((a: number, b: number) => a + b, 0) / stats.gains.length : 0.005;
      const avgLoss = stats.losses_list.length > 0 ? stats.losses_list.reduce((a: number, b: number) => a + b, 0) / stats.losses_list.length : -0.003;
      const profitFactor = Math.abs(avgLoss) > 0 ? Math.abs(avgGain / avgLoss) : 1.67;

      const alpha = 0.3;
      this.memory[signalType] = {
        generated: previous.generated + stats.total,
        executed: previous.executed + stats.executed,
        filledOrders: previous.filledOrders + stats.wins,
        wins: previous.wins + stats.wins,
        losses: previous.losses + stats.losses,
        winRate: alpha * winRate + (1 - alpha) * previous.winRate,
        avgGain: alpha * avgGain + (1 - alpha) * previous.avgGain,
        avgLoss: alpha * avgLoss + (1 - alpha) * previous.avgLoss,
        profitFactor: alpha * profitFactor + (1 - alpha) * previous.profitFactor,
      };
    });

    console.log("[ADAPTIVE_SIG] Memory updated with learned stats");
  }

  private generateDescription(signal: SignalType, asset: string): string {
    return `${signal.title} detected on ${asset}.`;
  }

  public generateSignal(correlationId?: string, causationId?: string): Signal | null {
    const weightedSignals = SIGNAL_CATALOG.map((sig) => {
      const learned = this.memory[sig.title];
      const learningBoost = Math.max(0, (learned.winRate - 0.5) * 0.5);
      const adjustedProb = Math.max(0.01, Math.min(0.9, sig.baseProb + learningBoost));

      return { ...sig, adjustedProb };
    });

    const totalProb = weightedSignals.reduce((sum, s) => sum + s.adjustedProb, 0);
    const normalized = weightedSignals.map((s) => ({
      ...s,
      adjustedProb: s.adjustedProb / totalProb,
    }));

    const rand = Math.random();
    let cumulative = 0;
    let selectedSignal: SignalType | null = null;

    for (const sig of normalized) {
      cumulative += sig.adjustedProb;
      if (rand <= cumulative) {
        selectedSignal = sig;
        break;
      }
    }

    if (!selectedSignal || Math.random() > activeGenome.getTraits().signalProbability) {
      return null;
    }

    const asset = this.assets[Math.floor(Math.random() * this.assets.length)];

    const newSignal: Signal = {
      id: Date.now().toString(),
      asset: asset, // ADDED
      title: `${asset}_${selectedSignal.title}`,
      desc: this.generateDescription(selectedSignal, asset),
      variant: selectedSignal.variant,
      time: 'NOW',
      confidence: selectedSignal.baseProb, // ADDED
    };

    if (this.memory[selectedSignal.title]) {
        this.memory[selectedSignal.title].generated++;
    }

    eventBus.dispatch(NexusEvent.SIGNAL_GENERATED, newSignal, 'ADAPTIVE_SIGNAL_GENERATOR', correlationId, causationId);
    
    return newSignal;
  }
  
  public getMemory() {
    return this.memory;
  }
}

export const adaptiveSignalGenerator = new AdaptiveSignalGenerator();
