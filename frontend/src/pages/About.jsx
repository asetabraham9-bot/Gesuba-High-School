export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="section-title">About Gesuba GSS</h1>
      <p className="mt-3 max-w-3xl text-brand-700">
        Gesuba General Secondary School serves grades 9–12 with a digital
        platform for teaching, learning resources, and secure online
        examinations.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <article className="card">
          <h2 className="font-display text-xl font-semibold">Mission</h2>
          <p className="mt-2 text-sm text-brand-600">
            Deliver reliable academic tools that keep students, instructors,
            and administrators aligned on curriculum, assessment, and
            attendance.
          </p>
        </article>
        <article className="card">
          <h2 className="font-display text-xl font-semibold">Platform</h2>
          <p className="mt-2 text-sm text-brand-600">
            React portal with a TypeScript Node API, MongoDB data model, and
            JWT-secured role access for Student, Instructor, and Admin.
          </p>
        </article>
      </div>
    </div>
  );
}
