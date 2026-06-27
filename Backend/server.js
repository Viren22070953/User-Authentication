require("dotenv").config();
const app=require("./src/app")
const connectDB=require("./src/db/db")



/**
 * @description ConnectDb function called 
 */
connectDB();

/**
 * @description Running the sever on port 3000
 */
app.listen(3000,()=>{
  console.log("Server is running on port 3000")
})

