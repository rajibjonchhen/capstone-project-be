import mongoose from "mongoose";

const {model, Schema} = mongoose

const ChatMessageSchema = new Schema ({
    title:{type:String},
    text : {type:String},
    meeting : {type:String},
    place : {type:String},
    markedAsRead : {type:Boolean, default:false},
    sender : {type:Schema.Types.ObjectId, rel:"Users"}
},{
    timestamps:true
})

export default model("ChatMessages",ChatMessageSchema)