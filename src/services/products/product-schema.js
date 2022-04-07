import mongoose from "mongoose";

const {model, Schema} = mongoose

const ProductSchema = new Schema ({
    images : [{type : String, default:""}],
    creator : {type : Schema.Types.ObjectId, ref:"Users"},
    title : {type : String, required : [true, "the title is required"]},
    category : {type : String, required : [true, "category is required"]},
    description	: {type : String, required : [true, "a short description is required"]},    
    Likes	: [{type : Schema.Types.ObjectId, ref:"Users"}],
    criteria : {default:false},
    agreement : {type:String},
    reqInvestment : {type : Number, default:"after negotiation"}
},{
    timestamps:true
})

export default model("Products", ProductSchema)