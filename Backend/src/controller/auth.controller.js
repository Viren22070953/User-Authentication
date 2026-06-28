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
    

    const accesssToken=jwt.sign({
      id:user._id
      },process.env.JWT_SECRET,{expiresIn:"15m"}
    )

    const refreshToken=jwt.sign({
      id:user._id
      },process.env.JWT_SECRET,{expiresIn:"7d"}
    )

    res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      secure:true,
      sameSite:'strict',
      maxAge:7*24*60*60*1000
    });

    res.status(201).json({
      message:"User Created Succesfully",
      user:{
        username,
        email,
        accessToken:accesssToken
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

  const accesssToken=jwt.sign({
      id:user._id
      },process.env.JWT_SECRET,{expiresIn:"15m"}
  )

  const refreshToken=jwt.sign({
    id:user._id
  },process.env.JWT_SECRET,{expiresIn:"7d"})

  res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      secure:true,
      sameSite:'strict',
      maxAge:7*24*60*60*1000
    });

  res.status(201).json({
      message:"User Created Succesfully",
      user:{
        username,
        email,
        accessToken:accesssToken
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
      message:"Unauthorized token"
    })
  }

  const decoded = jwt.verify(refreshToken,process.env.JWT_SECRET)

  const accessToken= jwt.sign({
    id:decoded.id
  },process.env.JWT_SECRET,{expiresIn:"15m"}
  )

  //THis is only for extra additional security
  
  const newRefreshToken = jwt.sign({
    id:decoded.id
  },process.env.JWT_SECRET,{expiresIn:"7d"})

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


module.exports={registerUser,loginUser,getMe,refreshToken};