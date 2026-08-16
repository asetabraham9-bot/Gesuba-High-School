import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { materialsApi, unwrapList } from "../lib/api";
import { Alert, EmptyState, PageHeader, StatusPill } from "../components/ui";

export default function Materials() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const payload = await materialsApi.list({ status: "PUBLISHED" });
        if (!cancelled) {
          setMaterials(unwrapList(payload, ["materials"]));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="section-title">Study materials</h1>
        <p className="mt-3 text-brand-600">
          Sign in to browse published notes, PDFs, and exercises from your
          instructors.
        </p>
        <Link to="/login" className="btn-primary mt-6 inline-flex">
          Log in to continue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Study materials"
        subtitle="Published resources from the school curriculum API."
      />
      {error ? <Alert>{error}</Alert> : null}
      {loading ? (
        <p className="text-sm text-brand-600">Loading materials…</p>
      ) : materials.length === 0 ? (
        <EmptyState
          title="No published materials yet"
          hint="Instructors can create and publish materials from their dashboard."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((item) => (
            <article key={item._id} className="card flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-brand-900">{item.title}</h2>
                <StatusPill tone="info">{item.type}</StatusPill>
              </div>
              {item.description ? (
                <p className="text-sm text-brand-600">{item.description}</p>
              ) : null}
              {item.content ? (
                <p className="line-clamp-4 text-sm text-brand-700">
                  {item.content}
                </p>
              ) : null}
              {item.fileUrl ? (
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary mt-auto self-start text-xs"
                >
                  Open file
                </a>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
