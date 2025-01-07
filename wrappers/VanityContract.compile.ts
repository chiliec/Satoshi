import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'func',
    targets: ['contracts/helpers/stdlib.fc', 'contracts/helpers/vanity_contract.fc'],
};