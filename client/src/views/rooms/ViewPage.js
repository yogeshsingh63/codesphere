import React from "react";
import asset from "utils/asset.js";
import { useParams, useHistory } from "react-router-dom";

import { useAuthState } from "context/auth.js";
import { useAlertState } from "context/alert.js";
import useWindowSize from "context/windowsize.js";

import fetch from "utils/fetch.js";
import storage from "utils/storage.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import Markdown from "components/Markdown/Markdown.js";
import IDE from "components/IDE/IDE.js";

function ViewPage() {
  const { isSignedIn } = useAuthState();
  const { setMessageOptions, setErrorOptions } = useAlertState();
  const { code } = useParams();
  const history = useHistory();
  useWindowSize();

  const navbarRef = React.createRef();
  const iframeRef = React.createRef();

  const [loaded, setLoaded] = React.useState(false);
  const [room, setRoom] = React.useState({});
  const [section, setSection] = React.useState({});
  const [num, setNum] = React.useState(0);

  const [answer, setAnswer] = React.useState("");
  const [answers, setAnswers] = React.useState([]);
  const [flag, setFlag] = React.useState("");

  let storageKey = `rooms.${room.code}.num`;

  const checkCompletion = React.useCallback((room, section, force = false) => {
    if(!section.completed || force) {
      if(section.type === "info"
        || (section.type === "website" && force)
        || (section.type === "coding" && section.coding.checks.length === 0)
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
              || (section.type === "coding" && section.coding.checks.length === 0)
              || (section.type === "website" && section.website.autopass));
          }
          else {
            setMessageOptions({title: "Info", body: json.response});
          }
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
          return <></>;
        }
      }
      else {
        history.push("/home");
      }
    });
  }, [code, loaded, history, checkCompletion, setErrorOptions]);

  React.useEffect(() => {
    if(section.type === "website" && !iframeRef.current.src) {
      iframeRef.current.src = section.website.url;
      if(section.website.autopass) {
        checkCompletion(room, section, true);
      }
    }
    window.onmessage = (e) => {
      if(e.data === "finish") {
        checkCompletion(room, section, true);
      }
    }
  }, [iframeRef, room, section, checkCompletion]);

  const complete = (room, section, noConfetti = false) => {
    let sections = room.sections;
    sections.find(find => find.code === section.code).completed = true;
    setRoom({...room, sections});
    setSection({...section, completed: true});
  }

  React.useEffect(() => {
    if(loaded) {
      storage.save(storageKey, num);
      setSection(room.sections[num]);
      checkCompletion(room, room.sections[num]);
    }
  }, [num, checkCompletion, loaded, room, storageKey]);

  if(!isSignedIn) {
    history.push("/");
    return <></>;
  }

  if(!section) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#faf9f6]">
        <i className="fas fa-spinner animate-spin text-[#c2410c] text-5xl"></i>
      </div>
    );
  }

  const RoomButtons = (num) => (
    <div className="room-buttons flex gap-2.5 mt-6 pb-4">
      {loaded && num > 0 && (
        <button 
          onClick={() => setNum(num-1)} 
          className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-100/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Prev</span>
        </button>
      )}
      {(loaded && num <= room.sections.length - 2 && section.completed) && (
        <button 
          onClick={() => setNum(num+1)} 
          className="px-4 py-2 bg-[#c2410c] hover:bg-[#a13207] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <span>Next</span>
          <i className="fas fa-arrow-right"></i>
        </button>
      )}
      {(loaded && section.completed && num === room.sections.length - 1) && (
        <button 
          onClick={() => setMessageOptions({title: "Congratulations!", body: "You have completed the room!", submit: () => history.push("/home")})} 
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <span>Finish</span>
          <i className="fas fa-flag"></i>
        </button>
      )}
    </div>
  );

  return (
    <div className="room-wrapper h-100 bg-[#faf9f6]">
      <Navbar transparent={false} fixed={false} className="mb-0" innerRef={navbarRef} />
      <div className="flex flex-col lg:flex-row p-0 m-0 below-navbar room-content">
        {section.type === "info" && (
          <>
            <div className={"room-col-text " + ["c-half-l", "c-small-l", "c-large-l", "vw-100"][section.layout]}>
              <div className="mt-3 room-type">{section.type}</div>
              <h6 className="title room-text" style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, margin: '16px 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {room.title} ({num+1}/{room.sections.length})
              </h6>
              <h5 className="title room-text" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {section.title} {section.completed && <i className="fas fa-check-circle text-emerald-600" style={{ fontSize: '1.25rem' }}></i>}
              </h5>
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <div className={["c-half-r", "c-large-r", "c-small-r", "hidden"][section.layout]}>
              <div className="flex h-full justify-center items-center bg-[#faf9f6]">
                {section.info?.image ? (
                  <img
                    src={process.env.REACT_APP_API_URL + "/file/" + section.info.image.code}
                    alt="Section"
                    className="c-info-img rounded-3xl shadow-sm"
                  />
                ) : (
                  <img
                    src={asset("assets/img/favicon.png")}
                    alt="codesphere logo"
                    className="c-info-img c-hide-on-small"
                  />
                )}
              </div>
            </div>
          </>
        )}
        {section.type === "coding" && (
          <>
            <div className="room-col-text w-full lg:w-1/3">
              <div className="mt-3 room-type">{section.type}</div>
              <h6 className="title room-text" style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, margin: '16px 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {room.title} ({num+1}/{room.sections.length})
              </h6>
              <h5 className="title room-text" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {section.title} {section.completed && <i className="fas fa-check-circle text-emerald-600" style={{ fontSize: '1.25rem' }}></i>}
              </h5>
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
              checks={section.coding.checks.length > 0}
              onComplete={() => {complete(room, section)}}
            />
          </>
        )}
        {section.type === "quiz" && (
          <>
            <div className={"room-col-text " + ["c-half-l", "c-small-l", "c-large-l"][section.layout]}>
              <div className="mt-3 room-type">{section.type}</div>
              <h6 className="title room-text" style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, margin: '16px 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {room.title} ({num+1}/{room.sections.length})
              </h6>
              <h5 className="title room-text" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {section.title} {section.completed && <i className="fas fa-check-circle text-emerald-600" style={{ fontSize: '1.25rem' }}></i>}
              </h5>
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <div className={"room-col-text pl-4 " + ["c-half-r", "c-large-r", "c-small-r"][section.layout]} style={{ padding: '32px' }}>
              <h4 className="text-base font-bold text-stone-900 mb-6">{section.quiz.question}</h4>
              <form className="ml-2 mb-6 flex flex-col gap-3">
                {section.quiz.answers.map((ans, i) => 
                  <div key={i} className="flex items-center gap-2.5">
                    <input
                      type={section.quiz.all ? "checkbox" : "radio"}
                      onChange={(e) => {
                          e.persist();
                          let checked = e.target.checked;
                          if(section.quiz.all) {
                            setAnswers((prevAns) => checked ? [...new Set(prevAns.concat(ans.choice))] : answers.filter(a => a !== ans.choice))
                          }
                          else {
                            setAnswer(checked ? ans.choice : "");
                          }
                        }
                      }
                      name="answer"
                      id={`answer_${i}`}
                      className="w-4 h-4 text-[#c2410c] focus:ring-[#c2410c] border-stone-300"
                    />
                    <label htmlFor={`answer_${i}`} className="text-xs font-semibold text-stone-750 cursor-pointer">
                      {ans.choice}
                    </label>
                  </div>
                )}
              </form>
              <button 
                type="button" 
                onClick={() => checkCompletion(room, section, true)} 
                className="px-4 py-2 bg-[#c2410c] hover:bg-[#a13207] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
              >
                <i className="fas fa-check"></i> Submit
              </button>
            </div>
          </>
        )}
        {section.type === "flag" && (
          <>
            <div className={"room-col-text " + ["c-half-l", "c-small-l", "c-large-l"][section.layout]}>
              <div className="mt-3 room-type">{section.type}</div>
              <h6 className="title room-text" style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, margin: '16px 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {room.title} ({num+1}/{room.sections.length})
              </h6>
              <h5 className="title room-text" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {section.title} {section.completed && <i className="fas fa-check-circle text-emerald-600" style={{ fontSize: '1.25rem' }}></i>}
              </h5>
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <div className={"room-col-text pl-4 pr-4 " + ["c-half-r", "c-large-r", "c-small-r"][section.layout]} style={{ padding: '32px' }}>
              <h4 className="text-base font-bold text-stone-900 mb-4">Answer:</h4>
              <div className="mb-6">
                <input
                  type="text"
                  value={flag}
                  onChange={e => setFlag(e.target.value)}
                  placeholder="Enter the flag..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm text-stone-900 max-w-sm transition-all"
                />
              </div>
              <button 
                type="button" 
                onClick={() => checkCompletion(room, section, true)} 
                className="px-4 py-2 bg-[#c2410c] hover:bg-[#a13207] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
              >
                <i className="fas fa-check"></i> Submit
              </button>
            </div>
          </>
        )}
        {section.type === "website" && (
          <>
            <div className={"room-col-text " + ["c-half-l", "c-small-l", "c-large-l"][section.layout]}>
              <div className="mt-3 room-type">{section.type}</div>
              <h6 className="title room-text" style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, margin: '16px 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {room.title} ({num+1}/{room.sections.length})
              </h6>
              <h5 className="title room-text" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {section.title} {section.completed && <i className="fas fa-check-circle text-emerald-600" style={{ fontSize: '1.25rem' }}></i>}
              </h5>
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <div className={"bg-white p-0 h-100 " + ["c-half-r", "c-large-r", "c-small-r"][section.layout]}>
              <iframe className="w-full border-0 h-full" ref={iframeRef} title="Interactive application" sandbox="allow-modals allow-scripts"></iframe>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ViewPage;
