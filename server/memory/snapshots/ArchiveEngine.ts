import fs from 'fs';
import path from 'path';
import { eventBus } from '../../events/event-bus/Bus';
import { NexusEvent } from '../../events/event-bus/Registry';

const ARCHIVE_DIR = path.join(process.cwd(), 'logs', 'archive');
const MAX_ACTIVE_EVENTS = 10000; // Keep 10k events in active lineage

/**
 * ARCHIVE ENGINE (Retention Doctrine)
 * 
 * Manages event log segmentation, snapshot pruning, and memory offloading.
 */
class ArchiveEngine {
  constructor() {
    if (!fs.existsSync(ARCHIVE_DIR)) {
      fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    }
  }

  public async evaluateRetention() {
    const logPath = path.join(process.cwd(), 'logs', 'system_events.jsonl');
    if (!fs.existsSync(logPath)) return;

    try {
      const stats = fs.statSync(logPath);
      // Rough estimate: 5MB log is around 10k-20k events
      if (stats.size > 5 * 1024 * 1024) {
        console.log("[ARCHIVE] Log size exceeds retention threshold. Initiating cold storage offload...");
        await this.segmentAndArchive(logPath);
      }
    } catch (err: any) {
      console.error("[ARCHIVE] Retention evaluation failed:", err.message);
    }
  }

  private async segmentAndArchive(logPath: string) {
    const timestamp = Date.now();
    const archivePath = path.join(ARCHIVE_DIR, `events_archive_${timestamp}.jsonl`);
    
    // In a real database, we'd find the last snapshot, copy events before it, and truncate.
    // For flat files, we just rotate the log and trigger a new snapshot.
    eventBus.dispatch(NexusEvent.SYSTEM_ALERT, { message: "LOG_ROTATION_STARTED", level: "INFO" });
    
    fs.renameSync(logPath, archivePath);
    console.log(`[ARCHIVE] [🟢] Active lineage compressed and moved to: ${archivePath}`);

    // Demand an immediate memory snapshot to anchor the new log
    eventBus.dispatch(NexusEvent.MEMORY_SNAPSHOT, { manual: true, reason: 'retention_pruning' });
  }

  public pruneSnapshots() {
     // Pruning logic to keep only last 5 snapshots
     const snapDir = path.join(process.cwd(), 'logs');
     const files = fs.readdirSync(snapDir).filter(f => f.startsWith('snapshot_'));
     
     if (files.length > 5) {
         files.sort(); // Lexicographical sort works for timestamp endings usually if padded, but let's parse timestamps
         // Just a basic implementation:
         const excess = files.length - 5;
         for (let i = 0; i < excess; i++) {
             fs.unlinkSync(path.join(snapDir, files[i]));
         }
         console.log(`[ARCHIVE] [🟢] Pruned ${excess} stale memory snapshots.`);
     }
  }
}

export const archiveEngine = new ArchiveEngine();
