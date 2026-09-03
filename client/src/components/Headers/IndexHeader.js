import React from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "context/auth.js";

const STATS = [
  { value: "7", label: "Sandbox languages" },
  { value: "5", label: "Section types" },
  { value: "100%", label: "In-browser" },
];

const DEMO_LINES = [
  [["def", "text-fuchsia-400"], [" two_sum", "text-indigo-300"], ["(nums, target):", "text-slate-300"]],
  [["    seen = {}", "text-slate-300"]],
  [["    ", ""], ["for", "text-fuchsia-400"], [" i, n ", "text-slate-300"], ["in", "text-fuchsia-400"], [" ", ""], ["enumerate", "text-indigo-300"], ["(nums):", "text-slate-300"]],
  [["        need = target - n", "text-slate-300"]],
  [["        ", ""], ["if", "text-fuchsia-400"], [" need ", "text-slate-300"], ["in", "text-fuchsia-400"], [" seen: ", "text-slate-300"], ["return", "text-fuchsia-400"], [" [seen[need], i]", "text-slate-300"]],
];

const DEMO_AVATARS = ["JM", "RS", "AK"];

function HeroMockup() {
  const [linesShown, setLinesShown] = React.useState(0);
  const [runState, setRunState] = React.useState("typing");
  const [checksShown, setChecksShown] = React.useState(0);
  const [people, setPeople] = React.useState(2);
  const timers = React.useRef([]);

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setLinesShown(DEMO_LINES.length);
      setRunState("passed");
      setChecksShown(3);
      setPeople(3);
      return;
    }
    const later = (ms, fn) => {
      const id = setTimeout(fn, ms);
      timers.current.push(id);
    };
    let t = 600;
    for (let i = 1; i <= DEMO_LINES.length; i += 1) {
      const at = t;
      later(at, () => setLinesShown(i));
      t += 340;
    }
    later(t, () => setRunState("running"));
    later(t + 1100, () => {
      setRunState("passed");
      setChecksShown(3);
    });
    later(t + 1500, () => setPeople(3));
    later(t + 5200, () => {
      setLinesShown(0);
      setRunState("typing");
      setChecksShown(0);
      setPeople(2);
    });
    const loop = setInterval(() => {
      setLinesShown(0);
      setRunState("typing");
      setChecksShown(0);
      setPeople(2);
      let tt = 600;
      for (let i = 1; i <= DEMO_LINES.length; i += 1) {
        const at = tt;
        setTimeout(() => setLinesShown(i), at);
        tt += 340;
      }
      setTimeout(() => setRunState("running"), tt);
      setTimeout(() => {
        setRunState("passed");
        setChecksShown(3);
      }, tt + 1100);
      setTimeout(() => setPeople(3), tt + 1500);
    }, t + 5600);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      clearInterval(loop);
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-3xl" aria-label="Live demo preview of a CodeSphere room">
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-fuchsia-500/10 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-[var(--cs-border)] bg-[#0d1428] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <div className="ml-3 hidden flex-1 items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 font-mono text-[11px] text-slate-400 sm:flex">
            <i className="fas fa-lock text-[10px]" aria-hidden="true" />
            <span className="truncate">codesphere.io/rooms/view/python-101</span>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            LIVE DEMO
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr]">
          <div className="hidden border-r border-white/10 p-3 sm:block">
            {["main.py", "test_input.txt", "notes.md"].map((f, i) => (
              <div
                key={f}
                className={`mb-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-mono text-[11px] ${i === 0 ? "bg-indigo-500/20 text-indigo-200" : "text-slate-400"}`}
              >
                <i className={`fas ${i === 2 ? "fa-file-lines" : "fa-file-code"} text-[10px]`} aria-hidden="true" />
                <span className="truncate">{f}</span>
              </div>
            ))}
            <div className="mt-4 space-y-1.5">
              {["Section 1", "Section 2", "Section 3"].map((s, i) => (
                <div key={s} className="flex items-center gap-2 px-2.5 font-mono text-[10px] text-slate-500">
                  <i className={`fas ${runState === "passed" && i < 2 ? "fa-check-circle text-emerald-400" : linesShown > 2 && i === 0 ? "fa-check-circle text-emerald-400" : "fa-circle"} text-[9px]`} aria-hidden="true" />
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div className="min-h-[196px] p-4 text-left font-mono text-[11px] leading-6 sm:text-xs" aria-live="off">
            {DEMO_LINES.slice(0, linesShown).map((tokens, li) => (
              <div key={li}>
                {tokens.map(([text, cls], ti) => (
                  <span key={ti} className={cls}>{text}</span>
                ))}
                {li === linesShown - 1 && runState === "typing" && (
                  <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-indigo-400 align-[-2px]" />
                )}
              </div>
            ))}
            {linesShown === 0 && (
              <span aria-hidden="true" className="inline-block h-4 w-2 animate-pulse bg-indigo-400" />
            )}
            {runState !== "typing" && (
              <div className={`mt-3 rounded-lg px-3 py-2 transition-colors ${runState === "running" ? "bg-amber-500/10 text-amber-300" : "bg-emerald-500/10 text-emerald-300"}`}>
                {runState === "running" ? (
                  <><i className="fas fa-circle-notch fa-spin mr-1.5" aria-hidden="true" />Running checks…</>
                ) : (
                  <><i className="fas fa-check-double mr-1.5" aria-hidden="true" />{checksShown} / 3 checks passed</>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5">
          <div className="flex -space-x-2">
            {DEMO_AVATARS.slice(0, people).map((n) => (
              <span key={n} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0d1428] bg-gradient-to-br from-indigo-500 to-violet-500 text-[8px] font-bold text-white">
                {n}
              </span>
            ))}
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {people} collaborator{people === 1 ? "" : "s"} editing now{runState === "typing" ? "…" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function IndexHeader() {
  const { isSignedIn } = useAuthState();

  const scrollToSignup = () => {
    document.getElementById("signup")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="relative overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-36">
      <div aria-hidden="true" className="cs-hero-grid absolute inset-0" />
      <div aria-hidden="true" className="absolute -top-32 left-1/2 h-96 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl dark:bg-indigo-500/20" />
      <div aria-hidden="true" className="absolute -right-32 top-40 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Link
            to="/rooms/list"
            className="group mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] py-1.5 pl-2 pr-3 text-xs font-semibold text-[var(--cs-ink-muted)] shadow-sm transition-colors hover:border-[var(--cs-brand)] hover:text-[var(--cs-brand)]"
          >
            <span className="rounded-full bg-[var(--cs-brand)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              New
            </span>
            Explore public coding rooms
            <i className="fas fa-arrow-right text-[10px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-[var(--cs-ink)] sm:text-5xl md:text-6xl">
            Learn to code{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              together,
            </span>
            <br />
            right in the browser.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--cs-ink-muted)] sm:text-lg">
            CodeSphere is a collaborative coding classroom — live sandboxes, auto-graded
            challenges, and pair programming with zero setup.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {isSignedIn ? (
              <>
                <Link
                  to="/home"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cs-brand)] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:bg-[var(--cs-brand-hover)]"
                >
                  Go to Dashboard <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
                </Link>
                <Link
                  to="/rooms/list"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] px-7 py-3.5 text-sm font-bold text-[var(--cs-ink)] transition-colors hover:border-[var(--cs-brand)] hover:text-[var(--cs-brand)]"
                >
                  Browse rooms
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={scrollToSignup}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cs-brand)] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:bg-[var(--cs-brand-hover)]"
                >
                  Start building free <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
                </button>
                <Link
                  to="/rooms/list"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] px-7 py-3.5 text-sm font-bold text-[var(--cs-ink)] transition-colors hover:border-[var(--cs-brand)] hover:text-[var(--cs-brand)]"
                >
                  <i className="fas fa-compass text-xs" aria-hidden="true" /> Explore rooms
                </Link>
              </>
            )}
          </div>
          <p className="mt-4 text-xs font-medium text-[var(--cs-ink-faint)]">
            Free &amp; open source · No install · 7 languages
          </p>
        </div>

        <div className="mt-12 sm:mt-16">
          <HeroMockup />
        </div>

        <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 sm:gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] px-3 py-4 text-center shadow-sm">
              <dt className="order-2 mt-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--cs-ink-faint)] sm:text-[11px]">
                {s.label}
              </dt>
              <dd className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}

export default IndexHeader;
