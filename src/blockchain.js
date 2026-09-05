import { NETWORK, rewardAtHeight } from "./config.js";
import { cryptoProvider, sha256 } from "./crypto.js";

const hashBlock = (block) => sha256(JSON.stringify({
  height: block.height, previousHash: block.previousHash, timestamp: block.timestamp,
  transactions: block.transactions, miner: block.miner, usefulWork: block.usefulWork,
  nonce: block.nonce,
}));

export class KorekChain {
  constructor() {
    this.pending = [];
    this.balances = new Map();
    this.issued = 0n;
    this.faucetClaims = new Map();
    this.chain = [this.genesis()];
  }

  genesis() {
    const block = { height: 0, previousHash: "0".repeat(64), timestamp: 1735689600000,
      transactions: [], miner: "genesis", usefulWork: { type: "genesis", score: 0 }, nonce: 0 };
    return { ...block, hash: hashBlock(block) };
  }

  addTransaction(tx) {
    const required = ["from", "to", "amount", "publicKey", "signature", "timestamp"];
    if (!required.every((key) => tx[key] !== undefined)) throw new Error("Incomplete transaction");
    if (!/^krk1[0-9a-f]{40}$/.test(tx.to) || BigInt(tx.amount) <= 0n) throw new Error("Invalid transfer");
    const message = `${tx.from}|${tx.to}|${tx.amount}|${tx.timestamp}`;
    if (`krk1${sha256(tx.publicKey).slice(0, 40)}` !== tx.from) throw new Error("Public key mismatch");
    if (!cryptoProvider.verify(message, tx.signature, tx.publicKey)) throw new Error("Invalid signature");
    const reserved = this.pending.filter((p) => p.from === tx.from).reduce((n, p) => n + BigInt(p.amount), 0n);
    if ((this.balances.get(tx.from) || 0n) - reserved < BigInt(tx.amount)) throw new Error("Insufficient balance");
    this.pending.push({ ...tx, id: sha256(message + tx.signature) });
    return this.pending.at(-1);
  }

  mine(miner, usefulWork = { type: "benchmark", score: 0 }) {
    if (!/^krk1[0-9a-f]{40}$/.test(miner)) throw new Error("Invalid miner address");
    const height = this.chain.length;
    const reward = this.issued >= NETWORK.maxSupply ? 0n :
      [rewardAtHeight(height), NETWORK.maxSupply - this.issued].reduce((a, b) => a < b ? a : b);
    const block = { height, previousHash: this.chain.at(-1).hash, timestamp: Date.now(),
      transactions: this.pending.splice(0), miner, usefulWork, nonce: 0 };
    const target = "0".repeat(NETWORK.difficulty);
    do { block.nonce++; block.hash = hashBlock(block); } while (!block.hash.startsWith(target));
    for (const tx of block.transactions) {
      this.balances.set(tx.from, (this.balances.get(tx.from) || 0n) - BigInt(tx.amount));
      this.balances.set(tx.to, (this.balances.get(tx.to) || 0n) + BigInt(tx.amount));
    }
    this.balances.set(miner, (this.balances.get(miner) || 0n) + reward);
    this.issued += reward;
    block.reward = reward.toString();
    this.chain.push(block);
    return block;
  }

  balance(address) { return (this.balances.get(address) || 0n).toString(); }
  claimFaucet(address, amount = 100n * 100_000_000n, now = Date.now()) {
    if (!/^krk1[0-9a-f]{40}$/.test(address)) throw new Error("Invalid KOREK address");
    const cooldownMs = 60 * 60 * 1000; const previousClaim = this.faucetClaims.get(address) || 0;
    if (now - previousClaim < cooldownMs) {
      const minutes = Math.max(1, Math.ceil((cooldownMs - (now - previousClaim)) / 60_000));
      throw new Error(`Faucet cooldown active. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}`);
    }
    if (amount <= 0n || this.issued + amount > NETWORK.maxSupply) throw new Error("Faucet supply unavailable");
    this.balances.set(address, (this.balances.get(address) || 0n) + amount);
    this.issued += amount; this.faucetClaims.set(address, now);
    return { address, amount: amount.toString(), balance: this.balance(address), network: NETWORK.networkId,
      claimedAt: now, nextClaimAt: now + cooldownMs };
  }
  status() { return { ...NETWORK, maxSupply: NETWORK.maxSupply.toString(), issued: this.issued.toString(),
    height: this.chain.length - 1, pending: this.pending.length, crypto: cryptoProvider.algorithm }; }
}
