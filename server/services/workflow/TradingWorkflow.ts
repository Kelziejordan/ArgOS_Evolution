import { eventBus } from "../../events/event-bus/Bus";
import { NexusEvent } from "../../events/event-bus/Registry";
import { replayContext } from "../../anatomy/ReplayContext";
import { adaptiveSignalGenerator } from "../../brain/adaptiveSignalGenerator";
import { IArgOSCapability, CapabilityMetadata, CapabilityState, CapabilityHealth, IPlatformContext } from "../contracts/ServiceContract";
import { capabilityRegistry } from "../contracts/RuntimeRegistry";

/**
 * TRADING WORKFLOW CAPABILITY (Workflow Engine)
 * 
 * Implements the standard IArgOSCapability contract to handle decupled state control,
 * semantic versioning, dependency alignment, and metadata telemetry.
 */
export class TradingWorkflowCapability implements IArgOSCapability {
  public readonly metadata: CapabilityMetadata = {
    id: "trading-workflow-engine",
    name: "Trading Workflow Engine",
    version: "1.1.0-FINAL",
    owner: "TRADING_ENGINE",
    category: "worker",
    dependencies: []
  };

  private state: CapabilityState = CapabilityState.UNINITIALIZED;
  private bootTime: number = 0;
  private lastPulse: number = Date.now();
  private eventSubscriptionToken: any = null;

  public getHealth(): CapabilityHealth {
    return {
      state: this.state,
      score: this.state === CapabilityState.ACTIVE ? 100 : 0,
      uptimeMs: this.bootTime > 0 ? Date.now() - this.bootTime : 0,
      lastPulseTime: this.lastPulse,
      stalled: Date.now() - this.lastPulse > 30000,
      diagnostics: {
        activeContext: replayContext.active ? "REPLAY_MODE" : "LIVE_MODE"
      }
    };
  }

  public async initialize(context: IPlatformContext): Promise<void> {
    console.log("[WORKFLOW] Initializing Trading Workflow Engine Capability...");
    this.state = CapabilityState.INITIALIZING;
    this.bootTime = Date.now();
  }

  public async activate(): Promise<void> {
    this.state = CapabilityState.ACTIVE;
    this.lastPulse = Date.now();

    // React to successful risk checks and route them to approval or execution
    this.eventSubscriptionToken = eventBus.on(NexusEvent.RISK_CHECK_PASSED, (payload) => {
      this.lastPulse = Date.now();
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

    console.log("[WORKFLOW] Trading Workflow Engine Capability now ACTIVE.");
  }

  public async suspend(reason: string): Promise<void> {
    this.state = CapabilityState.SUSPENDED;
    console.warn(`[WORKFLOW] Trading Workflow Engine Capability suspended: ${reason}`);
  }

  public async terminate(): Promise<void> {
    this.state = CapabilityState.TERMINATED;
    if (this.eventSubscriptionToken) {
      // In a real production codebase, you unsubscribe tokens here
      this.eventSubscriptionToken = null;
    }
    console.log("[WORKFLOW] Trading Workflow Engine Capability terminated.");
  }
}

// Instantiate and register to central registry
const workflowCapability = new TradingWorkflowCapability();
capabilityRegistry.register(workflowCapability);

export function initializeTradingWorkflow() {
  // Maintaining legacy bootstrapping export for continuous system support
  console.log("[WORKFLOW] Legacy bootstrap hook invoked (Registry now handles actual lifecycle triggers).");
}

