import express from "express"
import { JWTAuthMW } from "../authentication/JWTAuthMW.js"
import ChatMessageModel from "./chat-message-schema.js"
import createError from "http-errors";


const chatMessagesRouter = express.Router()

//***************** post message ******************/ 
chatMessagesRouter.post("/:chatMessageId", JWTAuthMW, async (req, res, next) => {
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

//***************** edit message ******************/ 
chatMessagesRouter.get("/:chatMessageId", JWTAuthMW, async (req, res, next) => {
    try {
        if (req.user) {
                const chatMessage = await ChatMessageModel.findById(req.params.chatMessageId)
                res.send({message: chatMessage});
            }else{
            next(createError(404, {message:"Not authorised to update the message"}))
        }
    } catch (error) {
        next(createError(error));
    }
    })

//***************** edit message ******************/ 
chatMessagesRouter.put("/:chatMessageId", JWTAuthMW, async (req, res, next) => {
try {
    const chatMessage = await ChatMessageModel.findById(req.params.chatMessageId)
    if (req.user === chatMessage.sender) {
            const savedMessage = await ChatMessageModel.findByIdAndUpdate(req.params.chatMessageId,req.body,{new:true})
            res.send({message: savedMessage});
        }else{
        next(createError(404, {message:"Not authorised to update the message"}))
    }
} catch (error) {
    next(createError(error));
}
})
//***************** delete message ******************/ 
chatMessagesRouter.delete("/:chatMessageId", JWTAuthMW, async (req, res, next) => {
    try {
        
        const chatMessage = await ChatMessageModel.findById(req.params.chatMessageId)
        if (req.user === chatMessage.sender) {
                const savedMessage = await ChatMessageModel.findByIdAndDelete(req.params.chatMessageId)
                res.status().send();
            }else{
            next(createError(404, {message:"Not authorised to update the message"}))
        }
    } catch (error) {
        next(createError(error));
    }
    })
//*****************  ******************/ 

export default chatMessagesRouter