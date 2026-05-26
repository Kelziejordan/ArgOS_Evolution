export const CONFIG = {
  PULSE_INTERVAL: 1000,
  MARKET_SYMBOLS: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'DOT/USD', 'ADA/USD', 'XRP/USD', 'LINK/USD'],
  SIMULATION_DRIFT: 0.05,
  LIVE_TRADING_ENABLED: process.env.LIVE_TRADING_ENABLED === 'true'
};

export const ASSET_MAPPING: Record<string, string> = {
  'BTC/USD': 'btc',
  'ETH/USD': 'eth',
  'SOL/USD': 'sol',
  'DOT/USD': 'dot',
  'ADA/USD': 'ada',
  'XRP/USD': 'xrp',
  'LINK/USD': 'link'
};
