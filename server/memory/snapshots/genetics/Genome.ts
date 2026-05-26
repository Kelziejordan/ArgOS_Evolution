import fs from 'fs';
import path from 'path';
import { eventBus } from '../../../events/event-bus/Bus';
import { NexusEvent } from '../../../events/event-bus/Registry';

export interface GenomeData {
  riskPerTrade: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  maxOpenPositions: number;
  signalProbability: number;
  volatilityThreshold: number;
}

const DEFAULT_GENOME: GenomeData = {
  riskPerTrade: 0.02,
  stopLossPercent: 0.02,
  takeProfitPercent: 0.03,
  maxOpenPositions: 5,
  signalProbability: 0.15,
  volatilityThreshold: 3.0,
};

const GENOME_FILE = path.join(process.cwd(), 'logs', 'genome.json');

export class Genome {
  private genes: GenomeData;

  constructor() {
    this.genes = { ...DEFAULT_GENOME };
    this.loadGenes();
  }

  private loadGenes() {
    try {
      if (fs.existsSync(GENOME_FILE)) {
        const data = fs.readFileSync(GENOME_FILE, 'utf-8');
        this.genes = JSON.parse(data);
        console.log("[GENOME] Loaded successfully", this.genes);
      }
    } catch (e) {
      console.warn("[GENOME] Could not load genome, using defaults.");
    }
  }

  private saveGenes() {
    try {
      const dir = path.dirname(GENOME_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(GENOME_FILE, JSON.stringify(this.genes, null, 2));
    } catch (e) {
      console.error("[GENOME] Failed to save genes", e);
    }
  }

  public getTraits(): GenomeData {
    return { ...this.genes };
  }

  public mutate(performance: number) {
    // If performance (Sharpe ratio or average win rate) is low, we mutate more
    // If performance is high, we make small tweaks
    const volatility = performance < 0.5 ? 0.2 : 0.05; // 20% vs 5% max mutation
    
    const tweak = (val: number, isInt = false) => {
      const change = 1 + (Math.random() * volatility * 2 - volatility);
      let newVal = val * change;
      if (isInt) newVal = Math.round(newVal);
      return Math.max(0.001, newVal); // Prevents going to 0 or negative
    };

    this.genes.riskPerTrade = Math.min(0.05, tweak(this.genes.riskPerTrade)); // Cap at 5%
    this.genes.stopLossPercent = tweak(this.genes.stopLossPercent);
    this.genes.takeProfitPercent = tweak(this.genes.takeProfitPercent);
    this.genes.maxOpenPositions = Math.max(1, Math.min(10, tweak(this.genes.maxOpenPositions, true)));
    this.genes.signalProbability = Math.min(0.5, tweak(this.genes.signalProbability));
    this.genes.volatilityThreshold = tweak(this.genes.volatilityThreshold);

    this.saveGenes();

    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, {
      message: `GENETIC_MUTATION: Adapted to new parameter set (Risk: ${(this.genes.riskPerTrade * 100).toFixed(1)}%, SL: ${(this.genes.stopLossPercent * 100).toFixed(1)}%, TP: ${(this.genes.takeProfitPercent * 100).toFixed(1)}%)`,
      level: "INFO"
    }, 'GENOME');
  }
}

export const activeGenome = new Genome();
