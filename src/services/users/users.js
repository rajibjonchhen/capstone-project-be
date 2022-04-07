import express from "express";
import createError from "http-errors";
import multer from "multer";
import { JWTAuthMW } from "../authentication/JWTAuthMW.js";
import { authenticateUser } from "../authentication/tools.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import UserModel from "./user-schema.js";
import { adminMW } from "../authentication/adminMW.js";

const cloudinaryAvatarUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "creators-space",
    },
  }),
}).single("avatar");

const usersRouter = express
  .Router()

 


  /***************************  admin only routes ************************/


  /***************************  edit user by id route ************************/
  .put("/:userId", JWTAuthMW, adminMW, async (req, res, next) => {
    try {
      if (req.user) {
          const updatedUser = await UserModel.findByIdAndUpdate(
          req.params.userId,
          req.body,
          { new: true }
        );
        res.send({ user: updatedUser });
      }
    } catch (error) {
      next(createError(error));
    }
  })

  /***************************  delete user by id route ************************/
  .delete("/:userId", JWTAuthMW, adminMW, async (req, res, next) => {
    try {
      if (req.user) {
        const updatedUser = await UserModel.findByIdAndDelete(req.params.userId);
        res.send({ user: updatedUser });
      }
    } catch (error) {
      next(createError(error));
    }
  })

/***************************  user routes ************************/

 /***************************  get user by id route ************************/
 .get("/:userId", JWTAuthMW, async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        res.send({ user });
    } catch (error) {
      next(createError(error));
    }
  })

  /***************************  register new user ***********************/
  .post("/signUp", async (req, res, next) => {
    try {
      const newUser = new UserModel(req.body);
      const { _id } = await newUser.save();
      if (_id) {
        res.send({ _id });
      } else {
        next(
          createError(401, {
            message: "bad request missing field could not create user",
          })
        );
      }
    } catch (error) {
      next(createError(error));
    }
  })

   
 

  /******************************  login user ***************************/
  .post("/signIn", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const reqUser = await UserModel.checkCredentials(email, password);
      if (reqUser) {
        const user = await UserModel.findById(reqUser._id);
        const token = await authenticateUser(user);
        res.send({ user, token });
      } else {
        next(createError(401, { message: "Invalid email or password" }));
      }
    } catch (error) {
      next(createError(error));
    }
  })

  /*****************************  get all users *************************/
  .get("/", JWTAuthMW, async (req, res, next) => {
    try {
      const users = await UserModel.find();
      res.send({ users });
    } catch (error) {
      next(createError(error));
    }
  })

  /*****************************  get my detail *************************/
  .get("/me", JWTAuthMW, async (req, res, next) => {
    try {
      if (req.user) {
        const user = await UserModel.findById(req.user._id);
        res.send({ user });
      }
    } catch (error) {
      next(createError(error));
    }
  })

  /****************************  edit my detail *************************/
  .put("/me", JWTAuthMW, async (req, res, next) => {
    try {
      if (req.user) {
          const user = await UserModel.findByIdAndUpdate(req.user._id, req.body, {
          new: true,
        });
        res.send({ user });
      }
    } catch (error) {
      next(createError(error));
    }
  })

  /***************************  delete my detail ************************/
  .delete("/me", JWTAuthMW, async (req, res, next) => {
    try {
      if (req.user) {
        const user = await UserModel.findByIdAndDelete(req.user._id);
        res.send();
      }
    } catch (error) {
      next(createError(error));
    }
  })

  /*****************************  add my avatar *************************/
  .post(
    "/me/avatar",
    JWTAuthMW,
    cloudinaryAvatarUploader,
    async (req, res, next) => {
      try {
        if (req.user) {
          const updatedUser = await UserModel.findByIdAndUpdate(
            req.user._id,
            { avatar: req.file.path },
            { new: true }
          );
          res.send(updatedUser)
        }
      } catch (error) {
        next(createError(error));
      }
    }
  )

  /*****************************  logout user *************************/
  .delete("/session", async (req, res, next) => {
    try {
      res.send({ token: null });
    } catch (error) {
      next(createError(error));
    }
  });

export default usersRouter;
