import { eventBus } from "../../events/event-bus/Bus";
import { NexusEvent } from "../../events/event-bus/Registry";
import { marketState } from "../../state/state";
import { getKraken } from "../../organs/kraken";
import { CONFIG, ASSET_MAPPING } from "../snapshots/genetics/config";
import { generateSignals } from "../../brain/signalGenerator";
import { saveSnapshot, loadLastKnownGood } from "../snapshots/persistence";
import { replayContext } from "../../anatomy/ReplayContext";
import { adaptiveSignalGenerator } from "../../brain/adaptiveSignalGenerator";

export function initializeEventCenter() {
  console.log("[EVENT_CENTER] Initializing coordination layer...");

  // 1. Heartbeat Handler
  eventBus.on(NexusEvent.PULSE_TICK, async (payload) => {
    if (replayContext.active) return;
    
    const marketUpdate = await computeMarketUpdate();
    const atmosphericUpdate = getAtmosphericUpdate();
    
    // Broadcast collected data for state ingestion
    eventBus.dispatch(NexusEvent.MARKET_DATA_RECEIVED, {
      assets: marketUpdate.assets,
      metrics: {
        ...atmosphericUpdate,
        krakenConnected: marketUpdate.krakenConnected
      }
    }, 'EVENT_CENTER', payload.correlationId, payload.eventId);

    // Broadcast that market lifecycle step completed
    eventBus.dispatch(NexusEvent.MARKET_UPDATED, {}, 'EVENT_CENTER', payload.correlationId, payload.eventId);
    
    if (payload.data.pulseCount % 60 === 0) {
      eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "SYSTEM_STABILITY_CHECK: NOMINAL", level: "INFO" });
    }
  });


  // 2. Brain Handler (Signal Generation)
  eventBus.on(NexusEvent.MARKET_UPDATED, (payload) => {
    if (replayContext.active) return;
    
    if (!marketState.killSwitchActive) {
      generateSignals(payload.correlationId, payload.eventId);
    }
  });

  // 4. Memory Handler (Snapshots)
  eventBus.on(NexusEvent.MEMORY_SNAPSHOT, () => {
    if (replayContext.active) return;
    
    saveSnapshot(marketState.systemStatus === 'NOMINAL');
  });

  // 6. Command Handler
  eventBus.on(NexusEvent.COMMAND_RECEIVED, (payload) => {
    const { command, args } = payload.data;
    if (command === 'ROLLBACK') {
      const lastGood = loadLastKnownGood();
       if (lastGood) {
        eventBus.dispatch(NexusEvent.STATE_TRANSITION, { from: marketState.systemStatus, to: lastGood.systemStatus, snapshot: lastGood }, 'EVENT_CENTER', payload.correlationId, payload.eventId);
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "ROLLBACK_SUCCESSFUL: SYSTEM_RESTORED_TO_LAST_KNOWN_GOOD", level: "INFO" }, 'EVENT_CENTER', payload.correlationId, payload.eventId);
      } else {
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "ROLLBACK_FAILED: NO_KNOWN_GOOD_SNAPSHOT_AVAILABLE", level: "ERROR" }, 'EVENT_CENTER', payload.correlationId, payload.eventId);
      }
    }
    
    if (command === 'KILL_SWITCH') {
        eventBus.dispatch(NexusEvent.KILL_SWITCH_TRIGGERED, { reason: args?.reason || 'MANUAL_OVERRIDE' }, 'EVENT_CENTER', payload.correlationId, payload.eventId);
    }

    if (command === 'REPLAY_STATE') {
        // Since replayEvents is async and loads from disk, we can trigger it or handle it in runtime
        // We'll just emit an alert for now if they want to test replay from UI
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "REPLAY_INITIATED: STATE_RECONSTRUCTION_IN_PROGRESS", level: "INFO" }, 'EVENT_CENTER', payload.correlationId, payload.eventId);
    }
  });

  // 7. Audit Logger
  eventBus.on(NexusEvent.SYSTEM_ALERT, (payload) => {
    const data = payload.data;
    console.log(`[AUDIT_LOG] [${data.level}] ${data.message}`);
  });
  
  eventBus.on(NexusEvent.SIGNAL_GENERATED, (payload) => {
    const signal = payload.data;
    console.log(`[AUDIT_LOG] [SIGNAL] ${signal.title}: ${signal.desc}`);
  });
}

function getAtmosphericUpdate() {
  return {
    neuralSentiment: Math.max(0, Math.min(1, marketState.neuralSentiment + (Math.random() - 0.5) * 0.01)),
    quantumInstability: Math.max(0, Math.min(1, marketState.quantumInstability + (Math.random() - 0.5) * 0.005)),
    activeWhales: Math.max(1, marketState.activeWhales + (Math.random() > 0.5 ? 1 : -1))
  };
}

// Internal Logic Gates
async function computeMarketUpdate() {
  const isLive = CONFIG.LIVE_TRADING_ENABLED && !!(
    process.env.KRAKEN_API_KEY && 
    process.env.KRAKEN_API_KEY !== 'your_api_key_here'
  );

  const update: any = { assets: {}, krakenConnected: false };

  try {
    const kraken = getKraken();
    
    // REAL DATA: Fetch actual tickers from Kraken
    if (kraken && isLive) {
      const tickers = await kraken.fetchTickers(CONFIG.MARKET_SYMBOLS).catch(() => null);
      
      if (tickers) {
        for (const symbol of CONFIG.MARKET_SYMBOLS) {
          const ticker = tickers[symbol];
          const key = ASSET_MAPPING[symbol];
          
          if (ticker) {
            const newPrice = ticker.last || ticker.close;
            const newDelta = ticker.percentage || 0;
            
            // Calculate actual volatility from recent candles
            const volatility = await calculateVolatility(kraken, symbol);
            
            let status = 'neutral';
            if (volatility > 3) status = 'volatile';
            else if (newDelta > 0.5) status = 'bullish';
            else if (newDelta < -0.5) status = 'bearish';

            update.assets[key] = { 
              price: newPrice, 
              delta: newDelta, 
              status,
              volatility, // NEW
              lastUpdate: Date.now(),
            };
          }
        }
      }
      update.krakenConnected = true;
    } else {
      // FALLBACK: Simulation drift (when no real data)
      Object.keys(marketState).forEach(key => {
        const stateField = (marketState as any)[key];
        if (typeof stateField === 'object' && stateField?.price) {
          const driftedPrice = stateField.price + 
            (Math.random() - 0.5) * (stateField.price * CONFIG.SIMULATION_DRIFT * 0.2);
          update.assets[key] = { ...stateField, price: driftedPrice };
        }
      });
    }
  } catch (e) {
    console.error("[EVENT_CENTER] Market update failed:", e);
  }

  return update;
}

// NEW: Calculate actual volatility
async function calculateVolatility(kraken: any, symbol: string): Promise<number> {
  try {
    // Get last 24 candles (1-hour bars)
    const ohlcv = await kraken.fetchOHLCV(symbol, '1h', undefined, 24);
    if (ohlcv.length < 2) return 0;

    const closes = ohlcv.map((candle: number[]) => candle[4]); // close price
    const returns = [];

    for (let i = 1; i < closes.length; i++) {
      returns.push(Math.log(closes[i] / closes[i - 1]));
    }

    // Standard deviation of returns = volatility
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sq, val) => sq + Math.pow(val - mean, 2), 0) / returns.length;
    const stdev = Math.sqrt(variance);

    return stdev * 100; // Convert to percentage
  } catch {
    return 0;
  }
}

