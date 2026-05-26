import { eventBus } from "../events/event-bus/Bus";
import { NexusEvent } from "../events/event-bus/Registry";
import { CONFIG } from "../memory/snapshots/genetics/config";

let pulseTimer: NodeJS.Timeout | null = null;
let pulseCount = 0;

export function startMarketPulse() {
  if (pulseTimer) return;
  console.log("[PULSE] Heartbeat started");
  pulseTimer = setInterval(() => {
    pulseCount++;
    eventBus.dispatch(NexusEvent.PULSE_TICK, { pulseCount }, 'PULSE_ENGINE');
  }, CONFIG.PULSE_INTERVAL);
}

export function stopMarketPulse() {
  if (pulseTimer) {
    clearInterval(pulseTimer);
    pulseTimer = null;
    console.log("[PULSE] Heartbeat stopped");
  }
}
