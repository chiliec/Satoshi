import { toNano, Address } from '@ton/core';
import { Satoshi } from '../wrappers/Satoshi';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    const contractAddress = await ui.input('Please enter contract address:');

    let newOwner!: Address;
    const displayContent = await ui.choose('Resign to zero address?', ['Yes', 'No'], (c) => c);
    if (displayContent == 'Yes') {
        newOwner = Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
    } else {
        newOwner = Address.parse(await ui.input('Please enter new owner address:'));
    }
    const satoshi = provider.open(Satoshi.fromAddress(Address.parse(contractAddress)));

    await satoshi.send(
        provider.sender(),
        {
            value: toNano('0.02'),
        },
        {
            $$type: 'ChangeOwner',
            queryId: 0n,
            newOwner: newOwner,
        }
    );

    console.log('Transaction to change ownership was sended for address', satoshi.address);
}
