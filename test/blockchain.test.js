import test from "node:test";
import assert from "node:assert/strict";
import { KorekChain } from "../src/blockchain.js";
import { cryptoProvider } from "../src/crypto.js";
import { NETWORK } from "../src/config.js";

test("genesis is deterministic and mining rewards a valid wallet", () => {
  const chain = new KorekChain(); const wallet = cryptoProvider.createWallet();
  const block = chain.mine(wallet.address);
  assert.equal(block.height, 1); assert.equal(chain.balance(wallet.address), block.reward);
  assert.ok(block.hash.startsWith("0".repeat(NETWORK.difficulty)));
});

test("wallet address is derived from its public key", () => {
  const wallet = cryptoProvider.createWallet();
  assert.match(wallet.address, /^krk1[0-9a-f]{40}$/);
  const message = "korek-wallet-test";
  assert.ok(cryptoProvider.verify(message, cryptoProvider.sign(message, wallet.privateKey), wallet.publicKey));
});

test("faucet credits 100 test KRK once per wallet", () => {
  const chain = new KorekChain(); const wallet = cryptoProvider.createWallet();
  const claim = chain.claimFaucet(wallet.address);
  assert.equal(claim.amount, "10000000000"); assert.equal(chain.balance(wallet.address), "10000000000");
  assert.throws(() => chain.claimFaucet(wallet.address), /already claimed/);
});

test("signed KRK transfer is accepted and settled", () => {
  const chain = new KorekChain(); const alice = cryptoProvider.createWallet(); const bob = cryptoProvider.createWallet();
  chain.mine(alice.address); const timestamp = Date.now(); const amount = "100000000";
  const message = `${alice.address}|${bob.address}|${amount}|${timestamp}`;
  chain.addTransaction({ from:alice.address,to:bob.address,amount,timestamp,publicKey:alice.publicKey,signature:cryptoProvider.sign(message,alice.privateKey) });
  chain.mine(alice.address); assert.equal(chain.balance(bob.address), amount);
});
