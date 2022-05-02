import ChatModel from "./chat-schema.js"
import ChatMessageModel from "./chat-message-schema.js"
import express from "express"
import { JWTAuthMW } from "../authentication/JWTAuthMW.js"

const chatsRouter = express.Router()

// ******************* post a new message *********************
chatsRouter.post("/", JWTAuthMW,  async(req, res, next) => {
    // const newMessage = { title:req.body.title, text:req.body.text, place:req.body.place, meeting:req.body.meeting}
    const message = new ChatMessageModel(req.body.message)
    const savedMessage = await message.save()

    try {
        const recipient = req.body.recipient
        const sender = req.user._id
        if(sender){
            if(!recipient){
                next(createHttpError(400, "Recipient id is missing"))
            } 
            let chat = await ChatModel.findOne({
                'members':{
                    $all:[ sender, recipient]
                }
            })
            if(chat){
                const updatedChat = await ChatModel.findByIdAndUpdate(chat._id, {$push:{messages:savedMessage._id}},{new:true})
                res.send(updatedChat)
            } else{
                const newChat = new ChatModel({members : [sender, recipient],$push:{messages:savedMessage._id}},{new:true})
                const savedChat = await newChat.save()
                if(savedChat){
                    res.status(201).send(savedChat)
                }else{
                    next(createError(500,{message: "Something went wrong unable to save new chat"}))
                }
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
