import React, { useEffect, useState } from "react";

export default function InstructorDashboard({ user }: { user: any }) {
  const [exams, setExams] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/exams", { credentials: "include" });
        const json = await res.json();
        setExams(json.data.exams || json);
      } catch (e: any) {
        setErr(String(e));
      }
    }
    load();
  }, []);

  async function publishResults(examId: string) {
    try {
      const res = await fetch(`/api/v1/exams/${examId}/publish-results`, {
        method: "POST",
        credentials: "include"
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed");
      alert("Results published");
    } catch (e: any) {
      alert(String(e));
    }
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Instructor Dashboard</h2>
      {err && <div className="text-red-600">{err}</div>}
      <ul>
        {exams.map((ex) => (
          <li key={ex._id} className="bg-white p-3 mb-2 rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{ex.title}</div>
              <div className="text-sm text-gray-600">{ex.subjectId?.name || ex.subjectId}</div>
            </div>
            <div>
              <button onClick={() => publishResults(ex._id)} className="bg-green-600 text-white px-3 py-1 rounded">Publish Results</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
