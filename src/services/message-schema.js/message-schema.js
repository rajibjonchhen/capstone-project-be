import mongoose from "mongoose";

const {model, Schema}  = mongoose

const MessageSchema = new Schema ({
    text : {type:String},
    sender : {type:Schema.Types.ObjectId, rel:"Users"},
    product : {type:Schema.Types.ObjectId, rel:"Products"},
    meeting : {type:String},
    place : {type:String},
    markedAsRead : {type:Boolean, default:false}
},{
    timestamps:true
})

export default model("Messages", MessageSchema)