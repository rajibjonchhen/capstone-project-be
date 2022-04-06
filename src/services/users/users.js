import express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import { JWTAuthMW } from "../authentication/JWTAuthMW.js";
import { authenticateUser } from "../authentication/tools.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary"
import UserModel from "./user-schema.js"


const cloudinaryAvatarUploader = multer({
    storage: new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "creators-space",
        },
    }),
}).single("avatar")


const usersRouter = express.Router()
/***************************  register new user ***********************/
.post("/signUp", async(req, res, next) => {
    try {
        const newUser = new UserModel(req.body)
        const {_id} = await  newUser.save()
        if(_id){
            res.send({_id})
        } else {

            next(createError(401, "bad request missing field could not create user"))
        }
    } catch (error) {
        next(createHttpError(error))
    }
})

/******************************  login user ***************************/
.post("/signIn", async(req, res, next) => {
    try {
        const {email, password} = req.body
        const reqUser = await UserModel.checkCredentials(email, password)
        if(reqUser){
            const user = await UserModel.findById(reqUser._id)
            console.log(user)
            const token  =  await authenticateUser(user)
            res.send({user, token})
        } else {
            next(createHttpError(401, "Invalid email or password"))
        }
    } catch (error) {
        next(createHttpError(error))
    }
})


/*****************************  get all users *************************/
.get("/", JWTAuthMW, async(req, res, next) => {
    try {
            const users = await UserModel.find()
            res.send({users})
    } catch (error) {
        next(createHttpError(error))
    }
})


/*****************************  get my detail *************************/
.get("/me",  JWTAuthMW, async(req, res, next) => {
    try {
        if(req.user){
            const user = await UserModel.findById(req.user._id)
            res.send({user})
        }
    } catch (error) {
        next(createHttpError(error))
    }
})


/****************************  edit my detail *************************/
.put("/me",  JWTAuthMW, async(req, res, next) => {
    try {
        if(req.user){
            const user = await UserModel.findByIdAndUpdate(req.user._id, req.body, {new: true})
            res.send({user})
        }
    } catch (error) {
        next(createHttpError(error))
    }
})


/***************************  delete my detail ************************/
.delete("/me",  JWTAuthMW, async(req, res, next) => {
    try {
        if(req.user){
            const user = await UserModel.findByIdAndDelete(req.user._id)
            res.send()
        }
    } catch (error) {
        next(createHttpError(error))
    }
})


/*****************************  add my avatar *************************/
.post("/me/avatar",JWTAuthMW, cloudinaryAvatarUploader,  async(req, res, next) => {
    try {
        if(req.user){
            const updatedUser = await UserModel.findByIdAndUpdate(req.user._id, {avatar:req.file.path}, {new:true})
            
        }
    } catch (error) {
        next(createHttpError(error))
    }
})


/*****************************  logout user *************************/
.delete("/session", async(req, res, next) => {
    try {
        res.send({token : null})
    } catch (error) {
        next(createHttpError(error))
    }
})


export default usersRouter