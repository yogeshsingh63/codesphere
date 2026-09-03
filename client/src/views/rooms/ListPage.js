import React from "react";
import { useHistory } from "react-router-dom";
import { useAlertState } from "context/alert.js";
import fetch from "utils/fetch.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";
import PageHeader from "components/UI/PageHeader.js";
import EmptyState from "components/UI/EmptyState.js";
import RoomCard from "components/Cards/RoomCard.js";
import InputModal from "components/Modals/InputModal.js";

const PAGE_SIZE = 12;

const SORTS = [
  { id: "name", label: "Name A–Z" },
  { id: "author", label: "Author A–Z" },
];

function ListPage() {
  const history = useHistory();
  const { setMessageOptions, setErrorOptions } = useAlertState();

  const [rooms, setRooms] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [sort, setSort] = React.useState("name");
  const [page, setPage] = React.useState(0);
  const [joinModal, setJoinModal] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim().toLowerCase());
      setPage(0);
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  const loadRooms = React.useCallback(() => {
    setLoading(true);
    setLoadError("");
    fetch(process.env.REACT_APP_API_URL + "/room/list?limit=100", {
      method: "GET"
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        const payload = json.response;
        const list = Array.isArray(payload) ? payload : (payload?.rooms ?? []);
        setRooms(list);
      } else {
        setLoadError(json.response || "Failed to load rooms.");
      }
    }).catch(() => {
      setLoadError("Network error. Please retry.");
    }).finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const join = React.useCallback((code) => {
    const value = String(code || "").trim();
    if (!value) return;
    fetch(process.env.REACT_APP_API_URL + "/room/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code: value })
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setMessageOptions({body: json.response, submit: () => {history.push("/home")}});
      }
      else {
        setErrorOptions({body: json.response});
      }
    }).catch(() => {
      setErrorOptions({body: "Network error. Please try again."});
    });
  }, [history, setMessageOptions, setErrorOptions]);

  const filtered = React.useMemo(() => {
    const list = !debounced
      ? rooms
      : rooms.filter((r) => r && [r.title, r.desc, r.author, r.code].some((v) => String(v ?? "").toLowerCase().includes(debounced)));
    const sorted = [...list];
    if (sort === "author") {
      sorted.sort((a, b) => String(a.author || "").localeCompare(String(b.author || "")));
    } else {
      sorted.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    }
    return sorted;
  }, [rooms, debounced, sort]);

  const pageCount = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col bg-[var(--cs-surface)] pt-16">
        <InputModal open={setJoinModal} isOpen={joinModal} submit={join} title="Join Room" body="Enter room code below:" button="Join" />
        <PageHeader
          eyebrow="Explore"
          title="Public rooms"
          description="Discover classrooms and challenges shared by the community. Open one to start learning, or join it to track your progress."
          stats={[
            { label: "Public rooms", value: rooms.length },
            { label: "Results", value: filtered.length },
          ]}
          actions={[
            <button
              key="join"
              type="button"
              onClick={() => setJoinModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] px-5 py-2.5 text-sm font-bold text-[var(--cs-ink)] transition-colors hover:border-[var(--cs-brand)] hover:text-[var(--cs-brand)]"
            >
              <i className="fas fa-plus text-xs" aria-hidden="true" /> Join with code
            </button>,
          ]}
        />

        <main id="main" className="container mx-auto flex w-full flex-1 flex-col gap-5 px-4 py-8 sm:px-6 md:py-10">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <input
                id="room-search"
                placeholder="Search by title, author, or code…"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search public rooms"
                className="w-full rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] py-2.5 pl-10 pr-4 text-sm text-[var(--cs-ink)] shadow-sm transition-colors placeholder:text-[var(--cs-ink-faint)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--cs-brand)]"
              />
              <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--cs-ink-faint)]" aria-hidden="true" />
            </div>
            <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] px-3 py-2.5 text-xs font-semibold text-[var(--cs-ink-muted)]">
              <i className="fas fa-arrow-down-wide-short" aria-hidden="true" />
              <span className="sr-only">Sort rooms</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(0); }}
                className="bg-transparent font-semibold text-[var(--cs-ink)] focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          {loadError && (
            <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              <span className="flex items-center gap-2">
                <i className="fas fa-triangle-exclamation" aria-hidden="true" /> {loadError}
              </span>
              <button type="button" onClick={loadRooms} className="shrink-0 font-bold underline">Retry</button>
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
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={debounced ? "fa-search" : "fa-compass"}
              title={debounced ? `No rooms match “${search.trim()}”` : "No public rooms yet"}
              body={debounced ? "Try a different keyword — or be the first to create one." : "Be the first to share a room with the community."}
              actionTo="/rooms/create"
              actionText="Create a room"
            />
          ) : (
            <>
              <p className="text-xs font-semibold text-[var(--cs-ink-faint)]" aria-live="polite">
                Showing {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} room{filtered.length === 1 ? "" : "s"}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {pageItems.map((room) => (
                  <RoomCard
                    key={room.code}
                    title={room.title}
                    desc={room.desc}
                    code={room.code}
                    author={room.author}
                    icon="fa-compass"
                    buttons={[
                      { to: "/rooms/view/" + room.code, text: "Open" },
                      { onClick: () => join(room.code), text: "Join", color: "ghost" },
                    ]}
                  />
                ))}
              </div>
              {pageCount > 1 && (
                <nav aria-label="Pagination" className="mt-2 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage === 0}
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    aria-label="Previous page"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] text-[var(--cs-ink-muted)] transition-colors hover:text-[var(--cs-ink)] disabled:opacity-30"
                  >
                    <i className="fas fa-angle-left text-xs" aria-hidden="true" />
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i)}
                      aria-label={`Page ${i + 1}`}
                      aria-current={i === safePage ? "page" : undefined}
                      className={`h-9 min-w-9 rounded-xl px-2 text-xs font-bold transition-colors ${
                        i === safePage
                          ? "bg-[var(--cs-brand)] text-white"
                          : "border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] text-[var(--cs-ink-muted)] hover:text-[var(--cs-ink)]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={safePage === pageCount - 1}
                    onClick={() => setPage((p) => Math.min(p + 1, pageCount - 1))}
                    aria-label="Next page"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] text-[var(--cs-ink-muted)] transition-colors hover:text-[var(--cs-ink)] disabled:opacity-30"
                  >
                    <i className="fas fa-angle-right text-xs" aria-hidden="true" />
                  </button>
                </nav>
              )}
            </>
          )}
        </main>
        <DefaultFooter />
      </div>
    </>
  );
}

export default ListPage;
