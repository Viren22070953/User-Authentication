/**
 * @description Require all the requirements
 */
const express=require("express")
const authRoutes=require("./routes/auth.routes");
const cookieParser=require("cookie-parser")
const app=express();

app.use(express.json());

app.use(cookieParser());


/**
 * @description Register all the middleware that we are using in the backend
 */

app.use("/api/auth", authRoutes);






module.exports=app;