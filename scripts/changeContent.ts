import { toNano, Address } from '@ton/core';
import { Satoshi } from '../wrappers/Satoshi';
import { NetworkProvider } from '@ton/blueprint';
import { buildOnchainMetadata } from '../utils/jetton-helpers';

export async function run(provider: NetworkProvider) {

    const ui = provider.ui();

    const contractAddress = await ui.input('Please enter contract address:');

    const satoshi = provider.open(Satoshi.fromAddress(Address.parse(contractAddress)));

    const name = await ui.input('Please enter jetton name:');
    const description = await ui.input('Please enter jetton description:');
    const symbol = await ui.input('Please enter jetton symbol:');
    const image = await ui.input('Please enter link to jetton image:');

    const jettonParams = {
        name: name,
        description: description,
        symbol: symbol,
        image: image,
    }
    const content = buildOnchainMetadata(jettonParams);

    await satoshi.send(
        provider.sender(),
        {
            value: toNano('0.02'),
        },
        {
            $$type: 'TokenUpdateContent',
            content: content,
        }
    );

    console.log('Transaction to change content was sended for address', satoshi.address);
}
