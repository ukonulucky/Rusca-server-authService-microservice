
import mongoose from "mongoose";
import argon2 from "argon2"
import { userSchemaType } from "../types/appTypes";
import crypto from "crypto"


const userSchema = new mongoose.Schema<userSchemaType>({
  fullName: {
    type: String,
    required: true,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  image: {
      type: Object,
  },
  password_reset_token: {
    type: String,
    default: null
  },
  password_reset_expires: {
    type: Date,
    
    default: null
  },
  email_token: {
    type: String,
    default: null
 
  },
  email_token_expires: {
    type: Date,
    default: null
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  failedLoginCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["suspended", "active","pending"],
   default:"pending"
  }
}, {
  timestamps: true,
});



// hash the password before saving to db anytime it is tampered
userSchema.pre("save", async function (next) { 
    try {
        if (this.isModified("password")) { 
            this.password = await argon2.hash(this.password)
            next()
        }
    } catch (error:any) {
        next(error)
    }
})

userSchema.methods.comparePassword = async function (userPassword: string) { 
  try {
    if (!userPassword || userPassword.length === 0) {
      throw new Error("Password must be provided");
    }
    console.log("db password", this.password)
    return await argon2.verify(this.password,userPassword )
   } catch (error: any) {
    throw new Error(error)
   }
}

// Method to generate a password reset token
userSchema.methods.createPasswordResetCode = function () {
    // Generate a random number between 10000 and 99999
    const code = crypto.randomInt(10000, 100000); // 100000 is exclusive
  
  // Set token to be valid for 1 hour
  const now = new Date()
  const expirationTime = new Date(now.getTime() + 10 * 60 * 1000); // Add 1o minutes (10 minutes * 60 seconds * 1000 milliseconds)
  this.password_reset_expires = expirationTime
  this.password_reset_token = code.toString()
    
    return code;
  

  };
  
  // Method to check if the reset token is valid (not expired)
userSchema.methods.isPasswordResetTokenValid = function (token: string) {


    console.log("token sent", token, typeof token,"password_reset_token:", this.password_reset_token, typeof this.password_reset_token)
    return (
      this.password_reset_token === token && this.password_reset_expires > Date.now()
    );
  };
  
  // Method to generate account verification token
userSchema.methods.createEmailVerificationToken = function () {
    console.log("code ran in createEmailVerificationToken")
    const emailToken = crypto.randomBytes(20).toString('hex');
  
    // Set account verifcation token
    this.email_token = emailToken;
    const now = new Date(); // Current time
const expirationTime = new Date(now.getTime() + 10 * 60 * 1000); // Add 10 minutes (10 minutes * 60 seconds * 1000 milliseconds)
  
    this.email_token_expires = expirationTime 
  
  
    return emailToken;
  };
  
  
  // Method to check if the email Verification token is valid 
  userSchema.methods.isEmailVerificationTokenValid = function (emailToken: string) {
    return (
      this.email_token === emailToken && this.email_token_expires > Date.now()
    );
  };
  


const UserModel = mongoose.model('User', userSchema);

export default UserModel;