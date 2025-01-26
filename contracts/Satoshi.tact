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
    total_supply: Int as coins;
    owner: Address;
    content: Cell;

    // Mining params
    block: Int as uint32;
    time: Int as uint32;
    attempts: Int as uint16;

    init() {
        self.block = 0;
        self.time = now();
        self.total_supply = 0;
        self.attempts = 0;
        self.owner = sender();
        self.content = beginCell().storeUint(0, 64).endCell(); // TODO: change to real content
    }

    receive(msg: Mine) {
        self.mine(msg.receiver);
    }

    receive("F") {
        self.mine(sender());
    }

    fun mine(receiver: Address) {
        require(context().value >= ton("0.06"), "Insufficient value");
        self.attempts += 1;
        let randomValue: Int = random(0, 101); // max value not included
        let minutesSinceLastBlock: Int = (now() - self.time) / 60;
        let probability: Int = self.calculateBlockProbability(minutesSinceLastBlock, self.attempts);
        if (probability - randomValue < 0) {
            self.notify("Mining failed.".asComment());
            return;
        }
        // => probability - randomValue >= 0
        let blocksToMine = (minutesSinceLastBlock / 10) > 1 ? (minutesSinceLastBlock / 10) : 1;
        if (blocksToMine > 1) {
            let halvings = blocksToMine / blockSubsidyHalvingInterval;
            if (halvings > 0) {
                blocksToMine += halvings * blockSubsidyHalvingInterval;
                blocksToMine += blockSubsidyHalvingInterval - self.block;
            }
        }
        let amount = getBlockSubsidy(self.block) * blocksToMine;
        self.block += blocksToMine;
        self.time = now();
        self.attempts = 0;
        self.mint(sender(), receiver, amount, self.block);
    }

    get fun get_mining_data(): MiningParams {
        return MiningParams{
            last_block: self.block,
            last_block_time: self.time,
            attempts: self.attempts,
            subsidy: getBlockSubsidy(self.block+1),
            probability: self.get_mining_probability(
                (now() - self.time) / 60,
                self.attempts + 1
            ),
        };
    }

    get fun get_mining_probability(minutes: Int, attempts: Int): Int {
        return self.calculateBlockProbability(minutes, attempts);
    }
}
