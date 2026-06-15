import React from "react";
import asset from "utils/asset.js";
import { useParams, useHistory } from "react-router-dom";
// import Confetti from 'react-confetti';
// reactstrap components
import {
  Row,
  Col,
  Spinner,
  Button,
  Form,
  FormGroup,
  Input
} from "reactstrap";

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

  // const [confetti, setConfetti] = React.useState(false);
  // const [confettiActive, setConfettiActive] = React.useState(true);

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
    // if(!noConfetti) {
    //   setConfetti(true);
    //   setTimeout(() => setConfettiActive(false), 3000);
    // }
    
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

  const navbarRef = React.createRef();
  const iframeRef = React.createRef();

  const [loaded, setLoaded] = React.useState(false);
  const [room, setRoom] = React.useState({});
  const [section, setSection] = React.useState({});
  const [num, setNum] = React.useState(0);

  const [answer, setAnswer] = React.useState("");
  const [answers, setAnswers] = React.useState([]);
  const [flag, setFlag] = React.useState("");

  // const [confetti, setConfetti] = React.useState(false);
  // const [confettiActive, setConfettiActive] = React.useState(true);

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
    // if(!noConfetti) {
    //   setConfetti(true);
    //   setTimeout(() => setConfettiActive(false), 3000);
    // }
    
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
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <Spinner color="primary" style={{ width: '6rem', height: '6rem' }} />
      </div>
    );
  }

  const RoomButtons = (num) => (
    <div className="room-buttons" style={{ display: 'flex', gap: '10px', marginTop: '24px', paddingBottom: '16px' }}>
      {loaded && num > 0 && (
        <Button outline color="primary" type="button" onClick={() => setNum(num-1)} style={{ fontWeight: 600, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <i className="fas fa-arrow-left"></i> Prev
        </Button>
      )}
      {(loaded && num <= room.sections.length - 2 && section.completed) && (
        <Button color="primary" type="button" onClick={() => setNum(num+1)} style={{ fontWeight: 600, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          Next <i className="fas fa-arrow-right"></i>
        </Button>
      )}
      {(loaded && section.completed && num === room.sections.length - 1) && (
        <Button color="success" type="button" onClick={() => setMessageOptions({title: "Congratulations!", body: "You have completed the room!", submit: () => history.push("/home")})} style={{ fontWeight: 600, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          Finish <i className="fas fa-flag"></i>
        </Button>
      )}
    </div>
  );

  return (
    <div className="room-wrapper h-100">
      <Navbar transparent={false} fixed={false} className="mb-0" innerRef={navbarRef} />
      <Row className="p-0 m-0 below-navbar room-content">
        {section.type === "info" && (
          <>
            <div className={"room-col-text " + ["c-half-l", "c-small-l", "c-large-l", "vw-100"][section.layout]}>
              <div className="mt-3 room-type">{section.type}</div>
              <h6 className="title room-text" style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, margin: '16px 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {room.title} ({num+1}/{room.sections.length})
              </h6>
              <h5 className="title room-text" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {section.title} {section.completed && <i className="fas fa-check-circle text-success" style={{ fontSize: '1.25rem' }}></i>}
              </h5>
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <div className={["c-half-r", "c-large-r", "c-small-r", "d-none"][section.layout]}>
              <div className="d-flex h-100 justify-content-center align-items-center" style={{ background: '#f8fafc' }}>
                {section.info?.image ? (
                  <img
                    src={process.env.REACT_APP_API_URL + "/file/" + section.info.image.code}
                    alt="Section"
                    className="c-info-img"
                    style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
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
            <Col className="room-col-text col-md-4" sm="12">
              <div className="mt-3 room-type">{section.type}</div>
              <h6 className="title room-text" style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, margin: '16px 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {room.title} ({num+1}/{room.sections.length})
              </h6>
              <h5 className="title room-text" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {section.title} {section.completed && <i className="fas fa-check-circle text-success" style={{ fontSize: '1.25rem' }}></i>}
              </h5>
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </Col>
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
                {section.title} {section.completed && <i className="fas fa-check-circle text-success" style={{ fontSize: '1.25rem' }}></i>}
              </h5>
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <div className={"room-col-text pl-4 " + ["c-half-r", "c-large-r", "c-small-r"][section.layout]} style={{ padding: '32px' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '20px' }}>{section.quiz.question}</h4>
              <Form className="ml-2" style={{ marginBottom: '24px' }}>
                {section.quiz.answers.map((answer, i) => 
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Input
                      type={section.quiz.all ? "checkbox" : "radio"}
                      onChange={(e) => {
                          e.persist();
                          let checked = e.target.checked;
                          if(section.quiz.all) {
                            setAnswers((prevAns) => checked ? [...new Set(prevAns.concat(answer.choice))] : answers.filter(a => a !== answer.choice))
                          }
                          else {
                            setAnswer(checked ? answer.choice : "");
                          }
                        }
                      }
                      name="answer"
                      id={`answer_${i}`}
                      style={{ position: 'static', margin: 0, width: '18px', height: '18px' }}
                    />
                    <label htmlFor={`answer_${i}`} style={{ fontSize: '0.925rem', fontWeight: 500, color: '#374151', cursor: 'pointer', margin: 0 }}>
                      {answer.choice}
                    </label>
                  </div>
                )}
              </Form>
              <Button color="primary" type="button" onClick={() => checkCompletion(room, section, true)} style={{ fontWeight: 600, borderRadius: '8px' }}><i className="fas fa-check"></i> Submit</Button>
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
                {section.title} {section.completed && <i className="fas fa-check-circle text-success" style={{ fontSize: '1.25rem' }}></i>}
              </h5>
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <div className={"room-col-text pl-4 pr-4 " + ["c-half-r", "c-large-r", "c-small-r"][section.layout]} style={{ padding: '32px' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Answer:</h4>
              <FormGroup style={{ marginBottom: '20px' }}>
                <Input
                  type="text"
                  value={flag}
                  onChange={e => setFlag(e.target.value)}
                  placeholder="Enter the flag..."
                  style={{ borderRadius: '8px', maxWidth: '400px' }}
                />
              </FormGroup>
              <Button color="primary" type="button" onClick={() => checkCompletion(room, section, true)} style={{ fontWeight: 600, borderRadius: '8px' }}><i className="fas fa-check"></i> Submit</Button>
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
                {section.title} {section.completed && <i className="fas fa-check-circle text-success" style={{ fontSize: '1.25rem' }}></i>}
              </h5>
              <Markdown className="room-text" markdown={section.markdown} />
              {RoomButtons(num)}
            </div>
            <div className={"bg-white p-0 h-100 " + ["c-half-r", "c-large-r", "c-small-r"][section.layout]}>
              <iframe className="w-100 border-0 h-100" ref={iframeRef} title="Interactive application" sandbox="allow-modals allow-scripts"></iframe>
            </div>
          </>
        )}
      </Row>
    </div>
  );
}

export default ViewPage;
