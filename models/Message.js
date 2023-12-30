const mongoose   = require('mongoose')
const MessageSchema = mongoose.Schema({
    
    user:{
        type : mongoose.Types.ObjectId,
        ref : "users",
        required : true
    },
    
    type:{
        type:String,
        enum:["sent","recieved"]
    },
    message:{
        type:String
    },
    
    
    createdAt:{
        type:Number,
        default:Date.now()
    }
    

})
mongoose.model('messages',MessageSchema)