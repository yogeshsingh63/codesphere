import React from "react";
import asset from "utils/asset.js";
import { Link, useParams, useHistory } from "react-router-dom";

import { useAlertState } from "context/alert.js";

import fetch from "utils/fetch.js";
import storage from "utils/storage.js";
import useFileUrl from "utils/fileUrl.js";
import CopyChip from "components/UI/CopyChip.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import Markdown from "components/Markdown/Markdown.js";
import IDE from "components/IDE/IDE.js";

const TYPE_LABELS = {
  info: "Lesson",
  coding: "Coding",
  quiz: "Quiz",
  flag: "Challenge",
  website: "Interactive",
};

function SectionIntro({ room, num, section }) {
  return (
    <div className="room-text">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-[var(--cs-ink-faint)] transition-colors hover:text-[var(--cs-brand)]"
        >
          <i className="fas fa-arrow-left text-[10px]" aria-hidden="true" /> Rooms
        </Link>
        {room?.code && <CopyChip value={room.code} label="room code" />}
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-[var(--cs-brand-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--cs-brand)]">
          {TYPE_LABELS[section.type] || section.type}
        </span>
        <span className="text-[11px] font-semibold text-[var(--cs-ink-faint)]">
          Section {num + 1} of {room.sections.length}
        </span>
      </div>
      <h1 className="mt-2 flex items-center gap-2 text-xl font-extrabold tracking-tight text-[var(--cs-ink)] sm:text-2xl">
        <span className="min-w-0 truncate">{section.title}</span>
        {section.completed && <i className="fas fa-check-circle shrink-0 text-emerald-500" aria-label="Completed" />}
      </h1>
      <p className="mt-0.5 truncate text-xs font-medium text-[var(--cs-ink-faint)]">{room.title}</p>
    </div>
  );
}

function ViewPage() {
  const { setMessageOptions, setErrorOptions } = useAlertState();
  const { code } = useParams();
  const history = useHistory();

  const navbarRef = React.createRef();
  const iframeRef = React.createRef();

  const [loaded, setLoaded] = React.useState(false);
  const [room, setRoom] = React.useState({});
  const [section, setSection] = React.useState({});
  const [num, setNum] = React.useState(0);

  const [answer, setAnswer] = React.useState("");
  const [answers, setAnswers] = React.useState([]);
  const [flag, setFlag] = React.useState("");

  // Authenticated image load: /file/:code now requires auth, which plain
  // <img> tags can't send (headers/cookies) in production.
  const infoImageUrl = useFileUrl(section?.info?.image?.code);

  let storageKey = `rooms.${room.code}.num`;

  const checkCompletion = React.useCallback((room, section, force = false) => {
    if(!room?.code || !section?.code) return;
    if(!section.completed || force) {
      if(section.type === "info"
        || (section.type === "website" && force)
        || (section.type === "coding" && (section.coding?.checks?.length ?? 0) === 0)
        || (section.type === "quiz" && force)
        || (section.type === "flag" && flag)) {

        fetch(process.env.REACT_APP_API_URL + "/room/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ room: room.code, section: section.code, answer, answers, flag })
        }).then(resp => resp.json()).then(json => {
          if(json.success) {
            complete(room, section,
              section.type === "info"
              || (section.type === "coding" && (section.coding?.checks?.length ?? 0) === 0)
              || (section.type === "website" && section.website?.autopass));
          }
          else {
            setMessageOptions({title: "Info", body: json.response});
          }
        }).catch(() => {
          setMessageOptions({title: "Network error", body: "Could not verify completion. Please try again."});
        });
      }
    }
  }, [answer, answers, flag, setMessageOptions]);

  React.useEffect(() => {
    if(loaded) {
      return;
    }

    fetch(process.env.REACT_APP_API_URL + "/room/info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        let room = json.response;
        let sections = room.sections;

        setRoom(room);

        if(!sections || sections.length === 0) {
          setErrorOptions({ body: "This room has no sections.", submit: () => history.push("/home") })
          return;
        }

        let storageKey = `rooms.${room.code}.num`;
        let saved = storage.load(storageKey);
        let nextSection;

        let initial = 0;
        for(; initial < room.sections.length; initial++) {
          if(!room.sections[initial].completed) break;
          if(saved && saved === initial) break;
        }
        initial = Math.min(initial, room.sections.length - 1);

        setSection(sections[initial]);
        setNum(initial);
        nextSection = room.sections[initial];
        setLoaded(true);

        if(!nextSection) {
          history.push("/home");
          return;
        }
      }
      else {
        setErrorOptions({ body: json.response || "Unable to load room.", submit: () => history.push("/home") });
      }
    }).catch(() => {
      setErrorOptions({ body: "Network error loading room.", submit: () => history.push("/home") });
    });
  }, [code, loaded, history, setErrorOptions]);

  React.useEffect(() => {
    if(section?.type === "website" && iframeRef.current && !iframeRef.current.getAttribute("src") && section.website?.url) {
      iframeRef.current.setAttribute("src", section.website.url);
      if(section.website.autopass) {
        checkCompletion(room, section, true);
      }
    }
    const onMessage = (e) => {
      if(e.data === "finish") {
        checkCompletion(room, section, true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [iframeRef, room, section, checkCompletion]);

  const complete = (room, section, noConfetti = false) => {
    if (!room?.sections) return;
    const sections = [...room.sections];
    const idx = sections.findIndex(find => find.code === section.code);
    if (idx !== -1) sections[idx] = { ...sections[idx], completed: true };
    setRoom({...room, sections});
    setSection({...section, completed: true});
  }

  React.useEffect(() => {
    if(loaded && room?.sections?.[num]) {
      try { storage.save(storageKey, num); } catch {}
      setSection(room.sections[num]);
      checkCompletion(room, room.sections[num]);
    }
  }, [num, checkCompletion, loaded, room, storageKey]);

  if(!loaded || !section) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[var(--cs-surface)]" role="status" aria-label="Loading section">
        <i className="fas fa-circle-notch animate-spin text-[var(--cs-brand)] text-5xl" aria-hidden="true"></i>
      </div>
    );
  }

  const RoomButtons = (current) => {
    const doneCount = (room.sections || []).filter((s) => s.completed).length;
    return (
    <div className="mt-6 flex flex-col gap-3 pb-4 pr-4">
      {room.sections.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-1" role="navigation" aria-label="Sections">
          {room.sections.map((s, i) => (
            <button
              key={s.code || i}
              type="button"
              onClick={() => setNum(i)}
              title={`${i + 1}. ${s.title}${s.completed ? " (completed)" : ""}`}
              aria-label={`Go to section ${i + 1}: ${s.title}`}
              aria-current={i === current ? "step" : undefined}
              className={`h-2.5 shrink-0 rounded-full transition-all ${
                i === current
                  ? "w-7 bg-[var(--cs-brand)]"
                  : s.completed
                    ? "w-2.5 bg-emerald-500"
                    : "w-2.5 bg-black/15 hover:bg-black/25 dark:bg-white/15 dark:hover:bg-white/25"
              }`}
            />
          ))}
          <span className="ml-2 shrink-0 text-[11px] font-bold text-[var(--cs-ink-faint)]">
            {doneCount}/{room.sections.length}
          </span>
        </div>
      )}
      <div className="flex gap-2.5 px-4">
      {loaded && current > 0 && (
        <button
          type="button"
          onClick={() => setNum(current-1)}
          className="flex items-center gap-1.5 rounded-xl border border-[var(--cs-border)] px-4 py-2 text-xs font-semibold text-[var(--cs-ink-muted)] transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        >
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          <span>Prev</span>
        </button>
      )}
      {(loaded && current <= room.sections.length - 2 && section.completed) && (
        <button
          type="button"
          onClick={() => setNum(current+1)}
          className="flex items-center gap-1.5 rounded-xl bg-[var(--cs-brand)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[var(--cs-brand-hover)]"
        >
          <span>Next</span>
          <i className="fas fa-arrow-right" aria-hidden="true"></i>
        </button>
      )}
      {(loaded && section.completed && current === room.sections.length - 1) && (
        <button
          type="button"
          onClick={() => setMessageOptions({title: "Congratulations!", body: "You have completed the room!", submit: () => history.push("/home")})}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <span>Finish</span>
          <i className="fas fa-flag" aria-hidden="true"></i>
        </button>
      )}
      </div>
    </div>
    );
  };

  const layoutLeft = ["c-half-l", "c-small-l", "c-large-l", "vw-100"][section.layout ?? 0] ?? "vw-100";
  const layoutRight = ["c-half-r", "c-large-r", "c-small-r", "hidden"][section.layout ?? 0] ?? "hidden";
  const layoutRightQuiz = ["c-half-r", "c-large-r", "c-small-r"][section.layout ?? 0] ?? "c-half-r";

  return (
    <div className="room-wrapper bg-[var(--cs-surface)] min-h-screen">
      <Navbar />
      <main id="main" className="flex flex-col lg:flex-row p-0 m-0 below-navbar room-content">
        {section.type === "info" && (
          <>
            <div className={`room-col-text ${layoutLeft}`}>
              <SectionIntro room={room} num={num} section={section} />
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <div className={layoutRight}>
              <div className="flex h-full justify-center items-center bg-[var(--cs-surface)] p-6">
                {section.info?.image ? (
                  <img
                    src={infoImageUrl || asset("assets/img/logo.svg")}
                    alt="Section illustration"
                    className="c-info-img rounded-3xl shadow-sm"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src={asset("assets/img/logo.svg")}
                    alt="CodeSphere logo"
                    className="c-info-img c-hide-on-small opacity-90"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          </>
        )}
        {section.type === "coding" && (
          <>
            <div className="room-col-text w-full lg:w-1/3">
              <SectionIntro room={room} num={num} section={section} />
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <IDE 
              navbarRef={navbarRef}
              key={section.code}
              room={room.code}
              section={section.code}
              files={section.coding.files}
              lang={section.coding.lang}
              storageKey={`rooms.${room.code}.${section.code}`}
              checks={(section.coding?.checks?.length ?? 0) > 0}
              onComplete={() => {complete(room, section)}}
            />
          </>
        )}
        {section.type === "quiz" && (
          <>
            <div className={`room-col-text ${layoutLeft}`}>
              <SectionIntro room={room} num={num} section={section} />
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <div className={`room-col-text p-8 ${layoutRightQuiz}`}>
              <h4 className="text-base font-bold text-[var(--cs-ink)] mb-6">{section.quiz.question}</h4>
              <form className="ml-2 mb-6 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); checkCompletion(room, section, true); }}>
                {section.quiz.answers.map((ans, i) => 
                  <div key={i} className="flex items-center gap-2.5">
                    <input
                      type={section.quiz.all ? "checkbox" : "radio"}
                      onChange={(e) => {
                          const checked = e.target.checked;
                          if(section.quiz.all) {
                            setAnswers((prevAns) => checked ? [...new Set([...prevAns, ans.choice])] : prevAns.filter(a => a !== ans.choice))
                          }
                          else {
                            setAnswer(checked ? ans.choice : "");
                          }
                        }
                      }
                      name="answer"
                      id={`answer_${i}`}
                      className="w-4 h-4 accent-[var(--cs-brand)]"
                    />
                    <label htmlFor={`answer_${i}`} className="text-xs font-semibold text-[var(--cs-ink)] cursor-pointer">
                      {ans.choice}
                    </label>
                  </div>
                )}
                <div>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-[var(--cs-brand)] hover:bg-[var(--cs-brand-hover)] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <i className="fas fa-check" aria-hidden="true"></i> Submit
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
        {section.type === "flag" && (
          <>
            <div className={`room-col-text ${layoutLeft}`}>
              <SectionIntro room={room} num={num} section={section} />
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <div className={`room-col-text p-8 ${layoutRightQuiz}`}>
              <h4 className="text-base font-bold text-[var(--cs-ink)] mb-4"><label htmlFor="flag-input">Answer:</label></h4>
              <form className="mb-6 max-w-sm flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); checkCompletion(room, section, true); }}>
                <input
                  id="flag-input"
                  type="text"
                  value={flag}
                  onChange={e => setFlag(e.target.value)}
                  placeholder="Enter the flag..."
                  autoComplete="off"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--cs-brand)] focus:border-transparent text-sm text-[var(--cs-ink)] transition-colors"
                />
                <div>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-[var(--cs-brand)] hover:bg-[var(--cs-brand-hover)] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <i className="fas fa-check" aria-hidden="true"></i> Submit
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
        {section.type === "website" && (
          <>
            <div className={`room-col-text ${layoutLeft}`}>
              <SectionIntro room={room} num={num} section={section} />
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <div className={`bg-[var(--cs-surface-elevated)] p-0 ${layoutRightQuiz}`}>
              <iframe className="w-full border-0 h-full min-h-[60vh]" ref={iframeRef} title={`Interactive application: ${section.title}`} sandbox="allow-scripts allow-modals allow-forms allow-popups"></iframe>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ViewPage;
