import mongoose from "mongoose";

const {model, Schema} = mongoose
const PostSchema = new Schema({
    content : {type:String, required:true},
    postedBy : {type:Schema.Types.ObjectId, ref: "User"},
    likes : [{type: Schema.Types.ObjectId, ref:"User"}],
    comments : [{
        comment:{type:String},
        commentedBy : {type:Schema.Types.ObjectId, ref: "User"},
    }]
},{
    timestamps: true
})

export default model("Posts", PostSchema)