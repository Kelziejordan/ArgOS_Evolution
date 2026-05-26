# ArgOS Evolved v6.2 System Map (Freeze Baseline)

This document is the official system map and architecture blueprint for the ArgOS v6.2 Parent Platform.

---

## 1. The Organized Core Structure (`/core`)

All core execution modules are frozen, secure, and separated from downstream trading extensions.

### 🧠 Analysis Center (`/server/brain`)
- **Adaptive Signal Generator**: `adaptiveSignalGenerator.ts` — Evaluates telemetry to render neural trade signals and dynamically recalculates win ratios.
- **Risk System**: `/server/brain/risk/` — Analyzes state changes to prevent trade lockup or toxic exposures.

### ⚡ Central Event System (`/server/events`)
- **Hardened Event Bus**: Central event routing via `/server/events/event-bus/Bus.ts`. Supports strict priorities, queue boundaries, and event storm protection.
- **System Event Registry**: Standard interfaces and types inside `/server/events/event-bus/Registry.ts`.

### 💾 Core Memory Layer (`/server/memory`)
- **Persistent Event Log**: Append-only local registry kept in `/logs/system_events.jsonl` for audit lineage.
- **Adaptive Genetics**: DNA configurations and evolution constraints in `/server/memory/snapshots/genetics/`.
- **State Snapshot Persistence**: Captured inside `/logs/snapshot_current.json` and synchronized with Firebase Firestore rules. Preserves drawdown, win rates, equity, and live states.
- **Temporal Event Replay**: Reconstruction of system state via `/server/memory/replay/ReplayEngine.ts`.

### 🚀 Boot & State Control (`/server/runtime`)
- **System Boot Loader**: `bootstrap.ts` — Governs safe 7-step startup with graceful degradation.
- **State Engine**: `StateEngine.ts` — Updates centralized real-time `marketState`.
- **Position Manager**: `positionManager.ts` — Controls portfolio state, tracks drawdown, and manages position closure workflows with full audit trails (`ORDER_PLACED` and `ORDER_EXECUTED` events).

---

## 2. Advanced Telemetry Dashboard (`/src/components/telemetry`)

The user dashboard remains operator-centric, responsive, and uses zero external dependency libraries:
- **Global Liquidity**: Real-time order book aggregate depth map.
- **Liquidation Map**: Up/downside leverage liquidation casualty corridors.
- **Order Flow**: Real-time ticker tracking whale buying vs. selling force.
- **Volatility index**: SVG realizable volatility Standard Deviation timelines.

---

## 3. Modular Folder Separation (Physical & Conceptual)

```
ArgOS-Evolved-v6.2/
├── core/
│   ├── charter/                     # MASTER_CHARTER.md (Operational constitution)
│   ├── governance/                  # PLATFORM_ARCHITECTURE.md (Rigid design rules)
│   ├── protocols/                   # Integration agreements (Kraken, Gemini)
│   └── base-runtime/                # Frozen runtime logic references
│── trading-engine/                  # All custom strategy triggers & live APIs
│── runtime-loop/                    # Core snap recovery & loop ticking
│── system-engine/                   # Genetics, evolution, & learning models
└── experiments/                     # Area for experimental mock strategies
```
