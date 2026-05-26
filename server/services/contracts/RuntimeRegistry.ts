import { IArgOSCapability, CapabilityState, CapabilityHealth, IPlatformContext } from "./ServiceContract";
import { eventBus } from "../../events/event-bus/Bus";
import { NexusEvent } from "../../events/event-bus/Registry";

/**
 * ARCHITECTURAL RUNTIME REGISTRY
 * 
 * Central registry managing capability modularity, dependency resolution loops,
 * and lifecycle propagation across the entire platform.
 */
class CapabilityRegistry {
  private capabilities = new Map<string, IArgOSCapability>();
  private context: IPlatformContext = {
    environment: process.env.NODE_ENV || 'development',
    dispatchLocalEvent: (event, payload) => {
      eventBus.dispatch(event as any, payload, 'RUNTIME_REGISTRY');
    },
    getSecret: (key) => process.env[key]
  };

  /**
   * Safe registration of a framework-neutral platform capability
   */
  public register(capability: IArgOSCapability): void {
    const id = capability.metadata.id;
    if (this.capabilities.has(id)) {
      console.warn(`[REGISTRY] Warn: Capability already registered: ${id}. Overwriting.`);
    }
    this.capabilities.set(id, capability);
    console.log(`[REGISTRY] Registered core capability: ${id} (${capability.metadata.name}) v${capability.metadata.version}`);
  }

  /**
   * Retrieves a capability on-demand
   */
  public get(id: string): IArgOSCapability | undefined {
    return this.capabilities.get(id);
  }

  /**
   * Returns a standard list of all registered capabilities
   */
  public list(): IArgOSCapability[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Initializes and boot-straps the entire configured platform tree
   */
  public async bootAll(): Promise<void> {
    console.log("[REGISTRY] Boot-sequencing capability dependency tree...");
    
    // Simple topological sorting for dependency resolution
    const resolvedIds = new Set<string>();
    const pending = new Set<string>(this.capabilities.keys());
    
    let stateChanged = true;
    while (pending.size > 0 && stateChanged) {
      stateChanged = false;
      
      for (const id of pending) {
        const cap = this.capabilities.get(id)!;
        const deps = cap.metadata.dependencies || [];
        
        // Check if all dependencies have been booted successfully
        const allDepsReady = deps.every(depId => resolvedIds.has(depId));
        if (allDepsReady) {
          try {
            console.log(`[REGISTRY] Booting sequence for: ${id}`);
            await cap.initialize(this.context);
            await cap.activate();
            resolvedIds.add(id);
            pending.delete(id);
            stateChanged = true;
            
            // Emit success telemetry
            eventBus.dispatch(NexusEvent.SYSTEM_ALERT, {
              message: `CAPABILITY_ONLINE: ${id} successfully initialized & activated.`,
              level: 'INFO'
            }, 'RUNTIME_REGISTRY');
          } catch (err: any) {
            console.error(`[REGISTRY] Failed to boot capability ${id}:`, err);
            await cap.suspend(`BOOT_FAILURE: ${err?.message || 'Unknown standard error'}`);
            // Do not resolve this ID to block downstream dependent capabilities
            pending.delete(id);
            stateChanged = true;
            
            eventBus.dispatch(NexusEvent.SYSTEM_ALERT, {
              message: `CAPABILITY_FAILED: Boot error on ${id}: ${err?.message || 'Unknown error'}`,
              level: 'ERROR'
            }, 'RUNTIME_REGISTRY');
          }
        }
      }
    }
    
    if (pending.size > 0) {
      const remainingDeps = Array.from(pending).map(id => `${id} (requires: ${this.capabilities.get(id)?.metadata.dependencies.join(', ')})`);
      console.warn("[REGISTRY] Unresolved or failed dependency branches detected:", remainingDeps);
      eventBus.dispatch(NexusEvent.SYSTEM_ALERT, {
        message: `DEPENDENCY_RESOLUTION_BLOCKED: Following capabilities could not boot: ${remainingDeps.join('; ')}`,
        level: 'WARNING'
      }, 'RUNTIME_REGISTRY');
    } else {
      console.log("[REGISTRY] All capabilities successfully resolved and operational.");
    }
  }

  /**
   * Clean shut down of all components to handle robust platform reset
   */
  public async terminateAll(): Promise<void> {
    console.log("[REGISTRY] Shutting down all capability structures...");
    const caps = Array.from(this.capabilities.values());
    for (const cap of caps) {
      try {
        await cap.terminate();
      } catch (err) {
        console.error(`[REGISTRY] Failed to clean terminate capability ${cap.metadata.id}:`, err);
      }
    }
    console.log("[REGISTRY] Capability registry fully evacuated.");
  }
}

export const capabilityRegistry = new CapabilityRegistry();
