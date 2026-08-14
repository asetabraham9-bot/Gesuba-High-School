import React, { useEffect, useState } from "react";

export default function Exams() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/exams/student/available", {
          credentials: "include"
        });
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setErr(String(e));
      }
    }
    load();
  }, []);

  if (err) return <div className="text-red-600">Error: {err}</div>;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Available Exams</h2>
      <pre className="bg-white p-4 rounded shadow">{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}
