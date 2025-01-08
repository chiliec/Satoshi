import "../helpers/messages.tact";
import "../SatoshiWallet.tact";
import "@stdlib/ownable";

struct JettonData {
    totalSupply: Int;
    mintable: Bool;
    owner: Address;
    content: Cell;
    walletCode: Cell;
}

@interface("org.ton.jetton.master")
trait Jetton with OwnableTransferable {

    totalSupply: Int;
    mintable: Bool;
    owner: Address;
    content: Cell;

    max_supply: Int; // This is not in the TEP-74 interface

    receive(msg: TokenUpdateContent) {
        self.requireOwner();                // Allow changing content only by owner
        self.content = msg.content;         // Update content
    }

    receive(msg: TokenBurnNotification) {
        self.requireWallet(msg.owner);                     // Check wallet
        self.totalSupply = self.totalSupply - msg.amount; // Update supply

        if (msg.response_destination != null) { // Cashback
            send(SendParameters{
                to: msg.response_destination!!,
                value: 0,
                bounce: false,
                mode: SendRemainingValue + SendIgnoreErrors,
                body: TokenExcesses{
                    queryId: msg.queryId
                }.toCell()
            });
        }
    }

    // @from The Address receive remaining value after minting
    // @to The Address receive the Jetton token after minting
    // @amount The amount of Jetton token being minted
    // @comment The comment to be sent in the message body
    fun mint(from: Address, to: Address, amount: Int, comment: String) {
        require(self.totalSupply + amount <= self.max_supply, "Can't mint more than max supply");
        self.totalSupply = self.totalSupply + amount;

        let winit: StateInit = self.getJettonWalletInit(to);
        send(SendParameters{
            to: contractAddress(winit),
            value: 0,
            bounce: false,
            mode: SendRemainingValue | SendIgnoreErrors,
            body: TokenTransferInternal{
                queryId: 0,
                amount: amount,
                from: myAddress(),
                response_destination: from,
                forward_ton_amount: 0,
                forward_payload: comment.asSlice()
            }.toCell(),
            code: winit.code,
            data: winit.data
        });
    }

    receive("withdraw"){
        require(sender() == self.owner, "Only owner is allowed to withdraw");
        send(SendParameters{to: self.owner, value: 0, mode: SendRemainingBalance | SendIgnoreErrors});
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
            totalSupply: self.totalSupply,
            mintable: self.mintable,
            owner: self.owner,
            content: self.content,
            walletCode: code
        };
    }

    get fun get_wallet_address(owner: Address): Address {
        let winit: StateInit = self.getJettonWalletInit(owner);
        return contractAddress(winit);
    }
}
