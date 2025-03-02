# Satoshi Tribute

## TL;DR
To mine **$SATOSHI** coins, send **0.06 TON** with the text **"F"** to the contract address:

`EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI`

You can do this manually or via the [web interface](https://chiliec.github.io/Satoshi/).

## Introduction
Satoshi Tribute is a decentralized token created to honor **Satoshi Nakamoto**, the visionary behind blockchain technology. This project serves as a tribute to his revolutionary ideas that transformed the financial system, fostering a strong crypto community around decentralization and innovation.

## Mining
Mining **$SATOSHI** is simple and fair:

- Send **0.06 TON** to the contract address with the text **"F"** to initiate mining.
- The probability of successful mining **increases over time** and **decreases with the number of attempts**.
- There are **no extra fees, pre-mining, or hidden mechanisms**—everyone has an equal opportunity.
- Like Bitcoin, mining rewards are halved every **210,000 blocks (~4 years)**.

Mining probability follows the algorithm visualized in the chart below:

![Probability vs Minutes Since Last Block](docs/figure.png)

## Smart Contract Transparency
- Built on **proven blockchain technology**.
- The mining probability algorithm is **fully open-source**.
- The complete implementation is available in the [Probability.tact](contracts/traits/Probability.tact) file, ensuring full transparency and security.

## Project Structure
- **`contracts`** - Source code of all smart contracts and dependencies.
- **`wrappers`** - Wrapper classes for contracts, implementing `Contract` from `ton-core`.
- **`tests`** - Test cases for the smart contracts.
- **`scripts`** - Deployment and automation scripts.
- **`utils`** - Utilities for scripts and UI.
- **`docs`** - Documentation and resources.

## Smart Contract Code
### Build
To compile the contracts, run:
```
npx blueprint build
```

### Test
To execute tests, use:
```
npx blueprint test
```

## Satoshi Tribute Contract
|||
|-|-|
|Address|[EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI](https://tonviewer.com/EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI?section=code)|
|Workchain | Basic Workchain (0) |
|Code Hash |icqUtHwmVcLNq4yWAlaOMogwG8MnufJI5B/s/MTBRmo= |

### Compiler
|Compiler|tact|
|-|-|
|Version|[1.5.3](https://github.com/tact-lang/tact/tree/v1.5.3)|
|Verified on|1/27/2025|

### Verification Proof
This source code compiles to the same exact bytecode that is found on-chain, verified by a decentralized group of validators.

|Status|Public Key|IP|Verification date|Verifier|
|-|-|-|-|-|
|✅ Verified|edaMyPS3LRFd28UVd7qP6YK1Y/JWrW4+hT+ydMO8TRY=|3.3.3.3|1/27/2025|[Proof](https://verifier.ton.org/EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI)|
|✅ Verified|0fjyUVE88fJa2IgWpNjjz6O9TC8ftFoSwb+DI1HvFM8=|3.3.3.3|1/27/2025|[Proof](https://verifier.ton.org/EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI)|
|✅ Verified|1fWcZGowOI0gTHZyTPhTX2s3iBnMSdqsNqJYCWNj0A4=|3.3.3.3|1/27/2025|[Proof](https://verifier.ton.org/EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI)|

## Join the Community
Become part of the movement celebrating decentralization and honoring a crypto legend. [Join our community](https://t.me/DAOthxS) on Telegram!
