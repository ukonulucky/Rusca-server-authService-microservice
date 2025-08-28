import Joi from "joi"
import { changePasswordOTPVerificationType, changePasswordType, userForgotPasswordType, userLoginType, userRegisterType } from "../types/appTypes"


export const registerValidation = (data: userRegisterType) => { 

    const schema = Joi.object({
        userName: Joi.string().min(3).max(15).required(),
        email: Joi.string().email().required(),
        password:Joi.string().min(5).max(15).required()
    })

    return schema.validate(data)

}
export const loginValidation = (data: userLoginType) => { 

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(5).max(15).required(),
        fullName: Joi.string(),
        role: Joi.string()
    })

    return schema.validate(data)

}

export const forgotPasswordValidation = (data:userForgotPasswordType) => { 
    const schema = Joi.object({
        email: Joi.string().email().required()
    })

    return schema.validate(data)
}

export const changePasswordValidation = (data:changePasswordType) => { 
    const schema = Joi.object({
        email: Joi.string().email().required(),
        token: Joi.string().required(),
        password: Joi.string().required(),
    })

    return schema.validate(data)
}

export const changePasswordOTPVerificationValidation = (data:changePasswordOTPVerificationType) => { 
    const schema = Joi.object({
        email: Joi.string().email().required(),
        token: Joi.string().required()
    })

    return schema.validate(data)
}