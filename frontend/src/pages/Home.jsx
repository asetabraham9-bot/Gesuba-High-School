import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isAuthenticated, dashboardPath } = useAuth();

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(105deg, rgba(15,35,51,0.88) 0%, rgba(26,76,111,0.72) 55%, rgba(15,35,51,0.45) 100%), url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80')"
          }}
        />
        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 text-white">
          <p className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
            Gesuba
          </p>
          <h1 className="mt-3 max-w-xl text-2xl font-semibold leading-snug sm:text-3xl">
            General Secondary School portal for learning and exams
          </h1>
          <p className="mt-4 max-w-lg text-brand-100">
            Students, instructors, and admins share one secure system for
            materials, attendance, and online assessment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <Link to={dashboardPath} className="btn-accent">
                Open dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-accent">
                  Student sign up
                </Link>
                <Link
                  to="/login"
                  className="btn border border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  Portal login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="section-title">Built for school operations</h2>
        <p className="mt-2 max-w-2xl text-brand-600">
          The portal connects directly to the Gesuba API for curriculum,
          study materials, exam workflows, and class management.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Online exams",
              body: "Draft, approve, release, attempt, and publish results with role-based controls."
            },
            {
              title: "Study materials",
              body: "Unit-scoped notes and references published by instructors for each grade."
            },
            {
              title: "Class operations",
              body: "Rosters, instructor assignments, attendance, and in-app notifications."
            }
          ].map((item) => (
            <article key={item.title} className="card">
              <h3 className="font-display text-xl font-semibold text-brand-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-brand-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
