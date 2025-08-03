"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import styles from "@/app/Form.module.css";

export default function ForgotPage() {
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post("/api/password/forgot", {
        email: email.trim().toLowerCase(),
      });
      setMessage(res.data.message);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md space-y-4 bg-white p-8 rounded shadow"
    >
      <h2 className="text-2xl font-bold text-center">Forgot Password</h2>

      {message && <p className="text-green-600 text-center">{message}</p>}
      {error   && <p className="text-red-500   text-center">{error}</p>}

      <div className={styles.input_group}>
        <input
          type="email"
          placeholder="Your email address"
          className={styles.input_text}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <button type="submit" className={`${styles.button} w-full`}>
        Send Reset Link
      </button>

      <p className="text-center text-sm">
        Remembered?{" "}
        <Link href="/login" className="text-indigo-500 hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
