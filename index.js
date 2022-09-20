// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        236,  69, 216, 102, 166, 134, 255, 238, 77,  88,  36,
        150,  40, 104, 112, 165, 125,   6, 214, 79, 253,  11,
        142, 201, 217,  66, 228, 184,  90, 144, 10,  44,  37,
         57, 107,  67,  84,  89,  13, 151, 189, 61, 212, 116,
         50, 203, 151, 165,  59, 155,  93,   2, 51,   4, 206,
        233, 213, 234, 102, 115,  97, 237, 234, 43
      ]
);

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();


    // Get Sender Balance and Print off the initial balance
    const getWalletBalance = async(publicAddress) => {
        try {
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const myWallet = new PublicKey(publicAddress);
            const walletBalance = await connection.getBalance(
                myWallet
            );
            return walletBalance;
            
        } catch (error) {
            console.error(error);
        }
    }
    console.log("Sender. Before Airdrop: ", await getWalletBalance(from.publicKey));
    console.log("Receiver. Before Airdrop: ", await getWalletBalance(to.publicKey));

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );



    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    console.log("Sender. After Airdrop: ", await getWalletBalance(from.publicKey));
    console.log("Receiver. After Airdrop: ", await getWalletBalance(to.publicKey));

    let senderHalfBalance = await getWalletBalance(from.publicKey) * 1/2
    console.log("Retrieving half the amount of the sender's balance in lamports....", senderHalfBalance);

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: senderHalfBalance
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);

    console.log("Sender. After transaction", await getWalletBalance(from.publicKey));
    console.log("Receiver. After transaction", await getWalletBalance(to.publicKey));
}

// Making a keypair and getting the private key
// const newPair = Keypair.generate();
// console.log(newPair);

transferSol();

