import { eventBus } from "../../nervous-system/event-bus/Bus";
import { NexusEvent } from "../../nervous-system/event-bus/Registry";

const queue: any[] = [];

export const approvalSystem = {
  getQueue() {
    return queue;
  },
  approve(signalId: string, correlationId?: string) {
    eventBus.dispatch(NexusEvent.APPROVAL_GRANTED, { type: 'SIGNAL_EXECUTION', signalId }, 'APPROVAL_SYSTEM', correlationId);
  },
  reject(signalId: string, correlationId?: string) {
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: `APPROVAL REJECTED for signal ${signalId}`, level: 'WARNING' }, 'APPROVAL_SYSTEM', correlationId);
  }
};
