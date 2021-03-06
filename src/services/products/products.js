import express from "express";
import createError from "http-errors";
import multer from "multer";
import { JWTAuthMW } from "../authentication/JWTAuthMW.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import ProductModel from "./product-schema.js";
import UserModel from "../users/user-schema.js";
import { adminMW } from "../authentication/adminMW.js";

const cloudinaryImageUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "creators-space-products",
    },
  }),
}).array("images");

const productsRouter = express.Router();

/***************************  admin only routes ************************/

productsRouter.post(
  "/me/:productId/images",
  JWTAuthMW,
  cloudinaryImageUploader,
  async (req, res, next) => {
    try {
      const reqProduct = await ProductModel.findById(req.params.productId);
      if (reqProduct) {
        const images = [];
        req.files.map((file) => images.push(file.path));
        const updatedProduct = await ProductModel.findByIdAndUpdate(
          req.params.productId,
          { $push: { images: [...images] } },
          { new: true }
        ).populate({
          path: "creator",
          select: "name surname email avatar _id",
        });
        if (updatedProduct) {
          res.send({ updatedProduct });
        }
      } else {
        console.log("could not find the product");
        next(createError(404, { message: "could not find the product" }));
      }
    } catch (error) {
      console.log(error);
      next(createError(error));
    }
  }
);
/***************************  edit product byid route ************************/
productsRouter.put(
  "/:productId",
  JWTAuthMW,
  adminMW,
  async (req, res, next) => {
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
      console.log(error);

      next(createError(error));
    }
  }
);

/***************************  delete product byid route ************************/
productsRouter.delete(
  "/:productId",
  JWTAuthMW,
  adminMW,
  async (req, res, next) => {
    try {
      if (req.user.role === "admin") {
        const updatedProduct = await ProductModel.findByIdAndDelete(
          req.params.productId
        );
        res.send({ product: updatedProduct });
      }
    } catch (error) {
      console.log(error);

      next(createError(error));
    }
  }
);

/***************************  product routes ************************/

/*****************************  get all my products *************************/
productsRouter.get("/me", JWTAuthMW, async (req, res, next) => {
  try {
    const products = await ProductModel.find({
      creator: req.user._id,
    }).populate({ path: "creator", select: "name surname email avatar " });

    products.forEach((product, i) => {
      const isLiked = product.Likes.find(
        (like) => like.toString() === req.user._id
      );
      if (isLiked) {
        products[i].isLiked = true;
      } else {
        products[i].isLiked = false;
      }
    });
    res.send({ products });
  } catch (error) {
    console.log(error);

    next(createError(error));
  }
});

/*****************************  get all products *************************/
productsRouter.get("/allProducts", JWTAuthMW, async (req, res, next) => {
  try {
    const search = req.query.s;
    const products = await ProductModel.find();
    products.forEach((product, i) => {
      const isLiked = product.Likes.find(
        (like) => like.toString() === req.user._id
      );
      if (isLiked) {
        products[i].isLiked = true;
      } else {
        products[i].isLiked = false;
      }
    });

    if (req.query.s) {
      const products = await ProductModel.find({
        // $or: [{ title: `${search}` }],
        $or: [{"title": `/^${search}/i`},{"name": `/^${search}/i`}, {"description": `/^${search}/i`}, {"summary": `/^${search}/i`}]
      });

      res.send({ products });
    } else {
      res.send({ products });
    }
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
});

/***************************  get product byid route ************************/
productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId).populate({
      path: "creator",
      select: "name surname email avatar bio interest ",
    });

    if (req?.user?._id) {
      const isLiked = product.Likes.find(
        (like) => like.toString() === req.user._id
      );
      if (isLiked) {
        product.isLiked = true;
        res.send({ product });
      } else {
        product.isLiked = false;
        res.send({ product });
      }
    } else {
      res.send({ product });
    }
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
});

/***************************  register new product ***********************/
productsRouter.post("/", JWTAuthMW, async (req, res, next) => {
  try {
    const newProduct = new ProductModel({
      ...req.body,
      creator: req.user._id,
    });
    const product = await newProduct.save();
    if (product) {
      res.send({ product });
    } else {
      console.log("bad request missing field could not create product");

      next(
        createError(401, {
          message: "bad request missing field could not create product",
        })
      );
    }
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
});

//   /*****************************  get all products *************************/
//   productsRouter.get("/", async (req, res, next) => {
//     try {
//         const search = req.query.s
//         if(req.query.s){
//             const products = await ProductModel.find( {$or:[{title : `${search}`}]})

//             res.send({ products })
//         }else{

//             const products = await ProductModel.find()
//             if(req?.user?._id){
//                 products.forEach((product,i) => {
//                     const isLiked = product.Likes.find(like => like.toString() === req.user._id)
//                     if(isLiked){
//                         products[i].isLiked = true
//                     }else {
//                         products[i].isLiked = false
//                     }
//                 })
//                 res.send({ products })
//                 }
//             else{
//                 res.send({ products })
//             }
//         }
//     } catch (error) {
//                 next(createError(error))
//     }
//   })

/*****************************  get all products *************************/
productsRouter.get("/", async (req, res, next) => {
  try {
    const search = req.query.s;
    const products = await ProductModel.find();
    if (req.query.s) {
      const products = await ProductModel.find({
        $or: [{ title: `${search}` }],
      });

      res.send({ products });
    } else {
      res.send({ products });
    }
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
});

/****************************  edit my product *************************/
productsRouter.put("/me/:productId", JWTAuthMW, async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId);
    if (product) {
      if (product.creator.toString() === req.user._id) {
        const updatedProduct = await ProductModel.findByIdAndUpdate(
          req.params.productId,
          req.body,
          {
            new: true,
          }
        ).populate({
          path: "creator",
          select: "name surname email avatar bio interest ",
        });
        res.send({ updatedProduct });
      } else {
        console.log(" not authorised to update the product");

        next(
          createError(401, {
            message: " not authorised to update the product",
          })
        );
      }
    } else {
      next(createError(404, { message: "could not find the product" }));
    }
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
});

/***************************  delete my product ************************/
productsRouter
  .delete("/me/:productId", JWTAuthMW, async (req, res, next) => {
    try {
      const product = await ProductModel.findById(req.params.productId);
      if (product) {
        if (product.creator.toString() === req.user._id) {
          const updatedProduct = await ProductModel.findByIdAndDelete(
            req.params.productId
          );
          res.send();
        } else {
          console.log("could not find the product");

          next(
            createError(401, {
              message: " not authorised to delete the product",
            })
          );
        }
      } else {
        console.log("could not find the product");

        next(createError(404, { message: "could not find the product" }));
      }
    } catch (error) {
      console.log(error);
      next(createError(error));
    }
  })

  /*****************************  add my avatar *************************/

  /*****************************  like product *************************/
  .put("/:productId/likes", JWTAuthMW, async (req, res, next) => {
    try {
      const reqProduct = await ProductModel.findById(req.params.productId);
      if (reqProduct) {
        const isLiked = reqProduct.Likes.find(
          (like) => like.toString() === req.user._id
        );
        const counts = reqProduct.Likes.length;

        if (!isLiked) {
          const updatedProduct = await ProductModel.findByIdAndUpdate(
            req.params.productId,
            { $push: { Likes: req.user._id }, LikesCounts: counts + 1 },
            { new: true }
          );

          const user = await UserModel.findByIdAndUpdate(req.user._id, {
            $push: { productsLiked: req.params.productId },
          });

          updatedProduct.isLiked = true;
          res.send({ product: updatedProduct, user: user });
        } else {
          const updatedProduct = await ProductModel.findByIdAndUpdate(
            req.params.productId,
            { $pull: { Likes: req.user._id }, LikesCounts: counts - 1 },
            { new: true }
          );
          const user = await UserModel.findByIdAndUpdate(req.user._id, {
            $pull: { productsLiked: req.params.productId },
          });
          updatedProduct.isLiked = false;
          res.send({ product: updatedProduct, user: user });
        }
      } else {
        console.log("bad request could not find the required product");
        next(
          createError(404, {
            message: "bad request could not find the required product",
          })
        );
      }
    } catch (error) {
      console.log(error);
      next(createError(error));
    }
  });

export default productsRouter;
