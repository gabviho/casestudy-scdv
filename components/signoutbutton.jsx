// components/SignOutButton.jsx
"use client";

import { signOut } from "next-auth/react";
import styles from "@/app/Form.module.css";

export default function SignOutButton() {
  return (
    <button
      className={styles.button}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign Out
    </button>
  );
}
