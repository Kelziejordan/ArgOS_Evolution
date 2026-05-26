import { eventBus } from "../../events/event-bus/Bus";
import { NexusEvent } from "../../events/event-bus/Registry";
import { replayContext } from "../../anatomy/ReplayContext";

/**
 * EXECUTION ENGINE
 * 
 * Separates paper-trading (dry-run) from live execution.
 * 
 * Flow:
 * 1. PositionManager prepares position and emits ORDER_PLACED.
 * 2. ExecutionEngine intercepts ORDER_PLACED.
 * 3. Based on DRY_RUN_MODE, it either simulates slippage/latency or calls Kraken API.
 * 4. Once complete, it emits ORDER_EXECUTED so PositionManager updates state.
 */
export function initializeExecutionEngine() {
  console.log("[EXECUTION_ENGINE] Initializing trade execution layer...");

  const isDryRun = process.env.DRY_RUN_MODE !== 'false'; // Default to true for safety

  eventBus.on(NexusEvent.ORDER_PLACED, async (payload) => {
    if (replayContext.active) return;
    
    const orderData = payload.data;
    
    if (isDryRun) {
      console.log(`[EXECUTION_ENGINE] [DRY RUN] Simulating order execution for ${orderData.asset}...`);
      
      // Simulate latency and slight slippage
      setTimeout(() => {
        const slippage = 1 + ((Math.random() - 0.5) * 0.001); // 0.05% slippage max
        const executionPrice = orderData.price * slippage;
        
        eventBus.dispatch(NexusEvent.ORDER_EXECUTED, {
          ...orderData,
          status: 'FILLED',
          executionPrice,
          executedAt: Date.now(),
          mode: 'DRY_RUN'
        }, 'EXECUTION_ENGINE', payload.correlationId, payload.eventId);
        
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, {
          message: `DRY_RUN EXECUTION: FILLED ${orderData.asset} @ $${executionPrice.toFixed(2)}`,
          level: 'INFO'
        }, 'EXECUTION_ENGINE', payload.correlationId, payload.eventId);
        
      }, 800 + Math.random() * 1000); // 800-1800ms ping/execution time
    } else {
      console.log(`[EXECUTION_ENGINE] [LIVE] Proceeding with live order for ${orderData.asset}...`);
      
      // LIVE TRADING STUB
      // Insert actual exchange logic here (e.g. ccxt createOrder)
      // Since live trading requires intense pre-validation, for now we will bounce back a rejection if not fully implemented.
      
      eventBus.dispatch(NexusEvent.SYSTEM_ALERT, {
        message: `LIVE TRADING REJECTED: FULL EXCHANGE IMPLEMENTATION PENDING TEMPORAL AUDIT`,
        level: 'WARNING'
      }, 'EXECUTION_ENGINE', payload.correlationId, payload.eventId);
      
      eventBus.dispatch(NexusEvent.ORDER_EXECUTED, {
        ...orderData,
        status: 'REJECTED',
        reason: 'LIVE_TRADING_LOCKED',
        mode: 'LIVE'
      }, 'EXECUTION_ENGINE', payload.correlationId, payload.eventId);
    }
  });
}
