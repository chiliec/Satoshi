# Satoshi Tribute

## TL;DR

To mine **$SATOSHI** coins, send **0.06 TON** with the text **`F`** to the contract address:

`EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI`

You can do this:

* Manually from your any TON wallet
* Via the [web interface](https://chiliec.github.io/Satoshi/)
* Or using the [automatic mining script](https://github.com/chiliec/satoshi-sender)

---

## Introduction

**Satoshi Tribute** is a decentralized token created to honor **Satoshi Nakamoto**, the visionary behind blockchain technology.

This project is a tribute to his revolutionary ideas that reshaped global finance, fostering a community built on **decentralization, fairness, and innovation**.

---

## Mining

Mining **$SATOSHI** is simple and fair:

* Send **0.06 TON** to the contract address with the text **`F`** to attempt mining.
* The probability of success **increases with time since the last block** and **decreases with repeated attempts**.
* There are **no extra fees, pre-mining, or hidden mechanisms**—everyone has the same opportunity.
* Rewards follow Bitcoin’s logic: halved every **210,000 blocks (\~4 years)**.

Mining probability is defined by the open-source algorithm below:

![Probability vs Minutes Since Last Block](docs/figure.png)

---

## Smart Contract Transparency

* Built on **proven TON blockchain technology**.
* The mining probability algorithm is **fully open-source**.
* Full implementation is available in [`Probability.tact`](contracts/traits/Probability.tact).

This ensures **complete transparency and security**.

---

## Project Structure

* **`contracts/`** – Source code of all smart contracts and dependencies
* **`wrappers/`** – Wrapper classes for contracts, implementing `Contract` from `ton-core`
* **`tests/`** – Smart contract test cases
* **`scripts/`** – Deployment and automation scripts
* **`utils/`** – Shared utilities for scripts and UI
* **`docs/`** – Documentation and resources

---

## Smart Contract Code

### Build

```bash
npx blueprint build
```

### Test

```bash
npx blueprint test
```

---

## Satoshi Tribute Contract

|               |                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Address**   | [EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI](https://tonviewer.com/EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI?section=code) |
| **Workchain** | Basic Workchain (0)                                                                                                                     |
| **Code Hash** | `icqUtHwmVcLNq4yWAlaOMogwG8MnufJI5B/s/MTBRmo=`                                                                                          |

### Compiler

|                 |                                                        |
| --------------- | ------------------------------------------------------ |
| **Compiler**    | tact                                                   |
| **Version**     | [1.5.3](https://github.com/tact-lang/tact/tree/v1.5.3) |
| **Verified on** | 2025-01-27                                             |

### Verification Proof

The source code compiles to the **exact same bytecode** found on-chain, verified by multiple independent validators.

| Status     | Public Key                                   | IP      | Verification Date | Verifier                                                                           |
| ---------- | -------------------------------------------- | ------- | ----------------- | ---------------------------------------------------------------------------------- |
| ✅ Verified | edaMyPS3LRFd28UVd7qP6YK1Y/JWrW4+hT+ydMO8TRY= | 3.3.3.3 | 2025-01-27        | [Proof](https://verifier.ton.org/EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI) |
| ✅ Verified | 0fjyUVE88fJa2IgWpNjjz6O9TC8ftFoSwb+DI1HvFM8= | 3.3.3.3 | 2025-01-27        | [Proof](https://verifier.ton.org/EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI) |
| ✅ Verified | 1fWcZGowOI0gTHZyTPhTX2s3iBnMSdqsNqJYCWNj0A4= | 3.3.3.3 | 2025-01-27        | [Proof](https://verifier.ton.org/EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI) |

---

## Join the Community

Become part of the movement celebrating decentralization and honoring a crypto legend.

👉 [Join our Telegram community](https://t.me/DAOthxS)
