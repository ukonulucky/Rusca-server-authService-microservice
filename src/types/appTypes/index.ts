import mongoose from "mongoose"
import { Request } from "express"
export type userSchemaType = {
    _id?: MongooseIdType
    fullName: string,
    is_deleted: boolean,
    email: string,
    phone: string,
    image:Object
    createdAt?: string,
    password: string,
    password_reset_token: string | null,
    password_reset_expires: Date | null,
    email_token: string | null,
    email_token_expires: Date | null,
    email_verified: boolean,
    status:"suspended" | "active" | "pending",
    failedLoginCount: number,
    role: "user" | " staff",
    createPasswordResetCode: () => number
    comparePassword: (userPassword: string) => boolean,
    isPasswordResetTokenValid: (token: number) => boolean,
    createEmailVerificationToken: () => number,
    isEmailVerificationTokenValid: (eamilToken:number) => boolean
}

export type userRegisterType = {
    userName: string,
    email: string,
    password: string,

}
export type userLoginType = {
    email: string,
    password: string,

}

export type userForgotPasswordType = {
    email: string
}

export type changePasswordType = {
    email: string,
    token: string,
    password: string
} 


export type changePasswordOTPVerificationType = {
    email: string,
    token: string
}
export type MongooseIdType = mongoose.Types.ObjectId;

export type generateTokenType = {
    accessToken : string ,
        expiresAt :Date,
        userId : MongooseIdType
}


export type sendEmailOptionType = {
    subject: string,
    to: {
        email: string,
        name: string
    }[],
    emailTemplate: string
}


export interface mailSenderType { 
    subject: string
    to: {
        email: string,
        name: string
    }[]
    emailTemplate: string,
    mailData: {
        companyName: string, 
        userName: string,
        link?: string,
        verificationCode?: number,
        attemptTime?: string,
        ipAddress?: string,
        location?: string
    }
}


export interface IpAddressInfo { 
    time: string,
    ipAddress: string,
    location: {
        country: string,
        regionName: string
    },
    status: string
}

export interface  requestIpType extends Request { 
    clientIp:string
}