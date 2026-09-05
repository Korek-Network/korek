export const NETWORK = Object.freeze({
  name: "KOREK",
  symbol: "KRK",
  networkId: "korek-testnet-1",
  decimals: 8,
  maxSupply: 365_000_000n * 100_000_000n,
  initialReward: 50n * 100_000_000n,
  halvingInterval: 1_000_000,
  blockTimeMs: 200,
  difficulty: 3,
  finalityMode: "rapid-testnet",
  nodeMinerAddress: process.env.KOREK_BLOCK_PRODUCER || `krk1${"0".repeat(40)}`,
  apiPort: Number(process.env.KOREK_PORT || 8365),
});

export function rewardAtHeight(height) {
  const halvings = Math.floor(height / NETWORK.halvingInterval);
  return halvings >= 64 ? 0n : NETWORK.initialReward >> BigInt(halvings);
}
