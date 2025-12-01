import { toNano, Address } from '@ton/core'
import { Satoshi } from '../wrappers/Satoshi'
import { NetworkProvider } from '@ton/blueprint'
import { buildOnchainMetadata } from '../utils/jetton-helpers'
import * as fs from 'fs'
import * as path from 'path'

export async function run(provider: NetworkProvider) {
    const ui = provider.ui()
    const contractAddress = await ui.input('Please enter contract address:')

    // Load metadata.json
    const metadataPath = path.resolve(__dirname, '../docs/metadata.json')
    if (!fs.existsSync(metadataPath)) {
        throw new Error(`metadata.json not found at ${metadataPath}`)
    }

    const raw = fs.readFileSync(metadataPath, 'utf8')
    const metadata = JSON.parse(raw)

    // Remove address from metadata if present
    const { address, ...metadataWithoutAddress } = metadata
    console.log('\nLoaded metadata:')
    console.log(metadataWithoutAddress)

    const confirm = await ui.input('\nProceed with updating jetton content? (yes/no)')

    if (confirm.toLowerCase() !== 'yes') {
        console.log('Operation cancelled.')
        return
    }

    const satoshi = provider.open(
        Satoshi.fromAddress(Address.parse(contractAddress))
    )

    // Build metadata cell from all fields except "address"
    const content = buildOnchainMetadata(metadataWithoutAddress)

    // Send transaction
    await satoshi.send(
        provider.sender(),
        {
            value: toNano('0.02'),
        },
        {
            $$type: 'TokenUpdateContent',
            content,
        }
    )

    console.log('\nTransaction to change content was sent for address', satoshi.address)
}
