import { Blockchain, BlockchainTransaction, SandboxContract, TreasuryContract } from '@ton/sandbox'
import { toNano } from '@ton/core'
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
                value: toNano('0.05'),
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
            current_subsidy: expectedSubsidy,
            last_block_time: data.last_block_time,
            attempts: data.attempts,
            probability: data.probability,
        })
    })

    it('should mine with low probability of success', async () => {
        const wallet = await randomTreasury()
        let attempts = 100
        let successCount = 0
        let previousTotalSupply = 0n
        for (let i = 0; i < attempts; i++) {
            incrementBlockchainTime(10)
            await mine(wallet)
            const totalSupply = (await satoshi.getGetJettonData()).totalSupply
            if (totalSupply > previousTotalSupply) {
                successCount++
            }
            previousTotalSupply = totalSupply
        }
        const successRate = successCount / attempts
        expect(successRate).toBeGreaterThan(0.005)
        expect(successRate).toBeLessThanOrEqual(0.02)
    })

    it('should mine correctly', async () => {
        let wallet = await randomTreasury()
        let failedTrxs = await mine(wallet) // chance ~= 1%
        expect((await satoshi.getGetJettonData()).totalSupply).toEqual(toNano(0))
        expect(failedTrxs).toHaveLength(3)

        incrementBlockchainTime(60 * 10)

        let successTrxs = await mine(wallet) // chance = 100%
        expect((await satoshi.getGetJettonData()).totalSupply).toEqual(toNano(50))
        expect(successTrxs).toHaveLength(4)
    })

    it('should mine predictable with halvings', async () => {
        const iterCount = 22
        const iterBlocks = 10000
        let shouldEqualSupply = 0n
        incrementBlockchainTime(60 * 10 * Number(iterBlocks))
        let wallet = await randomTreasury()
        for (let i = 1; i < iterCount; i++) {
            await mine(wallet)
            incrementBlockchainTime(60 * 10 * Number(iterBlocks))
            const miningData = await satoshi.getGetMiningData()
            shouldEqualSupply += BigInt(iterBlocks) * miningData.current_subsidy
            expect((await satoshi.getGetJettonData()).totalSupply).toEqual(shouldEqualSupply)
        }
    })
})
