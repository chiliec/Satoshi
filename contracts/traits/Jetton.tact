import "../helpers/messages.tact";
import "../SatoshiWallet.tact";
import "@stdlib/ownable";

@interface("org.ton.jetton.master")
trait Jetton with OwnableTransferable {
    const minTonsForStorage: Int = ton("0.06");

    total_supply: Int;
    mintable: Bool;
    owner: Address;
    content: Cell;

    max_supply: Int; // This is not in the TEP-74 interface

    receive(msg: TokenUpdateContent) {
        self.requireOwner();                // Allow changing content only by owner
        self.content = msg.content;         // Update content
    }

    receive(msg: TokenBurnNotification) {
        self.requireWallet(msg.sender);                     // Check wallet
        self.total_supply = self.total_supply - msg.amount; // Update supply

        if (msg.response_destination != null) { // Cashback
            send(SendParameters{
                to: msg.response_destination!!,
                value: 0,
                bounce: false,
                mode: SendRemainingValue + SendIgnoreErrors,
                body: TokenExcesses{
                    query_id: msg.query_id
                }.toCell()
            });
        }
    }

    // https://github.com/ton-blockchain/TEPs/blob/master/text/0089-jetton-wallet-discovery.md
    receive(msg: ProvideWalletAddress){
        // 0x2c76b973
        require(context().value >= ton("0.0061"), "Insufficient gas");
        let init: StateInit = initOf SatoshiWallet(myAddress(), msg.owner_address);
        if (msg.include_address) {
            send(SendParameters{
                    to: sender(),
                    value: 0,
                    mode: SendRemainingValue,
                    body: TakeWalletAddress{
                        query_id: msg.query_id,
                        wallet_address: contractAddress(init),
                        owner_address: beginCell().storeBool(true).storeAddress(msg.owner_address).endCell().asSlice()
                    }.toCell()
                }
            );
        } else {
            send(SendParameters{
                    to: sender(),
                    value: 0,
                    mode: SendRemainingValue,
                    body: TakeWalletAddress{ // 0xd1735400
                        query_id: msg.query_id,
                        wallet_address: contractAddress(init),
                        owner_address: beginCell().storeBool(false).endCell().asSlice()
                    }.toCell()
                }
            );
        }
    }

    // @from The Address receive remaining value after minting
    // @to The Address receive the Jetton token after minting
    // @amount The amount of Jetton token being minted
    // @block The block number
    fun mint(from: Address, to: Address, amount: Int, block: Int) {
        require(self.total_supply + amount <= self.max_supply, "Can't mint more than max supply");
        self.total_supply = self.total_supply + amount;

        let comment = beginString()
            .concat("Block #")
            .concat(block.toString())
            .concat(" mined.")
            .toString();

        let payload = beginCell()
            .storeUint(0, 33)
            .storeSlice(comment.asSlice())
            .asSlice();

        let winit: StateInit = self.getJettonWalletInit(to);

        // Calculate costs
        let ctx: Context = context();
        let tonBalanceBeforeMsg: Int = myBalance() - ctx.value;
        let storageFee: Int = max(0, self.minTonsForStorage - min(tonBalanceBeforeMsg, self.minTonsForStorage));
        let fwdAmount: Int = 1;
        let final: Int = ctx.value - fwdAmount - storageFee - ctx.readForwardFee();
        require(final >= 0, "Insufficient funds for operation");

        send(SendParameters{
            to: contractAddress(winit),
            value: final,
            bounce: false,
            mode: SendPayGasSeparately,
            body: TokenTransferInternal{
                query_id: block,
                amount: amount,
                from: myAddress(),
                response_destination: from,
                forward_ton_amount: fwdAmount,
                forward_payload: payload
            }.toCell(),
            code: winit.code,
            data: winit.data
        });
    }

    fun requireWallet(owner: Address) {
        let ctx: Context = context();
        let winit: StateInit = self.getJettonWalletInit(owner);
        require(contractAddress(winit) == ctx.sender, "Invalid sender");
    }

    virtual fun getJettonWalletInit(address: Address): StateInit {
        return initOf SatoshiWallet(myAddress(), address);
    }

    // ====== Get Methods ====== //
    get fun get_jetton_data(): JettonData {
        let code: Cell = self.getJettonWalletInit(myAddress()).code;
        return JettonData{
            total_supply: self.total_supply,
            mintable: self.mintable,
            owner: self.owner,
            content: self.content,
            wallet_code: code
        };
    }

    get fun get_wallet_address(owner: Address): Address {
        let winit: StateInit = self.getJettonWalletInit(owner);
        return contractAddress(winit);
    }
}
