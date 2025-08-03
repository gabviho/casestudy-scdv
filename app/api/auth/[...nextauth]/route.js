// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/utils/database";
import User from "@/models/user";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "text",     placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔑 authorize called");
        console.log("Payload:", credentials);

        const lookupEmail = credentials.email?.trim().toLowerCase() || "";
        console.log("Looking up email:", lookupEmail);

        // --- Debug DB connect ---
        console.log("ENV MONGODB_URI:", process.env.MONGODB_URI);
        console.log("Before DB connect");
        try {
          await connectToDatabase();
          console.log("After DB connect");
        } catch (dbErr) {
          console.error("❌ DB connect error:", dbErr);
          throw new Error("Database connection error");
        }

        // --- Find user ---
        let user;
        try {
          user = await User.findOne({ email: lookupEmail });
          console.log("👤 found user:", user);
        } catch (findErr) {
          console.error("❌ User.findOne error:", findErr);
          throw new Error("Database query error");
        }

        if (!user) {
          throw new Error("Invalid email or password");
        }
        if (user.isLocked) {
          throw new Error("Account locked. Try again later.");
        }

        // --- Password check ---
        let isValid = false;
        try {
          isValid = await bcrypt.compare(credentials.password, user.password);
          console.log("🔐 password match?", isValid);
        } catch (cmpErr) {
          console.error("❌ bcrypt.compare error:", cmpErr);
          throw new Error("Authentication error");
        }

        if (!isValid) {
          await user.incLoginAttempts();
          throw new Error("Invalid email or password");
        }
        await user.resetLoginAttempts();

        return {
          id:    user._id.toString(),
          email: user.email,
          role:  user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      session.user.id   = token.sub;
      session.user.role = token.role;
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
