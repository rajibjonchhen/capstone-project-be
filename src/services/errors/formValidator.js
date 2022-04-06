
import express from 'express'
import {body} from 'express-validator'

export const productValidator = [
    body('name').exists().withMessage('name is mandatory'),
    body('description').exists().withMessage('description is mandatory'),
    body('brand').exists().withMessage('brand is mandatory'),
    body('price').exists().withMessage('price is mandatory'),
    body('category').exists().withMessage('category is mandatory')
]

// import { validationResult } from "express-validator"
// import createHttpError from "http-errors"
// import { productValidator } from "./productValidator.js"
// productsRouter.post("/", productValidator, async (req, res, next) => {
//     try {
//       const errors = validationResult(req)

//       if (errors.isEmpty()) {
//         const productsArray = await getProducts()
//         const newProduct = { ...req.body, _id: uniqid(), createAt: new Date(), imageUrl: `https://via.placeholder.com/150/` }
//         productsArray.push(newProduct)
//         await writeProducts(productsArray)
//         res.status(201).send(`New product added with id - ${newProduct._id}`)
//       } else {
//         next(createHttpError(400, { errors }))
//       }
//     } catch (error) {
//       next(error)
//     }
//   })