import { Blockchain, BlockchainTransaction, SandboxContract, TreasuryContract } from '@ton/sandbox'
import { fromNano, toNano } from '@ton/core'
import { Satoshi } from '../wrappers/Satoshi'
import '@ton/test-utils'

describe('Satoshi', () => {
    let blockchain: Blockchain
    let deployer: SandboxContract<TreasuryContract>
    let satoshi: SandboxContract<Satoshi>

    async function randomTreasury() {
        let rnd = (Math.random() + 1).toString(36).substring(7)
        return await blockchain.treasury(rnd)
    }

    function incrementBlockchainTime(seconds: number) {
        if (!blockchain.now) {
            blockchain.now = Math.floor(Date.now() / 1000)
        }
        blockchain.now += seconds
    }

    async function mine(treasury: SandboxContract<TreasuryContract>): Promise<BlockchainTransaction[]> {
        const result = await satoshi.send(treasury.getSender(),
            {
                value: toNano("0.2"),
            },
            {
                $$type: 'Mine',
                receiver: treasury.address
            }
        )
        return result.transactions
    }

    beforeEach(async () => {
        blockchain = await Blockchain.create()
        blockchain.verbosity = {
            blockchainLogs: false,
            vmLogs: 'none',
            debugLogs: true,
            print: true
        }

        satoshi = blockchain.openContract(await Satoshi.fromInit())

        deployer = await blockchain.treasury('deployer')

        const deployResult = await satoshi.send(
            deployer.getSender(),
            {
                value: toNano('0.2'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        )

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: satoshi.address,
            deploy: true,
            success: true,
        })
    })

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and satoshi are ready to use
    })

    it('should get start mining data', async () => {
        const data = (await satoshi.getGetMiningData())
        const expectedSubsidy = toNano("50")
        expect(data).toEqual({
            "$$type": "MiningParams",
            last_block: 0n,
            subsidy: expectedSubsidy,
            probability: data.probability,
            attempts: data.attempts,
            last_block_time: data.last_block_time,
        })
    })

    it('should get predictable probability', async () => {
        const data0 = (await satoshi.getGetMiningData())
        expect(data0.probability).toBe(1n)

        incrementBlockchainTime(1 * 60)
        const data1 = (await satoshi.getGetMiningData())
        expect(data1.probability).toBe(10n)

        incrementBlockchainTime(1 * 60)
        const data2 = (await satoshi.getGetMiningData())
        expect(data2.probability).toBe(20n)

        incrementBlockchainTime(1 * 60)
        const data3 = (await satoshi.getGetMiningData())
        expect(data3.probability).toBe(30n)

        incrementBlockchainTime(1 * 60)
        const data4 = (await satoshi.getGetMiningData())
        expect(data4.probability).toBe(40n)

        incrementBlockchainTime(1 * 60)
        const data5 = (await satoshi.getGetMiningData())
        expect(data5.probability).toBe(50n)

        incrementBlockchainTime(1 * 60)
        const data6 = (await satoshi.getGetMiningData())
        expect(data6.probability).toBe(60n)

        incrementBlockchainTime(1 * 60)
        const data7 = (await satoshi.getGetMiningData())
        expect(data7.probability).toBe(70n)

        incrementBlockchainTime(1 * 60)
        const data8 = (await satoshi.getGetMiningData())
        expect(data8.probability).toBe(80n)

        incrementBlockchainTime(1 * 60)
        const data9 = (await satoshi.getGetMiningData())
        expect(data9.probability).toBe(90n)

        incrementBlockchainTime(1 * 60)
        const data10 = (await satoshi.getGetMiningData())
        expect(data10.probability).toBe(100n)

    })

    it('should mine with low probability of success', async () => {
        const wallet = await randomTreasury()
        let attempts = 100
        let successCount = 0
        let previoustotal_supply = 0n
        for (let i = 0; i < attempts; i++) {
            incrementBlockchainTime(60 * 1)
            await mine(wallet)
            const total_supply = (await satoshi.getGetJettonData()).total_supply
            if (total_supply > previoustotal_supply) {
                successCount++
            }
            previoustotal_supply = total_supply
        }
        const successRate = successCount / attempts
        expect(successRate).toBeGreaterThanOrEqual(0.01)
        expect(successRate).toBeLessThanOrEqual(0.15)
    })

    it('should mine correctly', async () => {
        const minProbability = (await satoshi.getGetMiningData()).probability
        expect(minProbability).toBe(1n)
        expect((await satoshi.getGetJettonData()).total_supply).toEqual(toNano(0))

        incrementBlockchainTime(60 * 10)

        const maxProbability = (await satoshi.getGetMiningData()).probability
        expect(maxProbability).toBe(100n)

        let wallet = await randomTreasury()
        let successTrxs = await mine(wallet)
        expect((await satoshi.getGetJettonData()).total_supply).toEqual(toNano(50))
        expect(successTrxs).toHaveLength(5)
    })

    it('should mine predictable with halvings', async () => {
        const iterCount = 300
        const iterBlocks = 10_000
        let shouldEqualSupply = 0n
        let wallet = await randomTreasury()
        for (let i = 1; i <= iterCount; i++) {
            const miningData = await satoshi.getGetMiningData()
            shouldEqualSupply += BigInt(iterBlocks) * miningData.subsidy
            incrementBlockchainTime(60 * 10 * Number(iterBlocks))
            await mine(wallet)
            expect((await satoshi.getGetJettonData()).total_supply).toEqual(shouldEqualSupply)
        }
        const tonBalance = (await blockchain.getContract(satoshi.address)).balance
        console.log("Result balance: ", fromNano(tonBalance))
        expect(tonBalance).toBeGreaterThan(toNano(0.001))
        expect(tonBalance).toBeLessThan(toNano(1))
    })
})
