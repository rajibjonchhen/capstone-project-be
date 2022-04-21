    import express from "express";
    import createError from "http-errors";
    import multer from "multer";
    import { JWTAuthMW } from "../authentication/JWTAuthMW.js";
    import { CloudinaryStorage } from "multer-storage-cloudinary";
    import { v2 as cloudinary } from "cloudinary";
    import ProductModel from "./product-schema.js";
    import { adminMW } from "../authentication/adminMW.js";

    const cloudinaryAvatarUploader = multer({
    storage: new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "creators-space-products",
    },
    }),
    }).array("images");

    const productsRouter = express
    .Router()

    /***************************  admin only routes ************************/

    /***************************  edit product byid route ************************/
    .put("/:productId", JWTAuthMW, adminMW, async (req, res, next) => {
    try {
        if (req.user.role === "admin") {
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            req.params.productId,
            req.body,
            { new: true }
        );
        res.send({ product: updatedProduct });
        }
    } catch (error) {
        next(createError(error));
    }
    })

    /***************************  delete product byid route ************************/
    .delete("/:productId", JWTAuthMW, adminMW, async (req, res, next) => {
    try {
        if (req.user.role === "admin") {
        const updatedProduct = await ProductModel.findByIdAndDelete(req.params.productId);
        res.send({ product: updatedProduct });
        }
    } catch (error) {
        next(createError(error));
    }
    })

    /***************************  product routes ************************/

    /*****************************  get all my products *************************/
    .get("/me", JWTAuthMW, async (req, res, next) => {
        try {
           
            const products = await ProductModel.find({creator:req.user._id});
            res.send({ products });
            
        } catch (error) {
            next(createError(error));
        }
        })

    /***************************  get product byid route ************************/
    .get("/:productId", JWTAuthMW, async (req, res, next) => {
    try {
        
        const product = await ProductModel.findById(req.params.productId);
        res.send({ product });
        
    } catch (error) {
        next(createError(error));
    }
    })


    /***************************  register new product ***********************/
    .post("/",JWTAuthMW, async (req, res, next) => {
    try {
        const newProduct = new ProductModel({...req.body,creator:req.user._id});
        const product = await newProduct.save();
        if (product) {
        res.send({ product});
        } else {
        next(
            createError(401, {
            message: "bad request missing field could not create product",
            })
        );
        }
    } catch (error) {
        next(createError(error));
    }
    })



    /*****************************  get all products *************************/
    .get("/", JWTAuthMW, async (req, res, next) => {
    try {
        const products = await ProductModel.find();
        res.send({ products });
    } catch (error) {
        next(createError(error));
    }
    })


    /****************************  edit my product *************************/
    .put("/me/:productId", JWTAuthMW, async (req, res, next) => {
    try {
        const product = await ProductModel.findById(req.params.productId)
        if (product) {
            if(product.creator.toString()===req.user._id){

                const updatedProduct = await ProductModel.findByIdAndUpdate(req.params.productId, req.body, {
                    new: true,
                })
                res.send({ updatedProduct });
            }else {
                next(createError(401, {message:" not authorised to update the product"}));
                }
        } else {
        next(createError(404, {message:"could not find the product"}));
        }
    } catch (error) {
        next(createError(error));
    }
    })

    /***************************  delete my product ************************/
    .delete("/me/:productId", JWTAuthMW, async (req, res, next) => {
        try {
            const product = await ProductModel.findById(req.params.productId)
            if (product) {
                if(product.creator.toString()===req.user._id){
    
                    const updatedProduct = await ProductModel.findByIdAndDelete(req.params.productId)
                    res.send();
                }else {
                    next(createError(401, {message:" not authorised to delete the product"}));
                    }
            } else {
            next(createError(404, {message:"could not find the product"}));
            }
        } catch (error) {
            next(createError(error));
        }
        })

    /*****************************  add my avatar *************************/
    .post(
    "/me/:productId/images",
    JWTAuthMW,
    cloudinaryAvatarUploader,
    async (req, res, next) => {
        console.log("req.files", req.files)
        try {
            const reqProduct = await ProductModel.findById(req.params.productId)
        if (reqProduct) {
            console.log(req.files)
            const images = []
            req.files.map(file => images.push(file.path))
            console.log(images)
            const updatedProduct = await ProductModel.findByIdAndUpdate(
                req.params.productId,
                {$push : {images:[...images]}},
                { new: true}
                );
                if(updatedProduct){
                    console.log("image uploaded",updatedProduct)
                    res.send({updatedProduct})
                }else{
                    
                    console.log("cannot upload image")
                }
        } else{

            next(createError(404, {message : "could not find the product"}));
        }
        } catch (error) {
        next(createError(error));
        }
    }
    )

    export default productsRouter;
