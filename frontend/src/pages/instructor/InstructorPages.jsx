import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  classesApi,
  curriculumApi,
  examsApi,
  materialsApi,
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

export function InstructorOverview() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [examPayload, classPayload] = await Promise.all([
          examsApi.listInstructor(),
          classesApi.instructorClasses(user.id || user.user_id)
        ]);
        if (cancelled) return;
        setExams(unwrapList(examPayload, ["exams"]));
        const classData = classPayload?.data;
        setClasses(
          Array.isArray(classData) ? classData : unwrapList(classPayload, ["classes", "assignments"])
        );
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div>
      <PageHeader
        title={`Instructor · ${user?.full_name || user?.name || user?.email}`}
        subtitle="Manage exams, materials, and assigned classes."
        actions={
          <Link to="/instructor/exams/new" className="btn-primary">
            Create exam
          </Link>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="text-sm text-brand-600">Your exams</p>
          <p className="text-3xl font-bold">{exams.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-brand-600">Assigned classes</p>
          <p className="text-3xl font-bold">{classes.length}</p>
        </div>
      </div>
      <section className="card">
        <h2 className="mb-3 font-semibold">Recent exams</h2>
        {exams.length === 0 ? (
          <p className="text-sm text-brand-600">No exams yet.</p>
        ) : (
          <ul className="space-y-2">
            {exams.slice(0, 5).map((exam) => (
              <li key={exam._id} className="flex items-center justify-between gap-2 text-sm">
                <Link
                  to={`/instructor/exams/${exam._id}`}
                  className="font-medium text-brand-800 hover:underline"
                >
                  {exam.title}
                </Link>
                <StatusPill tone={examStatusTone(exam.status)}>
                  {exam.status}
                </StatusPill>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function InstructorExams() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    const payload = await examsApi.listInstructor();
    setExams(unwrapList(payload, ["exams"]));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function publish(id) {
    await examsApi.publish(id);
    await load();
  }

  async function publishResults(id) {
    await examsApi.publishResults(id);
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Exams"
        actions={
          <Link to="/instructor/exams/new" className="btn-primary">
            New exam
          </Link>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      {exams.length === 0 ? (
        <EmptyState title="No exams" hint="Create your first exam." />
      ) : (
        <div className="overflow-x-auto card p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-brand-700">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id} className="border-t border-brand-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/instructor/exams/${exam._id}`}
                      className="font-medium text-brand-800 hover:underline"
                    >
                      {exam.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{exam.type}</td>
                  <td className="px-4 py-3">
                    <StatusPill tone={examStatusTone(exam.status)}>
                      {exam.status}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {exam.status === "DRAFT" ? (
                        <button
                          type="button"
                          className="btn-secondary py-1 text-xs"
                          onClick={() =>
                            publish(exam._id).catch((e) => setError(e.message))
                          }
                        >
                          Publish
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="btn-secondary py-1 text-xs"
                        onClick={() =>
                          publishResults(exam._id).catch((e) =>
                            setError(e.message)
                          )
                        }
                      >
                        Publish results
                      </button>
                    </div>
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

const emptyExam = {
  title: "",
  description: "",
  type: "REGULAR",
  classLevelId: "",
  subjectId: "",
  academicYear: "2025/26",
  durationMinutes: 60,
  startAt: "",
  endAt: ""
};

export function InstructorExamForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyExam);
  const [classLevels, setClassLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([curriculumApi.classLevels(), curriculumApi.subjects()])
      .then(([c, s]) => {
        setClassLevels(unwrapList(c, ["classLevels"]));
        setSubjects(unwrapList(s, ["subjects"]));
      })
      .catch((err) => setError(err.message));
  }, []);

  function update(field) {
    return (event) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = await examsApi.create({
        ...form,
        durationMinutes: Number(form.durationMinutes),
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString()
      });
      const exam = payload?.data?.exam || payload?.data;
      navigate(`/instructor/exams/${exam._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Create exam" />
      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-4">
        {error ? <Alert>{error}</Alert> : null}
        <div>
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={update("title")} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={update("description")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={update("type")}>
              <option value="REGULAR">REGULAR</option>
              <option value="MODEL">MODEL</option>
              <option value="NATIONAL">NATIONAL</option>
            </select>
          </div>
          <div>
            <label className="label">Academic year</label>
            <input className="input" required value={form.academicYear} onChange={update("academicYear")} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Class level</label>
            <select className="input" required value={form.classLevelId} onChange={update("classLevelId")}>
              <option value="">Select…</option>
              {classLevels.map((cl) => (
                <option key={cl._id} value={cl._id}>
                  {cl.gradeId?.name || cl.gradeId?.number || "Grade"} · Section {cl.section}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Subject</label>
            <select className="input" required value={form.subjectId} onChange={update("subjectId")}>
              <option value="">Select…</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Duration (min)</label>
            <input
              type="number"
              min={1}
              className="input"
              required
              value={form.durationMinutes}
              onChange={update("durationMinutes")}
            />
          </div>
          <div>
            <label className="label">Starts</label>
            <input type="datetime-local" className="input" required value={form.startAt} onChange={update("startAt")} />
          </div>
          <div>
            <label className="label">Ends</label>
            <input type="datetime-local" className="input" required value={form.endAt} onChange={update("endAt")} />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Creating…" : "Create exam"}
        </button>
      </form>
    </div>
  );
}

export function InstructorExamDetail() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [qForm, setQForm] = useState({
    questionText: "",
    type: "MCQ",
    correctAnswer: "",
    marks: 1,
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: ""
  });

  async function load() {
    const [e, q] = await Promise.all([
      examsApi.get(examId),
      examsApi.questions(examId)
    ]);
    setExam(e?.data?.exam || e?.data);
    setQuestions(unwrapList(q, ["questions"]));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [examId]);

  async function addQuestion(event) {
    event.preventDefault();
    setError("");
    try {
      const body = {
        questionText: qForm.questionText,
        type: qForm.type,
        correctAnswer: qForm.correctAnswer,
        marks: Number(qForm.marks)
      };
      if (qForm.type === "MCQ") {
        body.options = [qForm.optionA, qForm.optionB, qForm.optionC, qForm.optionD]
          .filter(Boolean)
          .map((text) => ({ text }));
      } else if (qForm.type === "TRUE_FALSE") {
        body.options = [{ text: "True" }, { text: "False" }];
      }
      await examsApi.addQuestion(examId, body);
      setQForm({
        questionText: "",
        type: "MCQ",
        correctAnswer: "",
        marks: 1,
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: ""
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeQuestion(questionId) {
    await examsApi.deleteQuestion(examId, questionId);
    await load();
  }

  if (!exam) {
    return error ? <Alert>{error}</Alert> : <p className="text-sm">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={exam.title}
        subtitle={`${exam.type} · ${formatDate(exam.startAt)} → ${formatDate(exam.endAt)}`}
        actions={
          <StatusPill tone={examStatusTone(exam.status)}>{exam.status}</StatusPill>
        }
      />
      {error ? <Alert>{error}</Alert> : null}

      <section className="card space-y-2 text-sm">
        <p>{exam.description || "No description"}</p>
        <p>
          Duration: <strong>{exam.durationMinutes} min</strong> · Total marks:{" "}
          <strong>{exam.totalMarks ?? "—"}</strong>
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {exam.status === "DRAFT" ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                examsApi
                  .publish(examId)
                  .then(load)
                  .catch((e) => setError(e.message))
              }
            >
              Submit for approval
            </button>
          ) : null}
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              examsApi
                .publishResults(examId)
                .then(load)
                .catch((e) => setError(e.message))
            }
          >
            Publish results
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Questions ({questions.length})</h2>
        <ul className="mb-6 space-y-2">
          {questions.map((q, i) => (
            <li
              key={q._id}
              className="flex items-start justify-between gap-3 rounded-lg border border-brand-100 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">
                  {i + 1}. {q.questionText}
                </p>
                <p className="text-brand-500">
                  {q.type} · {q.marks} marks · answer: {q.correctAnswer}
                </p>
              </div>
              <button
                type="button"
                className="btn-danger py-1 text-xs"
                onClick={() =>
                  removeQuestion(q._id).catch((e) => setError(e.message))
                }
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={addQuestion} className="space-y-3 border-t border-brand-100 pt-4">
          <h3 className="font-semibold">Add question</h3>
          <textarea
            className="input"
            rows={2}
            required
            placeholder="Question text"
            value={qForm.questionText}
            onChange={(e) => setQForm((p) => ({ ...p, questionText: e.target.value }))}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              className="input"
              value={qForm.type}
              onChange={(e) => setQForm((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="MCQ">MCQ</option>
              <option value="TRUE_FALSE">TRUE_FALSE</option>
              <option value="SHORT_ANSWER">SHORT_ANSWER</option>
            </select>
            <input
              className="input"
              type="number"
              min={1}
              value={qForm.marks}
              onChange={(e) => setQForm((p) => ({ ...p, marks: e.target.value }))}
            />
            <input
              className="input"
              required
              placeholder="Correct answer"
              value={qForm.correctAnswer}
              onChange={(e) =>
                setQForm((p) => ({ ...p, correctAnswer: e.target.value }))
              }
            />
          </div>
          {qForm.type === "MCQ" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {["optionA", "optionB", "optionC", "optionD"].map((key, idx) => (
                <input
                  key={key}
                  className="input"
                  placeholder={`Option ${idx + 1}`}
                  value={qForm[key]}
                  onChange={(e) => setQForm((p) => ({ ...p, [key]: e.target.value }))}
                />
              ))}
            </div>
          ) : null}
          <button type="submit" className="btn-primary">
            Add question
          </button>
        </form>
      </section>
    </div>
  );
}

export function InstructorClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    classesApi
      .instructorClasses(user.id || user.user_id)
      .then((payload) => {
        const data = payload?.data;
        setClasses(Array.isArray(data) ? data : unwrapList(payload, ["classes"]));
      })
      .catch((err) => setError(err.message));
  }, [user]);

  return (
    <div>
      <PageHeader title="My classes" subtitle="Assignments from class management." />
      {error ? <Alert>{error}</Alert> : null}
      {classes.length === 0 ? (
        <EmptyState title="No class assignments" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((item) => (
            <article key={item._id || item.assignmentId} className="card text-sm">
              <p className="font-semibold text-brand-900">
                {item.subjectName || item.subjectId?.name || "Subject"}
              </p>
              <p className="mt-1 text-brand-600">
                {item.className ||
                  `Section ${item.section || item.classLevelId?.section || "—"}`}
              </p>
              <p className="mt-1 text-brand-500">
                Year: {item.academicYear || "—"} · {item.status || "ACTIVE"}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function InstructorMaterials() {
  const [units, setUnits] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "NOTE",
    unitId: "",
    content: "",
    description: ""
  });

  async function load() {
    const [u, m] = await Promise.all([
      curriculumApi.units(),
      materialsApi.list()
    ]);
    setUnits(unwrapList(u, ["units"]));
    setMaterials(unwrapList(m, ["materials"]));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function createMaterial(event) {
    event.preventDefault();
    setError("");
    try {
      await materialsApi.create(form);
      setForm({
        title: "",
        type: "NOTE",
        unitId: "",
        content: "",
        description: ""
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Study materials" />
      {error ? <Alert>{error}</Alert> : null}

      <form onSubmit={createMaterial} className="card max-w-2xl space-y-3">
        <h2 className="font-semibold">Create material</h2>
        <input
          className="input"
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
          >
            {["NOTE", "PDF", "VIDEO", "EXERCISE", "REFERENCE"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            className="input"
            required
            value={form.unitId}
            onChange={(e) => setForm((p) => ({ ...p, unitId: e.target.value }))}
          >
            <option value="">Select unit…</option>
            {units.map((u) => (
              <option key={u._id} value={u._id}>
                Unit {u.unitNumber}: {u.title}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className="input"
          rows={2}
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
        <textarea
          className="input"
          rows={4}
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
        />
        <button type="submit" className="btn-primary">
          Save draft
        </button>
      </form>

      <div className="space-y-3">
        {materials.map((item) => (
          <article key={item._id} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-brand-600">
                {item.type} · {item.status}
              </p>
            </div>
            <div className="flex gap-2">
              {item.status === "DRAFT" ? (
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() =>
                    materialsApi
                      .publish(item._id)
                      .then(load)
                      .catch((e) => setError(e.message))
                  }
                >
                  Publish
                </button>
              ) : null}
              <button
                type="button"
                className="btn-danger text-xs"
                onClick={() =>
                  materialsApi
                    .remove(item._id)
                    .then(load)
                    .catch((e) => setError(e.message))
                }
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
