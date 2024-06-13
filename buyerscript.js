  var StellarSdk = require("stellar-sdk");
  var server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

  // Buyer's keypair
  var buyerKeys = StellarSdk.Keypair.fromSecret("SBNLB64G3JN3WMEMJYOX5AJLA4DNTZYVHV5WWOWSXFYTJ5UK25BG467M");

  // Asset to buy
  var NewDollar = new StellarSdk.Asset("NewDollar","GA2XMHHFMN3NDSG5BLQYTDIYFYHBRQFYJ4DZKKBI7JDVIVPIVHVNA2ND");

  // Create trustline to the asset
  server.loadAccount(buyerKeys.publicKey())
    .then(function (buyer) {
      var transaction = new StellarSdk.TransactionBuilder(buyer, {
        fee: 100,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.changeTrust({
            asset: NewDollar,
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
            buying: NewDollar,
            buyAmount: "100", // Amount of NewDollar to buy
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
