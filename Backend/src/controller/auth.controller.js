const userModel=require("../models/user.model")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcryptjs")


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
    

    const token=jwt.sign({
      id:user._id
    },process.env.JWT_SECRET,{expiresIn:"1d"}
  )

    res.cookie("token",token);

    res.status(200).json({
      message:"User Created Succesfully",
      user:{
        username,
        email,
        token
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

  const isPasswordValid=await bcrypt.compare(password,user.password);

  if(!isPasswordValid){
    return res.status(401).json({
      message:"Invalid Password"
    })
  }

  const token=jwt.sign({
    id:user._id
  },process.env.JWT_SECRET)

  res.cookie("token",token);

  res.status(200).json({
    message:"User logged in succesfully"
  })

}

async function getMe(req,res){

  try{

     const token=req.cookies.token;

    if(!token){
      return res.status(401).json({
        message:"Token not available"
      })
    }

    const decoded=jwt.verify(token,process.env.JWT_SECRET)

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

module.exports={registerUser,loginUser,getMe};