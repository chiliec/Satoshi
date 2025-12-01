import { UIProvider } from '@ton/blueprint'
import { beginCell, Builder, Cell, Dictionary, DictionaryValue, Slice } from "@ton/core"
import { sha256 } from 'ton-crypto'

// https://github.com/ton-blockchain/TEPs/blob/master/text/0064-token-data-standard.md#jetton-metadata-attributes
export const defaultJettonKeys = ["uri", "name", "description", "image", "image_data", "symbol", "decimals", "amount_style", "render_type"]
export const defaultNftKeys = ["uri", "name", "description", "image", "image_data"]

const contentValue: DictionaryValue<string> = {
    serialize: (src: string, builder: Builder) => {
        builder.storeRef(beginCell().storeUint(0, 8).storeStringTail(src).endCell())
    },
    parse: (src: Slice) => {
        const sc = src.loadRef().beginParse()
        const prefix = sc.loadUint(8)
        if (prefix == 0) { // on-chain
            return sc.loadStringTail()
        } else if (prefix == 1) { // off-chain
            const chunkDict = Dictionary.loadDirect(Dictionary.Keys.Uint(32), Dictionary.Values.Cell(), sc)
            return chunkDict.values().map(x => x.beginParse().loadStringTail()).join('')
        } else {
            throw (Error(`Prefix ${prefix} is not supported`))
        }
    }
}

export const displayContentCell = async (content: Cell, ui: UIProvider, jetton: boolean = true, additional?: string[]) => {
    const cs = content.beginParse()
    const contentType = cs.loadUint(8)
    ui.write(`Content type: ${contentType === 0 ? 'on-chain' : contentType === 1 ? 'off-chain' : 'unknown'}\n`)
    if (contentType == 1) {
        const noData = cs.remainingBits == 0
        if (noData && cs.remainingRefs == 0) {
            ui.write("No data in content cell!\n")
        } else {
            const contentUrl = noData ? cs.loadStringRefTail() : cs.loadStringTail()
            ui.write(`Content metadata url:${contentUrl}\n`)
        }
    } else if (contentType == 0) {
        let contentKeys: string[]
        const hasAdditional = additional !== undefined && additional.length > 0
        const contentDict = Dictionary.load(Dictionary.Keys.BigUint(256), contentValue, cs)
        const contentMap: { [key: string]: string } = {}

        if (jetton) {
            contentKeys = hasAdditional ? [...defaultJettonKeys, ...additional] : defaultJettonKeys
        } else {
            contentKeys = hasAdditional ? [...defaultNftKeys, ...additional] : defaultNftKeys
        }
        for (const name of contentKeys) {
            // I know we should pre-compute hashed keys for known values... just not today.
            const dictKey = BigInt("0x" + (await sha256(name)).toString('hex'))
            const dictValue = contentDict.get(dictKey)
            if (dictValue !== undefined) {
                contentMap[name] = dictValue
            }
        }
        ui.write(`Content:${JSON.stringify(contentMap, null, 2)}`)
    }
    else {
        ui.write(`Unknown content format indicator:${contentType}\n`)
    }
}
