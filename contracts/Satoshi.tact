import "@stdlib/deploy";
import "@stdlib/ownable";
import "./traits/Jetton.tact";
import "./traits/Probability.tact";
import "./helpers/subsidy.tact";
import "./helpers/messages.tact";

contract Satoshi with Jetton, Probability, OwnableTransferable, Deployable {
    // https://github.com/bitcoin/bitcoin/blob/63d0b930f821132badd804822a46232a5f98bbef/src/consensus/amount.h#L26
    max_supply: Int as coins = ton("21000000");
    mintable: Bool = true;
    totalSupply: Int as coins;
    owner: Address;
    content: Cell;

    // Mining params
    block: Int as uint32;
    time: Int as uint32;
    attempts: Int as uint32;

    init() {
        self.block = 0;
        self.time = now();
        self.totalSupply = 0;
        self.attempts = 0;
        self.owner = sender();
        self.content = beginCell().storeUint(0, 64).endCell(); // TODO: change to real content
    }

    receive(msg: Mine) {
        self.mine(msg.receiver);
    }

    receive() {
        self.mine(sender());
    }

    fun mine(receiver: Address) {
        self.attempts += 1;

        // Check chance probability
        let randomValue: Int = random(1, 101);
        let minutesSinceLastBlock: Int = (now() - self.time) / 60;
        let probability: Int = self.getProbability(minutesSinceLastBlock, self.attempts);
        require(probability >= randomValue, "Mining failed");

        // Update params and send the money to the receiver
        let blocksMined = (minutesSinceLastBlock / 10) > 1 ? (minutesSinceLastBlock / 10) : 1;
        self.block += blocksMined;
        self.time = now();
        self.attempts = 0;
        let amount = getBlockSubsidy(self.block) * blocksMined;
        self.mint(receiver, amount, myAddress());

        // Notify the caller that the receiver was executed and forward remaining value back
        let body: StringBuilder = beginString();
        body.append("Block #");
        body.append(self.block.toString());
        body.append(" mined successfully!");
        self.notify(body.toString().asComment());
    }

    get fun get_mining_data(): MiningParams {
        return MiningParams{
            last_block: self.block,
            last_block_time: self.time,
            current_subsidy: getBlockSubsidy(self.block),
        };
    }
}

struct MiningParams {
    last_block: Int as uint32;
    last_block_time: Int as uint32;
    current_subsidy: Int as coins;
}
