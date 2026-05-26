
import fs from 'fs';
import path from 'path';
import { NexusEvent, NexusEventPayload } from '../../events/event-bus/Registry';
import { stateEngine } from '../../runtime/StateEngine';
import { replayContext } from '../../anatomy/ReplayContext';
import { eventBus } from '../../events/event-bus/Bus';
import { loadSnapshot } from '../snapshots/persistence';

/**
 * EVENT REPLAY ENGINE (Digital Continuity)
 * 
 * Reconstructs the system state by replaying persistent event logs.
 * Supports Snapshot-Anchored Checkpointing to avoid scanning large logs.
 */

const EVENT_LOG = path.join(process.cwd(), 'logs', 'system_events.jsonl');

export async function replayEvents(ignoreCheckpoint: boolean = false) {
  console.log(`[MEMORY] Starting Event Replay (ignoreCheckpoint=${ignoreCheckpoint})...`);
  
  try {
    replayContext.active = true;
    eventBus.dispatch(NexusEvent.REPLAY_STARTED, {}, 'REPLAY_ENGINE');

    let startSequenceId = -1;
    let replayedCount = 0;
    let maxSequence = 0;

    // Load baseline snapshot if checkpointing is enabled
    if (!ignoreCheckpoint) {
      const snapshotObj = loadSnapshot();
      if (snapshotObj && snapshotObj.state) {
        startSequenceId = snapshotObj.lastSequenceId ?? -1;
        maxSequence = startSequenceId;
        console.log(`[MEMORY] [🟢] Checkpoint anchor loaded. Bootstrapping baseline state at seq pointer ${startSequenceId}.`);
        
        stateEngine.processEvent({
          type: NexusEvent.SNAPSHOT_RESTORE,
          data: { state: snapshotObj.state }
        });
      }
    }

    if (!fs.existsSync(EVENT_LOG)) {
      console.log("[MEMORY] No event log found. Starting fresh/baseline.");
      eventBus.setSequencePointer(maxSequence);
      eventBus.dispatch(NexusEvent.REPLAY_COMPLETED, { count: 0, maxSequence }, 'REPLAY_ENGINE');
      return;
    }

    const data = fs.readFileSync(EVENT_LOG, 'utf-8');
    const lines = data.trim().split('\n');
    let expectedSequence = startSequenceId !== -1 ? startSequenceId + 1 : -1;

    for (const line of lines) {
      if (!line) continue;
      const event: NexusEventPayload = JSON.parse(line);
      
      // Temporal Integrity Check
      const seq = event.sequenceId;
      if (seq !== undefined) {
         // Skip events already consolidated into the snapshot baseline
         if (seq <= startSequenceId) {
           continue;
         }

         if (expectedSequence !== -1 && seq !== expectedSequence) {
             console.warn(`[REPLAY] CORRUPTION DETECTED: Expected sequence ${expectedSequence}, got ${seq}. Proceeding with caution.`);
         }
         
         expectedSequence = seq + 1;
         if (seq > maxSequence) maxSequence = seq;
      }

      stateEngine.processEvent(event);
      replayedCount++;
    }
    
    eventBus.setSequencePointer(maxSequence);

    eventBus.dispatch(NexusEvent.REPLAY_COMPLETED, { count: replayedCount, maxSequence }, 'REPLAY_ENGINE');
    console.log(`[MEMORY] Replay complete. ${replayedCount} delta events integrated (current sequence pointer: ${maxSequence}).`);
  } catch (e: any) {
    console.error("[MEMORY] Replay failed:", e.message);
  } finally {
    replayContext.active = false;
  }
}
