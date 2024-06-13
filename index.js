const express=require('express')
var StellarSdk = require("stellar-sdk");
const app=express();
// const mongoose=require('mongoose');
// const {connectToMongoose,txnModel}=require('./connecToDB');

app.use(express.json())
app.post('/buy-tokens',async(req,res)=>{
    var server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
    const body=req.body;
    console.log(body)
    var buyerKeys = StellarSdk.Keypair.fromSecret(body.secret);

    var newDollar=new StellarSdk.Asset("NewDollar","GA2XMHHFMN3NDSG5BLQYTDIYFYHBRQFYJ4DZKKBI7JDVIVPIVHVNA2ND");
    server.loadAccount(buyerKeys.publicKey())
  .then(function (buyer) {
    var transaction = new StellarSdk.TransactionBuilder(buyer, {
      fee: 100,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset: newDollar,
          limit: "1000",
        }),
      )
      .setTimeout(100)
      .build();
    transaction.sign(buyerKeys);
    return server.submitTransaction(transaction);
  })
  .then(console.log)
  .then(function () {
    // Create buy offer
    return server.loadAccount(buyerKeys.publicKey());
  })
  .then(function (buyer) {
    var transaction = new StellarSdk.TransactionBuilder(buyer, {
      fee: 100,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.manageBuyOffer({
          selling: StellarSdk.Asset.native(),
          buying: newDollar,
          buyAmount: "10", // Amount of NewDollar to buy
          price: "1", // Price in XLM per NewDollar
        }),
      )
      .setTimeout(100)
      .build();
    transaction.sign(buyerKeys);
    return server.submitTransaction(transaction);
  })
  .then(console.log)
  .catch(function (error) {
    console.error("Error!", error);
  });
    res.send("done");
})
//route for block buying
app.post('/buy-block',async(req,res)=>{
 
  const {secret,blockID,amount}=req.body;
  const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
  const userKeypair = StellarSdk.Keypair.fromSecret(secret);
  const userPublicKey=userKeypair.publicKey();
  try {
    const userAccount=await server.loadAccount(userPublicKey);
    const xlmBalance = parseFloat(userAccount.balances.find(b => b.asset_type === 'native').balance);
    const requiredXlm = StellarSdk.BASE_FEE * 2; // Assuming a safety margin, multiply by 2
    if (xlmBalance < requiredXlm) {
        throw new Error(`Insufficient XLM balance (${xlmBalance} XLM) to cover the transaction fee.`);
    }
    const newDollarAsset = new StellarSdk.Asset('NewDollar','GA2XMHHFMN3NDSG5BLQYTDIYFYHBRQFYJ4DZKKBI7JDVIVPIVHVNA2ND');
    const balance = userAccount.balances.find(b => b.asset_code === 'NewDollar' && b.asset_issuer === 'GA2XMHHFMN3NDSG5BLQYTDIYFYHBRQFYJ4DZKKBI7JDVIVPIVHVNA2ND');
    // const blockidString=blockID
    if (!balance || parseFloat(balance.balance) < parseFloat(amount)) {
        throw new Error(`Insufficient balance of NewDollar`);
    }
    const transaction=new StellarSdk.TransactionBuilder(userAccount,{
      fee:StellarSdk.BASE_FEE,
      networkPassphrase:StellarSdk.Networks.TESTNET,
      sequence:userAccount.sequenceNumber()
    })
    .addOperation(StellarSdk.Operation.payment({
      destination:'GA2XMHHFMN3NDSG5BLQYTDIYFYHBRQFYJ4DZKKBI7JDVIVPIVHVNA2ND',
      asset:newDollarAsset,
      amount:amount
    }))

    .addMemo(StellarSdk.Memo.text(`Allocated block ID: ${blockID}`))
    .setTimeout(30)
    .build();
    transaction.sign(userKeypair);
    const transactionResult = await server.submitTransaction(transaction);
    
    // .then(console.log("Transaction saved in DB"))
    console.log('Transaction successful:', transactionResult);
    res.json({'Transaction successful:': transactionResult});
  } catch (error) {
    res.status(500).send('Transaction failed: ' + error.message);    // console.error('Transaction failed:', error.response?.data || error.message);
    throw error;
  }
})
app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})