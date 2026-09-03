import React from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "context/auth.js";
import fetch from "utils/fetch.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";
import PageHeader from "components/UI/PageHeader.js";
import EmptyState from "components/UI/EmptyState.js";

import RoomCard from "components/Cards/RoomCard.js";
import InputModal from "components/Modals/InputModal.js";
import MessageModal from "components/Modals/MessageModal.js";

function progressOf(completed) {
  if (!completed?.room?.sections?.length) return null;
  const total = completed.room.sections.length;
  const done = Array.isArray(completed.sections) ? completed.sections.length : 0;
  return Math.round((done / total) * 100);
}

const TABS = [
  { id: "all", label: "All rooms", icon: "fa-border-all" },
  { id: "enrolled", label: "Enrolled", icon: "fa-graduation-cap" },
  { id: "created", label: "Created", icon: "fa-tools" },
];

const SORTS = [
  { id: "name", label: "Name A–Z" },
  { id: "progress", label: "Progress" },
];

function HomePage() {
  const { user } = useAuthState(true);

  const [joinModal, setJoinModal] = React.useState(false);
  const [messageModal, setMessageModal] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");

  const [enrolled, setEnrolled] = React.useState([]);
  const [created, setCreated] = React.useState([]);
  const [completed, setCompleted] = React.useState([]);

  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState("all");
  const [sort, setSort] = React.useState("name");

  const join = (code) => {
    if (!code?.trim()) return;
    fetch(process.env.REACT_APP_API_URL + "/room/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code: code.trim() })
    }).then(resp => resp.json()).then(json => {
      setMessage(json.response);
      setMessageModal(true);
      if(json.success) {
        load();
      }
    }).catch(() => {
      setMessage("Network error. Please try again.");
      setMessageModal(true);
    });
  }

  const getCompleted = React.useCallback((room) => {
    if(completed.length > 0 && room?.code) {
      return completed.find(c => c?.room?.code === room.code) || null;
    }
    return null;
  }, [completed]);

  const load = React.useCallback(() => {
    setLoading(true);
    setLoadError("");
    fetch(process.env.REACT_APP_API_URL + "/user/rooms", {
      method: "POST"
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setEnrolled(json.response?.enrolled ?? []);
        setCreated(json.response?.created ?? []);
        setCompleted(json.response?.completed ?? []);
      } else {
        setLoadError(json.response || "Failed to load rooms.");
      }
    }).catch(() => {
      setLoadError("Network error. Please retry.");
    }).finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    load();
  }, [load]);

  const stats = React.useMemo(() => {
    const finished = [...enrolled, ...created].filter((r) => progressOf(getCompleted(r)) === 100).length;
    const inProgress = [...enrolled, ...created].filter((r) => {
      const p = progressOf(getCompleted(r));
      return p != null && p > 0 && p < 100;
    }).length;
    return [
      { label: "Enrolled", value: enrolled.length },
      { label: "Created", value: created.length },
      { label: "In progress", value: inProgress },
      { label: "Completed", value: finished },
    ];
  }, [enrolled, created, getCompleted]);

  const continueRoom = React.useMemo(() => {
    return enrolled.find((r) => {
      const p = progressOf(getCompleted(r));
      return p != null && p > 0 && p < 100;
    }) || null;
  }, [enrolled, getCompleted]);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = tab === "enrolled" ? enrolled : tab === "created" ? created : [...enrolled, ...created];
    const seen = new Set();
    const deduped = pool.filter((r) => {
      if (!r?.code || seen.has(r.code)) return false;
      seen.add(r.code);
      return true;
    });
    const filtered = q
      ? deduped.filter((r) =>
          [r.title, r.desc, r.author?.username ?? r.author, r.code]
            .some((v) => String(v ?? "").toLowerCase().includes(q))
        )
      : deduped;
    const sorted = [...filtered];
    if (sort === "progress") {
      sorted.sort((a, b) => (progressOf(getCompleted(b)) ?? -1) - (progressOf(getCompleted(a)) ?? -1));
    } else {
      sorted.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    }
    return sorted;
  }, [enrolled, created, query, tab, sort, getCompleted]);

  const createdCodes = React.useMemo(() => new Set(created.map((r) => r?.code)), [created]);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col bg-[var(--cs-surface)] pt-16">
        <InputModal open={setJoinModal} isOpen={joinModal} submit={join} title="Join Room" body="Enter room code below:" button="Join" />
        <MessageModal open={setMessageModal} isOpen={messageModal} title="Join Room" body={message} />

        <PageHeader
          eyebrow="Dashboard"
          title={user ? `Welcome back, ${user}!` : "Your workspace"}
          description="Pick up where you left off, join a new room with a code, or create your own classroom."
          stats={stats}
          actions={[
            <button
              key="join"
              type="button"
              onClick={() => setJoinModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] px-5 py-2.5 text-sm font-bold text-[var(--cs-ink)] transition-colors hover:border-[var(--cs-brand)] hover:text-[var(--cs-brand)]"
            >
              <i className="fas fa-plus text-xs" aria-hidden="true" /> Join with code
            </button>,
            <Link
              key="create"
              to="/rooms/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cs-brand)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--cs-brand-hover)]"
            >
              <i className="fas fa-wand-magic-sparkles text-xs" aria-hidden="true" /> Create room
            </Link>,
          ]}
        />

        <main id="main" className="container mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:py-10">
          {loadError && (
            <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              <span className="flex items-center gap-2">
                <i className="fas fa-triangle-exclamation" aria-hidden="true" /> {loadError}
              </span>
              <button type="button" onClick={load} className="shrink-0 font-bold underline">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading rooms">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="min-h-[210px] animate-pulse rounded-2xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] p-5">
                  <div className="mb-3 h-10 w-10 rounded-xl bg-black/10 dark:bg-white/10" />
                  <div className="mb-2 h-4 w-2/3 rounded bg-black/10 dark:bg-white/10" />
                  <div className="h-3 w-full rounded bg-black/10 dark:bg-white/10" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {continueRoom && (
                <section aria-label="Continue learning" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg shadow-indigo-500/20 sm:p-8">
                  <div aria-hidden="true" className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
                  <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-100">
                        Continue learning
                      </p>
                      <h2 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">
                        {continueRoom.title}
                      </h2>
                      <p className="cs-clamp-1 mt-1 max-w-xl text-sm text-indigo-100">
                        {continueRoom.desc}
                      </p>
                      {(() => {
                        const p = progressOf(getCompleted(continueRoom)) ?? 0;
                        return (
                          <div className="mt-4 max-w-md">
                            <div className="mb-1.5 flex justify-between text-[11px] font-bold">
                              <span className="uppercase tracking-wider text-indigo-100">Progress</span>
                              <span>{p}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/20">
                              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${p}%` }} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <Link
                      to={"/rooms/view/" + continueRoom.code}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      Resume <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
                    </Link>
                  </div>
                </section>
              )}

              <section aria-label="Your rooms">
                <div className="mb-4 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter rooms">
                    {TABS.map((t) => (
                      <button
                        key={t.id}
                        role="tab"
                        aria-selected={tab === t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                          tab === t.id
                            ? "bg-[var(--cs-ink)] text-white dark:bg-white dark:text-slate-900"
                            : "border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] text-[var(--cs-ink-muted)] hover:text-[var(--cs-ink)]"
                        }`}
                      >
                        <i className={`fas ${t.icon}`} aria-hidden="true" /> {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search your rooms…"
                        aria-label="Search your rooms"
                        className="w-full rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] py-2.5 pl-10 pr-4 text-sm text-[var(--cs-ink)] shadow-sm transition-colors placeholder:text-[var(--cs-ink-faint)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--cs-brand)]"
                      />
                      <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--cs-ink-faint)]" aria-hidden="true" />
                    </div>
                    <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] px-3 py-2.5 text-xs font-semibold text-[var(--cs-ink-muted)]">
                      <i className="fas fa-arrow-down-wide-short" aria-hidden="true" />
                      <span className="sr-only">Sort rooms</span>
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="bg-transparent font-semibold text-[var(--cs-ink)] focus:outline-none"
                      >
                        {SORTS.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                {visible.length === 0 ? (
                  <EmptyState
                    icon={query ? "fa-search" : tab === "created" ? "fa-wand-magic-sparkles" : "fa-door-open"}
                    title={query ? `No rooms match “${query}”` : tab === "created" ? "You haven't created any rooms yet" : "No rooms here yet"}
                    body={query ? "Try a different keyword, or browse public rooms to join." : "Join a room with a code, create your own, or explore public rooms."}
                    actionTo={tab === "created" ? "/rooms/create" : "/rooms/list"}
                    actionText={tab === "created" ? "Create a room" : "Explore public rooms"}
                    secondary={
                      !query && tab !== "created" ? (
                        <button
                          type="button"
                          onClick={() => setJoinModal(true)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] px-5 py-2.5 text-sm font-bold text-[var(--cs-ink)] transition-colors hover:border-[var(--cs-brand)] hover:text-[var(--cs-brand)]"
                        >
                          Join with code
                        </button>
                      ) : null
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                    {visible.map((room) => {
                      const mine = createdCodes.has(room.code);
                      const completion = getCompleted(room);
                      return (
                        <RoomCard
                          key={room.code}
                          title={room.title}
                          desc={room.desc}
                          code={room.code}
                          author={room.author?.username ?? room.author}
                          sectionsCount={Array.isArray(room.sections) ? room.sections.length : undefined}
                          completed={completion}
                          icon={mine ? "fa-crown" : "fa-layer-group"}
                          buttons={
                            mine
                              ? [
                                  { to: "/rooms/view/" + room.code, text: "Open" },
                                  { to: "/rooms/edit/" + room.code, text: "Manage", color: "danger" },
                                ]
                              : [{ to: "/rooms/view/" + room.code, text: "Open" }]
                          }
                        />
                      );
                    })}
                    <Link
                      to="/rooms/create"
                      className="group flex min-h-[210px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--cs-border)] bg-transparent p-5 text-center transition-colors hover:border-[var(--cs-brand)]"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--cs-brand-soft)] text-[var(--cs-brand)] transition-transform group-hover:scale-110">
                        <i className="fas fa-plus" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-bold text-[var(--cs-ink)]">Create a room</span>
                      <span className="max-w-[220px] text-xs leading-relaxed text-[var(--cs-ink-muted)]">
                        Design challenges, quizzes and lessons for your group.
                      </span>
                    </Link>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
        <DefaultFooter />
      </div>
    </>
  );
}

export default HomePage;
