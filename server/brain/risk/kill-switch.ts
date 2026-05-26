
import { eventBus } from '../../events/event-bus/Bus';
import { NexusEvent } from '../../events/event-bus/Registry';
import { marketState } from '../../state/state';

/**
 * GLOBAL KILL SWITCH
 * 
 * Immediate cessation of all autonomous activity.
 */

export function triggerGlobalKillSwitch(reason: string, correlationId?: string, causationId?: string) {
  console.log(`[KILL_SWITCH] TRIGGERED: ${reason}`);
  
  eventBus.dispatch(NexusEvent.STATE_TRANSITION, { 
    from: marketState.systemStatus, 
    to: 'HALTED', 
    reason,
    cooldownExpiry: null
  }, 'KILL_SWITCH', correlationId, causationId);

  eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { 
    message: `GLOBAL_HALT_ACTIVATED: ${reason}`, 
    level: "CRITICAL" 
  }, 'KILL_SWITCH', correlationId, causationId);
}

export function resetKillSwitch() {
  if (marketState.quantumInstability < 0.7) {
    eventBus.dispatch(NexusEvent.STATE_TRANSITION, { 
      from: 'HALTED', 
      to: 'NOMINAL' 
    }, 'KILL_SWITCH');
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "GLOBAL_HALT_LIFTED", level: "INFO" });
  }
}
