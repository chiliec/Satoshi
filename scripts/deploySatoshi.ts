import { toNano } from '@ton/core';
import { Satoshi } from '../wrappers/Satoshi';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const satoshi = provider.open(await Satoshi.fromInit());

    await satoshi.send(
        provider.sender(),
        {
            value: toNano('0.1'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(satoshi.address);

    console.log('Owner', await satoshi.getOwner());
}
