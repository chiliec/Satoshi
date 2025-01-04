import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { fromNano, toNano } from '@ton/core';
import { Satoshi } from '../wrappers/Satoshi';
import '@ton/test-utils';

describe('Satoshi', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let satoshi: SandboxContract<Satoshi>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

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

    it('should check original subsidy', async () => {
        const subsidy = (await satoshi.getGetParams()).current_subsidy;
        expect(fromNano(subsidy)).toEqual("50");
    });
});
