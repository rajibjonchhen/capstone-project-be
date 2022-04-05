import express from "express";
import createHttpError, { CreateHttpError } from "http-errors";
import UserModal from "./user-schema.js"

const usersRouter = express.Router()

/***************************  register new user ***********************/
.post("/signUp", async(req, res, next) => {
    try {
        const newUser = new UserModal(req.body)
        const {_id} = await  newUser.save()
        res.send({_id})
    } catch (error) {
        next(createHttpError(error))
    }
})

/******************************  login user ***************************/
.post("/signIn", async(req, res, next) => {
    try {
        const {email, password} = req.body
        const user = await UserModal.checkCredentials({email, password})
    } catch (error) {
        next(createHttpError(error))
    }
})


/*****************************  get all users *************************/
.get("/", async(req, res, next) => {
    try {
        
    } catch (error) {
        next(createHttpError(error))
    }
})


/*****************************  get my detail *************************/
.get("/me", async(req, res, next) => {
    try {
        
    } catch (error) {
        next(createHttpError(error))
    }
})


/****************************  edit my detail *************************/
.put("/me", async(req, res, next) => {
    try {
        
    } catch (error) {
        next(createHttpError(error))
    }
})


/***************************  delete my detail ************************/
.delete("/me", async(req, res, next) => {
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