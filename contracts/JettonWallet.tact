import "./helpers/messages.tact";
import "./helpers/constants.tact";

asm fun myCode(): Cell { MYCODE }

@interface("org.ton.jetton.wallet")
contract JettonWallet with WalletExitcodes, GasConstants {
    const minTonsForStorage: Int = ton("0.01");
    const gasConsumption: Int = ton("0.01");

    balance: Int as coins;
    owner: Address;
    master: Address;

    init(master: Address, owner: Address) {
        self.balance = 0;
        self.owner = owner;
        self.master = master;
    }

    receive(msg: TokenTransfer) { // 0xf8a7ea5
        let ctx: Context = context(); // Check sender
        nativeThrowUnless(self.IncorrectSender, sender() == self.owner);

        // Gas checks
        let fwdFee: Int = ctx.readForwardFee() + ctx.readForwardFee();
        let totalFees: Int = 2 * self.gasConsumption + self.minTonsForStorage + fwdFee;
        nativeThrowUnless(self.UnsufficientAmountOfTonAttached, ctx.value > totalFees);

        // Update balance
        self.balance -= msg.amount;
        nativeThrowUnless(self.IncorrectBalanceAfrerSend, self.balance >= 0);

        let init: StateInit = initOf JettonWallet(self.master, msg.destination);
        let walletAddress: Address = contractAddress(init);
        send(SendParameters{
                to: walletAddress,
                value: 0,
                mode: SendRemainingValue,
                bounce: false,
                body: TokenTransferInternal{
                    query_id: msg.query_id,
                    amount: msg.amount,
                    from: self.owner,
                    response_destination: msg.response_destination,
                    forward_ton_amount: msg.forward_ton_amount,
                    forward_payload: msg.forward_payload
                }.toCell(),
                code: init.code,
                data: init.data
            });
    }

    receive(msg: TokenTransferInternal) { // 0x178d4519
        if (sender() != self.master) {
            let init: StateInit = initOf JettonWallet(self.master, msg.from);
            nativeThrowUnless(self.IncorrectSenderInternal, contractAddress(init) == sender());
        }

        // Update balance
        self.balance = self.balance + msg.amount;
        nativeThrowUnless(self.IncorrectBalanceAfrerSend, self.balance >= 0);

        // Get value for gas
        let ctx: Context = context();
        let msgValue: Int = self.msgValue(ctx.value);
        let fwdFee: Int = ctx.readForwardFee();
        msgValue = msgValue - msg.forward_ton_amount - fwdFee;

         // 0x7362d09c - notify the new owner of JettonToken that the transfer is complete
        if (msg.forward_ton_amount > 0) {
            send(SendParameters{
                to: self.owner,
                value: msg.forward_ton_amount,
                mode: SendPayGasSeparately + SendIgnoreErrors,
                bounce: false,
                body: TokenNotification {
                    query_id: msg.query_id,
                    amount: msg.amount,
                    from: msg.from,
                    forward_payload: msg.forward_payload
                }.toCell()
            });
        }

        // 0xd53276db -- Cashback to the original Sender
        if (msg.response_destination != null) {
            send(SendParameters {
                to: msg.response_destination!!,
                value: msgValue,
                bounce: false,
                body: TokenExcesses {
                    query_id: msg.query_id
                }.toCell(),
                mode: SendIgnoreErrors
            });
        }
    }

    receive(msg: TokenBurn) {
        let ctx: Context = context();
        nativeThrowUnless(self.IncorrectSender, sender() == self.owner);

        self.balance -= msg.amount; // Update balance
        //Commented require() here because self.balance and msg.amount are coins, so they are unsigned
        //require(self.balance >= 0, "Invalid balance");

        let fwdFee: Int = ctx.readForwardFee(); // Gas checks

        // This is minimal possible amount of TONs for attached.
        nativeThrowUnless(self.UnsufficientAmountOfTonForBurn, ctx.value > self.gasForBurn);

        // Burn tokens
        send(SendParameters{
            to: self.master,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: TokenBurnNotification{
                query_id: msg.query_id,
                amount: msg.amount,
                sender: self.owner,
                response_destination: self.owner
            }.toCell()
        });
    }

    receive("withdraw"){
        nativeThrowUnless(self.IncorrectSender, sender() == self.owner);
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: 0,
            mode: SendRemainingBalance + SendIgnoreErrors
        });
    }

    get fun msgValue(value: Int): Int {
        let tonBalanceBeforeMsg: Int = myBalance() - value;
        let storageFee: Int = self.minTonsForStorage - min(tonBalanceBeforeMsg, self.minTonsForStorage);
        value = value - (storageFee + self.gasConsumption);
        return value;
    }

    bounced(src: bounced<TokenTransferInternal>) {
        self.balance += self.balance + src.amount;
    }

    bounced(src: bounced<TokenBurnNotification>) {
        self.balance += src.amount;
    }

    get fun get_wallet_data(): JettonWalletData {
        return JettonWalletData{
            balance: self.balance,
            owner: self.owner,
            master: self.master,
            code: myCode()
        };
    }
}
