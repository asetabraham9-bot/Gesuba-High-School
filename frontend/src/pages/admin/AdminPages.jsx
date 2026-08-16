import { useEffect, useState } from "react";
import {
  classesApi,
  curriculumApi,
  examsApi,
  notificationsApi,
  unwrapList,
  usersApi
} from "../../lib/api";
import {
  Alert,
  EmptyState,
  PageHeader,
  StatusPill,
  examStatusTone
} from "../../components/ui";

export function AdminOverview() {
  const [stats, setStats] = useState({
    users: 0,
    grades: 0,
    queue: 0
  });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      usersApi.list(),
      curriculumApi.grades(),
      examsApi.approvalQueue()
    ])
      .then(([u, g, q]) => {
        setStats({
          users: unwrapList(u, ["users"]).length,
          grades: unwrapList(g, ["grades"]).length,
          queue: unwrapList(q, ["exams"]).length
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <PageHeader
        title="Admin dashboard"
        subtitle="Users, curriculum, exam approvals, and broadcasts."
      />
      {error ? <Alert>{error}</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-brand-600">Users</p>
          <p className="text-3xl font-bold">{stats.users}</p>
        </div>
        <div className="card">
          <p className="text-sm text-brand-600">Grades</p>
          <p className="text-3xl font-bold">{stats.grades}</p>
        </div>
        <div className="card">
          <p className="text-sm text-brand-600">Approval queue</p>
          <p className="text-3xl font-bold">{stats.queue}</p>
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    kind: "students",
    email: "",
    password: ""
  });

  async function load() {
    const payload = await usersApi.list();
    setUsers(unwrapList(payload, ["users"]));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function createUser(event) {
    event.preventDefault();
    setError("");
    try {
      const body = { email: form.email, password: form.password };
      if (form.kind === "students") await usersApi.createStudent(body);
      else if (form.kind === "instructors")
        await usersApi.createInstructor(body);
      else await usersApi.createAdmin(body);
      setForm({ kind: form.kind, email: "", password: "" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" />
      {error ? <Alert>{error}</Alert> : null}

      <form onSubmit={createUser} className="card max-w-xl space-y-3">
        <h2 className="font-semibold">Create account</h2>
        <select
          className="input"
          value={form.kind}
          onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value }))}
        >
          <option value="students">Student</option>
          <option value="instructors">Instructor</option>
          <option value="admins">Admin</option>
        </select>
        <input
          className="input"
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
        <input
          className="input"
          type="password"
          minLength={8}
          required
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        <button type="submit" className="btn-primary">
          Create
        </button>
      </form>

      <div className="overflow-x-auto card p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-brand-50 text-brand-700">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id || u.id} className="border-t border-brand-50">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">
                  <StatusPill
                    tone={u.status === "ACTIVE" ? "success" : "warning"}
                  >
                    {u.status}
                  </StatusPill>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-secondary py-1 text-xs"
                      onClick={() =>
                        usersApi
                          .updateStatus(
                            u._id || u.id,
                            u.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
                          )
                          .then(load)
                          .catch((e) => setError(e.message))
                      }
                    >
                      Toggle status
                    </button>
                    <button
                      type="button"
                      className="btn-danger py-1 text-xs"
                      onClick={() =>
                        usersApi
                          .remove(u._id || u.id)
                          .then(load)
                          .catch((e) => setError(e.message))
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminApprovals() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    const payload = await examsApi.approvalQueue();
    setExams(unwrapList(payload, ["exams"]));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <PageHeader
        title="Exam approval queue"
        subtitle="Approve or reject instructor submissions, then release to students."
      />
      {error ? <Alert>{error}</Alert> : null}
      {exams.length === 0 ? (
        <EmptyState title="Queue is empty" />
      ) : (
        <ul className="space-y-3">
          {exams.map((exam) => (
            <li key={exam._id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-brand-900">{exam.title}</p>
                  <p className="mt-1 text-sm text-brand-600">
                    {exam.type} ·{" "}
                    <StatusPill tone={examStatusTone(exam.status)}>
                      {exam.status}
                    </StatusPill>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-primary text-xs"
                    onClick={() =>
                      examsApi
                        .approve(exam._id)
                        .then(load)
                        .catch((e) => setError(e.message))
                    }
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn-danger text-xs"
                    onClick={() =>
                      examsApi
                        .reject(exam._id, "Needs revision")
                        .then(load)
                        .catch((e) => setError(e.message))
                    }
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    onClick={() =>
                      examsApi
                        .release(exam._id)
                        .then(load)
                        .catch((e) => setError(e.message))
                    }
                  >
                    Release
                  </button>
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    onClick={() =>
                      examsApi
                        .lockSchedule(exam._id)
                        .then(load)
                        .catch((e) => setError(e.message))
                    }
                  >
                    Lock schedule
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminCurriculum() {
  const [grades, setGrades] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [error, setError] = useState("");
  const [gradeForm, setGradeForm] = useState({ name: "", number: 9 });
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    gradeId: ""
  });
  const [classForm, setClassForm] = useState({
    gradeId: "",
    section: "A",
    capacity: 40
  });
  const [unitForm, setUnitForm] = useState({
    subjectId: "",
    title: "",
    unitNumber: 1
  });

  async function load() {
    const [g, c, s, u] = await Promise.all([
      curriculumApi.grades(),
      curriculumApi.classLevels(),
      curriculumApi.subjects(),
      curriculumApi.units()
    ]);
    setGrades(unwrapList(g, ["grades"]));
    setClassLevels(unwrapList(c, ["classLevels"]));
    setSubjects(unwrapList(s, ["subjects"]));
    setUnits(unwrapList(u, ["units"]));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Curriculum" subtitle="Grades, sections, subjects, units." />
      {error ? <Alert>{error}</Alert> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          className="card space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            curriculumApi
              .createGrade({
                name: gradeForm.name,
                number: Number(gradeForm.number)
              })
              .then(load)
              .catch((err) => setError(err.message));
          }}
        >
          <h2 className="font-semibold">Add grade</h2>
          <input
            className="input"
            placeholder="Name"
            required
            value={gradeForm.name}
            onChange={(e) => setGradeForm((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className="input"
            type="number"
            min={9}
            max={12}
            value={gradeForm.number}
            onChange={(e) =>
              setGradeForm((p) => ({ ...p, number: e.target.value }))
            }
          />
          <button className="btn-primary" type="submit">
            Create grade
          </button>
          <ul className="text-sm text-brand-700">
            {grades.map((g) => (
              <li key={g._id}>
                {g.name} ({g.number})
              </li>
            ))}
          </ul>
        </form>

        <form
          className="card space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            curriculumApi
              .createClassLevel({
                gradeId: classForm.gradeId,
                section: classForm.section,
                capacity: Number(classForm.capacity)
              })
              .then(load)
              .catch((err) => setError(err.message));
          }}
        >
          <h2 className="font-semibold">Add class section</h2>
          <select
            className="input"
            required
            value={classForm.gradeId}
            onChange={(e) =>
              setClassForm((p) => ({ ...p, gradeId: e.target.value }))
            }
          >
            <option value="">Grade…</option>
            {grades.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={classForm.section}
            onChange={(e) =>
              setClassForm((p) => ({ ...p, section: e.target.value }))
            }
          >
            {["A", "B", "C", "D", "E", "F"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input
            className="input"
            type="number"
            min={1}
            value={classForm.capacity}
            onChange={(e) =>
              setClassForm((p) => ({ ...p, capacity: e.target.value }))
            }
          />
          <button className="btn-primary" type="submit">
            Create section
          </button>
          <ul className="text-sm text-brand-700">
            {classLevels.map((cl) => (
              <li key={cl._id}>
                {cl.gradeId?.name || cl.gradeId} · {cl.section}
              </li>
            ))}
          </ul>
        </form>

        <form
          className="card space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            curriculumApi
              .createSubject(subjectForm)
              .then(load)
              .catch((err) => setError(err.message));
          }}
        >
          <h2 className="font-semibold">Add subject</h2>
          <input
            className="input"
            required
            placeholder="Name"
            value={subjectForm.name}
            onChange={(e) =>
              setSubjectForm((p) => ({ ...p, name: e.target.value }))
            }
          />
          <input
            className="input"
            required
            placeholder="Code"
            value={subjectForm.code}
            onChange={(e) =>
              setSubjectForm((p) => ({ ...p, code: e.target.value }))
            }
          />
          <select
            className="input"
            required
            value={subjectForm.gradeId}
            onChange={(e) =>
              setSubjectForm((p) => ({ ...p, gradeId: e.target.value }))
            }
          >
            <option value="">Grade…</option>
            {grades.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
          <button className="btn-primary" type="submit">
            Create subject
          </button>
          <ul className="text-sm text-brand-700">
            {subjects.map((s) => (
              <li key={s._id}>
                {s.name} ({s.code})
              </li>
            ))}
          </ul>
        </form>

        <form
          className="card space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            curriculumApi
              .createUnit({
                ...unitForm,
                unitNumber: Number(unitForm.unitNumber)
              })
              .then(load)
              .catch((err) => setError(err.message));
          }}
        >
          <h2 className="font-semibold">Add unit</h2>
          <select
            className="input"
            required
            value={unitForm.subjectId}
            onChange={(e) =>
              setUnitForm((p) => ({ ...p, subjectId: e.target.value }))
            }
          >
            <option value="">Subject…</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            required
            placeholder="Title"
            value={unitForm.title}
            onChange={(e) =>
              setUnitForm((p) => ({ ...p, title: e.target.value }))
            }
          />
          <input
            className="input"
            type="number"
            min={1}
            value={unitForm.unitNumber}
            onChange={(e) =>
              setUnitForm((p) => ({ ...p, unitNumber: e.target.value }))
            }
          />
          <button className="btn-primary" type="submit">
            Create unit
          </button>
          <ul className="text-sm text-brand-700">
            {units.map((u) => (
              <li key={u._id}>
                {u.unitNumber}. {u.title}
              </li>
            ))}
          </ul>
        </form>
      </div>
    </div>
  );
}

export function AdminClasses() {
  const [classLevels, setClassLevels] = useState([]);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [roster, setRoster] = useState(null);
  const [error, setError] = useState("");
  const [assignForm, setAssignForm] = useState({
    instructorId: "",
    classLevelId: "",
    subjectId: "",
    academicYear: "2025/26"
  });
  const [enrollForm, setEnrollForm] = useState({
    studentId: "",
    classLevelId: ""
  });

  useEffect(() => {
    Promise.all([
      curriculumApi.classLevels(),
      usersApi.list(),
      curriculumApi.subjects()
    ])
      .then(([c, u, s]) => {
        setClassLevels(unwrapList(c, ["classLevels"]));
        setUsers(unwrapList(u, ["users"]));
        setSubjects(unwrapList(s, ["subjects"]));
      })
      .catch((err) => setError(err.message));
  }, []);

  const instructors = users.filter(
    (u) => String(u.role).toUpperCase() === "INSTRUCTOR"
  );
  const students = users.filter(
    (u) => String(u.role).toUpperCase() === "STUDENT"
  );

  async function loadRoster(classLevelId) {
    setSelectedClass(classLevelId);
    const payload = await classesApi.roster(classLevelId);
    setRoster(payload?.data ?? payload);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Class management" />
      {error ? <Alert>{error}</Alert> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          className="card space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            classesApi
              .assignInstructor(assignForm.instructorId, {
                classLevelId: assignForm.classLevelId,
                subjectId: assignForm.subjectId,
                academicYear: assignForm.academicYear
              })
              .then(() => setError(""))
              .catch((err) => setError(err.message));
          }}
        >
          <h2 className="font-semibold">Assign instructor</h2>
          <select
            className="input"
            required
            value={assignForm.instructorId}
            onChange={(e) =>
              setAssignForm((p) => ({ ...p, instructorId: e.target.value }))
            }
          >
            <option value="">Instructor…</option>
            {instructors.map((u) => (
              <option key={u._id || u.id} value={u._id || u.id}>
                {u.email}
              </option>
            ))}
          </select>
          <select
            className="input"
            required
            value={assignForm.classLevelId}
            onChange={(e) =>
              setAssignForm((p) => ({ ...p, classLevelId: e.target.value }))
            }
          >
            <option value="">Class…</option>
            {classLevels.map((cl) => (
              <option key={cl._id} value={cl._id}>
                {cl.gradeId?.name || "Grade"} · {cl.section}
              </option>
            ))}
          </select>
          <select
            className="input"
            required
            value={assignForm.subjectId}
            onChange={(e) =>
              setAssignForm((p) => ({ ...p, subjectId: e.target.value }))
            }
          >
            <option value="">Subject…</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            value={assignForm.academicYear}
            onChange={(e) =>
              setAssignForm((p) => ({ ...p, academicYear: e.target.value }))
            }
          />
          <button type="submit" className="btn-primary">
            Assign
          </button>
        </form>

        <form
          className="card space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            classesApi
              .enrollStudent(enrollForm.studentId, {
                classLevelId: enrollForm.classLevelId
              })
              .then(() => setError(""))
              .catch((err) => setError(err.message));
          }}
        >
          <h2 className="font-semibold">Enroll student</h2>
          <select
            className="input"
            required
            value={enrollForm.studentId}
            onChange={(e) =>
              setEnrollForm((p) => ({ ...p, studentId: e.target.value }))
            }
          >
            <option value="">Student…</option>
            {students.map((u) => (
              <option key={u._id || u.id} value={u._id || u.id}>
                {u.email}
              </option>
            ))}
          </select>
          <select
            className="input"
            required
            value={enrollForm.classLevelId}
            onChange={(e) =>
              setEnrollForm((p) => ({ ...p, classLevelId: e.target.value }))
            }
          >
            <option value="">Class…</option>
            {classLevels.map((cl) => (
              <option key={cl._id} value={cl._id}>
                {cl.gradeId?.name || "Grade"} · {cl.section}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            Enroll
          </button>
          <p className="text-xs text-brand-500">
            Note: enroll/remove may fail until backend AppError fixes land.
          </p>
        </form>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">View roster</h2>
        <select
          className="input max-w-md"
          value={selectedClass}
          onChange={(e) =>
            loadRoster(e.target.value).catch((err) => setError(err.message))
          }
        >
          <option value="">Select class…</option>
          {classLevels.map((cl) => (
            <option key={cl._id} value={cl._id}>
              {cl.gradeId?.name || "Grade"} · {cl.section}
            </option>
          ))}
        </select>
        {roster ? (
          <pre className="overflow-auto rounded-lg bg-brand-50 p-3 text-xs">
            {JSON.stringify(roster, null, 2)}
          </pre>
        ) : null}
      </div>
    </div>
  );
}

export function AdminBroadcast() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "ANNOUNCEMENT",
    recipientIds: []
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    usersApi
      .list()
      .then((payload) => setUsers(unwrapList(payload, ["users"])))
      .catch((err) => setError(err.message));
  }, []);

  function toggleRecipient(id) {
    setForm((prev) => {
      const exists = prev.recipientIds.includes(id);
      return {
        ...prev,
        recipientIds: exists
          ? prev.recipientIds.filter((x) => x !== id)
          : [...prev.recipientIds, id]
      };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      await notificationsApi.broadcast({
        title: form.title,
        message: form.message,
        type: form.type,
        recipientIds: form.recipientIds
      });
      setSuccess("Broadcast sent.");
      setForm((p) => ({ ...p, title: "", message: "", recipientIds: [] }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Broadcast notification" />
      <form onSubmit={submit} className="card max-w-2xl space-y-3">
        {error ? <Alert>{error}</Alert> : null}
        {success ? <Alert tone="success">{success}</Alert> : null}
        <input
          className="input"
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        />
        <textarea
          className="input"
          required
          rows={4}
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
        />
        <select
          className="input"
          value={form.type}
          onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
        >
          <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
          <option value="EXAM_RELEASED">EXAM_RELEASED</option>
          <option value="MATERIAL_UPLOADED">MATERIAL_UPLOADED</option>
          <option value="SYSTEM_ALERT">SYSTEM_ALERT</option>
        </select>
        <div className="max-h-48 space-y-1 overflow-auto rounded-lg border border-brand-100 p-3 text-sm">
          {users.map((u) => {
            const id = u._id || u.id;
            return (
              <label key={id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.recipientIds.includes(id)}
                  onChange={() => toggleRecipient(id)}
                />
                {u.email} ({u.role})
              </label>
            );
          })}
        </div>
        <button type="submit" className="btn-primary">
          Send broadcast
        </button>
      </form>
    </div>
  );
}
