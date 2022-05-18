import express from "express";
import createError from "http-errors";
import multer from "multer";
import { JWTAuthMW } from "../authentication/JWTAuthMW.js";
import { authenticateUser } from "../authentication/tools.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import UserModel from "./user-schema.js";
import { adminMW } from "../authentication/adminMW.js";
import  passport  from "passport";

const cloudinaryAvatarUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "creators-space",
    },
  }),
}).single("avatar");

const usersRouter = express.Router()

 
/***************************  user routes ************************/

/***************************  register new user ***********************/
usersRouter.post("/signUp", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const user = await newUser.save();
    if (user) {
      const token = await authenticateUser(user);
      res.send({user, token});
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
usersRouter.post("/signIn", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const reqUser = await UserModel.checkCredentials(email, password);
    if (reqUser) {
      const user = await UserModel.findById(reqUser._id);
      const token = await authenticateUser(user);
      res.send({ user, token });
    } else {
      next(createError(401, { message: "User not found invalid email or password" }));
    }
  } catch (error) {
    next(createError(error));
  }
})



  /*****************************  google login user *************************/
  usersRouter.get("/googleLogin", passport.authenticate("google",{scope:["email", "profile"]}));
  
  /*****************************  redirect  *************************/
  usersRouter.get("/googleRedirect", passport.authenticate("google"),(req, res, next)=> {
    try {
      const {token} = req.user
      res.redirect(`${process.env.FE_URL}/home?token=${token}`)
    } catch (error) {
      next(createError(error));
    }
  });

  /*****************************  google investor login  *************************/
  usersRouter.get("/googleLoginInvestor", passport.authenticate("googleInvestor",{scope:["email", "profile"]}));

  /*****************************  investor redirect  *************************/
  usersRouter.get("/googleRedirectInvestor", passport.authenticate("googleInvestor"),(req, res, next)=> {
    try {
      const {token} = req.user
      res.redirect(`${process.env.FE_URL}/home?token=${token}`)
    } catch (error) {
      next(createError(error));
    }
  });

  /*****************************  google investor login  *************************/
  usersRouter.get("/googleLoginCreator", passport.authenticate("googleCreator",{scope:["email", "profile"]}));

  /*****************************  investor redirect  *************************/
  usersRouter.get("/googleRedirectCreator", passport.authenticate("googleCreator"),(req, res, next)=> {
    try {
      const {token} = req.user
      res.redirect(`${process.env.FE_URL}/home?token=${token}`)
    } catch (error) {
      next(createError(error));
    }
  });

  /*****************************  google login user *************************/

  usersRouter.get('/linkedinLogin', passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));
  
  /*****************************  redirect  *************************/
  usersRouter.get('/linkedinRedirect',passport.authenticate('linkedin'),(req, res, next) => {
    try {
      const {token} = req.user
      res.redirect(`${process.env.FE_URL}/home?token=${token}`)
    } catch (error) {
      next(createError(error));
    }
  }
  );

 /*****************************  get my detail *************************/
 usersRouter.get("/me", JWTAuthMW, async (req, res, next) => {
  try {
    if (req.user) {
      const user = await UserModel.findById(req.user._id).populate({path:"productsLiked", select:"" })
      for(let i = 0 ; i < user.productsLiked.length; i++){
        user.productsLiked[i].isLiked = true
      }
      // user.productsLiked.forEach((product, i) =>
      //   user.productsLiked[i].isLiked = true
      // )
      res.send({ user });
    }
  } catch (error) {
    next(createError(error));
  }
})
/***************************  get all liked product ************************/
usersRouter.get("/me/productsLiked", JWTAuthMW, async (req, res, next) => {
  try {
    if (req.user) {
      const user = await UserModel.findById(req.user._id).populate({path:"productsLiked", select:"" })
      for(let i = 0 ; i < user.productsLiked.length; i++){
        user.productsLiked[i].isLiked = true
      }
      // user.productsLiked.forEach((product, i) =>
      //   user.productsLiked[i].isLiked = true
      // )
      res.send({ productsLiked: user.productsLiked });
    }
  } catch (error) {
    next(createError(error));
  }
})

 /*****************************  get all messages *************************/
 usersRouter.get("/me/messages", JWTAuthMW, async (req, res, next) => {
  try {
    
    if (req.user) {
      const user = await UserModel.findById(req.user._id)
      .populate({
        path:"messages.sender",
        select:"name surname avatar email"
    })
    .populate({
      path:"messages.product",
      select:"images title category summary"
    });

      res.send({messages: user.messages });
    }
  } catch (error) {
    next(createError(error));
  }
})

 /*****************************  post a new message *************************/
 usersRouter.post("/me/messages", JWTAuthMW, async (req, res, next) => {
  try {
   
    if (req.user) {
        const user = await UserModel.findById(req.body.receiver)
          if(user){
            const newMessage = {
              text : req.body.text,
              receiver : req.body.receiver,
              sender : req.user._id,
              product : req.body.product,
              meeting : req.body.meeting,
              place : req.body.place,
              markedAsRead :req.body.markedAsRead
            } 
            const savedUser = await UserModel.findByIdAndUpdate(req.body.receiver,{$push:{messages:newMessage}},{new:true})
            res.send({messages: savedUser.messages });
          }else {
            next(createError(404, {message:"couldn't find the user"}))
          }
        }else{
          next(createError(404, {message:"couldn't find the user"}))
      }
  } catch (error) {
    next(createError(error));
  }
})

 /*****************************  post a new message *************************/
 usersRouter.put("/me/messages/read", JWTAuthMW, async (req, res, next) => {
  try {
   
    if (req.user) {
        const user = await UserModel.findById(req.body.receiver)
          if(user){
            const newMessage = {
              text : req.body.text,
              sender : req.user._id,
              product : req.body.product,
              meeting : req.body.meeting,
              place : req.body.place,
              markedAsRead :req.body.markedAsRead
            } 
            const savedUser = await UserModel.findByIdAndUpdate(req.body.receiver,{$push:{messages:newMessage}},{new:true})
            res.send({messages: savedUser.messages });
          }else {
            next(createError(404, {message:"couldn't find the user"}))
          }
        }else{
          next(createError(404, {message:"couldn't find the user"}))
      }
  } catch (error) {
    next(createError(error));
  }
})

  /****************************  edit my detail *************************/
  usersRouter.put("/me", JWTAuthMW, async (req, res, next) => {
    try {
      if (req.user) {
          const user = await UserModel.findByIdAndUpdate(req.user._id, req.body, {
          new: true,
        }).populate({path:"productsLiked", select:"" });
        user.productsLiked.forEach((product, i) =>
          user.productsLiked[i].isLiked = true
        )
        res.send({ user });
      }
    } catch (error) {
      next(createError(error));
    }
  })

  

  /*****************************  get all users *************************/
  usersRouter.get("/", JWTAuthMW, async (req, res, next) => {
    
    try {
      const users = await UserModel.find({'_id': {$ne : req.user._id}})
      res.send({ users });
    } catch (error) {
      next(createError(error));
    }
  })

  /***************************  get user by id route ************************/
  usersRouter.get("/:userId", JWTAuthMW, async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        res.send({ user });
    } catch (error) {
      next(createError(error));
    }
  })


/***************************  admin only routes ************************/


  /***************************  edit user by id route ************************/
  usersRouter.put("/:userId", JWTAuthMW, adminMW, async (req, res, next) => {
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
  usersRouter.delete("/:userId", JWTAuthMW, adminMW, async (req, res, next) => {
    try {
      if (req.user) {
        const updatedUser = await UserModel.findByIdAndDelete(req.params.userId);
        res.send({ user: updatedUser });
      }
    } catch (error) {
      next(createError(error));
    }
  })
  /***************************  delete my detail ************************/
  usersRouter.delete("/me", JWTAuthMW, async (req, res, next) => {
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
  usersRouter.post(
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
  usersRouter.delete("/session", async (req, res, next) => {
    try {
      res.send({ token: null });
    } catch (error) {
      next(createError(error));
    }
  });




  
export default usersRouter;
