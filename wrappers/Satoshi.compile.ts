import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/satoshi.tact',
    options: {
        debug: true,
    },
};
