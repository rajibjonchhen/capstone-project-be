import express from "express"
import { JWTAuthMW } from "../authentication/JWTAuthMW.js"
import ChatMessageModel from "./chat-message-schema.js"
import createError from "http-errors";


const chatMessagesRouter = express.Router()


//***************** edit message ******************/ 
chatMessagesRouter.get("/:chatMessageId", JWTAuthMW, async (req, res, next) => {
    try {
        if (req.user) {
                const chatMessage = await ChatMessageModel.findById(req.params.chatMessageId)
                res.send({message: chatMessage});
            }else{
        console.log("Not authorised to update the message")

            next(createError(404, {message:"Not authorised to update the message"}))
        }
    } catch (error) {
        console.log(error)
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
        console.log("Not authorised to update the message")

        next(createError(404, {message:"Not authorised to update the message"}))
    }
} catch (error) {
    console.log(error)

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
        console.log("Not authorised to update the message")

            next(createError(404, {message:"Not authorised to update the message"}))
        }
    } catch (error) {
        console.log(error)

        next(createError(error));
    }
    })

export default chatMessagesRouter