import "@stdlib/deploy";
import "@stdlib/ownable";
import "./traits/Jetton.tact";
import "./helpers/subsidy.tact";

message F {
    receiver: Address;
}

contract Satoshi with OwnableTransferable, Jetton, Deployable {
    // https://github.com/bitcoin/bitcoin/blob/63d0b930f821132badd804822a46232a5f98bbef/src/consensus/amount.h#L26
    max_supply: Int as coins = ton("21000000");
    mintable: Bool = true;
    block: Int as uint32;
    time: Int as uint32;
    totalSupply: Int as coins;
    owner: Address;
    content: Cell;

    init() {
        self.block = 0;
        self.time = now();
        self.totalSupply = 0;
        self.owner = sender();
        self.content = beginCell().storeUint(0, 64).endCell(); // TODO: change to real content
    }

    receive(msg: F) {
        // Check chance
        let chance: Bool = random(0, 101) > 50; // TODO: change to real chance
        require(chance, "Mining failed");

        // Send the money to the receiver
        let blocksCount = 1; // TODO: change to sum of missed blocks
        self.block += blocksCount;
        self.time = now();
        let amount = getBlockSubsidy(self.block) * blocksCount;
        self.mint(msg.receiver, amount, myAddress());

        // Notify the caller that the receiver was executed and forward remaining value back
        let body: StringBuilder = beginString();
        body.append("Block #");
        body.append(self.block.toString());
        body.append(" mined successfully!");
        self.notify(body.toString().asComment());
    }

    get fun get_params(): MiningParams {
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
