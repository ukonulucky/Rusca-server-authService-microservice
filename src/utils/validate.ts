import Joi from "joi"
import { changePasswordOTPVerificationType, changePasswordType, userForgotPasswordType, userLoginType, userRegisterType } from "../types/appTypes"


export const registerValidation = (data: userRegisterType) => { 
    if (!data) {
        return {
          error: { details: [{ message: "Request body cannot be empty" }] }
        };
      }

    const schema = Joi.object({
        fullName: Joi.string().min(3).max(15).required(),
        email: Joi.string().email().required(),
      password: Joi.string().min(5).max(15).required(),
        role:Joi.string().valid('user', 'admin'),
        phone:Joi.string()
        .pattern(/^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/)
        .message("Phone number must be a valid UK number, e.g., +447123456789 or 07123456789")
        .required()
    })

    return schema.validate(data)

}
export const loginValidation = (data: userLoginType) => { 
    if (!data) {
        return {
          error: { details: [{ message: "Request body cannot be empty" }] }
        };
      }
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(5).max(15).required(),
        fullName: Joi.string(),
        role: Joi.string()
    })

    return schema.validate(data)

}

export const forgotPasswordValidation = (data: userForgotPasswordType) => { 
    if (!data) {
        return {
          error: { details: [{ message: "Request body cannot be empty" }] }
        };
      }
    const schema = Joi.object({
        email: Joi.string().email().required()
    })

    return schema.validate(data)
}

export const changePasswordValidation = (data: changePasswordType) => { 
    if (!data) {
        return {
          error: { details: [{ message: "Request body cannot be empty" }] }
        };
      }
    const schema = Joi.object({
        email: Joi.string().email().required(),
        token: Joi.string().required(),
        password: Joi.string().required(),
    })

    return schema.validate(data)
}

export const changePasswordOTPVerificationValidation = (data: changePasswordOTPVerificationType) => { 
    if (!data) {
        return {
          error: { details: [{ message: "Request body cannot be empty" }] }
        };
      }
    const schema = Joi
    .object({
        email: Joi.string().email().required(),
        token: Joi.string().required()
    })

    return schema.validate(data)
}