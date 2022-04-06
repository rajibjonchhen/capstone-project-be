

import express from "express";
import createError from "http-errors";
import { JWTAuthMW } from "../authentication/JWTAuthMW.js";
import { authenticateUser } from "../authentication/tools.js";
import PostModel from "./post-schema.js"
import { adminMW } from "../authentication/adminMW.js";



const postsRouter = express.Router()


/***************************  admin only routes ************************/

/***************************  get post by id route ************************/
.get("/:id",  JWTAuthMW, adminMW, async(req, res, next) => {
    try {
        if(req.user.role==="admin"){
            console.log("admin search only")
            const post = await PostModel.findById(req.params.id)
            res.send({post})
        }
    } catch (error) {
        next(createError(error))
    }
})

/***************************  edit post by id route ************************/
.put("/:id",  JWTAuthMW, adminMW, async(req, res, next) => {
    try {
        if(req.user.role==="admin"){
            const updatedPost = await PostModel.findByIdAndUpdate(req.params.id, req.body,{new:true})
            res.send({post : updatedPost})
        }
    } catch (error) {
        next(createError(error))
    }
})

/***************************  delete Post by id route ************************/
.delete("/:id",  JWTAuthMW, adminMW, async(req, res, next) => {
    try {
        if(req.user.role==="admin"){
            await PostModel.findByIdAndDelete(req.params.id)
            res.send()
        }
    } catch (error) {
        next(createError(error))
    }
})



/***************************  Post routes ************************/

/***************************  register new Post ***********************/
.post("/",JWTAuthMW, async(req, res, next) => {
    try {
        const newPost = new PostModel({...req.body, postedBy: req.user._id})
        const {_id} = await  newPost.save()
        if(_id){
            res.send({_id})
        } else {

            next(createError(401, "bad request missing field could not create Post"))
        }
    } catch (error) {
        next(createError(error))
    }
})


/*****************************  get all Posts *************************/
.get("/", JWTAuthMW, async(req, res, next) => {
    try {
            const posts = await PostModel.find()
            res.send({posts})
    } catch (error) {
        next(createError(error))
    }
})


/*****************************  get my detail *************************/
.get("/me/all",  JWTAuthMW, async(req, res, next) => {
    try {
        if(req.user){
            const posts = await PostModel.find({postedBy: req.user._id})
            res.send({posts})
        }
    } catch (error) {
        next(createError(error))
    }
})

/*****************************  get my detail *************************/
.get("/me/:id",  JWTAuthMW, async(req, res, next) => {
    try {
        if(req.user){
            const post = await PostModel.findById(req.params.id)
            res.send({post})
        }
    } catch (error) {
        next(createError(error))
    }
})


/****************************  edit my post *************************/
.put("/me/:id",  JWTAuthMW, async(req, res, next) => {
    try {
        const post = await PostModel.findById(req.params.id)
        if(post){
            console.log("post.postedBy -", post.postedBy)
            console.log("post.postedBy.toObject", post.postedBy.toString())
            console.log("req.user._id", req.user._id)
            if(post.postedBy.toString() === req.user._id){
                const updatedPost = await PostModel.findByIdAndUpdate(req.params.id, req.body, {new: true})
                res.send({updatedPost})
            }else{
                console.log("not authorised to update this post");
                next(createError(401, {message:"not authorised to update this post"}))
            }
        } else {
            console.log("post not found");
            next(createError(404, {message:"post not found"}))
        }
    } catch (error) {
        next(createError(error))
    }
})


/***************************  delete my post ************************/
.delete("/me/:id",  JWTAuthMW, async(req, res, next) => {
    try {
        if(req.user){
            const post = await PostModel.findById(req.params.id)
            if(post){
                if(post.postedBy.toString === req.user._id){

                    await PostModel.findByIdAndDelete(req.params.id)
                    res.send()
                }else {
                    next(createError(401, {message:"not authorised to delete this post"}))
                }
            }else{
                next(createError(404, {message:"post not found"}))
            }
        }
    } catch (error) {
        next(createError(error))
    }
})


export default postsRouter