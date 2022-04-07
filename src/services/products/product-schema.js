import mongoose from "mongoose";

const {model, Schema} = mongoose

const ProductSchema = new Schema ({
    images : [{type : String, default:"https://res.cloudinary.com/dai5duzoj/image/upload/v1649324811/creators-space/bivntlxrift19n90h4xj.png"}],
    creator : {type : Schema.Types.ObjectId, ref:"Users"},
    title : {type : String, required : [true, "the title is required"]},
    category : {type : String, enum:["Business Plan", "Story", "Novel", "Song", "Poem", "Movie", "Web Template" ], required : [true, "category is required"]},
    description	: {type : String, required : [true, "a short description is required"]},    
    Likes	: [{type : Schema.Types.ObjectId, ref:"Users"}],
    criteria : {default:false},
    agreement : {type:String},
    reqInvestment : {type : Number}
},{
    timestamps:true
})

export default model("Products", ProductSchema)