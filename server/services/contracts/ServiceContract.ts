/**
 * PROVEN SERVICE CONTRACT LAYER (Unified Abstractions)
 * 
 * Defines standard lifecycle states, metadata constraints, and metabolic health reporting
 * structures to make ArgOS stack-agnostic and robust under any service paradigm.
 */

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
  dependencies: string[];     // IDs of other capabilities that must initialize first
}

export interface CapabilityHealth {
  state: CapabilityState;
  score: number;              // 0 to 100 metabolic health rating
  uptimeMs: number;
  lastPulseTime: number;
  stalled: boolean;
  diagnostics?: Record<string, any>;
}

export interface IPlatformContext {
  environment: string;
  dispatchLocalEvent(event: string, payload: any): void;
  getSecret(key: string): string | undefined;
}

export interface IArgOSCapability {
  readonly metadata: CapabilityMetadata;
  getHealth(): CapabilityHealth;
  
  // Decoupled Lifecycle Triggers
  initialize(context: IPlatformContext): Promise<void>;
  activate(): Promise<void>;
  suspend(reason: string): Promise<void>;
  terminate(): Promise<void>;
}
