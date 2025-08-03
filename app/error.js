// app/error.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error); // server‐side log
  }, [error]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Something went wrong.</h1>
      <p>We’re working on it, please try again later.</p>
      <button onClick={() => reset()}>Retry</button>
    </div>
  );
}
