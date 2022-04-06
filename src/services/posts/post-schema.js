import mongoose from "mongoose";

const {model, Schema} = mongoose


const PostSchema = new Schema({
    content : {type:String, required:true},
    postedBy : {type:Schema.Types.ObjectId, ref: "Users"},
    likes : [{type: Schema.Types.ObjectId, ref:"Users"}],
    comments : [{type: Schema.Types.ObjectId, ref:"Comments", required: true}],
                
},{
    timestamps: true
})

export default model("Posts", PostSchema)