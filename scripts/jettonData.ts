import { toNano, Address, fromNano } from '@ton/core';
import { Satoshi } from '../wrappers/Satoshi';
import { NetworkProvider } from '@ton/blueprint';
import { buildOnchainMetadata } from '../utils/jetton-helpers';
import { displayContentCell } from '../utils/ui-utils';

export async function run(provider: NetworkProvider) {

    const ui = provider.ui();

    const contractAddress = await ui.input('Please enter Satoshi contract address:');

    const satoshi = provider.open(Satoshi.fromAddress(Address.parse(contractAddress)));

    const jettonData = await satoshi.getGetJettonData();
    ui.write("Jetton info:\n");
    ui.write(`Admin: ${jettonData.owner}\n`);
    ui.write(`Total supply: ${fromNano(jettonData.total_supply)}\n`);
    ui.write(`Mintable: ${jettonData.mintable}\n\n`);

    const miningData = await satoshi.getGetMiningData();
    ui.write(`Mining data:\n`);
    ui.write(`Last block: ${miningData.last_block}\n`);
    ui.write(`Last block time: ${miningData.last_block_time}\n`);
    ui.write(`Attempts: ${miningData.attempts}\n`);
    ui.write(`Subsidy: ${fromNano(miningData.subsidy)}\n`);
    ui.write(`Probability: ${miningData.probability}\n\n`);

    const displayContent = await ui.choose('Display content?', ['Yes', 'No'], (c) => c);
    if (displayContent == 'Yes') {
        await displayContentCell(jettonData.content, ui);
    }
}
