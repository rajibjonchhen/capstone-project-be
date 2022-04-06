import mongoose from "mongoose";

const {model, Schema} = mongoose
const CommentSchema = new Schema({
    comment:{type:String},
    commentedBy : {type:Schema.Types.ObjectId, ref: "User"},
},{

    timestamps: true
})

const PostSchema = new Schema({
    content : {type:String, required:true},
    postedBy : {type:Schema.Types.ObjectId, ref: "User"},
    likes : [{type: Schema.Types.ObjectId, ref:"User"}],
    comments : [{type:CommentSchema}]
},{
    timestamps: true
})

export default model("Posts", PostSchema)