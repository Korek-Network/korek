# KOREK Network website

This repository contains the public website served at [korek.network](https://korek.network).

The active software lives in separate repositories:

- [KOREK blockchain and KOREKSCAN](https://github.com/Korek-Network/blockchain)
- [KOREK desktop miner](https://github.com/Korek-Network/korekUI)
- [KOREK wallet](https://github.com/Korek-Network/wallet)
- [Mining protocol reference vectors](https://github.com/Korek-Network/template)

## Current Planck testnet policy

- Network: `korek-planck-testnet-1`
- Maximum supply: 210,000,000 KRK
- Genesis premine: 0 KRK
- Initial block subsidy: 50 KRK
- Target reward-block interval: 60 seconds
- Halving interval: 2,100,000 reward blocks
- Miner payout: 95% of each subsidy plus 100% of transaction fees
- Public treasury: 5% of each subsidy
- Founder/team allocation: none

All issuance begins with accepted proof-of-work blocks. Planck balances are test-only, have no monetary value, and will not migrate to mainnet.

## Public services

- Website: [korek.network](https://korek.network)
- Explorer: [scan.planck.korek.network](https://scan.planck.korek.network)
- Mining gateway and API: [rpc.planck.korek.network](https://rpc.planck.korek.network)
- Mining guide: [MINING_AND_NODE.md](https://github.com/Korek-Network/blockchain/blob/main/docs/MINING_AND_NODE.md)

## Local website preview

```bash
npm install
KOREK_PORT=8370 npm start
```

Open `http://127.0.0.1:8370`. This command previews the website only; it is not the public mining endpoint or the active blockchain node.

## Status

KOREK Planck is experimental, unaudited testnet software. Test KRK has no monetary value. Mainnet is not live.
