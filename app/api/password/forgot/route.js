// app/api/password/forgot/route.js
import connectToDatabase from "@/utils/database";
import User from "@/models/user";
import TokenModel from "@/models/passwordresettoken";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const config = { api: { bodyParser: true } };

export async function POST(req) {
  await connectToDatabase();
  const { email } = await req.json();

  if (!email) {
    return new Response(
      JSON.stringify({ message: "Email is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const lookup = email.trim().toLowerCase();
  const user   = await User.findOne({ email: lookup });

  // If email not found, return 404 with specific message
  if (!user) {
    return new Response(
      JSON.stringify({ message: "Email not registered" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Remove existing tokens
  await TokenModel.deleteMany({ userId: user._id });

  // Generate & hash a new token
  const plainToken = crypto.randomBytes(32).toString("hex");
  const tokenHash  = await bcrypt.hash(plainToken, 10);
  const expiresAt  = new Date(Date.now() + 60 * 60 * 1000);

  await TokenModel.create({ userId: user._id, tokenHash, expiresAt });

  // (In a real app you'd email this link)
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset?token=${encodeURIComponent(plainToken)}`;
  console.log(`Password reset link for ${lookup}: ${resetUrl}`);

  return new Response(
    JSON.stringify({ message: "Reset link sent!" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
