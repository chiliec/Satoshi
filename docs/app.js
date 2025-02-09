const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://chiliec.github.io/Satoshi/tonconnect-manifest.json',
    buttonRootId: 'connect-button',
    uiOptions: {
        language: 'en',
        uiPreferences: {
            theme: TON_CONNECT_UI.THEME.DARK,
        },
    },
});

const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC'));

const { Address, Cell } = TonWeb;

const contractAddress = new Address('EQCkdx5PSWjj-Bt0X-DRCfNev6ra1NVv9qqcu-W2-SaToSHI');

function createMessageBody(address) {
    const cell = new Cell();
    cell.bits.writeUint(0xe9b94603, 32);
    cell.bits.writeAddress(new Address(address));
    return cell;
}

async function initTonConnect() {
    try {
        tonConnectUI.onStatusChange(async (wallet) => {
            document.getElementById('mineButton').disabled = !!!wallet;
            document.getElementById('receiverAddress').disabled = !!!wallet;
        });
        await tonConnectUI.connectionRestored;
    } catch (e) {
        console.error('Connection error:', e);
    }
}

async function submitMining() {
    const walletState = await tonConnectUI.getWalletInfo();
    if (!walletState) {
        alert('Please connect your wallet first');
        return;
    }
    const receiverAddress = document.getElementById('receiverAddress').value || walletState.account.address;
    try {
        const messageBody = createMessageBody(receiverAddress);
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 120, // 120 seconds from now
            messages: [
                {
                    address: contractAddress.toString(),
                    amount: '60000000', // 0.06 TON
                    payload: messageBody.toBoc().toString('base64'),
                },
            ],
        };
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Transaction sent:', result);
    } catch (e) {
        console.error('Transaction error:', e);
        alert('Transaction failed: ' + e.message);
    }
}

function formatAmount(amount) {
    return TonWeb.utils.fromNano(amount.toString());
}

async function getJettonData() {
    try {
        const result = await tonweb.provider.call2(contractAddress.toString(), 'get_jetton_data');
        return {
            total_supply: parseInt(result[0]),
            mintable: result[1],
            admin_address: result[2],
            content: result[3],
            wallet_code: result[4],
        };
    } catch (e) {
        console.error('Error getting jetton data:', e);
        return null;
    }
}

async function getMiningData() {
    try {
        const result = await tonweb.provider.call2(contractAddress.toString(), 'get_mining_data');
        return {
            last_block: parseInt(result[0]),
            last_block_time: parseInt(result[1]),
            attempts: parseInt(result[2]),
            subsidy: parseInt(result[3]),
            probability: parseInt(result[4]),
        };
    } catch (e) {
        console.error('Error getting jetton data:', e);
        return null;
    }
}

async function updateStats() {
    const pluralize = (count, noun, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`;
    try {
        const jettonData = await getJettonData();
        if (!jettonData) throw new Error('Failed to get jetton data');

        document.getElementById('supply').textContent =
            `${formatAmount(jettonData.total_supply)} (${(formatAmount(jettonData.total_supply) / 21000000).toFixed(2)}%)`;
        document.getElementById('rights').textContent =
            jettonData.admin_address === '0:0000000000000000000000000000000000000000000000000000000000000000'
                ? 'Yes'
                : 'No';

        const miningData = await getMiningData();
        if (!miningData) throw new Error('Failed to get mining data');

        document.getElementById('lastBlock').textContent = miningData.last_block;
        const difference = new Date() - new Date(miningData.last_block_time * 1000);
        const minutes = Math.round(difference / 60000);

        document.getElementById('minutes').textContent = pluralize(minutes, 'minute');
        let blocks = (minutes - (minutes % 10)) / 10;
        blocks = blocks === 0 ? 1 : blocks;
        document.getElementById('minutes').title = pluralize(blocks, 'block');

        document.getElementById('attempts').textContent = miningData.attempts;

        const blockSubsidyHalvingInterval = 210_000;
        document.getElementById('subsidy').textContent = formatAmount(miningData.subsidy) + ' $SATOSHI';
        document.getElementById('subsidy').title =
            miningData.last_block % blockSubsidyHalvingInterval === 0
                ? 'Last block'
                : `${pluralize(blockSubsidyHalvingInterval - (miningData.last_block % blockSubsidyHalvingInterval), 'block')} to next halving`;

        document.getElementById('probability').textContent = miningData.probability + '%';
    } catch (e) {
        console.error('Error updating data:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTonConnect();
    updateStats();
});
