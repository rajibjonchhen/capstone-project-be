import mongoose from "mongoose";

const {model, Schema} = mongoose
const CommentSchema = Schema({
    comment:{type:String},
    commentedBy : {type:Schema.Types.ObjectId, ref: "Users"},
    post : {type:Schema.Types.ObjectId, ref: "Posts"},
},{
    timestamps: true
})


export default model("Comments", CommentSchema)