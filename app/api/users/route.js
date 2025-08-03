// app/api/users/route.js
import connectToDatabase from "@/utils/database";
import User from "@/models/user";
import bcrypt from "bcrypt";
import sanitizeHtml from "sanitize-html";
import { writeFile } from "fs/promises";
import { Buffer } from "buffer";

// still need this to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

async function saveUser(user, avatar) {
  const bytes = await avatar.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const path = `${process.cwd()}/tmp/${avatar.name}`;
  await writeFile(path, buffer);
  await user.save();
}

export async function POST(req) {
  try {
    // 1) DB
    await connectToDatabase();

    // 2) parse the multipart/form-data
    const data = await req.formData();
    const userInfo = JSON.parse(data.get("userInfo"));
    const avatar   = data.get("avatar");

    // After:
const { email, firstName, lastName, phoneNumber, password } = userInfo;

if (!email || !firstName || !lastName || !phoneNumber || !password) {
  return new Response(
    JSON.stringify({ message: "All fields are required." }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}


// (optional) You can still enforce server‐side password rules here,
// but no need to compare confirmPassword since it never arrives.

    // if (password !== confirmPassword) {
    //   return new Response(
    //     JSON.stringify({ message: "Passwords do not match." }),
    //     { status: 400, headers: { "Content-Type": "application/json" } }
    //   );
    // }

    // 5) sanitize + hash
    const clean = {
      email:       sanitizeHtml(email.trim()),
      firstName:   sanitizeHtml(firstName.trim()),
      lastName:    sanitizeHtml(lastName.trim()),
      phoneNumber: sanitizeHtml(phoneNumber.trim()),
    };
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6) build and save
    const user = new User({
      ...clean,
      password: hashedPassword,
      avatar: {
        data: "/tmp/" + avatar.name,
        contentType: avatar.type,
      },
    });
    await saveUser(user, avatar);

    // 7) return success
    return new Response(
      JSON.stringify({ message: "User created successfully." }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
