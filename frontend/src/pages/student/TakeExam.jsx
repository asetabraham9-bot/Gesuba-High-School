import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { examsApi, unwrapList } from "../../lib/api";
import { Alert, PageHeader, StatusPill } from "../../components/ui";

export default function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [attempt, setAttempt] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        const [examPayload, can] = await Promise.all([
          examsApi.studentExam(examId),
          examsApi.canAttempt(examId)
        ]);
        if (cancelled) return;

        const examData =
          examPayload?.data?.exam ||
          examPayload?.data ||
          examPayload;
        setExam(examData);

        const allowed =
          can?.data?.canAttempt ??
          can?.data?.allowed ??
          can?.data?.available ??
          true;

        if (!allowed) {
          setPhase("blocked");
          setError(can?.data?.reason || "You cannot attempt this exam now.");
          return;
        }

        let attemptPayload;
        try {
          attemptPayload = await examsApi.getAttempt(examId);
        } catch {
          attemptPayload = await examsApi.startAttempt(examId);
        }

        const current =
          attemptPayload?.data?.attempt || attemptPayload?.data;
        setAttempt(current);

        if (current?.status && current.status !== "IN_PROGRESS") {
          setPhase("done");
          return;
        }

        const qPayload = await examsApi.studentQuestions(examId);
        const list = unwrapList(qPayload, ["questions"]);
        setQuestions(list);

        const seeded = {};
        for (const ans of current?.answers || []) {
          const qid = ans.questionId?._id || ans.questionId;
          if (qid) seeded[qid] = ans.answer ?? ans.selectedAnswer ?? "";
        }
        setAnswers(seeded);
        setPhase("ready");
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setPhase("error");
        }
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [examId]);

  const answerPayload = useMemo(
    () =>
      Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      })),
    [answers]
  );

  async function saveProgress() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = await examsApi.saveAnswers(examId, answerPayload);
      setAttempt(payload?.data?.attempt || payload?.data);
      setMessage("Progress saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitExam() {
    if (!window.confirm("Submit this exam? You cannot change answers after.")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await examsApi.saveAnswers(examId, answerPayload);
      const payload = await examsApi.submitAttempt(examId);
      setAttempt(payload?.data?.attempt || payload?.data);
      setPhase("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (phase === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
      </div>
    );
  }

  if (phase === "error" || phase === "blocked") {
    return (
      <div className="space-y-4">
        <PageHeader title="Exam unavailable" />
        <Alert>{error}</Alert>
        <Link to="/student/exams" className="btn-secondary inline-flex">
          Back to exams
        </Link>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="space-y-4">
        <PageHeader title="Exam submitted" />
        <div className="card space-y-2">
          <p className="font-semibold text-brand-900">
            {exam?.title || "Exam"}
          </p>
          <p className="text-sm text-brand-600">
            Status: {attempt?.status || "SUBMITTED"}
          </p>
          {typeof attempt?.score === "number" ? (
            <p className="text-sm">
              Score: <strong>{attempt.score}</strong>
              {attempt.totalMarks != null ? ` / ${attempt.totalMarks}` : null}
            </p>
          ) : (
            <p className="text-sm text-brand-600">
              Results appear after the instructor publishes them.
            </p>
          )}
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/student/exams")}
        >
          Back to exams
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={exam?.title || "Exam"}
        subtitle={`${exam?.durationMinutes || "—"} minutes · ${questions.length} questions`}
        actions={
          <>
            <button
              type="button"
              className="btn-secondary"
              disabled={busy}
              onClick={saveProgress}
            >
              Save
            </button>
            <button
              type="button"
              className="btn-accent"
              disabled={busy}
              onClick={submitExam}
            >
              Submit
            </button>
          </>
        }
      />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      {message ? (
        <div className="mb-4">
          <Alert tone="success">{message}</Alert>
        </div>
      ) : null}

      <div className="space-y-4">
        {questions.map((q, index) => {
          const id = q._id;
          const value = answers[id] ?? "";
          return (
            <article key={id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-brand-900">
                  {index + 1}. {q.questionText}
                </h2>
                <StatusPill>
                  {q.marks} mark{q.marks === 1 ? "" : "s"}
                </StatusPill>
              </div>

              {q.type === "SHORT_ANSWER" ? (
                <textarea
                  className="input"
                  rows={3}
                  value={value}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [id]: e.target.value }))
                  }
                />
              ) : (
                <div className="space-y-2">
                  {(q.options || []).map((opt, optIndex) => {
                    const optValue = opt.text ?? opt;
                    return (
                      <label
                        key={`${id}-${optIndex}`}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-100 px-3 py-2 text-sm hover:bg-brand-50"
                      >
                        <input
                          type="radio"
                          name={id}
                          checked={value === optValue}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [id]: optValue
                            }))
                          }
                        />
                        {optValue}
                      </label>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
