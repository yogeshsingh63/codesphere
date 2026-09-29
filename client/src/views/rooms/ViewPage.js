import React from "react";
import asset from "utils/asset.js";
import { useParams, useHistory } from "react-router-dom";
import {
  Row,
  Col,
  Spinner,
  Button,
  Form,
  FormGroup,
  Input,
  Badge,
} from "reactstrap";

import { useAlertState } from "context/alert.js";
import useWindowSize from "context/windowsize.js";

import fetch from "utils/fetch.js";
import storage from "utils/storage.js";

import Navbar from "components/Navbars/Navbar.js";
import Markdown from "components/Markdown/Markdown.js";
import IDE from "components/IDE/IDE.js";

function ViewPage() {
  const { setMessageOptions, setErrorOptions } = useAlertState();
  const { code } = useParams();
  const history = useHistory();
  useWindowSize();

  const navbarRef = React.useRef(null);
  const iframeRef = React.useRef(null);

  const [loaded, setLoaded] = React.useState(false);
  const [room, setRoom] = React.useState({});
  const [section, setSection] = React.useState({});
  const [num, setNum] = React.useState(0);

  const [answer, setAnswer] = React.useState("");
  const [answers, setAnswers] = React.useState([]);
  const [flag, setFlag] = React.useState("");

  const storageKey = `rooms.${code}.num`;

  const complete = React.useCallback(
    (currentRoom, currentSection) => {
      if (!currentRoom?.sections || !currentSection?.code) return;
      const updatedSections = [...currentRoom.sections];
      const found = updatedSections.find((s) => s.code === currentSection.code);
      if (found) {
        found.completed = true;
      }
      setRoom({ ...currentRoom, sections: updatedSections });
      setSection((prev) => ({ ...prev, completed: true }));
    },
    []
  );

  const checkCompletion = React.useCallback(
    (currentRoom, currentSection, force = false) => {
      if (!currentSection || (!force && currentSection.completed)) {
        return;
      }

      const shouldCheck =
        currentSection.type === "info" ||
        (currentSection.type === "website" && force) ||
        (currentSection.type === "coding" &&
          (!currentSection.coding?.checks ||
            currentSection.coding.checks.length === 0)) ||
        (currentSection.type === "quiz" && force) ||
        (currentSection.type === "flag" && flag);

      if (shouldCheck) {
        fetch(process.env.REACT_APP_API_URL + "/room/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room: currentRoom.code,
            section: currentSection.code,
            answer,
            answers,
            flag,
          }),
        })
          .then((resp) => resp.json())
          .then((json) => {
            if (json.success) {
              complete(currentRoom, currentSection);
            } else {
              setMessageOptions({ title: "Result", body: json.response });
            }
          })
          .catch(() => {
            setMessageOptions({
              title: "Error",
              body: "Could not submit solution. Check your connection.",
            });
          });
      }
    },
    [answer, answers, flag, complete, setMessageOptions]
  );

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + "/room/info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })
      .then((resp) => resp.json())
      .then((json) => {
        if (json.success) {
          const roomData = json.response;
          const sections = roomData.sections || [];

          if (sections.length === 0) {
            setErrorOptions({
              body: "This room has no sections.",
              submit: () => history.push("/home"),
            });
            return;
          }

          setRoom(roomData);

          const saved = storage.load(`rooms.${code}.num`);
          let initial = 0;
          if (typeof saved === "number" && saved >= 0 && saved < sections.length) {
            initial = saved;
          } else {
            for (let i = 0; i < sections.length; i++) {
              if (!sections[i].completed) {
                initial = i;
                break;
              }
            }
          }

          setSection(sections[initial]);
          setNum(initial);
          setLoaded(true);
        } else {
          setErrorOptions({
            body: json.response || "Failed to load room.",
            submit: () => history.push("/home"),
          });
        }
      })
      .catch(() => {
        setErrorOptions({
          body: "Network error loading room.",
          submit: () => history.push("/home"),
        });
      });
  }, [code, history, setErrorOptions]);

  React.useEffect(() => {
    if (
      section.type === "website" &&
      iframeRef.current &&
      section.website?.url &&
      !iframeRef.current.src
    ) {
      iframeRef.current.src = section.website.url;
      if (section.website?.autopass) {
        checkCompletion(room, section, true);
      }
    }

    const handleMessage = (e) => {
      if (e.data === "finish") {
        checkCompletion(room, section, true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [section, room, checkCompletion]);

  React.useEffect(() => {
    if (loaded && room.sections && room.sections[num]) {
      storage.save(storageKey, num);
      setSection(room.sections[num]);
      checkCompletion(room, room.sections[num]);
    }
  }, [num, loaded, room, storageKey, checkCompletion]);

  const handleQuizToggle = (choice, checked) => {
    if (section.quiz?.all) {
      setAnswers((prev) =>
        checked ? [...new Set([...prev, choice])] : prev.filter((c) => c !== choice)
      );
    } else {
      setAnswer(checked ? choice : "");
    }
  };

  if (!loaded || !section) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#080c14",
          gap: "1rem",
          color: "#94a3b8",
        }}
      >
        <Spinner color="info" />
        <div>Loading room content...</div>
      </div>
    );
  }

  const sectionsCount = room.sections?.length || 1;
  const progressPercent = Math.round(((num + 1) / sectionsCount) * 100);

  const RoomControls = () => (
    <div className="cs-room-controls d-flex justify-content-between align-items-center p-3 mt-auto">
      <div>
        {num > 0 ? (
          <Button
            color="secondary"
            outline
            size="sm"
            className="cs-btn cs-btn-ghost"
            onClick={() => setNum(num - 1)}
          >
            <i className="fas fa-arrow-left mr-1"></i> Prev
          </Button>
        ) : (
          <Button
            color="secondary"
            outline
            size="sm"
            className="cs-btn cs-btn-ghost"
            onClick={() => history.push("/home")}
          >
            <i className="fas fa-chevron-left mr-1"></i> Exit
          </Button>
        )}
      </div>

      <div className="d-flex align-items-center gap-2">
        {num < sectionsCount - 1 && section.completed && (
          <Button
            color="info"
            size="sm"
            className="cs-btn cs-btn-info"
            onClick={() => setNum(num + 1)}
          >
            Next <i className="fas fa-arrow-right ml-1"></i>
          </Button>
        )}

        {num === sectionsCount - 1 && section.completed && (
          <Button
            color="success"
            size="sm"
            className="cs-btn cs-btn-success"
            onClick={() =>
              setMessageOptions({
                title: "Room Completed!",
                body: `Outstanding work! You have successfully completed all sections of "${room.title}".`,
                submit: () => history.push("/home"),
              })
            }
          >
            Finish Room <i className="fas fa-trophy ml-1"></i>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="room-wrapper cs-room-viewport d-flex flex-column">
      <Navbar
        transparent={false}
        fixed={false}
        className="mb-0 cs-room-nav"
        innerRef={navbarRef}
      />

      <div className="cs-room-subbar d-flex justify-content-between align-items-center px-4 py-2">
        <div className="d-flex align-items-center gap-2 overflow-hidden text-truncate">
          <span className="text-white font-weight-600 text-truncate">
            {room.title}
          </span>
          <span className="text-muted">/</span>
          <span className="text-info text-truncate">{section.title}</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">
            Step {num + 1} of {sectionsCount}
          </span>
          <div
            style={{
              width: "100px",
              height: "4px",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                backgroundColor: "#38bdf8",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          {section.completed && (
            <Badge color="success" className="cs-badge-success">
              <i className="fas fa-check mr-1"></i> Completed
            </Badge>
          )}
        </div>
      </div>

      <Row className="p-0 m-0 flex-grow-1 cs-room-split-container">
        {section.type === "info" && (
          <>
            <div
              className={`cs-room-doc-panel d-flex flex-column ${
                ["c-half-l", "c-small-l", "c-large-l", "vw-100"][
                  section.layout || 0
                ]
              }`}
            >
              <div className="p-4 flex-grow-1 overflow-auto">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Badge color="info" className="cs-type-badge">
                    {section.type}
                  </Badge>
                </div>
                <h3 className="cs-section-heading mb-3">{section.title}</h3>
                <div className="cs-markdown-content">
                  <Markdown markdown={section.markdown} />
                </div>
              </div>
              <RoomControls />
            </div>

            <div
              className={`cs-room-media-panel ${
                ["c-half-r", "c-large-r", "c-small-r", "d-none"][
                  section.layout || 0
                ]
              }`}
            >
              <div className="d-flex h-100 justify-content-center align-items-center p-4">
                {section.info?.image?.code ? (
                  <img
                    src={
                      process.env.REACT_APP_API_URL +
                      "/file/" +
                      section.info.image.code
                    }
                    alt="Section Illustration"
                    className="c-info-img rounded shadow"
                    style={{ maxHeight: "75%", maxWidth: "85%", objectFit: "contain" }}
                  />
                ) : (
                  <img
                    src={asset("assets/img/code-collab.svg")}
                    alt="Illustration"
                    className="c-info-img c-hide-on-small"
                    style={{ maxHeight: "60%", opacity: 0.85 }}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {section.type === "coding" && (
          <>
            <Col
              sm="12"
              md="4"
              className="cs-room-doc-panel d-flex flex-column p-0"
            >
              <div className="p-4 flex-grow-1 overflow-auto">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Badge color="info" className="cs-type-badge">
                    Interactive Challenge
                  </Badge>
                </div>
                <h3 className="cs-section-heading mb-3">{section.title}</h3>
                <div className="cs-markdown-content">
                  <Markdown markdown={section.markdown} />
                </div>
              </div>
              <RoomControls />
            </Col>
            <IDE
              navbarRef={navbarRef}
              key={section.code}
              room={room.code}
              section={section.code}
              files={section.coding?.files || []}
              lang={section.coding?.lang}
              storageKey={`rooms.${room.code}.${section.code}`}
              checks={Boolean(
                section.coding?.checks && section.coding.checks.length > 0
              )}
              onComplete={() => complete(room, section)}
            />
          </>
        )}

        {section.type === "quiz" && (
          <>
            <div
              className={`cs-room-doc-panel d-flex flex-column ${
                ["c-half-l", "c-small-l", "c-large-l"][section.layout || 0]
              }`}
            >
              <div className="p-4 flex-grow-1 overflow-auto">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Badge color="warning" className="cs-type-badge">
                    Quiz
                  </Badge>
                </div>
                <h3 className="cs-section-heading mb-3">{section.title}</h3>
                <div className="cs-markdown-content">
                  <Markdown markdown={section.markdown} />
                </div>
              </div>
              <RoomControls />
            </div>

            <div
              className={`cs-room-quiz-panel d-flex flex-column justify-content-center p-5 ${
                ["c-half-r", "c-large-r", "c-small-r"][section.layout || 0]
              }`}
            >
              <div className="cs-quiz-box p-4 rounded">
                <h4 className="font-weight-600 mb-4 text-white">
                  {section.quiz?.question}
                </h4>
                <Form className="mb-4">
                  {section.quiz?.answers?.map((item, i) => (
                    <div
                      key={i}
                      className="cs-quiz-option p-3 mb-2 rounded d-flex align-items-center"
                    >
                      <Input
                        type={section.quiz.all ? "checkbox" : "radio"}
                        id={`answer_${i}`}
                        name="quiz_choice"
                        className="mr-3"
                        onChange={(e) =>
                          handleQuizToggle(item.choice, e.target.checked)
                        }
                      />
                      <label
                        htmlFor={`answer_${i}`}
                        className="mb-0 text-white font-weight-500 cursor-pointer flex-grow-1"
                      >
                        {item.choice}
                      </label>
                    </div>
                  ))}
                </Form>
                <Button
                  color="info"
                  className="cs-btn cs-btn-info w-100 py-2"
                  onClick={() => checkCompletion(room, section, true)}
                >
                  <i className="fas fa-check-circle mr-1"></i> Submit Answer
                </Button>
              </div>
            </div>
          </>
        )}

        {section.type === "flag" && (
          <>
            <div
              className={`cs-room-doc-panel d-flex flex-column ${
                ["c-half-l", "c-small-l", "c-large-l"][section.layout || 0]
              }`}
            >
              <div className="p-4 flex-grow-1 overflow-auto">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Badge color="danger" className="cs-type-badge">
                    Flag Challenge
                  </Badge>
                </div>
                <h3 className="cs-section-heading mb-3">{section.title}</h3>
                <div className="cs-markdown-content">
                  <Markdown markdown={section.markdown} />
                </div>
              </div>
              <RoomControls />
            </div>

            <div
              className={`cs-room-quiz-panel d-flex flex-column justify-content-center p-5 ${
                ["c-half-r", "c-large-r", "c-small-r"][section.layout || 0]
              }`}
            >
              <div className="cs-quiz-box p-4 rounded">
                <h4 className="font-weight-600 mb-3 text-white">Submit Flag</h4>
                <p className="text-muted small mb-3">
                  Inspect the challenge output or environment to find the target flag.
                </p>
                <FormGroup className="mb-4">
                  <Input
                    type="text"
                    placeholder="flag{...}"
                    className="cs-input"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                  />
                </FormGroup>
                <Button
                  color="info"
                  className="cs-btn cs-btn-info w-100 py-2"
                  onClick={() => checkCompletion(room, section, true)}
                >
                  <i className="fas fa-flag mr-1"></i> Submit Flag
                </Button>
              </div>
            </div>
          </>
        )}

        {section.type === "website" && (
          <>
            <div
              className={`cs-room-doc-panel d-flex flex-column ${
                ["c-half-l", "c-small-l", "c-large-l"][section.layout || 0]
              }`}
            >
              <div className="p-4 flex-grow-1 overflow-auto">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Badge color="success" className="cs-type-badge">
                    Live Web Sandbox
                  </Badge>
                </div>
                <h3 className="cs-section-heading mb-3">{section.title}</h3>
                <div className="cs-markdown-content">
                  <Markdown markdown={section.markdown} />
                </div>
              </div>
              <RoomControls />
            </div>

            <div
              className={`cs-room-iframe-panel bg-dark h-100 ${
                ["c-half-r", "c-large-r", "c-small-r"][section.layout || 0]
              }`}
            >
              <iframe
                className="w-100 border-0 h-100"
                ref={iframeRef}
                title="Interactive application sandbox"
                sandbox="allow-modals allow-scripts allow-same-origin"
              />
            </div>
          </>
        )}
      </Row>
    </div>
  );
}

export default ViewPage;
