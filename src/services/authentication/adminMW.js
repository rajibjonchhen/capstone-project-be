import createHttpError  from "http-errors"

export const adminMW = async(req, res, next) => {
    if(req.user.role === "admin") {
        next()
    } else {
        next(createHttpError(401, "not authorised admin only"))
    }
}