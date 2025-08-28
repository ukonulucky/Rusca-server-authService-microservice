import mongoose from "mongoose"


const refreshTokenSchema = new mongoose.Schema({
    accessToken: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps:true
})

// TTL index to auto-delete expired tokens when the expiresAt time is reached
refreshTokenSchema.index({
    expiresAt: 1
}, {
    expireAfterSeconds: 0
})

const refreshTokenModal = mongoose.model("RefreshToken", refreshTokenSchema)

export default refreshTokenModal