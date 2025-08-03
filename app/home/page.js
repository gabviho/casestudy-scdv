// app/home/page.js
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SignOutButton from "@/components/SignOutButton";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {session.user.email}!</h1>
      <p>Your role: <strong>{session.user.role}</strong></p>

      <section>
        <h2 className="text-xl font-semibold">Security Controls Implemented</h2>
        <ul className="list-disc pl-5">
          <li>✔ Role-based access control (Admin / Customer)</li>
          <li>✔ Account lockout after 5 failed attempts</li>
          <li>✔ Secure password hashing (bcrypt)</li>
          <li>✔ Route protection via middleware</li>
          <li>✔ Audit logging of auth events</li>
        </ul>
      </section>

      <section className="flex space-x-4">
        {/* Note: no <a> inside Link */}
        <Link href="/admin/logs" className="underline text-blue-600">
          View Audit Logs
        </Link>
        <SignOutButton />
      </section>
    </div>
  );
}
