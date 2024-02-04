const { Web3 } = require('web3');

const alchemyHttp = "https://eth-mainnet.g.alchemy.com/v2/kHoKc8WvRtTDgaM8VIq_wCJ1LlMKDb7a"
const alchemyWss = "wss://eth-mainnet.g.alchemy.com/v2/kHoKc8WvRtTDgaM8VIq_wCJ1LlMKDb7a"
const web3 = new Web3(createWebSocketProvider());
web3.config.defaultChain = 1

function createWebSocketProvider() {
    const provider = new Web3.providers.WebsocketProvider(alchemyWss);

    provider.on('connect', function () {
        console.log('WS Connected');
        // subscribeToPendingTransactions();
        subscribeToNewBlocks();
    });

    provider.on('error', e => console.error('WS Error', e));
    provider.on('end', e => {
        console.error('WS End', e);
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            web3.setProvider(createWebSocketProvider());
        }, 10000);
    });

    return provider;
}


async function subscribeToPendingTransactions() {
    (await web3.eth.subscribe('pendingTransactions')).on('data', async (tx) => {
        try {
            const transaction = await web3.eth.getTransaction(tx);
            console.log(`New Transaction ${transaction.hash} ==>`, transaction)
        } catch (error) {
            console.error('Error fetching pending transactions:', error);
        }
    });
}


async function subscribeToNewBlocks() {
    (await web3.eth.subscribe('newBlockHeaders')).on('data', async (blockHeader) => {
        try {
            const block = await web3.eth.getBlock(blockHeader.number);
            console.log(`New Block ${block.number} Received ==> `, block)

            if (block.transactions.length) {
                console.log(`Block has ${block.transactions.length} Transactions`);
                const transaction = await web3.eth.getTransaction(block.transactions[0]);
                console.log(`First Transaction ${transaction.hash} ==>`, transaction)
            } else {
                console.log(`Block ${block.number} has no transactions.`);
            }
        } catch (error) {
            console.error('Error fetching block details:', error);
        }
    });
}