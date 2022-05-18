import mongoose from "mongoose";

const {model, Schema} = mongoose

const ChatMessageSchema = new Schema ({
    title:{type:String},
    text : {type:String},
    meeting : {type:String},
    place : {type:String},
    markedAsRead : {type:Boolean, default:false},
    sender : {type:Schema.Types.ObjectId, ref:"Users"},
    recipient : {type:Schema.Types.ObjectId, ref:"Users"},
    chatId : {type:Schema.Types.ObjectId, ref:"Chats"},
    productId : {type:Schema.Types.ObjectId, ref:"Products"}
},{
    timestamps:true
})

export default model("ChatMessages",ChatMessageSchema)