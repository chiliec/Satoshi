import { Address, fromNano, Contract } from '@ton/core'
import { Satoshi } from '../wrappers/Satoshi'
import { NetworkProvider } from '@ton/blueprint'
import { displayContentCell } from '../utils/content-parser'

export async function run(provider: NetworkProvider) {
    const ui = provider.ui()

    const contractAddress = await ui.input('Please enter Satoshi contract address:')

    let address: Address
    try {
        address = Address.parse(contractAddress)
    } catch {
        throw new Error('Invalid address')
    }

    const satoshi = provider.open(Satoshi.fromAddress(address))

    const jettonData = await satoshi.getGetJettonData()
    ui.write('Jetton info:\n')
    ui.write(`Admin: ${jettonData.owner}\n`)
    ui.write(`Total supply: ${fromNano(jettonData.total_supply)}\n`)
    ui.write(`Mintable: ${jettonData.mintable}\n\n`)
    await displayContentCell(jettonData.content, ui, true, ['uri', 'content_url', 'social', 'websites'])

    const miningData = await satoshi.getGetMiningData()
    ui.write(`\nMining data:\n`)
    ui.write(`Last block: ${miningData.last_block}\n`)
    ui.write(`Last block time: ${miningData.last_block_time}\n`)
    ui.write(`Attempts: ${miningData.attempts}\n`)
    ui.write(`Subsidy: ${fromNano(miningData.subsidy)}\n`)
    ui.write(`Probability: ${miningData.probability}\n\n`)
}
