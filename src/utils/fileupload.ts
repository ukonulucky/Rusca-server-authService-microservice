const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary")
import { Request } from "express"

// cloudinary configuration
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_Name,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_KEY_SECRET
})


// cloudinary storage initialization
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
   allowedFormats:["png", "jpg", "jpeg"],
   params: {
    folder:"RuscaWebsite",
       format: async (req:Request, file:File) => { 
         try {
           return "jpeg"
         } catch (error) {
            console.log("error from mutter", error)
         }
       },
    transformation:[{width:500, height: 500, crop:"limit"}]
   }
})


module.exports = storage