import React from "react";
import asset from "utils/asset.js";
import { Link } from "react-router-dom";
import { useAuthState } from "context/auth.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import IndexHeader from "components/Headers/IndexHeader.js";
import DarkFooter from "components/Footers/DarkFooter.js";
import SignUp from "components/Form/SignUp.js";

const AUDIENCES = [
  { icon: "fa-school", label: "Classrooms" },
  { icon: "fa-users", label: "Coding clubs" },
  { icon: "fa-graduation-cap", label: "Bootcamps" },
  { icon: "fa-user-astronaut", label: "Self-learners" },
];

const FEATURES = [
  {
    icon: "fa-code-branch",
    title: "Real-time collaboration",
    body: "Share a link and debug together with live cursors, shared terminals, and instant updates.",
  },
  {
    icon: "fa-terminal",
    title: "Zero-setup sandboxes",
    body: "Python, JavaScript, Java, C, C++, C# and Rust run securely in the cloud — nothing to install.",
  },
  {
    icon: "fa-check-double",
    title: "Auto-graded challenges",
    body: "Custom stdin/stdout tests and code checks verify submissions the moment learners hit run.",
  },
  {
    icon: "fa-layer-group",
    title: "Guided rooms",
    body: "Sequence lessons, coding tasks, quizzes and embedded apps into one shareable classroom.",
  },
  {
    icon: "fa-flag",
    title: "Quizzes & CTF flags",
    body: "Mix multiple-choice, multi-select and flag challenges to keep cohorts engaged.",
  },
  {
    icon: "fa-folder-open",
    title: "Built-in file storage",
    body: "Upload, organize and reuse project files and starter templates across every room.",
  },
];

const STEPS = [
  {
    n: "01",
    icon: "fa-plus",
    title: "Create a room",
    body: "Name it, write a description, and choose public or private.",
  },
  {
    n: "02",
    icon: "fa-pen-to-square",
    title: "Add sections",
    body: "Stack lessons, coding tasks, quizzes, flags and embedded apps in order.",
  },
  {
    n: "03",
    icon: "fa-share-nodes",
    title: "Share & track",
    body: "Send the code or link, then watch completions roll in live.",
  },
];

function Index() {
  const { isSignedIn } = useAuthState();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-[var(--cs-surface)]">
        <IndexHeader />

        <main id="main">
          {/* Audience strip */}
          <section aria-label="Who CodeSphere is for" className="border-y border-[var(--cs-border)] bg-[var(--cs-surface-elevated)]">
            <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-8 sm:px-6 md:flex-row md:justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--cs-ink-faint)]">
                Built for collaborative learning
              </p>
              <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {AUDIENCES.map((a) => (
                  <li
                    key={a.label}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--cs-border)] bg-[var(--cs-surface)] px-4 py-2 text-xs font-semibold text-[var(--cs-ink-muted)]"
                  >
                    <i className={`fas ${a.icon} text-[var(--cs-brand)]`} aria-hidden="true" />
                    {a.label}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Features grid */}
          <section aria-labelledby="features-heading" className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cs-brand)]">
                  Everything in one place
                </p>
                <h2 id="features-heading" className="text-3xl font-extrabold tracking-tight text-[var(--cs-ink)] sm:text-4xl">
                  A classroom that runs code
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--cs-ink-muted)]">
                  Stop juggling an LMS, an IDE, and a video call. CodeSphere combines
                  teaching content with live execution.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="group rounded-2xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--cs-brand-soft)] text-[var(--cs-brand)] transition-transform duration-300 group-hover:scale-110">
                      <i className={`fas ${f.icon}`} aria-hidden="true" />
                    </div>
                    <h3 className="text-[15px] font-bold tracking-tight text-[var(--cs-ink)]">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--cs-ink-muted)]">{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section aria-labelledby="how-heading" className="border-y border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cs-brand)]">
                  How it works
                </p>
                <h2 id="how-heading" className="text-3xl font-extrabold tracking-tight text-[var(--cs-ink)] sm:text-4xl">
                  From idea to classroom in minutes
                </h2>
              </div>
              <ol className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
                {STEPS.map((s, i) => (
                  <li key={s.n} className="relative rounded-2xl border border-[var(--cs-border)] bg-[var(--cs-surface)] p-6 sm:p-7">
                    <span aria-hidden="true" className="absolute right-5 top-4 bg-gradient-to-r from-indigo-500/25 to-violet-500/25 bg-clip-text text-4xl font-extrabold text-transparent">
                      {s.n}
                    </span>
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--cs-brand-gradient)] text-white shadow-md shadow-indigo-500/25">
                      <i className={`fas ${s.icon}`} aria-hidden="true" />
                    </div>
                    <h3 className="text-[15px] font-bold tracking-tight text-[var(--cs-ink)]">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--cs-ink-muted)]">{s.body}</p>
                    {i < STEPS.length - 1 && (
                      <i aria-hidden="true" className="fas fa-arrow-right absolute -right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] p-1.5 text-[10px] text-[var(--cs-ink-faint)] md:block" />
                    )}
                  </li>
                ))}
              </ol>
              <div className="mt-8 text-center">
                <Link
                  to={isSignedIn ? "/rooms/create" : "/register"}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--cs-brand)] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:bg-[var(--cs-brand-hover)]"
                >
                  {isSignedIn ? "Create your first room" : "Create your first room — free"}
                  <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          {/* Showcase splits */}
          <section aria-label="Product highlights" className="py-16 sm:py-24">
            <div className="container mx-auto flex flex-col gap-14 px-4 sm:gap-20 sm:px-6">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-14">
                <div className="w-full lg:w-1/2">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cs-brand)]">Pair program</p>
                  <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-[var(--cs-ink)] sm:text-3xl">
                    Debug together, in real time
                  </h2>
                  <p className="mb-6 text-[15px] leading-relaxed text-[var(--cs-ink-muted)]">
                    Invite peers or instructors directly into your workspace. Everyone sees
                    the same editor, the same terminal output, and the same results —
                    perfect for office hours, interviews, and hack nights.
                  </p>
                  <ul className="space-y-3">
                    {["Live shared editor sessions", "One-click collab links", "Works on any device with a browser"].map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-sm font-medium text-[var(--cs-ink)]">
                        <i className="fas fa-circle-check mt-0.5 text-[var(--cs-brand)]" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex w-full justify-center lg:w-1/2">
                  <div className="w-full max-w-lg rounded-2xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] p-4 shadow-sm">
                    <img
                      alt="Real-time collaboration illustration"
                      src={asset("assets/img/code-collab.svg")}
                      className="h-auto w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-14">
                <div className="flex w-full justify-center lg:order-1 lg:w-1/2">
                  <div className="w-full max-w-lg rounded-2xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] p-4 shadow-sm">
                    <img
                      alt="Custom courses and challenges illustration"
                      src={asset("assets/img/code-version-control.svg")}
                      className="h-auto w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="w-full lg:order-2 lg:w-1/2">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--cs-brand)]">Teach your way</p>
                  <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-[var(--cs-ink)] sm:text-3xl">
                    Design curriculums, not just snippets
                  </h2>
                  <p className="mb-6 text-[15px] leading-relaxed text-[var(--cs-ink-muted)]">
                    Author markdown tutorials, coding challenges with custom test cases,
                    quizzes and embedded apps — then track every learner's progress
                    per section.
                  </p>
                  <ul className="space-y-3">
                    {["Markdown lessons with rich media", "Custom input/output test cases", "Per-learner completion tracking"].map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-sm font-medium text-[var(--cs-ink)]">
                        <i className="fas fa-circle-check mt-0.5 text-[var(--cs-brand)]" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA banner */}
          <section aria-labelledby="cta-heading" className="pb-16 sm:pb-24">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-14 text-center shadow-xl shadow-indigo-500/20 sm:px-12 sm:py-16">
                <div aria-hidden="true" className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
                <div className="relative">
                  <h2 id="cta-heading" className="mx-auto max-w-2xl text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                    {isSignedIn ? "Your workspace is ready" : "Set up your collaborative room today"}
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
                    {isSignedIn
                      ? "Continue building challenges, collaborating with peers, or managing your coding classrooms from your dashboard."
                      : "Create an interactive space in seconds. Author coding rooms, pair-program with peers, and tackle challenges together."}
                  </p>
                  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    {isSignedIn ? (
                      <Link
                        to="/home"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-indigo-700 shadow transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        Go to Dashboard <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/register"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-indigo-700 shadow transition-all hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          Get started free
                        </Link>
                        <Link
                          to="/login"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
                        >
                          Log in
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Conditional SignUp */}
          {!isSignedIn && (
            <section aria-label="Create your account" id="signup" className="border-t border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] py-16 sm:py-20">
              <div className="container mx-auto px-4 sm:px-6">
                <div className="mx-auto mb-8 max-w-md text-center">
                  <h2 className="text-2xl font-extrabold tracking-tight text-[var(--cs-ink)] sm:text-3xl">
                    Create your free account
                  </h2>
                  <p className="mt-2 text-sm text-[var(--cs-ink-muted)]">
                    Join classrooms, save your work, and start collaborating in seconds.
                  </p>
                </div>
                <div className="mx-auto w-full max-w-md">
                  <SignUp />
                </div>
              </div>
            </section>
          )}
        </main>

        <DarkFooter />
      </div>
    </>
  );
}

export default Index;
