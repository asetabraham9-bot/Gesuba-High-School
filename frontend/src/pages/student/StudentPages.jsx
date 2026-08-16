import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  examsApi,
  materialsApi,
  notificationsApi,
  unwrapList
} from "../../lib/api";
import {
  Alert,
  EmptyState,
  PageHeader,
  StatusPill,
  examStatusTone
} from "../../components/ui";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function StudentOverview() {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [a, u, n] = await Promise.all([
          examsApi.studentAvailable(),
          examsApi.studentUpcoming(),
          notificationsApi.unreadCount()
        ]);
        if (cancelled) return;
        setAvailable(unwrapList(a, ["exams"]));
        setUpcoming(unwrapList(u, ["exams"]));
        setUnread(n?.data?.unreadCount ?? 0);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.full_name || user?.name || "Student"}`}
        subtitle={
          user?.grade_level
            ? `Grade ${user.grade_level} · ${user.email}`
            : user?.email
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-brand-600">Available now</p>
          <p className="mt-1 text-3xl font-bold text-brand-900">
            {available.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-brand-600">Upcoming</p>
          <p className="mt-1 text-3xl font-bold text-brand-900">
            {upcoming.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-brand-600">Unread notices</p>
          <p className="mt-1 text-3xl font-bold text-brand-900">{unread}</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-brand-900">Take an exam</h2>
            <Link to="/student/exams" className="text-sm font-medium text-brand-700">
              View all
            </Link>
          </div>
          {available.length === 0 ? (
            <p className="text-sm text-brand-600">No exams available right now.</p>
          ) : (
            <ul className="space-y-2">
              {available.slice(0, 4).map((exam) => (
                <li
                  key={exam._id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-brand-50 px-3 py-2"
                >
                  <span className="text-sm font-medium">{exam.title}</span>
                  <Link
                    to={`/student/exams/${exam._id}`}
                    className="btn-primary py-1.5 text-xs"
                  >
                    Start
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="mb-3 font-semibold text-brand-900">Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-brand-600">Nothing scheduled.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {upcoming.slice(0, 5).map((exam) => (
                <li key={exam._id} className="flex justify-between gap-2">
                  <span>{exam.title}</span>
                  <span className="text-brand-500">{formatDate(exam.startAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export function StudentExams() {
  const [tab, setTab] = useState("available");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const payload =
          tab === "available"
            ? await examsApi.studentAvailable()
            : tab === "upcoming"
              ? await examsApi.studentUpcoming()
              : await examsApi.studentPast();
        if (!cancelled) setRows(unwrapList(payload, ["exams"]));
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
  }, [tab]);

  return (
    <div>
      <PageHeader
        title="Exams"
        subtitle="Available, upcoming, and past exams from the API."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["available", "Available"],
          ["upcoming", "Upcoming"],
          ["past", "Past"]
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={tab === key ? "btn-primary" : "btn-secondary"}
          >
            {label}
          </button>
        ))}
      </div>
      {error ? <Alert>{error}</Alert> : null}
      {loading ? (
        <p className="text-sm text-brand-600">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="No exams in this list" />
      ) : (
        <div className="overflow-x-auto card p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-brand-100 bg-brand-50 text-brand-700">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Window</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((exam) => (
                <tr key={exam._id} className="border-b border-brand-50">
                  <td className="px-4 py-3 font-medium">{exam.title}</td>
                  <td className="px-4 py-3">
                    <StatusPill tone={examStatusTone(exam.status)}>
                      {exam.status}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3 text-brand-600">
                    {formatDate(exam.startAt)} → {formatDate(exam.endAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {tab === "available" ? (
                      <Link
                        to={`/student/exams/${exam._id}`}
                        className="btn-primary py-1.5 text-xs"
                      >
                        Open
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    materialsApi
      .list({ status: "PUBLISHED" })
      .then((payload) => {
        if (!cancelled) setMaterials(unwrapList(payload, ["materials"]));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader title="My materials" subtitle="Published study resources." />
      {error ? <Alert>{error}</Alert> : null}
      {materials.length === 0 ? (
        <EmptyState title="No materials found" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {materials.map((item) => (
            <article key={item._id} className="card">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">{item.title}</h2>
                <StatusPill>{item.type}</StatusPill>
              </div>
              <p className="mt-2 text-sm text-brand-600">
                {item.description || item.content || "No description"}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function StudentNotifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    const payload = await notificationsApi.list();
    const data = payload?.data;
    setItems(data?.notifications || unwrapList(payload, ["notifications"]));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function markAll() {
    await notificationsApi.markAllRead();
    await load();
  }

  async function markOne(id) {
    await notificationsApi.markRead(id);
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        actions={
          <button type="button" className="btn-secondary" onClick={markAll}>
            Mark all read
          </button>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      {items.length === 0 ? (
        <EmptyState title="Inbox is empty" />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n._id}
              className={`card ${n.isRead ? "opacity-70" : "border-brand-300"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-brand-900">{n.title}</p>
                  <p className="mt-1 text-sm text-brand-600">{n.message}</p>
                  <p className="mt-2 text-xs text-brand-500">
                    {formatDate(n.createdAt)} · {n.type}
                  </p>
                </div>
                {!n.isRead ? (
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    onClick={() => markOne(n._id)}
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StudentProfile() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="Profile" />
      <div className="card max-w-xl space-y-3 text-sm">
        <p>
          <span className="font-semibold">Name:</span>{" "}
          {user?.full_name || user?.name || "—"}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {user?.email}
        </p>
        <p>
          <span className="font-semibold">Student ID:</span>{" "}
          {user?.student_id || user?.username || "—"}
        </p>
        <p>
          <span className="font-semibold">Grade:</span>{" "}
          {user?.grade_level ?? "—"}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {user?.status}
        </p>
      </div>
    </div>
  );
}
