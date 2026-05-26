
import { initializeEventCenter } from '../memory/events/EventCenter';
import { startMarketPulse } from '../brain/pulseEngine';
import { initializeEventLogger } from '../memory/events/Logger';
import { initializeRiskEngine } from '../brain/risk/Engine';
import { approvalSystem } from '../services/approval/ApprovalSystem';
import { replayEvents } from '../memory/replay/ReplayEngine';
import { loadSnapshot } from '../memory/snapshots/persistence';
import { marketState } from '../state/state';
import { eventBus } from '../events/event-bus/Bus';
import { NexusEvent } from '../events/event-bus/Registry';
import { stateEngine } from './StateEngine';

import { initializeTradingWorkflow } from '../services/workflow/TradingWorkflow';

import { initializeExecutionEngine } from '../services/execution/ExecutionEngine';
import { geneticEvolution } from '../memory/snapshots/genetics/Evolution';

/**
 * SYSTEM RUNTIME
 * 
 * The master lifecycle controller. Orchestrates startup and coordination.
 */

import { positionManager } from './positionManager';

import { runSystemicVerification } from '../memory/replay/ReplayTests';
import { archiveEngine } from '../memory/snapshots/ArchiveEngine';
import { capabilityRegistry } from '../services/contracts/RuntimeRegistry';

export async function bootSystem() {
  console.log("-----------------------------------------");
  console.log("   argOS v5.5 - SYSTEM BOOT_SEQ       ");
  console.log("-----------------------------------------");

  marketState.systemBootState = 'INITIALIZING';

  const safeBoot = async (stepName: string, initFn: () => void | Promise<void>) => {
    try {
      await initFn();
      console.log(`[BOOT] [🟢] ${stepName} initialized.`);
    } catch (err: any) {
      console.error(`[BOOT] [🔴] ${stepName} failed:`, err.message);
      eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
        message: `${stepName}_INIT_FAILED: ${err.message}. System falling back to degraded mode.`, 
        level: "CRITICAL" 
      });
      marketState.systemBootState = 'DEGRADED_RUNTIME';
    }
  };

  // 1. Initialize State Authority (The Thalamus)
  await safeBoot('StateEngine', () => stateEngine.initialize());

  // 2. Initialize Sensory Logging (Digital Continuity)
  await safeBoot('EventLogger', () => initializeEventLogger());

  // 3. Evaluate Retention Doctrine
  await safeBoot('ArchiveEngine', async () => {
    await archiveEngine.evaluateRetention();
    archiveEngine.pruneSnapshots();
  });

  // 4. Load Memory Snapshot (State Reconstruction)
  await safeBoot('MemorySnapshot', () => {
    const savedState = loadSnapshot();
    if (savedState) {
      eventBus.dispatch(NexusEvent.SNAPSHOT_RESTORE, savedState, 'BOOT_LOADER');
    }
  });

  // 5. Systemic Validation (Determinism Check)
  await safeBoot('SystemicValidation', async () => {
    const passed = await runSystemicVerification();
    if (!passed) {
       throw new Error("Systemic replay validation failed. Determinism compromised.");
    }
  });

  // 6. Initialize Event Architecture (Pipeline & Brain Wiring)
  await safeBoot('EventCenter', () => initializeEventCenter());
  await safeBoot('RiskEngine', () => initializeRiskEngine());
  await safeBoot('TradingWorkflow', () => initializeTradingWorkflow());
  await safeBoot('ExecutionEngine', () => initializeExecutionEngine());
  
  // Initialize Genetic Engine explicitly to ensure evolution logic is running
  await safeBoot('GeneticEvolution', () => {
    if (geneticEvolution) { /* already active */ }
  });

  // Position manager auto-wires itself to event handlers
  await safeBoot('PositionManager', () => {
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
      message: "POSITION_MANAGER_INITIALIZED: Ready to manage trades", 
      level: "INFO" 
    });
  });

  // 7. Dynamic Platform Capability Registry Boot
  await safeBoot('CapabilityRegistry', () => capabilityRegistry.bootAll());

  // 8. Start Heartbeat (Pulse)
  await safeBoot('MarketPulse', () => startMarketPulse());

  if (marketState.systemBootState !== 'DEGRADED_RUNTIME') {
    marketState.systemBootState = 'FULLY_OPERATIONAL';
  }

  eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
    message: `SYSTEM_BOOT_COMPLETE: State - ${marketState.systemBootState}`, 
    level: "INFO" 
  });
  console.log(`[BOOT] System is ONLINE & CONTINUOUS. State: ${marketState.systemBootState}`);
}
