import mongoose from "mongoose";

const {model, Schema}  = mongoose

const ChatSchema = new Schema ({
    members : [{type:Schema.Types.ObjectId, ref:"Users"}],
    messages : [{type:Schema.Types.ObjectId, ref:"ChatMessages"}],
},{
    timestamps:true
})

export default model("Chats", ChatSchema)