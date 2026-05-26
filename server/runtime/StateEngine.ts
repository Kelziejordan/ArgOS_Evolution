import { eventBus } from "../events/event-bus/Bus";
import { NexusEvent } from "../events/event-bus/Registry";
import { marketState } from "../state/state";

// Initialize additional tracking arrays on the central state to prevent undefined reference errors in runtime
if (!marketState.positions) marketState.positions = [];
if (!marketState.pendingApprovals) marketState.pendingApprovals = [];
if (!marketState.signals) marketState.signals = [];
if (!marketState.systemBootState) marketState.systemBootState = 'UNKNOWN';

export const stateEngine = {
  initialize() {
    // Constitutional state mutation registration
    const eventsToGovern = [
      NexusEvent.MARKET_DATA_RECEIVED,
      NexusEvent.SIGNAL_GENERATED,
      NexusEvent.APPROVAL_REQUIRED,
      NexusEvent.APPROVAL_GRANTED,
      NexusEvent.APPROVAL_REJECTED,
      NexusEvent.ORDER_PLACED,
      NexusEvent.ORDER_EXECUTED,
      NexusEvent.ORDER_FAILED,
      NexusEvent.KILL_SWITCH_TRIGGERED,
      NexusEvent.HEARTBEAT_STALLED,
      NexusEvent.HEARTBEAT_RESUMED,
      NexusEvent.SNAPSHOT_RESTORE
    ];

    eventsToGovern.forEach(event => {
      eventBus.on(event, (payload) => {
        this.processEvent(payload);
      });
    });
  },

  processEvent(payload: any) {
    if (!payload || !payload.type) return;

    try {
      switch (payload.type) {
        case NexusEvent.MARKET_DATA_RECEIVED:
          if (payload.data?.assets) {
            Object.entries(payload.data.assets).forEach(([key, val]: any) => {
              (marketState as any)[key] = val;
            });
          }
          if (payload.data?.metrics) {
            marketState.neuralSentiment = payload.data.metrics.neuralSentiment ?? marketState.neuralSentiment;
            marketState.quantumInstability = payload.data.metrics.quantumInstability ?? marketState.quantumInstability;
            marketState.activeWhales = payload.data.metrics.activeWhales ?? marketState.activeWhales;
          }
          break;

        case NexusEvent.SIGNAL_GENERATED:
          if (payload.data) {
            // Unshifting to have newest first, limit size to 50
            marketState.signals = [payload.data, ...(marketState.signals || [])].slice(0, 50);
          }
          break;

        case NexusEvent.APPROVAL_REQUIRED:
          if (payload.data?.token || payload.data?.signalId) {
            const token = payload.data.token || `token-${payload.data.signalId}`;
            const exists = marketState.pendingApprovals.some((a: any) => a.token === token);
            if (!exists) {
              marketState.pendingApprovals.push({
                token,
                signalId: payload.data.signalId,
                title: payload.data.signalTitle || 'Signal Execution',
                timestamp: payload.timestamp ?? Date.now()
              });
            }
          }
          break;

        case NexusEvent.APPROVAL_GRANTED:
        case NexusEvent.APPROVAL_REJECTED:
          if (payload.data?.token || payload.data?.signalId) {
            const token = payload.data.token || `token-${payload.data.signalId}`;
            marketState.pendingApprovals = marketState.pendingApprovals.filter((a: any) => a.token !== token);
          }
          break;

        case NexusEvent.ORDER_PLACED:
          if (payload.data) {
            marketState.positions = [...(marketState.positions || []), {
              id: payload.data.id || payload.data.orderId,
              symbol: payload.data.symbol,
              side: payload.data.side,
              price: payload.data.price,
              amount: payload.data.amount,
              status: 'PENDING',
              timestamp: payload.timestamp ?? Date.now()
            }];
          }
          break;

        case NexusEvent.ORDER_EXECUTED:
          if (payload.data) {
            const id = payload.data.id || payload.data.orderId;
            marketState.positions = (marketState.positions || []).map((pos: any) => {
              if (pos.id === id) {
                return { ...pos, status: 'EXECUTED', filledPrice: payload.data.price || pos.price };
              }
              return pos;
            });
          }
          break;

        case NexusEvent.ORDER_FAILED:
          if (payload.data) {
            const id = payload.data.id || payload.data.orderId;
            marketState.positions = (marketState.positions || []).filter((pos: any) => pos.id !== id);
          }
          break;

        case NexusEvent.KILL_SWITCH_TRIGGERED:
          marketState.killSwitchActive = true;
          marketState.systemStatus = 'DEGRADED_RUNTIME';
          break;

        case NexusEvent.HEARTBEAT_STALLED:
          marketState.systemStatus = 'STALLED';
          break;

        case NexusEvent.HEARTBEAT_RESUMED:
          marketState.systemStatus = 'NOMINAL';
          break;

        case NexusEvent.SNAPSHOT_RESTORE:
          if (payload.data?.state) {
            Object.assign(marketState, payload.data.state);
            console.log("[StateEngine] State fully reconstituted from snapshot anchor.");
          }
          break;

        default:
          break;
      }
    } catch (err: any) {
      console.error(`[StateEngine] Mutation error during ${payload.type}:`, err.message);
    }
  }
};
