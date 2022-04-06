

import express from "express";
import createHttpError from "http-errors";
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
            const post = await PostModel.findById(req.params.id)
            res.send({post})
        }
    } catch (error) {
        next(createHttpError(error))
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
        next(createHttpError(error))
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
        next(createHttpError(error))
    }
})



/***************************  Post routes ************************/

/***************************  register new Post ***********************/
.post("/",JWTAuthMW, async(req, res, next) => {
    try {
        const newPost = new PostModel(req.body)
        const {_id} = await  newPost.save()
        if(_id){
            res.send({_id})
        } else {

            next(createError(401, "bad request missing field could not create Post"))
        }
    } catch (error) {
        next(createHttpError(error))
    }
})


/*****************************  get all Posts *************************/
.get("/", JWTAuthMW, async(req, res, next) => {
    try {
            const posts = await PostModel.find()
            res.send({posts})
    } catch (error) {
        next(createHttpError(error))
    }
})


/*****************************  get my detail *************************/
.get("/me",  JWTAuthMW, async(req, res, next) => {
    try {
        if(req.user){
            const posts = await PostModel.find({postedBy:req.user._id})
            res.send({posts})
        }
    } catch (error) {
        next(createHttpError(error))
    }
})


/****************************  edit my post *************************/
.put("/me/:id",  JWTAuthMW, async(req, res, next) => {
    try {
        if(req.user){
            const post = await PostModel.findByIdAndUpdate(req.post._id, req.body, {new: true})
            if(post){
                res.send({post})
            }else{
                next(createHttpError(401, "not authorised to update this post"))
            }
        }
    } catch (error) {
        next(createHttpError(error))
    }
})


/***************************  delete my post ************************/
.delete("/me/:id",  JWTAuthMW, async(req, res, next) => {
    try {
        if(req.user){
            const post = await PostModel.findById(req.post._id)
            if(post){
                await PostModel.findByIdAndDelete(req.post._id)
                res.send()
            }else{
                next(createHttpError(401, "not authorised to delete this post"))
            }
        }
    } catch (error) {
        next(createHttpError(error))
    }
})


export default postsRouter