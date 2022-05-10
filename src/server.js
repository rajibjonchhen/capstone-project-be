import express from "express";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import cors from "cors"
import usersRouter from "./services/users/users.js";
import { badRequestHandler, forbiddenHandler, genericErrorHandler, notFoundHandler, unauthorizedHandler } from "./services/errors/errorHandler.js";
import postsRouter from "./services/posts/posts.js";
import productsRouter from "./services/products/products.js";
import passport from "passport";
import googleStrategy from './services/authentication/googleOauth.js'
import googleStrategyInvestor from './services/authentication/googleOauthInvestor.js'
import googleStrategyCreator from './services/authentication/googleOauthCreator.js'
import linkedinStrategy from "./services/authentication/linkedinOauth.js";
import facebookStrategy from "./services/authentication/facebookOauth.js";
import chatsRouter from "./services/chat.js/chats.js";
import chatMessagesRouter from "./services/chat.js/chatMessage.js";

/****************************** Port ***************************/
const server = express()
const PORT =  process.env.PORT || 3001
passport.use("google", googleStrategy)
passport.use("googleInvestor", googleStrategyInvestor)
passport.use("googleCreator", googleStrategyCreator)
passport.use("linkedin", linkedinStrategy )
passport.use("facebook", facebookStrategy )

/***************************  middleware ***********************/
server.use(express.json())

const whiteListOrigin = [process.env.PROD_URL, process.env.DEV_URL]

server.use(cors({
    origin: function(origin, next){
        if(!origin || whiteListOrigin.indexOf(origin) !== -1){
            next(null, true)
        }else {
            next(new Error("cors error"))
        }
    }
}))
server.use(passport.initialize())
/****************************  routes **************************/

server.use("/users", usersRouter)
server.use("/posts", postsRouter)
server.use("/products", productsRouter)
server.use("/chats", chatsRouter)
server.use("/chatMessages", chatMessagesRouter)

/************************* Error Handler ***********************/
server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(forbiddenHandler)
server.use(genericErrorHandler)

/**************************   connection ***********************/
mongoose.connect(process.env.MONGO_CONNECTION)
mongoose.connection.on("connected",() => {
    console.log("Successfully connected to mongo!")
})

server.listen(PORT, () => {
console.table(listEndpoints(server))
console.log("The server is running in the port - ", PORT)
})

server.on("error", (error) => {
    console.log("Server has stopped due to error", error)
})

