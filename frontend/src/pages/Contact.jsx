import { useState } from "react";
import { Alert } from "../components/ui";

export default function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Contact</h1>
      <p className="mt-2 text-brand-600">
        Reach the school office for admissions and portal support.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
        {sent ? (
          <Alert tone="success">
            Thanks — your message was recorded locally. A contact API can be
            added on the backend later.
          </Alert>
        ) : null}
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="message">
            Message
          </label>
          <textarea id="message" name="message" rows={5} required className="input" />
        </div>
        <button type="submit" className="btn-primary">
          Send message
        </button>
      </form>
    </div>
  );
}
