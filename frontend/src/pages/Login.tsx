import React, { useState } from "react";

export default function Login({ onLogin }: { onLogin: (u: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Login failed");
      onLogin(json.data.user);
    } catch (err: any) {
      setErr(String(err.message ?? err));
    }
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <label className="block mb-2">Email
        <input className="w-full border p-2 mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="block mb-4">Password
        <input type="password" className="w-full border p-2 mt-1" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
    </form>
  );
}
