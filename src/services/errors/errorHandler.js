

export const badRequestHandler = (err, req, res, next) => {
    if(err.status === 400){
        res.status(400).send({error : err.message})
    } else{
        next()
    }
}

export const unauthorizedHandler = (err, req, res, next) => {
    if(err.code === 401){
        res.status(401).send({error : err.message})
    } else{
        next()
    }
}

export const notFoundHandler = (err, req, res, next) => {
    if(err.code === 404){
        res.status(404).send({error : err.message})
    } else{
        next()
    }
}

export const genericErrorHandler = (err, req, res, next) => {
    console.log("generic error", err)
        res.status(500).send({error : "Generic error"})
}