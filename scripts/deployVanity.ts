
import { toNano } from '@ton/core';
import { compile, NetworkProvider } from '@ton/blueprint';
import { VanityContract } from '../wrappers/VanityContract';
import { Satoshi } from '../wrappers/Satoshi';

export async function run(provider: NetworkProvider) {
    const { code, data } = await Satoshi.init();
    const ui = provider.ui()
    const owner = provider.sender().address
    if (!owner) {
        throw new Error('No address in provider found')
    }
    const salt = await ui.input('Please enter salt:')
    const vanityCodeCell = await compile('VanityContract')
    const vanity = provider.open(VanityContract.createFromConfig({
        salt, owner
    }, vanityCodeCell, 0));

    await vanity.sendDeploy(
        provider.sender(),
        toNano('0.2'),
        code,
        data
    );

    await provider.waitForDeploy(vanity.address);

    console.log('Deployed to ',  vanity.address.toString());
}
