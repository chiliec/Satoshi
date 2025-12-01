import { UIProvider } from '@ton/blueprint'
import { Address } from "@ton/core"

export const promptBool = async (prompt: string, options: [string, string], ui: UIProvider, choice: boolean = false) => {
    let yes = false
    let no = false
    let opts = options.map(o => o.toLowerCase())

    do {
        let res = (choice ? await ui.choose(prompt, options, (c: string) => c) : await ui.input(`${prompt}(${options[0]}/${options[1]})`)).toLowerCase()
        yes = res == opts[0]
        if (!yes)
            no = res == opts[1]
    } while (!(yes || no))

    return yes
}

export const promptAddress = async (prompt: string, provider: UIProvider, fallback?: Address) => {
    let promptFinal = fallback ? prompt.replace(/:$/, '') + `(default:${fallback}):` : prompt
    do {
        let testAddr = (await provider.input(promptFinal)).replace(/^\s+|\s+$/g, '')
        try {
            return testAddr == "" && fallback ? fallback : Address.parse(testAddr)
        }
        catch (e) {
            provider.write(testAddr + " is not valid!\n")
            prompt = "Please try again:"
        }
    } while (true)

}

export const promptAmount = async (prompt: string, provider: UIProvider) => {
    let resAmount: number
    do {
        let inputAmount = await provider.input(prompt)
        resAmount = Number(inputAmount)
        if (isNaN(resAmount)) {
            provider.write("Failed to convert " + inputAmount + " to float number")
        }
        else {
            return resAmount.toFixed(9)
        }
    } while (true)
}

export const promptUrl = async (prompt: string, ui: UIProvider) => {
    let retry = false
    let input = ""
    let res = ""

    do {
        input = await ui.input(prompt)
        try {
            let testUrl = new URL(input)
            res = testUrl.toString()
            retry = false
        }
        catch (e) {
            ui.write(input + " doesn't look like a valid url:\n" + e)
            retry = !(await promptBool('Use anyway?(y/n)', ['y', 'n'], ui))
        }
    } while (retry)
    return input
}
