
import EventEmitter from 'eventemitter3';
import { NexusEvent, NexusEventPayload } from './Registry';

/**
 * HARDENED EVENT BUS (The Spinal Cord)
 * 
 * Central routing for all organism communications.
 * Includes correlation IDs for tracking event chains across subsystems.
 */

class EventBus extends EventEmitter {
  private static instance: EventBus;
  private currentSequenceId = 0;
  
  // Temporal Hardening: Queue and Priorities
  private isProcessingQueue = false;
  private queue: NexusEventPayload[] = [];
  
  private constructor() {
    super();
  }

  public setSequencePointer(seq: number) {
    if (seq > this.currentSequenceId) {
       this.currentSequenceId = seq;
    }
  }

  public getSequenceId(): number {
    return this.currentSequenceId;
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  private getEventPriority(type: NexusEvent): number {
    switch(type) {
      case NexusEvent.SYSTEM_ALERT:
      case NexusEvent.FATAL_FAILURE:
      case NexusEvent.KILL_SWITCH_TRIGGERED:
      case NexusEvent.HEARTBEAT_STALLED:
        return 0; // Highest priority
      case NexusEvent.ORDER_PLACED:
      case NexusEvent.ORDER_EXECUTED:
      case NexusEvent.RISK_CHECK_FAILED:
      case NexusEvent.APPROVAL_REQUIRED:
        return 1; // High priority
      case NexusEvent.MARKET_UPDATED:
      case NexusEvent.MARKET_DATA_RECEIVED:
      case NexusEvent.SIGNAL_GENERATED:
        return 2; // Normal priority
      default:
        return 3; // Low priority
    }
  }

  /**
   * Dispatch a typed event with payload
   */
  public dispatch(type: NexusEvent, data: any, source: string = 'unknown', correlationId?: string, causationId?: string) {
    this.checkEventStorm();
    this.currentSequenceId++;

    const payload: NexusEventPayload = {
      eventId: Math.random().toString(36).substring(2, 11),
      sequenceId: this.currentSequenceId,
      timestamp: Date.now(),
      type,
      source,
      data,
      correlationId: correlationId || `corr_${Math.random().toString(36).substring(2, 7)}`,
      causationId: causationId,
      version: '1.2.0'
    };

    this.queue.push(payload);
    
    // Sort array by priority then sequence (stable temporal order)
    this.queue.sort((a, b) => {
      const pA = this.getEventPriority(a.type);
      const pB = this.getEventPriority(b.type);
      if (pA !== pB) return pA - pB;
      return a.sequenceId - b.sequenceId;
    });

    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  private processQueue() {
    this.isProcessingQueue = true;
    try {
      while (this.queue.length > 0) {
        // Shift retrieves the highest priority, oldest sequence event
        const nextEvent = this.queue.shift();
        if (nextEvent) {
          // Internal routing
          this.emit(nextEvent.type, nextEvent);
          
          // Also emit a generic 'any' event for global listeners like the Logger
          this.emit('*', nextEvent);
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // --- IMMUNE SYSTEM: EVENT STORM PROTECTION ---
  private eventCount = 0;
  private lastReset = Date.now();
  private readonly STORM_THRESHOLD = 200; // max events per second
  private stormAlerted = false;

  private checkEventStorm() {
    const now = Date.now();
    if (now - this.lastReset > 1000) {
      if (this.eventCount > this.STORM_THRESHOLD) {
        console.warn(`[EVENT_BUS] STORM_DETECTED: ${this.eventCount} events/sec`);
      }
      this.eventCount = 0;
      this.lastReset = now;
      this.stormAlerted = false;
    }

    this.eventCount++;

    if (this.eventCount > this.STORM_THRESHOLD && !this.stormAlerted) {
      this.stormAlerted = true;
      // Self-protection: dispatch alert directly if threshold exceeded
      // We use a internal emit to avoid infinite loops if the alert itself triggers more events
      this.currentSequenceId++;
      this.emit(NexusEvent.SYSTEM_ALERT, { 
        eventId: 'internal_storm', 
        sequenceId: this.currentSequenceId,
        timestamp: Date.now(), 
        type: NexusEvent.SYSTEM_ALERT, 
        source: 'EVENT_BUS', 
        data: { message: "CRITICAL: EVENT_STORM_DETECTED. RATE_LIMITING_COMMUNICATION.", level: "CRITICAL" },
        version: '1.2.0'
      });
    }
  }
}

export const eventBus = EventBus.getInstance();
