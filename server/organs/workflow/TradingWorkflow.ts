import { eventBus } from "../../nervous-system/event-bus/Bus";
import { NexusEvent } from "../../nervous-system/event-bus/Registry";
import { replayContext } from "../../anatomy/ReplayContext";
import { adaptiveSignalGenerator } from "../../brain/adaptiveSignalGenerator";

/**
 * TRADING WORKFLOW (Workflow Engine)
 * 
 * Separates execution sequencing and approval heuristics 
 * from the NervousCenter (which should only route).
 */
export function initializeTradingWorkflow() {
  console.log("[WORKFLOW] Initializing Trading Workflow Engine...");

  // React to successful risk checks and route them to approval or execution
  eventBus.on(NexusEvent.RISK_CHECK_PASSED, (payload) => {
    if (replayContext.active) return;
    
    const signal = payload.data;

    // Automated confidence scoring heuristic
    let autoApprove = false;
    const parts = signal.title?.split('_');
    const actualTitle = parts?.length > 1 ? parts.slice(1).join('_') : signal.title;
    
    const memory = adaptiveSignalGenerator.getMemory();
    const stats = memory[actualTitle];
    
    if (stats && stats.executed >= 5 && stats.winRate > 0.60 && stats.profitFactor > 1.2) {
      console.log(`[WORKFLOW] Auto-approving high confidence signal: ${actualTitle} (WinRate: ${(stats.winRate*100).toFixed(1)}%)`);
      autoApprove = true;
    }

    // Check if signal requires approval
    if (!autoApprove && (signal.variant === 'red' || signal.variant === 'emerald')) {
      // High confidence/impact signals require approval
      eventBus.dispatch(NexusEvent.APPROVAL_REQUIRED, { 
        type: 'SIGNAL_EXECUTION', 
        signalId: signal.id,
        signalTitle: signal.title 
      }, 'WORKFLOW_ENGINE', payload.correlationId, payload.eventId);
    } else {
      // Automatic approval for low-risk signals (amber) or high-confidence learned signals
      eventBus.dispatch(NexusEvent.APPROVAL_GRANTED, { 
        type: 'SIGNAL_EXECUTION', 
        signalId: signal.id,
        signalTitle: signal.title 
      }, 'WORKFLOW_ENGINE', payload.correlationId, payload.eventId);
    }
  });
}
