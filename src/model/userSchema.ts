
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
    select: false,
  },
  password_reset_expires: {
    type: Date,
    select: false,
  },
  email_token: {
    type: String,
    select: false,
  },
  email_token_expires: {
    type: Date,
    select: false,
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['user', 'staff'],
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
  },
  
 

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
      this.passwordResetToken = code;
      this.passwordResetExpires = Date.now() + 3600000; // 1 hour from now
    
    return code;
  

  };
  
  // Method to check if the reset token is valid (not expired)
  userSchema.methods.isPasswordResetTokenValid = function (token: number) {
    return (
      this.passwordResetToken === token && this.passwordResetExpires > Date.now()
    );
  };
  
  // Method to generate account verification token
  userSchema.methods.createEmailVerificationToken = function () {
    const emailToken = crypto.randomBytes(20).toString('hex');
  
    // Set account verifcation token
    this.accountVerificationToken = emailToken;
  
  
    return emailToken;
  };
  
  
  // Method to check if the email Verification token is valid 
  userSchema.methods.isEmailVerificationTokenValid = function (emailToken: number) {
    return (
      this.accountVerificationToken = emailToken
    );
  };
  


const UserModel = mongoose.model('User', userSchema);

export default UserModel;