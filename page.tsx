"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const councilRecipients = [
  { name: "Kerry P. Devine", role: "Mayor (At-Large)", email: "kpdevine@fredericksburgva.gov" },
  { name: "Charlie L. Frye, Jr.", role: "Vice-Mayor (Ward 4)", email: "clfrye@fredericksburgva.gov" },
  { name: "Matt D. Rowe", role: "Council Member (Ward 1)", email: "mrowe@fredericksburgva.gov" },
  { name: "Joy Y. Crump", role: "Council Member (Ward 2)", email: "jcrump@fredericksburgva.gov" },
  { name: "Susanna R. Finn", role: "Council Member (Ward 3)", email: "sfinn@fredericksburgva.gov" },
  { name: "Jannan W. Holmes", role: "Council Member (At-Large)", email: "jwholmes@fredericksburgva.gov" },
  { name: "Will B. Mackintosh", role: "Council Member (At-Large)", email: "wbmackintosh@fredericksburgva.gov" },
];

const defaultMessage = `Dear Mayor Devine and Members of City Council,

I am writing to share my support for the proposed 1500 Gateway project in Fredericksburg.

I believe this project represents an opportunity to strengthen the City’s tax base, support jobs, and help Fredericksburg plan for long-term economic growth. I also appreciate the importance of public safety, construction management, and responsible communication with nearby residents.

Please include my comments in the public record as a statement of support for the project.

Thank you for your time and consideration.`;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey);
}

export default function GatewaySupportSite() {
  const recipientList = useMemo(() => councilRecipients.map((r) => r.email).join(","), []);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    locality: "",
    message: defaultMessage,
    consent: true,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = event.target;
    const checked = type === "checkbox" && "checked" in event.target ? event.target.checked : false;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setStatusMessage("Saving your message for review...");

    try {
      const supabase = getSupabase();

      if (!supabase) {
        throw new Error("Missing Supabase environment variables.");
      }

      const payload = {
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        locality: formData.locality.trim(),
        message: formData.message.trim(),
        consent: formData.consent,
        review_status: "pending",
        recipients: councilRecipients,
        created_at_client: new Date().toISOString(),
      };

      const { error } = await supabase.from("support_messages").insert(payload);

      if (error) {
        throw error;
      }

      setStatus("success");
      setStatusMessage("Thanks. Your message has been submitted for review.");
      setFormData((current) => ({
        ...current,
        fullName: "",
        email: "",
        locality: "",
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setStatus("error");
      setStatusMessage(message);
    }
  }

  const draftMailto = `mailto:${recipientList}?subject=${encodeURIComponent(
    "Support for 1500 Gateway"
  )}&body=${encodeURIComponent(
    `${formData.message}\n\nSincerely,\n${formData.fullName || "[Your Name]"}\n${formData.locality || "[Town/City/County]"}\n${formData.email || "[Email Address]"}`
  )}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-emerald-300">1500 Gateway</div>
            <div className="text-lg font-semibold">Community support website</div>
          </div>
          <a
            href="#support"
            className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
          >
            Share support
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_28%),radial-gradient(circle_at_left,rgba(20,184,166,0.16),transparent_22%)]" />
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
            <div className="relative z-10">
              <div className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                Fredericksburg, Virginia
              </div>
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">
                Built for people who want to support 1500 Gateway.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
                This version uses a community-first tone, keeps the form simple, and saves every submission to a review database before any outreach happens.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#support"
                  className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  Submit a message
                </a>
                <a
                  href="#council"
                  className="rounded-2xl border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
                >
                  View council recipients
                </a>
              </div>
            </div>

            <div className="relative z-10">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-emerald-900/20">
                <div className="rounded-[1.5rem] border border-emerald-400/20 bg-slate-900 p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">How it works</div>
                      <div className="text-xl font-semibold">Review first. Then outreach.</div>
                    </div>
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                      Next.js + Supabase
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoStat label="Step 1" value="Resident submits support" />
                    <InfoStat label="Step 2" value="Message saved as pending" />
                    <InfoStat label="Step 3" value="Admin reviews" />
                    <InfoStat label="Step 4" value="Supporter can email council" />
                  </div>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                    You said images can come later, so this build leaves clean slots for renderings, maps, neighborhood graphics, and project facts without making the page look like a brochure from 2007.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard
              title="Community-first message"
              body="The default language is measured and respectful. People can use it, trim it, or replace it with their own words."
            />
            <FeatureCard
              title="Simple data capture"
              body="The form collects name, email, town/city/county, message, consent, and timestamp. That is enough for review without turning this into a CIA intake form."
            />
            <FeatureCard
              title="Safer sending flow"
              body="Support messages are saved for review. After approval, the cleaner path is a prefilled email draft so the supporter sends it from their own account."
            />
          </div>
        </section>

        <section id="support" className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/5 p-6 shadow-xl shadow-emerald-900/10">
              <div className="text-xs uppercase tracking-[0.25em] text-emerald-300">Support form</div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Share your support</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Submissions are stored in the database with a pending review status. Nothing here sends as the resident automatically.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    name="fullName"
                    placeholder="Jane Smith"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  <Field
                    label="Email address"
                    name="email"
                    placeholder="jane@example.com"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <Field
                  label="Town / city / county"
                  name="locality"
                  placeholder="Fredericksburg, VA"
                  value={formData.locality}
                  onChange={handleChange}
                />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Support message</span>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={11}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
                  />
                </label>
                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950"
                  />
                  <span>
                    I understand my message will be submitted for review and coordination. Any later outreach should preserve my meaning and clearly reflect how it is being sent.
                  </span>
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={status === "saving"}
                    className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "saving" ? "Saving..." : "Submit for review"}
                  </button>
                  <a
                    href={draftMailto}
                    className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
                  >
                    Preview personal email draft
                  </a>
                </div>

                {statusMessage ? (
                  <div
                    className={`rounded-2xl border p-4 text-sm ${
                      status === "error"
                        ? "border-red-400/30 bg-red-400/10 text-red-100"
                        : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                    }`}
                  >
                    {statusMessage}
                  </div>
                ) : null}
              </form>
            </div>

            <div className="space-y-5">
              <div id="council" className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-300">Recipients</div>
                <h3 className="mt-2 text-2xl font-semibold">Fredericksburg City Council</h3>
                <div className="mt-5 space-y-3">
                  {councilRecipients.map((recipient) => (
                    <div key={recipient.email} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                      <div className="font-semibold text-white">{recipient.name}</div>
                      <div className="text-sm text-slate-400">{recipient.role}</div>
                      <a href={`mailto:${recipient.email}`} className="mt-1 block text-sm text-emerald-300 hover:text-emerald-200">
                        {recipient.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-300">Database schema</div>
                <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900 p-4 text-xs leading-6 text-slate-300">
{`create table support_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  locality text not null,
  message text not null,
  consent boolean not null default false,
  review_status text not null default 'pending',
  admin_notes text,
  recipients jsonb not null,
  created_at_client timestamptz,
  created_at timestamptz not null default now()
);`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  type?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function Field({ label, name, placeholder, value, type = "text", onChange }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
        required
      />
    </label>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/10">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

/*
SETUP NOTES

1) Install packages:
npm install @supabase/supabase-js

2) Add env vars to .env.local:
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

3) In Supabase, create the support_messages table using the SQL shown on the page.

4) Recommended next files for a full app:
- app/page.tsx -> this page
- app/admin/page.tsx -> simple review dashboard
- middleware.ts -> protect admin route
- app/api/send-approved/route.ts -> optional server action for approved outreach

5) Best practice:
Use this database form for intake and review.
Then let approved supporters send their own message with a mailto link or a generated draft.
That keeps the process cleaner and avoids fake-sender problems.
*/
