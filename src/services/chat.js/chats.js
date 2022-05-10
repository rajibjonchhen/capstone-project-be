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

                res.send({chat})
            } else{
                const newChat = new ChatModel({members : [sender, recipient]})
                const savedChat = await newChat.save()
                if(savedChat){
                    res.status(201).send({chat:savedChat})
                }else{
                    next(createError(500,{message: "Something went wrong unable to save new chat"}))
                }
            }
        } else{
            next(createError(401, {message:"sender's id is missing"}))
        }
    } catch (error) {
        next(createError(500,error))
    }
})

//***************** post message ******************/ 
chatsRouter.post("/:chatMessageId", JWTAuthMW, async (req, res, next) => {
    const message = new ChatMessageModel({...req.body.message, sender:req.user._id})
    const savedMessage = await message.save()
    try {
            if(req.user._id){const chat = await ChatModel.findById(req.params.chatMessageId)
            if(chat){
                const updatedChat = await ChatModel.findByIdAndUpdate(req.params.chatMessageId, {$push:{messages:savedMessage._id}},{new:true})
                .populate({path:"messages", select:"title text sender createdAt"})
                .populate({path:"messages.sender", select:"name surname avatar"})
                res.send(updatedChat)
            } else{
                next(createError(400, {message:"bad request"}))
            }
        } else{
            next(createError(401, {message:"sender's id is missing"}))

        }
       
    } catch (error) {
        next(createError(error))
    }
})



// ******************* get all messages *********************
chatsRouter.get("/", JWTAuthMW,  async(req, res, next) => {
    try {
        const reqMsg = await ChatModel.find({members: req.user._id}).populate({path:"members", select:"name surname email avatar"}).populate({path:"messages",  select:"title text meeting place"})
        res.send({messages:reqMsg})
    } catch (error) {
        next(createError(error))
    }
})

// ******************* get message with id *********************
chatsRouter.get("/:chatId", JWTAuthMW,  async(req, res, next) => {
    try {
        const reqMsg = await ChatModel.findOne({_id:req.params.chatId, "members": req.user._id}).populate({path:"members", select:"name surname email avatar"}).populate({path:"messages",  select:"title text meeting place"})

        if(reqMsg){
            res.send({messages:reqMsg})
        } else{
            next(createError(404,{message:`chat with ${req.params.chatId} not found`}))
        }
    } catch (error) {
        next(createError(error))
    }
})

export default chatsRouter
