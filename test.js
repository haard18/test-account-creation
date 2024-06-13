var StellarSdk = require("stellar-sdk");
var server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
var buyerKeys = StellarSdk.Keypair.fromSecret("SAS53FAYJJMC7OOS2UIK3SIFEKND6JEGZ7FHQWOMYD5FHUDXMA77JZJU");
console.log(buyerKeys.publicKey())        
const userAccount = await server.loadAccount(userPublicKey);
