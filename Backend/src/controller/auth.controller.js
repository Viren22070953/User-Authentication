const userModel=require("../models/user.model")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcryptjs")
const crypto=require("crypto");
const sessionModel=require("../models/sessions.model")

const sendEmail=require("../services/email.service")

const otpModel=require("../models/otp.model");

const {generateOTP,getOtpHtml}=require("../utils/utils")

async function registerUser(req,res){

    const {username,email,password}=req.body;


    const isUserAlreadyExist=await userModel.findOne({
      $or:[
        {username},
        {email}

      ]
    })

    if(isUserAlreadyExist){
      return res.status(409).json({
        message:"Username or Email Already Exist"
      })
    }

    const hash=await bcrypt.hash(password,10);

    const user=await userModel.create({
      username,
      email,
      password:hash
    })

    const otp=generateOTP();

    const html=getOtpHtml(otp);

    const otpHash=crypto.createHash("sha256").update(otp).digest("hex");

    await otpModel.create({
      email,
      user:user._id,
      otpHash
    })

    await sendEmail(email,"OTP Verification", `Your OTP code is ${otp}`, html)


    res.status(201).json({
      message:"User Created Succesfully",
      user:{
        username,
        email,
        verified:user.verified
      }
    }) 

}

async function loginUser(req,res){

  const {username,email,password}=req.body;

  const user=await userModel.findOne({
    $or:[
      {username},
      {email}
    ]
  })

  if(!user){
    return res.status(400).json({
      message:"User Not found"
    })
  }

  if(!user.verified){
    return res.status(401).json({
      message:"Email not verified"
    })
  }

  const isPasswordValid=await bcrypt.compare(password,user.password);

  if(!isPasswordValid){
    return res.status(401).json({
      message:"Invalid Password"
    })
  }

    const refreshToken=jwt.sign({
    id:user._id
  },process.env.JWT_SECRET,{expiresIn:"7d"})

  const refreshTokenHash=crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session=await sessionModel.create({
      user:user._id,
      refreshTokenHash,
      ip:req.ip,
      userAgent:req.headers['user-agent']

    })



  const accesssToken=jwt.sign({
      id:user._id,
      sessionId:session._id
      },process.env.JWT_SECRET,{expiresIn:"15m"}
  )

  res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      secure:true,
      sameSite:'strict',
      maxAge:7*24*60*60*1000
    });

  res.status(201).json({
      message:"User Logged in Succesfully",
      user:{
        username,
        email,
        accessToken:accesssToken,
        verified:user.verified
      }
  }) 

}

async function getMe(req,res){

  try{

    const authHeader=req.headers.authorization;

    if(!authHeader){
      return res.status(401).json({
        message:"Access Token not available"
      })
    }

    const accessToken = authHeader.split(" ")[1];

    const decoded=jwt.verify(accessToken,process.env.JWT_SECRET)

    const user=await userModel.findById(decoded.id)

    res.status(200).json({
      message:"User data fetched succesfully",
      user:{
        username:user.username,
        email:user.email
      }
    })

  }

  catch(error){
    return res.status(400).json({
      message:"Internal server error"
    })
  }

 





}


async function refreshToken(req,res){

  const refreshToken=req.cookies.refreshToken;

  if(!refreshToken){
    return res.status(401).json({
      message:"Refresh Token Not found"
    })
  }

  const decoded = jwt.verify(refreshToken,process.env.JWT_SECRET)

  const refreshTokenHash=crypto.createHash("sha256").update(refreshToken).digest("hex");

  const session=await sessionModel.findOne({
    refreshTokenHash,
    revoked:false
  })

  if(!session){
    return res.status(401).json({
      message:"Invalid Refresh token"
    })
  }

  const accessToken= jwt.sign({
    id:decoded.id
  },process.env.JWT_SECRET,{expiresIn:"15m"}
  )

  //THis is only for extra additional security
  
  const newRefreshToken = jwt.sign({
    id:decoded.id
  },process.env.JWT_SECRET,{expiresIn:"7d"})

  const newRefreshTokenHash=crypto.createHash("sha256").update(newRefreshToken).digest("hex");

  session.refreshTokenHash=newRefreshTokenHash;
  await session.save();

  res.cookie("refreshToken",newRefreshToken,{
      httpOnly:true,
      secure:true,
      sameSite:'strict',
      maxAge:7*24*60*60*1000
    });

  res.status(200).json({
    message:"Access token send successfully",
    accessToken
  })




}


async function logoutUser(req,res){

  const refreshToken=req.cookies.refreshToken;

  if(!refreshToken){
    return res.status(400).json({
      message:"Refresh token not found"
    })
  }

  const refreshTokenHash=crypto.createHash("sha256").update(refreshToken).digest("hex");
  

  const session=await sessionModel.findOne({
    refreshTokenHash,
    revoked:false
  })

  if(!session){
    return res.status(401).json({
      message:"Invalid refresh token"
    })
  }

  session.revoked=true;
  await session.save();

  res.clearCookie("refreshToken");

  res.status(200).json({
    message:"User Logout Succesfully"
  })


}

async function logoutAll(req,res){

  const refreshToken=req.cookies.refreshToken;

  if(!refreshToken){
    return res.status(401).json({
      message:"Token not found"
    })
  }

  const decoded=jwt.verify(refreshToken,process.env.JWT_SECRET)

  await sessionModel.updateMany({
    user:decoded.id,
    revoked:false


  },{
    revoked:true
  })

  res.clearCookie("refreshToken")

  res.status(200).json({
    message:"Logged Out From All Devices Succesfully"
  })



}

async function verifyEmail(req,res){

  const {otp,email}=req.body;

  const otpHash=crypto.createHash("sha256").update(otp).digest("hex");

  const otpDoc= await otpModel.findOne({
    email,
    otpHash
  })

  if(!otpDoc){
    return res.status(400).json({
      message:"Invalid OTP"
    })
  }

  const user=await userModel.findByIdAndUpdate(otpDoc.user,{
    verified:true
  })

  await otpModel.deleteMany({
    user:otpDoc.user
  })

  return res.status(200).json({
    message:"Email Verified Succesfully",
    user:{
      username:user.username,
      email:user.email,
      verified:user.verified
    }
  })



}

module.exports={registerUser,loginUser,getMe,refreshToken,logoutUser,logoutAll,verifyEmail};