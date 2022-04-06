

import express from "express";
import createError from "http-errors";
import { JWTAuthMW } from "../authentication/JWTAuthMW.js";
import { authenticateUser } from "../authentication/tools.js";
import PostModel from "./post-schema.js"
import CommentModel from "../comments/comment-schema.js"
import { adminMW } from "../authentication/adminMW.js";



const postsRouter = express.Router()


/***************************  admin only routes ************************/

/***************************  get post by id route ************************/
.get("/:postId",  JWTAuthMW, adminMW, async(req, res, next) => {
    try {
        if(req.user.role==="admin"){
            console.log("admin search only")
            const post = await PostModel.findById(req.params.postId).populate({path: "postedBy", select:"name surname"}).populate({path:"comments", select:"_id comment"})
            res.send({post})
        }
    } catch (error) {
        next(createError(error))
    }
})

/***************************  edit post by id route ************************/
.put("/:postId",  JWTAuthMW, adminMW, async(req, res, next) => {
    try {
        if(req.user.role==="admin"){
            const updatedPost = await PostModel.findByIdAndUpdate(req.params.postId, req.body,{new:true})
            res.send({post : updatedPost})
        }
    } catch (error) {
        next(createError(error))
    }
})

/***************************  delete Post by id route ************************/
.delete("/:postId",  JWTAuthMW, adminMW, async(req, res, next) => {
    try {
        if(req.user.role==="admin"){
            await PostModel.findByIdAndDelete(req.params.postId)
            res.send()
        }
    } catch (error) {
        next(createError(error))
    }
})



/***************************  Post routes ************************/

/***************************  create new Post ***********************/
.post("/",JWTAuthMW, async(req, res, next) => {
    try {
        const newPost = new PostModel({...req.body, postedBy: req.user._id})
        const {_id} = await  newPost.save()
        if(_id){
            res.send({_id})
        } else {

            next(createError(400, "bad request missing field could not create Post"))
        }
    } catch (error) {
        next(createError(error))
    }
})


/*****************************  get all Posts *************************/
.get("/", JWTAuthMW, async(req, res, next) => {
    try {
            const posts = await PostModel.find().populate({path: "comments.commentedBy", select:"name surname"})
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
.get("/me/:postId",  JWTAuthMW, async(req, res, next) => {
    try {
        if(req.user){
            const post = await PostModel.findById(req.params.postId)
            res.send({post})
        }
    } catch (error) {
        next(createError(error))
    }
})


/****************************  edit my post *************************/
.put("/me/:postId",  JWTAuthMW, async(req, res, next) => {
    try {
        const post = await PostModel.findById(req.params.postId)
        if(post){
            console.log("post.postedBy -", post.postedBy)
            console.log("post.postedBy.toObject", post.postedBy.toString())
            console.log("req.user._id", req.user._id)
            if(post.postedBy.toString() === req.user._id){
                const updatedPost = await PostModel.findByIdAndUpdate(req.params.postId, req.body, {new: true})
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
.delete("/me/:postId",  JWTAuthMW, async(req, res, next) => {
    try {
        if(req.user){
            const post = await PostModel.findById(req.params.postId)
            if(post){
                if(post.postedBy.toString() === req.user._id){

                    await PostModel.findByIdAndDelete(req.params.postId)
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


/***************************  comments section ************************/

/***************************  comment a post ************************/
.post("/:postId/comments",JWTAuthMW, async(req, res, next) => {
    try {
        const postId = req.params.postId
        // const reqPost = await CommentModel.findById(postId)
        const newComment = new CommentModel({ ...req.body, post: postId, commentedBy:req.user._id })
        const { _id } = await newComment.save()
        const updatedPost = await PostModel.findByIdAndUpdate(postId,{$push : {comments: _id}}, {new:true}).populate({path:"comments" , select:"_id comment"})
        res.status(201).send({ updatedPost:updatedPost, newCommentId: _id })
      } catch (error) {
        next(createError(error))
      }
    })

/***************************  get all the comments of a post ************************/
.get("/:postId/comments",JWTAuthMW, async(req, res, next) => {
    try {
        const reqPost = await CommentModel.find({post:req.params.postId}).populate({path:"post", select:"_id content"})
        if(reqPost){
                res.send({comments:reqPost})
        } else {
            next(createError(404, {message:"bad request could not find the required post"}))
        }
    } catch (error) {
        next(createError(error))
    }
})

/***************************  get a comment with commentId ************************/
.get("/:postId/comments/:commentId",JWTAuthMW, async(req, res, next) => {
    try {
        const reqPost = await CommentModel.findById(req.params.commentId).populate({path:"post", select:"_id content"})
        if(reqPost){
                res.send({comments:reqPost})
        } else {
            next(createError(404, {message:"bad request could not find the required comment"}))
        }
    } catch (error) {
        next(createError(error))
    }
})

/***************************  edit a comment with commentId ************************/
.put("/:postId/comments/:commentId",JWTAuthMW, async(req, res, next) => {
    try {
        const reqComment = await CommentModel.findById(req.params.commentId)
        if(reqComment){
            if(reqComment.commentedBy.toString() === req.user._id){
                const updatedComment = await CommentModel.findByIdAndUpdate(req.params.commentId, req.body, {new:true})
                res.send({comment:updatedComment})
            } else {
                next(createError(401, {message:" not authorized to update the comment"}))

            }
        } else {
            next(createError(404, {message:"bad request could not find the required comment"}))
        }
    } catch (error) {
        next(createError(error))
    }
})

/***************************  delete a comment with commentId ************************/
.delete("/:postId/comments/:commentId",JWTAuthMW, async(req, res, next) => {
    try {
        const reqComment = await CommentModel.findById(req.params.commentId)
        if(reqComment){
            if(reqComment.commentedBy.toString() === req.user._id){
                const updatedComment = await CommentModel.findByIdAndDelete(req.params.commentId)
                res.send()
            } else {
                next(createError(401, {message:" not authorized to update the comment"}))

            }
        } else {
            next(createError(404, {message:"bad request could not find the required comment"}))
        }
    } catch (error) {
        next(createError(error))
    }
})


/***************************  admin only comments section ************************/

/***************************  edit a comment with commentId ************************/
.put("/comments/:commentId",JWTAuthMW, adminMW, async(req, res, next) => {
    try {
        const reqComment = await CommentModel.findById(req.params.commentId)
        if(reqComment){
            if(req.user.role === "admin"){
                const updatedComment = await CommentModel.findByIdAndUpdate(req.params.commentId, req.body, {new:true})
                res.send({comment:updatedComment})
            } else {
                next(createError(401, {message:" not authorized to update the comment"}))

            }
        } else {
            next(createError(404, {message:"bad request could not find the required comment"}))
        }
    } catch (error) {
        next(createError(error))
    }
})

/***************************  delete a comment with commentId ************************/
.delete("/comments/:commentId",JWTAuthMW, adminMW, async(req, res, next) => {
    try {
        const reqComment = await CommentModel.findById(req.params.commentId)
        if(reqComment){
            if( req.user.role === "admin"){
                const updatedComment = await CommentModel.findByIdAndDelete(req.params.commentId)
                res.send()
            } else {
                next(createError(401, {message:" not authorized to update the comment"}))

            }
        } else {
            next(createError(404, {message:"bad request could not find the required comment"}))
        }
    } catch (error) {
        next(createError(error))
    }
})


export default postsRouter