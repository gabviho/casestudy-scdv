"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import styles from "@/app/Form.module.css";

export default function ResetPage() {
  const router       = useRouter();
  const params       = useSearchParams();
  const token        = params.get("token") || "";
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");

  // If no token in URL, redirect back to login
  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post("/api/password/reset", {
        token,
        newPassword: password,
      });
      setSuccess(res.data.message);
      // Redirect to login after a short delay
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || "Reset failed. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md space-y-4 bg-white p-8 rounded shadow"
    >
      <h2 className="text-2xl font-bold text-center">Reset Password</h2>

      {success && <p className="text-green-600 text-center">{success}</p>}
      {error   && <p className="text-red-500   text-center">{error}</p>}

      <div className={styles.input_group}>
        <input
          type="password"
          placeholder="New password"
          className={styles.input_text}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className={styles.input_group}>
        <input
          type="password"
          placeholder="Confirm new password"
          className={styles.input_text}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      <button type="submit" className={`${styles.button} w-full`}>
        Reset Password
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
