// models/user.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true },
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  password:     { type: String, required: true },
  phoneNumber:  { type: String, required: true },
  avatar: {
    data:       { type: String, required: true },
    contentType:{ type: String, required: true },
  },
  role: {
    type: String,
    enum: ["admin","manager","customer"],
    default: "customer",
    required: true
  },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil:           { type: Date },
},
{
  timestamps: true
});

userSchema.virtual("isLocked").get(function(){
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Reset counters on successful login
userSchema.methods.resetLoginAttempts = function(){
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

userSchema.methods.incLoginAttempts = function(){
  const updates = { $inc: { failedLoginAttempts: 1 } };
  // lock after 5 attempts for 2 hours
  if(this.failedLoginAttempts + 1 >= 5 && !this.isLocked){
    updates.$set = { lockUntil: Date.now() + 2*60*60*1000 };
  }
  return this.updateOne(updates);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
