

export const badRequestHandler = (err, req, res, next) => {
    if(err?.code === 400){
        console.log("badRequestHandler error", err.status, err)
        res.status(400).send({message : err.message || "bad request"})
    } else{
        next(err)
    }
}

export const unauthorizedHandler = (err, req, res, next) => {
    if(err?.code === 401){
        console.log("unauthorizedHandler error", err.status, err)
        res.status(401).send({message : err.message || "not authorised"})
    } else{
        next(err)
    }
}
export const forbiddenHandler = (err, req, res, next) => {
    if(err?.code === 403){
        console.log("unauthorizedHandler error", err.status, err)
        res.status(401).send({message : err.message || "forbidden"})
    } else{
        next(err)
    }
}

export const notFoundHandler = (err, req, res, next) => {
    if(err?.code === 404){
        console.log("notFoundHandler error", err.status, err)
        res.status(404).send({message : err.message || "not found"})
    } else{
        next(err)
    }
}

export const genericErrorHandler = (err, req, res, next) => {
    console.log("generic error", err.status, err)
        res.status(500).send({error :err.message || "something went wrong"})
}