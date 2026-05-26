# ArgOS Platform Abstraction & Integration Layer
## Constitutional Contract Specification (v1.0.0-FINAL)

This specification defines the universal interface contracts, framework-neutral integration models, ownership lifecycles, and verification standards that enable ArgOS to scale, mutate, and assimilate any stack, workflow, or architecture.

---

## 1. Unified Service Contract Layover

To prevent direct coupling and allow any external API, background job, heavy-duty worker, or UI module to plug in, all extensions must implement the standard `IArgOSCapability` lifecycle contract.

### 1.1 The Lifecycle Interface Contract

Every platform capability is treated as a state-machine that responds to standardized lifecycle events:

```typescript
export enum CapabilityState {
  UNINITIALIZED = 'UNINITIALIZED',
  INITIALIZING = 'INITIALIZING',
  SUSPENDED = 'SUSPENDED',
  ACTIVE = 'ACTIVE',
  DEGRADED = 'DEGRADED',
  TERMINATED = 'TERMINATED'
}

export interface CapabilityMetadata {
  id: string;                 // e.g. "kraken-direct-execution"
  name: string;               // Human-readable label
  version: string;            // Semantic versioning string
  owner: string;              // Owner group identifier (e.g. "TRADING_ENGINE")
  category: 'api' | 'worker' | 'job' | 'ui-module' | 'external-tool';
  dependencies: string[];     // IDs of dependencies that must initialize first
}

export interface CapabilityHealth {
  state: CapabilityState;
  score: number;              // 0 to 100 metabolic score
  uptimeMs: number;
  lastPulseTime: number;
  stalled: boolean;
  diagnostics?: Record<string, any>;
}

export interface IArgOSCapability {
  readonly metadata: CapabilityMetadata;
  getHealth(): CapabilityHealth;
  
  // Lifecycle Handlers
  initialize(context: IPlatformContext): Promise<void>;
  activate(): Promise<void>;
  suspend(reason: string): Promise<void>;
  terminate(): Promise<void>;
}
```

### 1.2 Core Integration Channels

Each subclass fits into one of the 5 standardized operational models:

#### A. API Bridge (Decoupled External Networks)
- Must not run blocking event loops.
- Requests pass through typed request-reply adapters to insulate against downstream payload mutation.
- Example: REST adapters translating into localized `NexusEvent` streams.

#### B. Schedulable Jobs (Decoupled Logic / CRON-equivalent)
- Scheduled run-loops that complete in bounded timeframes.
- Must execute independently without persistent in-memory locks.

#### C. Dedicated Workers (Asynchronous Tasks / Processing Core)
- Block-isolated threads or loops (e.g., streaming exchange sockets, signal generation loops).
- Governed by state persistence protocols.

#### D. Dynamic UI Modules (Aesthetic Presentation Units)
- Framework-neutral render structures.
- Frame-permissions are isolated; can be ported from React components into Svelte, Vanilla Web Components, CLI structures, or native mobile layouts.

#### E. External Tools (Dynamic Run-Time Utilities)
- Integrations of third-party command tools safely bridged with sandboxed permission constraints.

---

## 2. Framework-Neutral UI & Frontend Integration Rules

ArgOS does not prioritize React; it treats React as a single transient window choice. To remain stack-agnostic, the frontend layers are abstracted from the core event-processing loop.

### 2.1 The Unified UI Bridge Model

All frontend systems communicate with ArgOS through a uniform bridge layer:
1. **JSON-RPC or WebSocket Event Pipeline**: UI components never query databases or access deep workspace files directly. Instead, they interact with the static `/api/*` proxies and send standard payloads:
   ```json
   {
     "jsonrpc": "2.0",
     "method": "system/emit_command",
     "params": {
       "command": "ROLLBACK",
       "args": {}
     },
     "id": 123
   }
   ```
2. **Generic Context Providers**: React-specific contexts like `SystemProvider` are lightweight wrappers over standard browser-native custom event channels:
   `window.dispatchEvent(new CustomEvent('argos:telemetry', { detail: payload }))`
3. **Vanilla Portability standard**: Every page layout must remain clean, modular, and composed of reusable stateful slices. This guarantees the entire visual console can be ported to static HTML/JS, a terminal TUI, or a native Android Compose workspace under the exact same API.

---

## 3. Capability Ownership, Registry, & Lifecycle States

This platform uses an active **CapabilityRegistry** to control lifecycle state-flow under explicit security checks.

```
+--------------------+        initialize()        +--------------------+
|   UNINITIALIZED    | -------------------------> |    INITIALIZING    |
+--------------------+                            +--------------------+
                                                            |
                                                            | (Passed Deps Check)
                                                            v
+--------------------+         suspend()          +--------------------+
|     SUSPENDED      | <------------------------- |       ACTIVE       |
+--------------------+ -------------------------> +--------------------+
                            activate()                      |
                                                            | (Error/Degradation)
                                                            v
+--------------------+                            +--------------------+
|     TERMINATED     | <------------------------- |      DEGRADED      |
+--------------------+         terminate()        +--------------------+
```

- **Ownership Constraint**: Every registered cap must list a defining domain (e.g., `trading-engine`, `system-engine`, `runtime-loop`).
- **Autonomy Gating**: Caps with `HIGH` or `CRITICAL` risk scopes are barred from triggering state-transitions without going through the central `ApprovalSystem` hook check.

---

## 4. Architectural Upgrade Paths & Capability On-Ramping

To expand the platform with any new database (e.g., Spanner, Cloud SQL), queuing network (RabbitMQ, PubSub), or custom LLM API without altering the core skeleton:

### 4.1 Steps for Safe Capability Integration
1. **Define the Metadata**: Declare model boundaries, dependencies, and risk scope in a JSON configuration block.
2. **Implement `IArgOSCapability`**: Write the class conforming to the contract.
3. **Register Extension**: Add the initialization hook to `bootstrap.ts` inside the standard startup cascade (`safeBoot` loop).
4. **Subscribe through EventBus**: Interface with other modules strictly via `NexusEvent` publishers/consumers.

### 4.2 Decoupled API Adaptation Pattern

No third-party SDK is allowed to initialize at module-load level. Everything resolves through **Lazy Initialization** patterns, checked continuously inside the capability workflow:

```typescript
export class SecureServiceBridge implements IArgOSCapability {
  private client: any = null;
  // ... conformance logic
  
  async activate() {
    if (!process.env.THIRD_PARTY_SECRET) {
      throw new Error("Activation failed: Missing mandatory environment secret");
    }
    this.client = new SafeSDKClient({ secret: process.env.THIRD_PARTY_SECRET });
  }
}
```

---

## 5. Non-Intrusive Monitoring, Health & Validation

Proof-of-health ensures high expandability without losing stability or integrity.

### 5.1 Metabolic Scoring Rules (Continuous Audit)
Every registered capability must expose its runtime metrics to the `HealthMonitor`. The monitor applies weighting filters block-by-block:
1. **Network Jitter Penalty**: If an API bridge times out 3 times in a row, score decays down to `DEGRADED`.
2. **Memory Leak Protection**: Active tracking checks if throughput drops proportional to high garbage collection latency.
3. **Loop Stalling Checks**: Background workers must emit continuous heartbeat signals. Any gap greater than 10 seconds flags `stalled = true`.

### 5.2 Verification Checklist for Automated Sandboxing
- [ ] Contract compliance: Implements all methods of `IArgOSCapability`.
- [ ] Dependency alignment: Guaranteed to initialize *only* after standard dependencies listed.
- [ ] Crash immunity: Internally catches block level exceptions to prevent overall server crash-looping.
- [ ] Fail-safe rollback: Supports clear state transition into `TERMINATED` during system rollback procedures.
- [ ] Environment separation: Runs exclusively simulated mocks in DEV/STAGING modes.
