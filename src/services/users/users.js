import express from "express";
import createHttpError from "http-errors";
import { JWTAuthMW } from "../authentication/JWTAuthMW.js";
import { authenticateUser } from "../authentication/tools.js";
import UserModel from "./user-schema.js"

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
        
    } catch (error) {
        next(createHttpError(error))
    }
})


/***************************  delete my detail ************************/
.delete("/me",  JWTAuthMW, async(req, res, next) => {
    try {
        
    } catch (error) {
        next(createHttpError(error))
    }
})


/*****************************  add my avatar *************************/
.post("/me/avatar", async(req, res, next) => {
    try {
        
    } catch (error) {
        next(createHttpError(error))
    }
})




export default usersRouter