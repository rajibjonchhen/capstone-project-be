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
import { Server } from 'socket.io'
import {createServer} from "http"

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

const httpServer = createServer(server)

const io = new Server(httpServer, {allowEIO3 : true})

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

// ****************************** socketio ****************************** 
let onlineUsers = []

io.on("connect", async(socket) => {
    
  // console.log(socket.handshake.auth)
    const token = socket.handshake.auth.token
    // console.log("token == ", token)
    if(!token){
      socket.emit("JWT_ERROR")
      throw createHttpError(401, 'JWT_ERROR please relogin')
    }

    const {_id, username} = await verifyJWTToken(token)
    // onlinseUsers will need to save the users' sockets
    socket.broadcast.emit("newConnection")

    const onlineUser = {userId:_id, id:socket.id , createdAt: new Date(), socket: socket}
    onlineUsers = onlineUsers.filter(online => online.userId !== _id).concat(onlineUser)
    // later in the GET request
    //  const userToChat = onlineUser.find(user => user.userId ===_id)
    //  socket.join(socket.id)
    // console.log("onlineUser", onlineUsers, _id)
    socket.on("outgoing-msg", async({chatId,message}) => {
      try {
       console.log("paylaod._id ====" ,  _id)
        const newMsg = {sender: message.sender, content: {text:message.content}}
     
        const chat = await ChatsModel.findByIdAndUpdate(chatId, { $push: {messages:newMsg}})
          // console.log(chat)
      chat.members.forEach(member => {
        // console.log("member", member)
        const recipient = onlineUsers.find(user => user.userId === member.toString())
        // console.log("ONLINE USERS", onlineUser,"message content", message.content)
        
          // console.log("ONLINE USERS recipient", onlineUser,"message content recipient", message.content)
          if(recipient){
            socket.to(recipient.id).emit("incoming-msg",message)
            console.log("I am going to send msg sending to socket :-)")   
          } else{
            console.log("I am not going to send msg")   
          }
        
      });
      // go and grab from the onlineUsers all the chat participants except you
      //socket.join(recipient.socket.Id)
      //socket.to(chatId).emit("incoming-msg",message)
    } catch (error) {
      throw createHttpError(401, "Error could not update database")
    }
    })
        
        socket.on("disconnect", () => {
          console.log("Disconnected socket with id " + socket.id)
          
          onlineUsers = onlineUsers.filter(user => user.id !== socket.id)
          
          socket.broadcast.emit("newConnection")
        })
      })
      server.use("/online-users", (res, req) => req.send({onlineUsers}))


// ****************************** socketio ****************************** 


server.listen(PORT, () => {
console.table(listEndpoints(server))
console.log("The server is running in the port - ", PORT)
})

server.on("error", (error) => {
    console.log("Server has stopped due to error", error)
})

