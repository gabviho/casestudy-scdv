"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { HiAtSymbol, HiFingerPrint } from "react-icons/hi";

import styles from "@/app/Form.module.css";

export default function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: email.trim(),
      password: password,
    });

    if (!res) {
      setError("Login failed: no response from server.");
      return;
    }

    if (res.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/home");
  };

  return (
    <form
      className="relative z-10 mx-auto w-full max-w-[450px] space-y-3 rounded-md bg-white div-8 text-slate-900 p-8"
      onSubmit={handleSubmit}
    >
      <h2 className="py-3 mb-4 text-4xl font-bold text-center">Sign In</h2>
      <div>Enter your email and password to sign in</div>

      {error && <div className="text-red-500 text-center">{error}</div>}

      <div className={styles.input_group}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className={styles.input_text}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <span className="flex items-center px-4 icon">
          <HiAtSymbol size={20} />
        </span>
      </div>

      <div className={styles.input_group}>
        <input
          type={show ? "text" : "password"}
          name="password"
          placeholder="Password"
          className={styles.input_text}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span
          className="flex items-center px-4 icon cursor-pointer"
          onClick={() => setShow(!show)}
        >
          <HiFingerPrint size={20} />
        </span>
      </div>

      <button type="submit" className={styles.button}>
        Sign In
      </button>

      {/* Forgot password link */}
      <div className="text-center mt-2">
        <Link href="/forgot" className="text-sm text-indigo-500 hover:underline">
          Forgot your password?
        </Link>
      </div>

      <div className="mt-8 text-center">
        Don&apos;t have an account?
        <span className="ml-2 text-indigo-500">
          <Link href="/register">Register</Link>
        </span>
      </div>
    </form>
  );
}
