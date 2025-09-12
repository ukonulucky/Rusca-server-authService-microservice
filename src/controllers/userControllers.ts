import { RequestHandler, Request } from "express";
import logger from "../utils/logger";
import jwt from "jsonwebtoken";
import {
    changePasswordOTPVerificationValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  verifyPasswordResetTokenValidation,
} from "../utils/validate";

import UserModel from "../model/userSchema";
import { isValidObjectId } from "mongoose";
import sendMailjetEmail from "../utils/sendEmail";
import { encrypt } from "../utils/encrypt";
import { getUserIpFunc } from "../utils/checkUserIp";
import { requestIpType } from "../types/appTypes";
// register user
export const registerUserController: RequestHandler = async (req, res) => {
  logger.info("user hit the register controller");
  try {
    // validate user input
    const { error } = registerValidation(req.body);
    if (error) {
      logger.error("user registration error", error.details[0].message);
      res.status(400).json({
        message: error.details[0].message,
        status: false,
      });
      return;
    }
    const { email, password, fullName, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { fullName }],
    });

    if (existingUser) {
      logger.warn("Attempted registration with existing email");
      return res.status(409).json({
        message: "User with this email or user name already exists",
        status: false,
      });
    }


    const user = new UserModel({
      password,
      email,
      fullName,
        role,
      phone
    });
    const newUser = await user.save();
    logger.info("user created");
    // create token

    /* endpoint to verify email */
    const emailVerificationToken = newUser.createEmailVerificationToken();

    const verifyEmailEndpoint =
      process.env.SERVER_URL +
      "/api/auth" +
      "/emailVerify/" +
      newUser.email +
      "/" +
      emailVerificationToken;

    const option = {
      subject: "Activate Your Account!",
      emailTemplate: "accountVerification",

      to: [
        {
          email: newUser.email,
          name: fullName,
        },
      ],

      mailData: {
        companyName: "Rusca bank",
        userName: fullName,
        link: verifyEmailEndpoint,
      },
    };
  newUser.save()
    await sendMailjetEmail(req, res, option);

    res.status(201).json({
      status: "success",
      message: "Account created, please verify your email",
      data: newUser,
    });
  } catch (error) {
    logger.error("Registration error", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

// login user

export const loginUserController: RequestHandler = async (req, res) => {
  logger.info("user hit the login controller");
  try {
    // validate user input
    const { error } = loginValidation(req.body);
    if (error) {
      logger.error("user login error", error.details[0].message);
      res.status(400).json({
        message: error.details[0].message,
        status: false,
      });
      return;
    }
    const { email, password } = req.body;
    console.log("loging body", req.body)
    const user = await UserModel.findOne({
      email,
    });
      console.log("login user", user)
    if (!user) {
      logger.warn("Attempted login with invalid email");
      return res.status(409).json({
        message: "Invalid user email/password",
        status: false,
      });
    }
    // check if passoword match

    const isPasswordCorrect = await user.comparePassword(password);

    /* const encryptedId = encrypt(user._id.toString()); */
  
    if (!isPasswordCorrect || user.status === "suspended") {
      logger.error("Attempt to login user with wrong credentials");
      if (user.failedLoginCount === 2) {
        // check if user account is already suspended
          if (user.status !== "suspended") {
            await UserModel.findOneAndUpdate(
                { email },
                { status: "suspended" },
                { new: true } // returns the updated document
              );
        }
        if (!(req as requestIpType).clientIp) {
          logger.warn("User ip not found")
        }
        const {
          location: { regionName },
          time,
          ipAddress,
          status,
        } = await getUserIpFunc((req as requestIpType).clientIp);
        if (status !== "success") {
          logger.warn("Failed to obtain user ip")
        }

        const option1 = {
          subject: "Failed Loging Attempt",
          to: [
            {
              email,
              name: user.fullName,
            },
          ],
          emailTemplate: "failedLoginTemplate",
          mailData: {
            companyName: "Rusca bank",
            userName: user.fullName,
            link: `${process.env.SERVER_URL}/api/auth/account/suspended/activate/${user._id}`,
            verificationCode: undefined,
            attemptTime: time,
            ipAddress: ipAddress || "not found",
            location: regionName || "not found",
          },
        };
          await sendMailjetEmail(req, res, option1);
        return  res.status(400).json({
            message: "Account suspended, please check your mail to activate account.",
            status: false,
          });
       
      }
      await UserModel.findOneAndUpdate(
        { email },
        {
          $inc: {
            failedLoginCount: 1,
          },
        },
        { new: true } // returns the updated document
      );
      return res.status(401).json({
        message: "Invalid user email/password",
        status: false,
      });
    }

  

    // check if user email is verified
    const { email_verified, fullName, status } = user;
    if (!email_verified) {
      // create an email verification token
      logger.info("attempt to create an email verification token");
      const emailVerificationToken = user.createEmailVerificationToken();

      const verifyEmailEndpoint =
        process.env.SERVER_URL +
        "/api/auth" +
        "/emailVerify/" +
        email +
        "/" +
        emailVerificationToken;

      console.log("email verification token", emailVerificationToken);

      const option = {
        subject: "Activate Your Account!",
        emailTemplate: "accountVerification",

        to: [
          {
            email: user.email,
            name: user.fullName,
          },
        ],

        mailData: {
          companyName: "Rusca bank",
          userName: user.fullName,
          link: verifyEmailEndpoint,
        },
      };

       sendMailjetEmail(req, res, option);
        await user.save()
      return res.status(201).json({
        message: "Email not verified, An email verification link has been sent to your mail",
        status: true,
        user
      });
    }


    const { _id } = user;
    // set jwt token for the user
    const token = jwt.sign({ id: _id }, process.env.JWT_SECRET as string);

    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // cookie will expire in 24 hours
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });

    res.status(201).json({
      message: "User loggedIn successfuly",
      status: true,
        user,
      token
    });
  } catch (error) {
    logger.error("Login error", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

// logout controller
export const logOutUserController: RequestHandler = async (req, res) => {
  logger.info("user hit the logout controller");
  try {
    res.cookie("token", "", {
      maxAge: 1,
    });
    return res.status(200).json({
      isAuthenticated: false,
      message: "user logged out",
    });
  } catch (error) {
    logger.error("Logout error", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

// get single user controller
export const getSingleUserController: RequestHandler = async (req, res) => {
  try {
    logger.info("User hits the getAllUsersRoutes");
    const { id } = req.params;
    const isIdVallid = isValidObjectId(id.toString());
    if (!id || !isIdVallid) {
      return res.status(404).json({
        status: "false",
        message: "User id not found",
      });
    }

    const userFound = await UserModel.findById(id);
    if (!userFound) {
      return res.status(404).json({
        status: "false",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      user: userFound,
    });
  } catch (error) {
    logger.error("Get single user error", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

// get all users controllers
export const getAllUsersController: RequestHandler = async (req, res) => {
  try {
    logger.info("User hits the getAllUsersRoutes");
      const users = await UserModel.find({});
    if (!users) {
      return res.status(404).json({
        status: "false",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      users
    });
  } catch (error) {
    logger.error("get all users", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

// forgot password controller
export const forgotPasswordController: RequestHandler = async (req, res) => {
  try {
    const { error } = forgotPasswordValidation(req.body);
    if (error) {
      logger.error(
        "user forgot password email error",
        error.details[0].message
      );
      res.status(400).json({
        message: error.details[0].message,
        status: false,
      });
      return;
    }

    const { email } = req.body;

    const foundUser = await UserModel.findOne({
      email,
    });
    if (!foundUser) {
      return res.status(401).json({
        status: false,
        message: "user not found",
      });
    }

    /* generate 5 digit code fro reset password */

    const code = foundUser.createPasswordResetCode();
    const { email: userEmail, fullName } = foundUser;

    await foundUser.save();

    const option = {
      subject: "Forgot Password",
      emailTemplate: "forgotPasswordTemplate",

      to: [
        {
          email: userEmail,
          name: fullName,
        },
      ],

      mailData: {
        companyName: "Rusca Bank",
        userName: fullName,
        link: "",
        verificationCode: code,
      },
    };

    await sendMailjetEmail(req, res, option);

    logger.info(`user sent email: ${email} for forgot password`);

    /*  mailSender() */
    res.status(200).json({
      error: false,
      message: "Hi, a change password OTP has been sent to your mail",
    });
  } catch (error) {
    logger.error("Forgot password error", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

// change password controller
export const changePasswordController: RequestHandler = async (req, res) => {
  try {
    const { error } = changePasswordValidation(req.body);
    if (error) {
      logger.error(
        "user hit the change forgot password controller error",
        error.details[0].message
      );
      res.status(400).json({
        message: error.details[0].message,
        status: false,
      });
      return;
    }
    const { email, token, password } = req.body;
    const foundUser = await UserModel.findOne({
      email,
    });
    if (!foundUser) {
      return res.status(401).json({
        status: false,
        message: "user not found",
      });
    }
    /* generate 5 digit code */

    const isTokenValid = await foundUser.isPasswordResetTokenValid(token);
  console.log("result", isTokenValid)
      if (!isTokenValid) {
        return  res.status(400).json({
              message: "Incorrect or expired OTP",
              status: false
          })
     
    }

    const { email: emailSaved, fullName } = foundUser;
    foundUser.password = password;
    foundUser.password_reset_token = null;
    foundUser.password_reset_expires = null;

    await foundUser.save();

    const option = {
      subject: "Password Update Success",
      emailTemplate: "passwordUpdateSuccessTemplate",

      to: [
        {
          email: emailSaved,
          name: fullName,
        },
      ],

      mailData: {
        companyName: "Rusca bank",
        userName: fullName,
        link: "https://ukonuluckyportfolio.vercel.app/",
      },
    };

    sendMailjetEmail(req, res, option);
    res.status(200).json({
      error: false,
      status: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    logger.error("change password error", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

// change password controller
export const verifyPasswordResetTokenController: RequestHandler = async (req, res) => {
  try {
    const { error } = verifyPasswordResetTokenValidation(req.body);
    if (error) {
      logger.error(
        "user hit the verify password reset token controller error",
        error.details[0].message
      );
      res.status(400).json({
        message: error.details[0].message,
        status: false,
      });
      return;
    }
    const { email, token } = req.body;
    const foundUser = await UserModel.findOne({
      email,
    });
    if (!foundUser) {
      return res.status(401).json({
        status: false,
        message: "user not found",
      });
    }
    /* generate 5 digit code */

    const isTokenValid = await foundUser.isPasswordResetTokenValid(token);
  console.log("result", isTokenValid)
      if (!isTokenValid) {
        return  res.status(400).json({
              message: "Incorrect or expired OTP",
              status: false
          })
     
    }

    const { email: emailSaved, fullName } = foundUser;

    res.status(200).json({
      error: false,
      status: true,
      message: "Token verified",
    });
  } catch (error) {
    logger.error("verify token change password error", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};


//delete password controller
export const deleteUserController: RequestHandler = async (req, res) => {
  try {
    logger.info("user hits the deleteController");
      const { id } = req.params;
      
      // check if id is a valid mongooseId

      const isIdVallid = isValidObjectId(id.toString());
    if (!id || !isIdVallid) {
      return res.status(404).json({
        status: "false",
        message: "User id not found or invalid",
      });
    }

    // delete user by Id

    const foundUser = await UserModel.findByIdAndDelete(id);
    if (!foundUser) {
      return res.status(401).json({
        status: false,
        message: "user not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    logger.error("user deletion error", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};
//delete password controller
export const changePasswordOTPVerificationController: RequestHandler = async (
  req,
  res
) => {
  try {
    logger.info("user hits the changePasswordOtpVerificationController");

      
       // validate user input
    const { error } = changePasswordOTPVerificationValidation(req.body);
    if (error) {
      logger.error("user chnagePasswordOtpVerification error", error.details[0].message);
      res.status(400).json({
        message: error.details[0].message,
        status: false,
      });
      return;
    }
    const { email, token } = req.body;

    const foundUser = await UserModel.findOne({
      email
    });
    if (!foundUser) {
      res.status(401).json({
        error: false,
        status: false,
        message: "user not found",
      });
      return;
    }

    /* check if token is valid */

    const isTokenValid = foundUser.isPasswordResetTokenValid(token);

    if (!isTokenValid) {
      throw new Error("Incorrect or expired OTP");
    }

    foundUser.password_reset_expires = null;
    foundUser.password_reset_token = null;
  

    await foundUser.save();

    res.status(200).json({
      error: false,
      status: "success",
      message: "OTP verified successfully",
      data: {
        email: foundUser.email,
      },
    });
  } catch (error) {
    logger.error("user deletion error", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

/// activate suspended account controller
export const suspendedAccountActivationController: RequestHandler = async (
    req,
    res
  ) => {
    try {
      logger.info("user hits the suspendedAccountActivationController");
  
         // validate user input
         const { id } = req.params
  
        if (!id) { 
          return  res.status(404).json({
                message: "id not found",
                status: false
            })
        }
       
      /*    const userId = decrypt(id) */
       
         const isIdVallid = isValidObjectId(id);  // check if userId is a valid mongoose id
         if (!isIdVallid) {
            res.status(404).json({
             status: "failed",
             message: "Invaild id or id not found",
            });
             return
         }
       
         
         const user = await UserModel.findByIdAndUpdate(
           id, {
             failedLoginCount: 0,
             status: "active"
         },
           {
             new: true
           }
         )
       
        if (!user) { 
            res.status(404).json({
                status: "false",
                message: "User not found",
               });
                return
        }
         res.render("suspendedAccountActivation", {
           userName: user.fullName,
           companyName: "Rusca bank",
           loginUrl:`${process.env.SERVER_URL}/api/auth/login`
           
         })
         // send user an otp to verifiy user
       
       }
     catch (error) {
      logger.error("user account suspension error", error);
      res.status(500).json({
        message: "Internal server error",
        status: false,
      });
    }
};
  
// verify user email

export const verifyUserEmailController: RequestHandler = async (
    req,
    res
  ) => {
    try {
      logger.info("user hits the verify email controller");
  
      const { email, token } = req.params;

      if (!token || !email) {
        throw new Error("Missing credentials");
      }
      const foundUser = await UserModel.findOne({
        email
      });
        console.log("found user:", foundUser)
      if (!foundUser) {
         res.status(401).json({
          status: false,
          message: "user not found",
         });
          return
      }
    
      const isTokenValid = await foundUser.isEmailVerificationTokenValid(token)
        if (!isTokenValid) {
          return  res.status(404).json({
                message: "Invalid user token",
                status: "true"
            })  
      
      }
      foundUser.email_verified = true;
        foundUser.email_token = null;
        foundUser.email_token_expires = null
      
      await foundUser.save();
      /* const url = process.env.CLIENT_URL + "/emailVerified"; */
      res.render("emailVerification")
       
       }
     catch (error) {
      logger.error("user account email verification error", error);
      res.status(500).json({
        message: "Internal server error",
        status: false,
      });
    }
};
  


