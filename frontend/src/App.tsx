import React from "react";
import React, { useState } from "react";
import Exams from "./pages/Exams";
import Login from "./pages/Login";
import InstructorDashboard from "./pages/InstructorDashboard";

export default function App() {
  const [user, setUser] = useState<any | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Gesuba Demo Frontend</h1>
      </header>
      <main className="max-w-4xl mx-auto mt-6">
        {!user ? (
          <Login onLogin={setUser} />
        ) : user.role === "INSTRUCTOR" || user.role === "ADMIN" ? (
          <InstructorDashboard user={user} />
        ) : (
          <Exams />
        )}
      </main>
    </div>
  );
}
