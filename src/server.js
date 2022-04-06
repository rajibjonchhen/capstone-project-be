import express from "express";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import cors from "cors"
import usersRouter from "./services/users/users.js";
import { badRequestHandler, forbiddenHandler, genericErrorHandler, notFoundHandler, unauthorizedHandler } from "./services/errors/errorHandler.js";
import postsRouter from "./services/posts/posts.js";



/****************************** Port ***************************/
const server = express()
const PORT =  process.env.PORT || 3001


/***************************  middleware ***********************/
server.use(express.json())
server.use(cors())

/****************************  routes **************************/
server.use("/users", usersRouter)
server.use("/posts", postsRouter)

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

