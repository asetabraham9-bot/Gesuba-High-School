import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/ui";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    password: "",
    gradeLevel: "9"
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (event) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register({
        fullName: form.fullName,
        studentId: form.studentId,
        password: form.password,
        gradeLevel: Number(form.gradeLevel)
      });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card">
        <h1 className="font-display text-3xl font-bold text-brand-900">
          Student sign up
        </h1>
        <p className="mt-1 text-sm text-brand-600">
          Instructor and admin accounts are created by administrators.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error ? <Alert>{error}</Alert> : null}
          <div>
            <label className="label" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              className="input"
              value={form.fullName}
              onChange={update("fullName")}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="studentId">
              Student ID
            </label>
            <input
              id="studentId"
              className="input"
              value={form.studentId}
              onChange={update("studentId")}
              required
            />
            <p className="mt-1 text-xs text-brand-500">
              Login email becomes {"{id}"}@student.gesuba.edu.et
            </p>
          </div>
          <div>
            <label className="label" htmlFor="gradeLevel">
              Grade
            </label>
            <select
              id="gradeLevel"
              className="input"
              value={form.gradeLevel}
              onChange={update("gradeLevel")}
            >
              {[9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              minLength={8}
              value={form.password}
              onChange={update("password")}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-brand-600">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-brand-800 underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
