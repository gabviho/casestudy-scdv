// models/PasswordResetToken.js
import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash:   { type: String, required: true, unique: true },
  expiresAt:   { type: Date, required: true },
}, { timestamps: true });

const PasswordResetToken = mongoose.models.PasswordResetToken
  || mongoose.model("PasswordResetToken", tokenSchema);

export default PasswordResetToken;
