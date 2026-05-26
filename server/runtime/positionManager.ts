import fs from "fs";
import path from "path";
import { activeGenome } from "../memory/snapshots/genetics/Genome";
import { marketState } from "../state/state";
import { eventBus } from "../events/event-bus/Bus";
import { NexusEvent } from "../events/event-bus/Registry";

export interface Position {
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
  status: 'open' | 'closed_profit' | 'closed_loss' | 'closed_manual';
  exitPrice?: number;
  exitTime?: number;
  pnl?: number;
  pnlPercent?: number;
}

export interface PortfolioState {
  totalEquity: number;
  availableCash: number;
  totalExposure: number;
  positions: Position[];
  activePositions: number;
  netPnL: number;
  maxDrawdown: number;
  winRate: number;
}

export class PositionManager {
  private positions: Map<string, Position> = new Map();
  private portfolioHistory: PortfolioState[] = [];
  private equity: number = 1000;
  private maxEquity: number = 1000;
  private closedPnL: number = 0;
  private totalTrades: number = 0;
  private wins: number = 0;

  private get MAX_OPEN_POSITIONS() { return activeGenome.getTraits().maxOpenPositions; }
  private get RISK_PER_TRADE() { return activeGenome.getTraits().riskPerTrade; }
  private get STOP_LOSS_PERCENT() { return activeGenome.getTraits().stopLossPercent; }
  private get TAKE_PROFIT_PERCENT() { return activeGenome.getTraits().takeProfitPercent; }
  private POSITION_CHECK_INTERVAL = 5000;

  constructor(initialEquity: number = 1000) {
    this.equity = initialEquity;
    this.maxEquity = initialEquity;
    this.startPositionMonitor();
    this.wireUpEventHandlers();
    this.restoreFromBootstrap();
  }

  private restoreFromBootstrap() {
    try {
      const logsDir = path.join(process.cwd(), "logs");
      const currentSnapshot = path.join(logsDir, "snapshot_current.json");
      if (fs.existsSync(currentSnapshot)) {
        const data = fs.readFileSync(currentSnapshot, "utf-8");
        const snap = JSON.parse(data);
        if (snap && snap.positionManagerState) {
          this.restoreState(snap.positionManagerState);
        }
      }
    } catch (err: any) {
      console.warn("[POSITION_MANAGER] [🟡] No baseline snapshot bootstrap found, starting with initial equity.", err.message);
    }
  }

  private wireUpEventHandlers() {
    eventBus.on(NexusEvent.RISK_CHECK_PASSED, (payload) => {
      const signal = payload.data;
      if (this.canOpenPosition()) {
        this.preparePosition(signal, payload.correlationId, payload.eventId);
      } else {
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, {
          message: `POSITION_REJECTED: MAX_OPEN_POSITIONS(${this.MAX_OPEN_POSITIONS}) REACHED`,
          level: 'WARNING',
        }, 'POSITION_MANAGER', payload.correlationId, payload.eventId);
      }
    });

    eventBus.on(NexusEvent.APPROVAL_GRANTED, (payload) => {
      if (payload.data.type === 'SIGNAL_EXECUTION') {
        this.executePosition(payload.data.signalId, payload.correlationId);
      }
    });

    eventBus.on(NexusEvent.ORDER_EXECUTED, (payload) => {
      const positionId = payload.data.positionId;
      const position = this.positions.get(positionId);
      if (position) {
        if (payload.data.status === 'REJECTED') {
          this.positions.delete(positionId);
          eventBus.dispatch(NexusEvent.SYSTEM_ALERT, {
            message: `POSITION_ABORTED: ${position.asset} execution rejected (${payload.data.reason})`,
            level: 'WARNING',
          }, 'POSITION_MANAGER', payload.correlationId);
        } else {
          // Update actual execution price if slippage occurred
          if (payload.data.executionPrice) {
            position.entryPrice = payload.data.executionPrice;
            position.positionValue = position.entryPrice * position.quantity;
          }
          eventBus.dispatch(NexusEvent.SYSTEM_ALERT, {
            message: `POSITION_OPENED: ${position.asset} @ $${position.entryPrice.toFixed(2)}, SL: $${position.stopLoss.toFixed(2)}, TP: $${position.takeProfit.toFixed(2)} [MODE: ${payload.data.mode}]`,
            level: 'INFO',
          }, 'POSITION_MANAGER', payload.correlationId);
        }
      }
    });

    eventBus.on(NexusEvent.SNAPSHOT_RESTORE, (payload) => {
      const snapData = payload.data;
      if (snapData) {
        const pState = snapData.positionManagerState || snapData.state?.positionManagerState;
        if (pState) {
          this.restoreState(pState);
        }
      }
    });
  }

  private canOpenPosition(): boolean {
    const activeCount = Array.from(this.positions.values()).filter(
      (p) => p.status === 'open'
    ).length;
    return activeCount < this.MAX_OPEN_POSITIONS && this.availableCash > this.equity * 0.05;
  }

  private get availableCash(): number {
    const openPositions = Array.from(this.positions.values()).filter(
      (p) => p.status === 'open'
    );
    const totalExposure = openPositions.reduce((sum, p) => sum + p.positionValue, 0);
    return this.equity - totalExposure;
  }

  public preparePosition(signal: any, correlationId?: string, causationId?: string): Position {
    const asset = signal.title.split('_')[0];
    const currentPrice = this.getCurrentPrice(asset);
    
    if (!currentPrice) return {} as Position;

    const riskAmount = this.equity * this.RISK_PER_TRADE;
    const stopLossPrice = currentPrice * (1 - this.STOP_LOSS_PERCENT);
    const priceDifference = currentPrice - stopLossPrice;
    
    if (priceDifference <= 0) return {} as Position;
    
    const quantity = riskAmount / priceDifference;
    const takeProfitPrice = currentPrice * (1 + this.TAKE_PROFIT_PERCENT);
    const rewardAmount = (takeProfitPrice - currentPrice) * quantity;

    const position: Position = {
      id: `POS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      signalId: signal.id,
      asset,
      side: 'long',
      entryPrice: currentPrice,
      quantity,
      positionValue: currentPrice * quantity,
      entryTime: Date.now(),
      stopLoss: stopLossPrice,
      takeProfit: takeProfitPrice,
      riskAmount,
      rewardAmount,
      status: 'open',
    };

    this.positions.set(position.id, position);

    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, {
      message: `POSITION_PREPARED: ${asset} | Size: ${quantity.toFixed(4)} | Risk: $${riskAmount.toFixed(2)} | Reward: $${rewardAmount.toFixed(2)}`,
      level: 'INFO',
    }, 'POSITION_MANAGER', correlationId, causationId);

    return position;
  }

  public executePosition(signalId: number, correlationId?: string) {
    const position = Array.from(this.positions.values()).find(
      (p) => p.signalId === signalId && p.status === 'open'
    );

    if (!position) return;

    // Send the order to the Execution Engine. 
    // The PositionManager will wait for ORDER_EXECUTED to acknowledge the fill.
    eventBus.dispatch(NexusEvent.ORDER_PLACED, {
      positionId: position.id,
      signalId: position.signalId,
      asset: position.asset,
      quantity: position.quantity,
      price: position.entryPrice,
    }, 'POSITION_MANAGER', correlationId);
  }

  private startPositionMonitor() {
    setInterval(() => {
      const openPositions = Array.from(this.positions.values()).filter(
        (p) => p.status === 'open'
      );

      openPositions.forEach((position) => {
        const currentPrice = this.getCurrentPrice(position.asset);
        if (!currentPrice) return;

        if (currentPrice <= position.stopLoss) {
          this.closePosition(position, currentPrice, 'STOP_LOSS_HIT', 'closed_loss');
        } else if (currentPrice >= position.takeProfit) {
          this.closePosition(position, currentPrice, 'TAKE_PROFIT_HIT', 'closed_profit');
        }
      });

      this.updatePortfolioState();
    }, this.POSITION_CHECK_INTERVAL);
  }

  private closePosition(
    position: Position,
    exitPrice: number,
    reason: string,
    status: 'closed_profit' | 'closed_loss' | 'closed_manual'
  ) {
    position.exitPrice = exitPrice;
    position.exitTime = Date.now();
    position.pnl = (exitPrice - position.entryPrice) * position.quantity;
    position.pnlPercent = ((exitPrice - position.entryPrice) / position.entryPrice) * 100;
    position.status = status;

    this.equity += position.pnl;
    this.closedPnL += position.pnl;
    this.totalTrades++;

    if (status === 'closed_profit') {
      this.wins++;
    }

    if (this.equity > this.maxEquity) {
      this.maxEquity = this.equity;
    }

    // Dispatch closing/exit order events for complete audit trailing and execution engine visibility
    const exitOrderId = `EXIT-${position.id}-${Date.now()}`;
    eventBus.dispatch(NexusEvent.ORDER_PLACED, {
      id: exitOrderId,
      symbol: `${position.asset}/USD`,
      side: 'sell',
      price: exitPrice,
      amount: position.quantity,
      status: 'PENDING',
      reason
    }, 'POSITION_MANAGER');

    eventBus.dispatch(NexusEvent.ORDER_EXECUTED, {
      id: exitOrderId,
      orderId: exitOrderId,
      symbol: `${position.asset}/USD`,
      side: 'sell',
      price: exitPrice,
      amount: position.quantity,
      executionPrice: exitPrice,
      status: 'EXECUTED',
      mode: 'SIMULATED'
    }, 'POSITION_MANAGER');

    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, {
      message: `POSITION_CLOSED: ${position.asset} | ${reason} | Exit: $${exitPrice.toFixed(2)} | P&L: $${position.pnl.toFixed(2)} (${position.pnlPercent.toFixed(2)}%)`,
      level: status === 'closed_profit' ? 'INFO' : 'WARNING',
    }, 'POSITION_MANAGER');
  }

  private getCurrentPrice(asset: string): number | null {
    const key = asset.toLowerCase();
    const stateField = (marketState as any)[key];
    return stateField?.price || null;
  }

  private updatePortfolioState() {
    const openPositions = Array.from(this.positions.values()).filter(
      (p) => p.status === 'open'
    );

    const totalExposure = openPositions.reduce((sum, p) => sum + p.positionValue, 0);
    const unrealizedPnL = openPositions.reduce((sum, p) => {
      const currentPrice = this.getCurrentPrice(p.asset) || p.entryPrice;
      return sum + (currentPrice - p.entryPrice) * p.quantity;
    }, 0);

    const portfolio: PortfolioState = {
      totalEquity: this.equity,
      availableCash: this.equity - totalExposure,
      totalExposure,
      positions: openPositions,
      activePositions: openPositions.length,
      netPnL: this.closedPnL + unrealizedPnL,
      maxDrawdown: ((this.maxEquity - this.equity) / this.maxEquity) * 100,
      winRate: this.totalTrades > 0 ? (this.wins / this.totalTrades) * 100 : 0,
    };

    this.portfolioHistory.push(portfolio);
    if (this.portfolioHistory.length > 1000) {
      this.portfolioHistory.shift();
    }
  }

  public getPortfolioState(): PortfolioState {
    const openPositions = Array.from(this.positions.values()).filter(
      (p) => p.status === 'open'
    );

    const totalExposure = openPositions.reduce((sum, p) => sum + p.positionValue, 0);
    const unrealizedPnL = openPositions.reduce((sum, p) => {
      const currentPrice = this.getCurrentPrice(p.asset) || p.entryPrice;
      return sum + (currentPrice - p.entryPrice) * p.quantity;
    }, 0);

    return {
      totalEquity: this.equity,
      availableCash: this.equity - totalExposure,
      totalExposure,
      positions: openPositions,
      activePositions: openPositions.length,
      netPnL: this.closedPnL + unrealizedPnL,
      maxDrawdown: ((this.maxEquity - this.equity) / this.maxEquity) * 100,
      winRate: this.totalTrades > 0 ? (this.wins / this.totalTrades) * 100 : 0,
    };
  }

  public getPosition(positionId: string): Position | undefined {
    return this.positions.get(positionId);
  }

  public emergencyClose(positionId: string) {
    const position = this.positions.get(positionId);
    if (position && position.status === 'open') {
      const currentPrice = this.getCurrentPrice(position.asset) || position.entryPrice;
      this.closePosition(position, currentPrice, 'MANUAL_CLOSE', 'closed_manual');
    }
  }

  public closeAll() {
    Array.from(this.positions.values()).forEach((position) => {
      if (position.status === 'open') {
        const currentPrice = this.getCurrentPrice(position.asset) || position.entryPrice;
        this.closePosition(position, currentPrice, 'CLOSE_ALL_COMMAND', 'closed_manual');
      }
    });
  }

  public saveState(): any {
    return {
      positions: Array.from(this.positions.entries()),
      portfolioHistory: this.portfolioHistory,
      equity: this.equity,
      maxEquity: this.maxEquity,
      closedPnL: this.closedPnL,
      totalTrades: this.totalTrades,
      wins: this.wins
    };
  }

  public restoreState(data: any) {
    if (!data) return;
    try {
      if (data.positions) {
        this.positions = new Map(data.positions);
      }
      this.portfolioHistory = data.portfolioHistory || [];
      this.equity = typeof data.equity === 'number' ? data.equity : this.equity;
      this.maxEquity = typeof data.maxEquity === 'number' ? data.maxEquity : this.maxEquity;
      this.closedPnL = typeof data.closedPnL === 'number' ? data.closedPnL : this.closedPnL;
      this.totalTrades = typeof data.totalTrades === 'number' ? data.totalTrades : this.totalTrades;
      this.wins = typeof data.wins === 'number' ? data.wins : this.wins;
      console.log(`[POSITION_MANAGER] [🟢] State reconstituted: Equity=$${this.equity}, OpenPositions=${this.positions.size}`);
    } catch (err: any) {
      console.error("[POSITION_MANAGER] [🔴] Failed to restore state:", err.message);
    }
  }
}

export const positionManager = new PositionManager(5000);
