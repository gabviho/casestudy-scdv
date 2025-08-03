// app/api/password/reset/route.js
import connectToDatabase from "@/utils/database";
import User from "@/models/user";
import TokenModel from "@/models/passwordresettoken";
import bcrypt from "bcrypt";

export const config = { api: { bodyParser: true } };

export async function POST(req) {
  console.log("[RESET REQUEST] incoming reset attempt:", new Date().toISOString());
  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    console.error("[RESET FAILURE] invalid JSON:", err);
    return new Response(
      JSON.stringify({ message: "Invalid request payload" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { token, newPassword } = payload;
  if (!token || !newPassword) {
    console.error("[RESET FAILURE] missing fields");
    return new Response(
      JSON.stringify({ message: "Token and new password are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Enforce password policy
  const policy = {
    minLength: 8,
    regex: /(?=.*\d)(?=.*[A-Z])(?=.*\W)/, // digit, uppercase, non-word
  };
  if (newPassword.length < policy.minLength || !policy.regex.test(newPassword)) {
    console.error("[RESET FAILURE] password policy violation");
    return new Response(
      JSON.stringify({
        message: `Password must be at least ${policy.minLength} characters long and include an uppercase letter, a digit, and a symbol.`,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Connect to DB
  try {
    await connectToDatabase();
  } catch (err) {
    console.error("[RESET FAILURE] DB connect error:", err);
    return new Response(
      JSON.stringify({ message: "Database connection error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Find valid (non-expired) tokens
  let matchToken;
  try {
    const tokens = await TokenModel.find({ expiresAt: { $gt: new Date() } });
    for (const entry of tokens) {
      if (await bcrypt.compare(token, entry.tokenHash)) {
        matchToken = entry;
        break;
      }
    }
  } catch (err) {
    console.error("[RESET FAILURE] token lookup error:", err);
    return new Response(
      JSON.stringify({ message: "Token lookup error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!matchToken) {
    console.error("[RESET FAILURE] invalid or expired token");
    return new Response(
      JSON.stringify({ message: "Invalid or expired token" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Fetch the user
  let user;
  try {
    user = await User.findById(matchToken.userId);
  } catch (err) {
    console.error("[RESET FAILURE] user lookup error:", err);
    return new Response(
      JSON.stringify({ message: "User lookup error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!user) {
    console.error("[RESET FAILURE] user not found for token");
    return new Response(
      JSON.stringify({ message: "Invalid token" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Prevent re-use of the same password
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    console.error("[RESET FAILURE] password re-use attempt");
    return new Response(
      JSON.stringify({ message: "New password must differ from the old one" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // All checks passed — update password
  let hashed;
  try {
    hashed = await bcrypt.hash(newPassword, 10);
  } catch (err) {
    console.error("[RESET FAILURE] bcrypt.hash error:", err);
    return new Response(
      JSON.stringify({ message: "Error processing password" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await User.updateOne(
      { _id: user._id },
      {
        password: hashed,
        failedLoginAttempts: 0,
        lockUntil: undefined,
        passwordChangedAt: new Date(),
      }
    );
  } catch (err) {
    console.error("[RESET FAILURE] user update error:", err);
    return new Response(
      JSON.stringify({ message: "Error saving new password" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Cleanup tokens
  try {
    await TokenModel.deleteMany({ userId: user._id });
  } catch (err) {
    console.warn("[RESET WARNING] token cleanup failed:", err);
  }

  console.log("[RESET SUCCESS] password reset for user:", user._id.toString());
  return new Response(
    JSON.stringify({ message: "Password has been reset successfully!" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
