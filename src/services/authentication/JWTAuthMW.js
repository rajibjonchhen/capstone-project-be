import createHttpError from "http-errors";
import { verifyJWTToken } from "./tools.js";


export const JWTAuthMW = async(req, res, next) => {
    if(!req.headers.authorization){
        next(createHttpError(404, "Bearer's token in authorization headers is missing"))
    }else{
        try {
            const token = req.headers.authorization.replace("Bearer ","")
            const payload = await verifyJWTToken(token)
            if(payload._id) {
                req.user = {
                    _id : payload._id,
                    role : payload.role
                }
            } else {
                next(createHttpError(401, "invalid token"))
            }

            next()
        } catch (error) {
           next(createHttpError(error))
        }
    }
}


