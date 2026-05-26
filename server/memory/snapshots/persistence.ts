import fs from "fs";
import path from "path";
import { marketState } from "../../state/state";
import { eventBus } from "../../events/event-bus/Bus";
import { positionManager } from "../../runtime/positionManager";

const LOGS_DIR = path.join(process.cwd(), "logs");
const CURRENT_SNAPSHOT = path.join(LOGS_DIR, "snapshot_current.json");
const KNOWN_GOOD_SNAPSHOT = path.join(LOGS_DIR, "snapshot_known_good.json");

function ensureDirectory() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

export function loadSnapshot(): any {
  ensureDirectory();
  try {
    if (fs.existsSync(CURRENT_SNAPSHOT)) {
      const data = fs.readFileSync(CURRENT_SNAPSHOT, "utf-8");
      const snap = JSON.parse(data);
      console.log("[PERSISTENCE] [🟢] Current state snapshot loaded successfully.");
      return snap;
    }
  } catch (err: any) {
    console.error(`[PERSISTENCE] [🔴] Failed to load current snapshot: ${err.message}. Attempting known good load.`);
    return loadLastKnownGood();
  }
  return null;
}

export function saveSnapshot(isNominal: boolean) {
  ensureDirectory();
  try {
    const timestamp = Date.now();
    const lastSequenceId = (eventBus as any).getSequenceId ? (eventBus as any).getSequenceId() : 0;
    const snapData = {
      timestamp,
      lastSequenceId,
      state: { ...marketState },
      positionManagerState: positionManager.saveState(),
      isNominal
    };

    const serialized = JSON.stringify(snapData, null, 2);
    fs.writeFileSync(CURRENT_SNAPSHOT, serialized, "utf-8");

    if (isNominal) {
      fs.writeFileSync(KNOWN_GOOD_SNAPSHOT, serialized, "utf-8");
      // Also write versioned historical snapshot for the prune window
      const versionedPath = path.join(LOGS_DIR, `snapshot_${timestamp}.json`);
      fs.writeFileSync(versionedPath, serialized, "utf-8");
      console.log(`[PERSISTENCE] [🟢] Nominal state snapshot versioned & saved: snapshot_${timestamp}.json`);
    } else {
      console.log("[PERSISTENCE] [🟡] State snapshot saved (Degraded/Non-nominal system state).");
    }
  } catch (err: any) {
    console.error("[PERSISTENCE] [🔴] Failed to save snapshot:", err.message);
  }
}

export function loadLastKnownGood(): any {
  ensureDirectory();
  try {
    if (fs.existsSync(KNOWN_GOOD_SNAPSHOT)) {
      const data = fs.readFileSync(KNOWN_GOOD_SNAPSHOT, "utf-8");
      const snap = JSON.parse(data);
      console.log("[PERSISTENCE] [🟢] Last known good state snapshot loaded successfully.");
      return snap;
    }
  } catch (err: any) {
    console.error("[PERSISTENCE] [🔴] Failed to load last known good snapshot:", err.message);
  }
  return null;
}
