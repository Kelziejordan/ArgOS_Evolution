# ArgOS Platform (v1.0.0-Evolved-v6.2)
## Sovereign Platform Architecture & Governance Rules

This document outlines the invariants and expansion points of the ArgOS architecture. Every child branch, project integration, or domain-specific module must inherit, conform to, and respect these parameters.

---

## 1. Ground Truth Invariants (The Frozen Spine)

These structures and behaviors are **constitutionally frozen** under and across all branches. They are stored in `/server/` (shared layer) and must never be altered or modified by downstream features.

### 1.1 Hardened Event Causation Chains
All asynchronous processes, actions, and orders must carry explicit tracing metadata to ensure trace lineage and sequence stability:
```typescript
interface OperationalEvent {
  id: string;            // Unique UUID or sequence representation
  correlationId: string; // The root cause command or external pulse trigger
  causationId: string;   // The direct parent event id that triggered this action
  sequenceId: number;    // Monotonically increasing order ID on the event-bus
  timestamp: number;     // Milliseconds since epoch
}
```
Any event injected without tracing context or sequence integrity will fail system ingestion.

### 1.2 State Persistence & Snapshot Formatting
State snapshots are managed via append-only logs in `/logs/` and synced via Firestore persistence rules. The model defines consistent recovery keys:
- `timestamp`: Record snapshot date.
- `lastSequenceId`: Last processed event sequence index.
- `state`: Exact clone of the `marketState` anatomy structure.
- `positionManagerState`: The serialized key metrics of running positions (`positions`, `portfolioHistory`, `equity`, `maxEquity`, `closedPnL`, `totalTrades`, `wins`).

Downstream engines may add variables to the state payload but **must not remove or rename** any of these baseline continuity metrics.

### 1.3 EventBus Priority Routing & Hardening
The `/server/nervous-system/event-bus/Bus.ts` handles traffic using a priority queue structure, ensuring critical telemetry outranks passive monitoring:
- **Priority 0 (CRITICAL)**: System events, Fail-safe commands, Kill switches, Database sync.
- **Priority 1 (OPERATIONAL)**: Order placements, Execution flows, Position checks.
- **Priority 2 (TELEMETRY)**: UI feeds, Sentiment updates, Log archiving.

Adaptive rate limiting is built into the bus to guard against Event Storms.

### 1.4 Health Monitor Metabolic Metrics
The health score and throughput tracking inside `/server/organs/execution/health/HealthMonitor.ts` must maintain continuous audit of:
- `heartbeat`: Constant execution pulses.
- `replayLatency`: Time to re-hydrate state from logs.
- `throughput`: Operations per second.
- `mutationViolations`: Unauthorized state changes outside the Event Bus.
- `stalledStates`: Flags if subsystems freeze.

---

## 2. Platform Expansion Points (Downstream Utilization)

To prevent code bloating and avoid compromising the foundation, the following zones are designated as modular, localized expansion layers.

### 2.1 Brain Logic & Analysis
Downstream projects customize intelligence without altering state authority:
- Custom strategy models must target standard signals on `/server/brain/*.ts`.
- Adaptive metrics can be tuned inside `adaptiveSignalGenerator.ts` using external signals (RSI, Bollinger, orderbook imbalances in `GlobalLiquidity.tsx`).

### 2.2 Operational Workflows & Automated Tasks
Workflows operate as decoupled event listeners subscribing to state updates:
- Creating trade flows or automated field processes is done by registering hooks on the `eventBus` inside `/server/organs/workflow/`.
- **Rule**: Workflows have execution capability but **no structural database or state mutation authority**; they utilize signal protocols.

### 2.3 Visual Telemetry & User Dashboard Sheets
Dashboard screens reside in `/src/components/telemetry/` using independent states and clean layouts:
- Components must query backend endpoints cleanly via `/api/` (e.g., `/api/market-pulse`, `/api/portfolio`, `/api/events`).
- **Rule**: UI components must use zero-dependency rendering or standard libraries (`lucide-react`, standard SVGs) to avoid library bloating.

---

## 3. Directory Layout Blueprint

The system partition is structured as follows:

```
ArgOS-Evolved-v6.2/
├── core/
│   ├── charter/                     # Immutable constitutional rules (MASTER_CHARTER.md)
│   ├── governance/                  # Rigid design specifications (PLATFORM_ARCHITECTURE.md)
│   ├── protocols/                   # Domain specific extension agreements (e.g. kraken, gemini)
│   └── base-runtime/                # Frozen runtime spinal logic
├── trading-engine/
│   ├── strategies/                  # Domain signal generation models & brain strategies
│   ├── connectors/                  # API integrations (Kraken, CoinMarketCap, etc.)
│   ├── logs/                        # Historical trades, audits, and performance records
│   └── configs/                     # Strategy parameter configurations
├── runtime-loop/
│   ├── memory/                      # Snapshot recovery, append-only logs, event ledgers
│   ├── execution/                   # Full execution engines (simulated, live, paper)
│   └── automation/                  # Loop schedulers and system ticking mechanisms
├── system-engine/
│   ├── evolution/                   # Genetic hyperparameter loops
│   ├── mutation/                    # Sandbox mutation frameworks
│   └── adaptation/                  # Probability recalculation models
└── experiments/                     # Area reserved for safe prototyping
```
