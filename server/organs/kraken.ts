import ccxt from 'ccxt';

// Use this structure to handle actual API keys if live trading gets enabled
let krakenClient: any = null;

export function getKraken() {
  if (krakenClient) return krakenClient;
  
  if (process.env.LIVE_TRADING_ENABLED === 'true' && process.env.KRAKEN_API_KEY && process.env.KRAKEN_API_KEY !== 'your_api_key_here') {
    try {
      krakenClient = new ccxt.kraken({
        apiKey: process.env.KRAKEN_API_KEY,
        secret: process.env.KRAKEN_API_SECRET,
        enableRateLimit: true
      });
      return krakenClient;
    } catch (e) {
      console.error("[KRAKEN_ORGAN] Failed to initialize ccxt.kraken", e);
      return null;
    }
  }
  return null;
}
