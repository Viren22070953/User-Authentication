const express=require("express")
const authController=require("../controller/auth.controller")

const router=express.Router();

/**
 * POST /api/auth/register
 */

router.post("/register",authController.registerUser);


/**
 * POST /api/auth/login
 */

router.post("/login",authController.loginUser);


/**
 * GET /api/auth/get-me
 */

router.get("/get-me",authController.getMe);



module.exports=router;