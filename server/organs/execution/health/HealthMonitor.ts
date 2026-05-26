import { eventBus } from "../../../nervous-system/event-bus/Bus";
import { NexusEvent } from "../../../nervous-system/event-bus/Registry";
import { replayContext } from "../../../anatomy/ReplayContext";

/**
 * HEALTH MONITOR (The Organism's Metabolism Checker)
 * 
 * Responsible for verifying the internal metabolic health of the system.
 * Tracks heartbeat stability, event throughput, and mutation integrity.
 */
class HealthMonitor {
  private lastHeartbeat: number = Date.now();
  private maxHeartbeatDelay: number = 30000; // 30 seconds
  private missedBeats: number = 0;
  
  private monitorInterval: NodeJS.Timeout | null = null;
  private totalEventsProcessed = 0;
  private lastEventCount = 0;

  // Empirical Health Metrics
  private subsystemScores = {
    brain: 100,
    organs: 100,
    nervous: 100
  };
  private mutationViolations = 0;
  private replayLatencyMs = 0;
  private movingAverageRate = 0; // Average events per 10s

  constructor() {
    this.startWatchdog();
    this.wireSenses();
  }

  private wireSenses() {
    eventBus.on(NexusEvent.PULSE_TICK, () => {
      if (replayContext.active) return;
      this.lastHeartbeat = Date.now();
      if (this.missedBeats > 0) {
        console.log("[HEALTH] Heartbeat stabilized.");
        eventBus.dispatch(NexusEvent.HEARTBEAT_RESUMED, {}, 'HEALTH_MONITOR');
        this.missedBeats = 0;
        // Logarithmic self-healing upon resurrection
        this.recoverSubsystem('nervous', 15);
      }
    });

    eventBus.on(NexusEvent.REPLAY_STARTED, () => {
      this.replayLatencyMs = Date.now();
    });

    eventBus.on(NexusEvent.REPLAY_COMPLETED, (payload) => {
      this.replayLatencyMs = Date.now() - this.replayLatencyMs;
      console.log(`[HEALTH] Replay Latency: ${this.replayLatencyMs}ms`);

      // Mathematically check replay performance (target < 5ms per event)
      const eventCount = payload?.data?.count || 1;
      const msPerEvent = this.replayLatencyMs / eventCount;
      if (msPerEvent > 12) {
        // Degrade slightly for performance lags
        const lagDeduction = Math.min(25, Math.floor((msPerEvent - 12) * 2));
        this.degradeSubsystem('brain', lagDeduction);
        console.warn(`[HEALTH] Elevated replay latency detected: ${msPerEvent.toFixed(2)}ms/event. Deducted ${lagDeduction} from Brain.`);
      } else {
        this.recoverSubsystem('brain', 10);
      }
    });

    eventBus.on(NexusEvent.FATAL_FAILURE, (payload) => {
      this.degradeSubsystem(payload.source || 'default', 45);
    });

    eventBus.on(NexusEvent.RECOVERABLE_FAILURE, (payload) => {
      this.degradeSubsystem(payload.source || 'default', 15);
    });

    eventBus.on(NexusEvent.SYSTEM_ALERT, (payload) => {
      // Monitor systemic alerts for state validation divergence issues
      if (payload?.data?.message?.includes("DIVERGENT") || payload?.data?.message?.includes("CRASHED")) {
        this.mutationViolations++;
        // Major blow to brain scores for replication failures
        this.degradeSubsystem('brain', 35);
      }
    });

    eventBus.on('*', () => {
      if (replayContext.active) return;
      this.totalEventsProcessed++;
    });
  }

  private degradeSubsystem(subsystem: string, impact: number) {
     if (subsystem.includes('brain') || subsystem.includes('risk') || subsystem.includes('VERIFICATION')) {
       this.subsystemScores.brain = Math.max(0, this.subsystemScores.brain - impact);
     } else if (subsystem.includes('execution') || subsystem.includes('kraken')) {
       this.subsystemScores.organs = Math.max(0, this.subsystemScores.organs - impact);
     } else {
       this.subsystemScores.nervous = Math.max(0, this.subsystemScores.nervous - impact);
     }
  }

  private recoverSubsystem(category: 'brain' | 'organs' | 'nervous', amount: number) {
      this.subsystemScores[category] = Math.min(100, this.subsystemScores[category] + amount);
  }

  private startWatchdog() {
    this.monitorInterval = setInterval(() => {
        if (replayContext.active) return;

        this.checkHeartbeat();
        this.checkThroughput();
        this.assessOverallHealth();
    }, 10000); // Check every 10 seconds
  }

  private assessOverallHealth() {
    const avgScore = (this.subsystemScores.brain + this.subsystemScores.organs + this.subsystemScores.nervous) / 3;
    if (avgScore < 50) {
       console.warn("[HEALTH] Organism critically degraded. Emitting degraded diagnostics.");
       eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "ORGANISM_HEALTH_CRITICAL: Initiating safety protocols.", level: "CRITICAL" });
    }
  }

  private checkHeartbeat() {
    const delay = Date.now() - this.lastHeartbeat;
    if (delay > this.maxHeartbeatDelay) {
        this.missedBeats++;
        
        // Jitter deduction is mathematically continuous based on excess stall time
        const excessFactor = delay / this.maxHeartbeatDelay;
        const jitterDeduction = Math.min(50, Math.floor(10 * excessFactor));
        
        this.degradeSubsystem('nervous', jitterDeduction);
        console.warn(`[HEALTH_MONITOR] STALLED HEARTBEAT DETECTED. delayed by ${delay}ms. Missed beats: ${this.missedBeats}. Deducting ${jitterDeduction}.`);
        
        eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
            message: `CRITICAL: HEARTBEAT_STALLED for ${delay}ms. Missed beats: ${this.missedBeats}`, 
            level: 'WARNING' 
        }, 'HEALTH_MONITOR');
        
        eventBus.dispatch(NexusEvent.HEARTBEAT_STALLED, { delay, missedBeats: this.missedBeats }, 'HEALTH_MONITOR');
    } else {
      // Natural logarithmic recovery for nervous health in baseline periods
      this.recoverSubsystem('nervous', 2);
    }
  }

  private checkThroughput() {
     const delta = this.totalEventsProcessed - this.lastEventCount;
     this.lastEventCount = this.totalEventsProcessed;

     // Calculate moving average
     this.movingAverageRate = Math.floor((this.movingAverageRate * 0.7) + (delta * 0.3));

     if (delta === 0) {
         // Inactivity decays nervous score slightly
         this.degradeSubsystem('nervous', 3);
     } else {
         // Re-processing signals heals organs/nervous channels
         this.recoverSubsystem('nervous', 1);
         this.recoverSubsystem('organs', 1);
     }

     if (delta > 500) {
         console.warn(`[HEALTH_MONITOR] ELEVATED THROUGHPUT: ${delta} events in 10s. Threshold limits monitored.`);
     }
  }

  public getMetabolicStats() {
      return {
          lastHeartbeat: this.lastHeartbeat,
          missedBeats: this.missedBeats,
          totalEventsProcessed: this.totalEventsProcessed,
          uptime: process.uptime(),
          subsystemScores: this.subsystemScores,
          mutationViolations: this.mutationViolations,
          replayLatencyMs: this.replayLatencyMs,
          movingAverageRate: this.movingAverageRate,
          dryRunMode: process.env.DRY_RUN_MODE !== 'false',
          liveTradingEnabled: process.env.LIVE_TRADING_ENABLED === 'true'
      };
  }
}

export const healthMonitor = new HealthMonitor();
