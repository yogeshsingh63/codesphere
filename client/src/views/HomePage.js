import React from "react";
import { Container, Row, Col, Button, Badge, Spinner } from "reactstrap";
import { Link } from "react-router-dom";
import { useAuthState } from "context/auth.js";
import fetch from "utils/fetch.js";

import Navbar from "components/Navbars/Navbar.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";
import RoomCard from "components/Cards/RoomCard.js";
import InputModal from "components/Modals/InputModal.js";
import MessageModal from "components/Modals/MessageModal.js";

function HomePage() {
  const { user } = useAuthState();

  const [joinModal, setJoinModal] = React.useState(false);
  const [messageModal, setMessageModal] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const [enrolled, setEnrolled] = React.useState([]);
  const [created, setCreated] = React.useState([]);
  const [completed, setCompleted] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const join = (code) => {
    fetch(process.env.REACT_APP_API_URL + "/room/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })
      .then((resp) => resp.json())
      .then((json) => {
        setMessage(json.response);
        setMessageModal(true);
        if (json.success) {
          load();
        }
      });
  };

  const getCompleted = (room) => {
    if (completed && completed.length > 0) {
      return completed.find((c) => c.room?.code === room.code) || null;
    }
    return null;
  };

  const load = React.useCallback(() => {
    fetch(process.env.REACT_APP_API_URL + "/user/rooms", {
      method: "POST",
    })
      .then((resp) => resp.json())
      .then((json) => {
        setLoading(false);
        if (json.success) {
          setEnrolled(json.response.enrolled || []);
          setCreated(json.response.created || []);
          setCompleted(json.response.completed || []);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    load();
  }, [load]);

  const totalCompleted = completed.filter((c) => {
    const total = c.room?.sections?.length || 0;
    return total > 0 && (c.sections?.length || 0) === total;
  }).length;

  return (
    <>
      <Navbar />
      <div
        className="wrapper cs-page-wrapper"
        style={{ minHeight: "100vh", backgroundColor: "#080c14", color: "#f8fafc" }}
      >
        <InputModal
          open={setJoinModal}
          isOpen={joinModal}
          submit={join}
          title="Join Room with Code"
          body="Enter room code below:"
          button="Join"
        />
        <MessageModal
          open={setMessageModal}
          isOpen={messageModal}
          title="Join Status"
          body={message}
        />

        <div style={{ height: "4.5rem" }} />

        {/* Dashboard Header Banner */}
        <div className="cs-dash-banner py-5 border-bottom border-dark">
          <Container>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <h2 className="title mb-0 font-weight-700">
                    Welcome back, {user || "Developer"}
                  </h2>
                  <Badge color="info" className="ml-2 px-2 py-1">
                    Pro Workspace
                  </Badge>
                </div>
                <p className="text-muted mb-0">
                  Manage your interactive learning curriculum, collaborative challenges, and cloud IDE sessions.
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2 mt-3 mt-md-0">
                <Button
                  color="info"
                  size="sm"
                  className="cs-btn cs-btn-info mr-2"
                  onClick={() => setJoinModal(true)}
                >
                  <i className="fas fa-sign-in-alt mr-1"></i> Join Code
                </Button>
                <Button
                  tag={Link}
                  to="/rooms/create"
                  color="primary"
                  size="sm"
                  className="cs-btn cs-btn-primary mr-2"
                >
                  <i className="fas fa-plus mr-1"></i> New Room
                </Button>
                <Button
                  tag={Link}
                  to="/ide"
                  color="secondary"
                  outline
                  size="sm"
                  className="cs-btn cs-btn-ghost"
                >
                  <i className="fas fa-code mr-1"></i> Cloud IDE
                </Button>
              </div>
            </div>

            {/* Quick Metrics */}
            <Row className="mt-4">
              <Col md="4" sm="6" className="mb-3 mb-md-0">
                <div className="cs-metric-card p-3 rounded">
                  <div className="text-muted small text-uppercase font-weight-600">
                    Enrolled Rooms
                  </div>
                  <div className="d-flex align-items-baseline gap-2 mt-1">
                    <span className="cs-metric-num">{enrolled.length}</span>
                    <span className="text-muted small">active curricula</span>
                  </div>
                </div>
              </Col>
              <Col md="4" sm="6" className="mb-3 mb-md-0">
                <div className="cs-metric-card p-3 rounded">
                  <div className="text-muted small text-uppercase font-weight-600">
                    Created Rooms
                  </div>
                  <div className="d-flex align-items-baseline gap-2 mt-1">
                    <span className="cs-metric-num text-info">
                      {created.length}
                    </span>
                    <span className="text-muted small">authored challenges</span>
                  </div>
                </div>
              </Col>
              <Col md="4" sm="12">
                <div className="cs-metric-card p-3 rounded">
                  <div className="text-muted small text-uppercase font-weight-600">
                    Completed
                  </div>
                  <div className="d-flex align-items-baseline gap-2 mt-1">
                    <span className="cs-metric-num text-success">
                      {totalCompleted}
                    </span>
                    <span className="text-muted small">fully completed</span>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Dashboard Content */}
        <Container className="py-5">
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="info" />
              <div className="mt-3 text-muted">Loading your workspace...</div>
            </div>
          ) : (
            <>
              {/* Enrolled Section */}
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="title mb-0 font-weight-700">
                    <i className="fas fa-book-reader mr-2 text-info"></i>
                    Enrolled Rooms ({enrolled.length})
                  </h4>
                  <Link
                    to="/rooms/list"
                    className="text-info font-weight-600 small"
                  >
                    Browse Community Rooms &rarr;
                  </Link>
                </div>
                <Row className="p-0">
                  {enrolled && enrolled.length > 0 ? (
                    enrolled.map((room, i) => (
                      <RoomCard
                        key={room.code || i}
                        completed={getCompleted(room)}
                        {...room}
                        buttons={[
                          {
                            to: "/rooms/view/" + room.code,
                            text: "Open Room",
                            color: "info",
                          },
                        ]}
                      />
                    ))
                  ) : (
                    <Col xs="12">
                      <div className="cs-empty-state text-center p-5 rounded">
                        <i className="fas fa-compass fa-2x text-muted mb-3"></i>
                        <h5 className="font-weight-600 mb-1">
                          No enrolled rooms yet
                        </h5>
                        <p className="text-muted small mb-3">
                          Join an existing course using a code or browse public rooms.
                        </p>
                        <Button
                          color="info"
                          size="sm"
                          className="cs-btn cs-btn-info mr-2"
                          onClick={() => setJoinModal(true)}
                        >
                          Join Code
                        </Button>
                        <Button
                          tag={Link}
                          to="/rooms/list"
                          color="secondary"
                          outline
                          size="sm"
                          className="cs-btn cs-btn-ghost"
                        >
                          Explore Rooms
                        </Button>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>

              {/* Created Section */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="title mb-0 font-weight-700">
                    <i className="fas fa-laptop-code mr-2 text-primary"></i>
                    Authored Rooms ({created.length})
                  </h4>
                  <Link
                    to="/rooms/create"
                    className="text-primary font-weight-600 small"
                  >
                    + Create New Room
                  </Link>
                </div>
                <Row className="p-0">
                  {created && created.length > 0 ? (
                    created.map((room, i) => (
                      <RoomCard
                        key={room.code || i}
                        completed={getCompleted(room)}
                        {...room}
                        buttons={[
                          {
                            to: "/rooms/view/" + room.code,
                            text: "Preview",
                            color: "info",
                          },
                          {
                            to: "/rooms/edit/" + room.code,
                            text: "Manage",
                            color: "danger",
                          },
                        ]}
                      />
                    ))
                  ) : (
                    <Col xs="12">
                      <div className="cs-empty-state text-center p-5 rounded">
                        <i className="fas fa-layer-group fa-2x text-muted mb-3"></i>
                        <h5 className="font-weight-600 mb-1">
                          You haven't authored any rooms yet
                        </h5>
                        <p className="text-muted small mb-3">
                          Create custom interactive challenges, quizzes, coding sandboxes, and documentation.
                        </p>
                        <Button
                          tag={Link}
                          to="/rooms/create"
                          color="primary"
                          size="sm"
                          className="cs-btn cs-btn-primary"
                        >
                          Create Your First Room
                        </Button>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </>
          )}
        </Container>
        <DefaultFooter />
      </div>
    </>
  );
}

export default HomePage;
