import React from "react";
import Exams from "./pages/Exams";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Gesuba Demo Frontend</h1>
      </header>
      <main className="max-w-4xl mx-auto mt-6">
        <Exams />
      </main>
    </div>
  );
}
