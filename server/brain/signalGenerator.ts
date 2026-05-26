import { adaptiveSignalGenerator } from './adaptiveSignalGenerator';
import { Signal } from "../state/state";

export const generateSignals = (correlationId?: string, causationId?: string): Signal | null => {
  return adaptiveSignalGenerator.generateSignal(correlationId, causationId);
};

