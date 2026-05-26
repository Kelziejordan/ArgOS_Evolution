import { eventBus } from '../nervous-system/event-bus/Bus';
import { NexusEvent } from '../nervous-system/event-bus/Registry';

export interface Signal {
  id: string;
  asset: string;
  title: string;
  desc: string;
  variant: 'amber' | 'emerald' | 'red';
  confidence: number;
  time?: string | number;
}

export const marketState: any = {
  systemStatus: 'NOMINAL',
  killSwitchActive: false,
  btc: { price: 65000, delta: 0, status: 'bullish', volatility: 2, lastUpdate: 0 },
  eth: { price: 3500, delta: 0, status: 'neutral', volatility: 2, lastUpdate: 0 },
  sol: { price: 150, delta: 0, status: 'neutral', volatility: 2, lastUpdate: 0 },
  neuralSentiment: 0.8,
  quantumInstability: 0.1,
  activeWhales: 5
};
