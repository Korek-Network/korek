import { writeFile } from "node:fs/promises";
import { cryptoProvider } from "./crypto.js";

const wallet = cryptoProvider.createWallet();
const filename = `korek-wallet-${wallet.address.slice(-8)}.json`;
await writeFile(filename, JSON.stringify(wallet, null, 2), { mode: 0o600, flag: "wx" });
console.log(`Created ${wallet.address}\nSaved ${filename}\nKeep this file private. TESTNET ONLY.`);
