const mongoose=require("mongoose")
const { refreshToken } = require("../controller/auth.controller")

const sessionSchema=new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true
  },

  refreshTokenHash:{
    type:String,
    required:true

  },

  ip:{
    type:String,
    required:true
  },

  userAgent:{
    type:String,
    required:true
  },

  revoked:{
    type:Boolean,
    default:false
  }


},{timestamps:true})

const sessionModel=mongoose.model("sessions",sessionSchema)

module.exports=sessionModel;