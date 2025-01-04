import { Blockchain, BlockchainTransaction, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Satoshi } from '../wrappers/Satoshi';
import '@ton/test-utils';

describe('Satoshi', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let satoshi: SandboxContract<Satoshi>;

    async function randomTreasury() {
        let rnd = (Math.random() + 1).toString(36).substring(7);
        return await blockchain.treasury(rnd);
    }

    function incrementBlockchainTime(seconds: number) {
        if (!blockchain.now) {
            blockchain.now = Math.floor(Date.now() / 1000);
        }
        blockchain.now += seconds;
    }

    async function mine(treasury: SandboxContract<TreasuryContract>): Promise<BlockchainTransaction[]> {
        const result = await satoshi.send(treasury.getSender(),
            {
                value: toNano("0.12"),
            },
            {
                $$type: 'Mine',
                receiver: treasury.address
            }
        );
        return result.transactions
    }

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        blockchain.verbosity = {
            blockchainLogs: false,
            vmLogs: 'none',
            debugLogs: true,
            print: true
        }

        satoshi = blockchain.openContract(await Satoshi.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await satoshi.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: satoshi.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and satoshi are ready to use
    });

    it('should get start mining data', async () => {
        const data = (await satoshi.getGetMiningData());
        const expectedSubsidy = toNano("50");
        expect(data).toEqual({
            "$$type": "MiningParams",
            last_block: 0n,
            current_subsidy: expectedSubsidy,
            last_block_time: data.last_block_time
        });
    });

    it('should mine correctly', async () => {
        let wallet = await randomTreasury();
        let failedTrxs = await mine(wallet); // chance ~= 1%
        expect(failedTrxs).toHaveLength(3);
        expect((await satoshi.getGetJettonData()).totalSupply).toEqual(toNano(0));

        incrementBlockchainTime(60 * 10);

        let successTrxs = await mine(wallet); // chance = 100%
        expect(successTrxs).toHaveLength(4);
        expect((await satoshi.getGetJettonData()).totalSupply).toEqual(toNano(50));
    });

    it('should mine predictable with halvings', async () => {
        let wallet = await randomTreasury();
        const iterCount = 22
        const iterBlocks = 10000
        var shouldEqualSupply = 0n
        for (let i = 1; i < iterCount; i++) {
            incrementBlockchainTime(60 * 10 * Number(iterBlocks))
            await mine(wallet)
            const data = (await satoshi.getGetMiningData())
            shouldEqualSupply += BigInt(iterBlocks) * data.current_subsidy
            expect((await satoshi.getGetJettonData()).totalSupply).toEqual(shouldEqualSupply)
        }
    });
});
