const mongoose=require('mongoose');
const url='mongodb://localhost:27017/stellar';
const {Schema}=mongoose;
const txnSchema=new Schema({
    blockid:String,
    amount:String,
    owner:{
        type:String,
        default:""
    },
    hash:String
})
const txnModel=mongoose.model('txn',txnSchema);
const connectToMongoose=async()=>{
    await mongoose.connect(url)
    
        console.log("connectd to mongoose");

}
module.exports={connectToMongoose,txnModel}