// ═══════════════════════════════════════════════════════════════
// symbolToTopic — normalise trading symbol → social topic slug
// ═══════════════════════════════════════════════════════════════

/** Strip common quote-currency suffixes from a symbol string. */
function stripSuffix(input: string): string {
  return input
    .toUpperCase()
    .replace(/\/(USDT?|BUSD|USD|PERP)$/i, '')  // BTC/USDT
    .replace(/(USDT?|BUSD|PERP)$/i, '')         // BTCUSDT, BTCPERP
    .toLowerCase();
}

/**
 * Map from canonical short symbol → social topic slug used by
 * LunarCrush / Santiment topic endpoints.
 */
const TOPIC_MAP: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  doge: 'dogecoin',
  xrp: 'ripple',
  bnb: 'bnb',
  ada: 'cardano',
  avax: 'avalanche',
  dot: 'polkadot',
  matic: 'polygon',
  link: 'chainlink',
  uni: 'uniswap',
  atom: 'cosmos',
  near: 'near',
  sui: 'sui',
  apt: 'aptos',
  arb: 'arbitrum',
  op: 'optimism',
  ltc: 'litecoin',
  bch: 'bitcoin-cash',
  trx: 'tron',
  xlm: 'stellar',
};

/**
 * Convert a raw trading symbol to a social topic slug.
 *
 * Examples:
 *   BTCUSDT   → bitcoin
 *   BTC/USDT  → bitcoin
 *   bitcoin   → bitcoin   (pass-through)
 *   UNKNOWN   → unknown   (lowercased pass-through)
 */
export function symbolToTopic(input: string): string {
  if (!input) return 'bitcoin';
  const stripped = stripSuffix(input);
  return TOPIC_MAP[stripped] ?? stripped;
}
