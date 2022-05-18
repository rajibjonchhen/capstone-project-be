import ChatModel from "./chat-schema.js"
import ChatMessageModel from "./chat-message-schema.js"
import express from "express"
import { JWTAuthMW } from "../authentication/JWTAuthMW.js"
import createError from "http-errors";


const chatsRouter = express.Router()

// ******************* post a new message *********************
chatsRouter.post("/", JWTAuthMW,  async(req, res, next) => {

    try {
        const recipient = req.body.recipient
        const message = req.body.message
        const sender = req.user._id
        if(sender){
            if(!recipient){
                next(createError(400, "Recipient id is missing"))
            } 
            let chat = await ChatModel.findOne({
                'members':{
                    $all:[ sender, recipient]
                }
            })
            .populate({path:"messages"})
            .populate({path:"messages.sender"})
            if(chat){
                if(message){
                    const message = new ChatMessageModel({...req.body.message, sender, chatId:chat._id, recipient})
                    const savedMessage = await message.save()

                    const updatedChat = await ChatModel.findByIdAndUpdate(chat._id, {$push:{messages:savedMessage._id}},{new:true})
                    .populate({path:"messages", select:"title text sender createdAt markedAsRead chatId"})
                    .populate({path:"messages.sender", select:"name surname avatar role"})
                    res.send({chat:updatedChat})
                } else{
                res.send({chat})
                }
            } else{
                const newChat = new ChatModel({members : [sender, recipient]})
                const savedChat = await newChat.save()
                if(savedChat){
                    if(message){
                        const message = new ChatMessageModel({...req.body.message, sender, chatId:chat._id, recipient})
                        const savedMessage = await message.save()

                        const updatedChat = await ChatModel.findByIdAndUpdate(chat._id, {$push:{messages:savedMessage._id}},{new:true})
                        .populate({path:"messages", select:"title text sender createdAt markedAsRead"})
                        .populate({path:"messages.sender", select:"name surname avatar role"})
                        res.send({chat:updatedChat})
                    } else{
                        res.status(201).send({chat:savedChat})
                    }
                }else{
                    console.log(error)
                    next(createError(500,{message: "Something went wrong unable to save new chat"}))
                }
            }
        } else{
            console.log("sender's id is missing")
            next(createError(401, {message:"sender's id is missing"}))
        }
    } catch (error) { 
        console.log(error)
        next(createError(500,error))
    }
})

//***************** post message ******************/ 
chatsRouter.post("/:chatId", JWTAuthMW, async (req, res, next) => {
    const chatId = req.params.chatId
    const message = new ChatMessageModel({...req.body.message, sender:req.user._id, chatId})
    const savedMessage = await message.save()
    try {
            if(req.user._id){const chat = await ChatModel.findById(chatId)
            if(chat){
                const updatedChat = await ChatModel.findByIdAndUpdate(chatId, {$push:{messages:savedMessage._id}},{new:true})
                .populate({path:"messages", select:""})
                .populate({path:"messages.sender", select:""})
                res.send(updatedChat)
            } else{
                console.log("sender's id is missing")
                next(createError(400, {message:"bad request"}))
            }
        } else{
            console.log("sender's id is missing")
            next(createError(401, {message:"sender's id is missing"}))

        }
       
    } catch (error) { 
        console.log(error)
        next(createError(error))
    }
})



// ******************* get all messages *********************
chatsRouter.get("/me", JWTAuthMW,  async(req, res, next) => {
    try {
        const reqMsg = await ChatModel.find({members: req.user._id})
        .populate({path:"members", select:""})
        .populate({path:"messages",  select:""})
        .populate({path : "messages.sender", select:"" })
        res.send({messages:reqMsg})
    } catch (error) { 
        console.log(error)
        next(createError(error))
    }
})


//***************** get unread chat Messages ******************/ 
chatsRouter.get("/me/unreadMsg", JWTAuthMW,  async(req, res, next) => {
    try {
        const reqChat = await ChatModel.find({members: req.user._id})
         .populate({path : "members", select:""})
        .populate({path : "messages",  select:""})
        .populate({path : "messages", populate:{path:"sender", select:"_id name surname avatar email"} })
        
        const unreadMessages = []

      
        for( let i = 0;  i < reqChat.length; i++ ){
            for(let j = 0; j < reqChat[i].messages.length; j++){
                
                if(reqChat[i].messages[j].markedAsRead === false && reqChat[i].messages[j].sender._id.toString() !== req.user._id.toString() ){
                    unreadMessages.push(reqChat[i].messages[j])
                }
            }
        }

        let sortedMessage = unreadMessages.sort((a, b) => Date.parse(new Date(a.createdAt)) - Date.parse(new Date(b.createdAt))).reverse();
        
        res.send({messages:sortedMessage})
    } catch (error) { 
        console.log(error)
        next(createError(error))
    }
})


// ******************* get message with id *********************
chatsRouter.get("/:chatId", JWTAuthMW,  async(req, res, next) => {
    try {
        const reqMsg = await ChatModel.findOne({_id:req.params.chatId, "members": req.user._id}).populate({path:"members", select:"name surname email avatar"}).populate({path:"messages",  select:"title text meeting place markedAsRead sender"})

        if(reqMsg){
            res.send({messages:reqMsg})
        } else{
            console.log(`chat with ${req.params.chatId} not found`)
            next(createError(404,{message:`chat with ${req.params.chatId} not found`}))
        }
    } catch (error) { 
        console.log(error)
        next(createError(error))
    }
})

export default chatsRouter
