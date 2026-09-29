import React from "react";
import { useParams, useHistory } from "react-router-dom";
import Cookies from "universal-cookie";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Spinner,
  FormGroup,
  Input,
  Button,
  Form,
  Badge,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";

import { useAuthState } from "context/auth.js";
import { useAlertState } from "context/alert.js";
import fetch from "utils/fetch.js";

import Navbar from "components/Navbars/Navbar.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

function ProfilePage() {
  const { setMessageOptions, setErrorOptions, setFileListOptions } =
    useAlertState();
  const { user: currentUsername, email: currentEmail } = useAuthState();
  const cookies = new Cookies();
  const history = useHistory();
  const params = useParams();

  const target = params.target || currentUsername;
  const isOwner = target && currentUsername && target === currentUsername;

  const [activeTab, setActiveTab] = React.useState("overview");
  const [userData, setUserData] = React.useState({});
  const [loaded, setLoaded] = React.useState(false);

  const [info, setInfo] = React.useState({});
  const [pass, setPass] = React.useState({ currentPassword: "", newPassword: "" });
  const [bio, setBio] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const loadUserData = React.useCallback(() => {
    if (!target) return;
    setLoaded(false);
    fetch(
      process.env.REACT_APP_API_URL +
        "/user/info?username=" +
        encodeURIComponent(target),
      {
        method: "GET",
      }
    )
      .then((resp) => resp.json())
      .then((json) => {
        setLoaded(true);
        if (json.success) {
          setUserData(json.response);
          setBio(json.response.bio || "");
          setInfo({
            username: json.response.username,
            name: json.response.name || "",
            email: currentEmail || "",
          });
        } else {
          setErrorOptions({
            body: json.response || "User not found.",
            submit: () => {
              history.push("/home");
            },
          });
        }
      })
      .catch(() => {
        setLoaded(true);
        setErrorOptions({
          body: "Network error loading user profile.",
          submit: () => {
            history.push("/home");
          },
        });
      });
  }, [target, currentEmail, history, setErrorOptions]);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    loadUserData();
  }, [loadUserData]);

  const updateInfo = (e) => {
    e.preventDefault();
    setSaving(true);

    fetch(process.env.REACT_APP_API_URL + "/user/update_info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: info.username || currentUsername,
        email: info.email || currentEmail,
        name: info.name !== undefined ? info.name : userData.name,
      }),
    })
      .then((resp) => resp.json())
      .then((json) => {
        setSaving(false);
        if (!json.success) {
          return setErrorOptions({ body: json.response });
        }
        cookies.set("authToken", json.response);
        setMessageOptions({ body: "Profile updated successfully!" });
        loadUserData();
      })
      .catch(() => {
        setSaving(false);
        setErrorOptions({ body: "Error updating user information." });
      });
  };

  const changePass = (e) => {
    e.preventDefault();
    setSaving(true);
    fetch(process.env.REACT_APP_API_URL + "/user/update_pass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...pass }),
    })
      .then((resp) => resp.json())
      .then((json) => {
        setSaving(false);
        if (json.success) {
          setMessageOptions({ body: "Password changed successfully!" });
          setPass({ currentPassword: "", newPassword: "" });
        } else {
          setErrorOptions({ body: json.response });
        }
      })
      .catch(() => {
        setSaving(false);
        setErrorOptions({ body: "Failed to update password." });
      });
  };

  const changeBio = (e) => {
    e.preventDefault();
    setSaving(true);
    fetch(process.env.REACT_APP_API_URL + "/user/update_bio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bio }),
    })
      .then((resp) => resp.json())
      .then((json) => {
        setSaving(false);
        if (json.success) {
          setMessageOptions({ body: "Bio updated successfully!" });
          loadUserData();
        } else {
          setErrorOptions({ body: json.response });
        }
      })
      .catch(() => {
        setSaving(false);
        setErrorOptions({ body: "Failed to update bio." });
      });
  };

  const changePic = (file) => {
    if (!file?.code) return;
    fetch(process.env.REACT_APP_API_URL + "/user/update_pic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: file.code }),
    })
      .then((resp) => resp.json())
      .then((json) => {
        if (json.success) {
          setMessageOptions({ body: "Profile picture changed!" });
          loadUserData();
        } else {
          setErrorOptions({ body: json.response });
        }
      });
  };

  const deletePic = () => {
    fetch(process.env.REACT_APP_API_URL + "/user/update_pic", {
      method: "POST",
    })
      .then((resp) => resp.json())
      .then((json) => {
        if (json.success) {
          setMessageOptions({ body: "Profile picture removed!" });
          loadUserData();
        } else {
          setErrorOptions({ body: json.response });
        }
      });
  };

  return (
    <>
      <Navbar />
      <div
        className="wrapper cs-page-wrapper"
        style={{ minHeight: "100vh", backgroundColor: "#080c14", color: "#f8fafc" }}
      >
        <div style={{ height: "4.5rem" }} />

        <Container className="py-5">
          {!loaded ? (
            <div className="text-center py-5">
              <Spinner color="info" />
              <div className="mt-3 text-muted">Loading profile...</div>
            </div>
          ) : (
            <Row>
              {/* Profile Card Left */}
              <Col lg="4" md="5" className="mb-4">
                <Card className="cs-card p-4 text-center">
                  <CardBody className="p-0">
                    <div className="position-relative d-inline-block mb-3">
                      <img
                        className="rounded-circle border border-info p-1 shadow"
                        src={
                          userData.profilepic
                            ? process.env.REACT_APP_API_URL +
                              "/file/" +
                              userData.profilepic
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                userData.username || "User"
                              )}&background=141e33&color=38bdf8&size=160`
                        }
                        style={{
                          width: "7.5rem",
                          height: "7.5rem",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            userData.username || "User"
                          )}&background=141e33&color=38bdf8&size=160`;
                        }}
                        alt={`${userData.username}'s avatar`}
                      />
                    </div>

                    <CardTitle tag="h4" className="font-weight-700 text-white mb-1">
                      {userData.name ? userData.name : userData.username}
                    </CardTitle>
                    <div className="text-info font-mono small mb-3">
                      @{userData.username}
                    </div>

                    <CardText
                      className="text-muted small px-2 mb-4"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {userData.bio ||
                        "No bio written yet. A quiet developer building remarkable code."}
                    </CardText>

                    <div className="cs-panel p-3 text-left mb-3">
                      <div className="d-flex justify-content-between py-1 border-bottom border-dark small">
                        <span className="text-muted">Enrolled Rooms</span>
                        <span className="font-weight-600 text-white">
                          {userData.enrolled || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom border-dark small">
                        <span className="text-muted">Created Rooms</span>
                        <span className="font-weight-600 text-info">
                          {userData.created || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-1 small">
                        <span className="text-muted">Completed</span>
                        <span className="font-weight-600 text-success">
                          {userData.completed || 0}
                        </span>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="d-flex flex-column gap-2">
                        <Button
                          color="info"
                          outline
                          size="sm"
                          className="cs-btn cs-btn-ghost mb-2"
                          onClick={() =>
                            setFileListOptions({
                              title: "Select Profile Picture",
                              submit: changePic,
                            })
                          }
                        >
                          <i className="fas fa-camera mr-1"></i> Upload Avatar
                        </Button>
                        {userData.profilepic && (
                          <Button
                            color="danger"
                            outline
                            size="sm"
                            className="cs-btn cs-btn-ghost"
                            onClick={deletePic}
                          >
                            <i className="fas fa-trash-alt mr-1"></i> Remove Avatar
                          </Button>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>

              {/* Profile Details / Settings Right */}
              <Col lg="8" md="7">
                {isOwner ? (
                  <Card className="cs-card">
                    <CardBody className="p-4">
                      <Nav tabs className="cs-tabs mb-4">
                        <NavItem>
                          <NavLink
                            className={`cs-tab-link ${
                              activeTab === "overview" ? "active" : ""
                            }`}
                            onClick={() => setActiveTab("overview")}
                          >
                            <i className="fas fa-user-edit mr-1"></i> Account Details
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={`cs-tab-link ${
                              activeTab === "security" ? "active" : ""
                            }`}
                            onClick={() => setActiveTab("security")}
                          >
                            <i className="fas fa-shield-alt mr-1"></i> Security
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={`cs-tab-link ${
                              activeTab === "bio" ? "active" : ""
                            }`}
                            onClick={() => setActiveTab("bio")}
                          >
                            <i className="fas fa-pen-fancy mr-1"></i> Bio & Summary
                          </NavLink>
                        </NavItem>
                      </Nav>

                      {activeTab === "overview" && (
                        <Form onSubmit={updateInfo}>
                          <h5 className="font-weight-600 text-white mb-3">
                            Personal Information
                          </h5>
                          <Row>
                            <Col md="6">
                              <FormGroup>
                                <label className="text-muted small">Username</label>
                                <Input
                                  type="text"
                                  className="cs-input"
                                  defaultValue={userData.username}
                                  onChange={(e) =>
                                    setInfo({ ...info, username: e.target.value })
                                  }
                                  required
                                  minLength={6}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup>
                                <label className="text-muted small">Display Name</label>
                                <Input
                                  type="text"
                                  className="cs-input"
                                  defaultValue={userData.name}
                                  onChange={(e) =>
                                    setInfo({ ...info, name: e.target.value })
                                  }
                                  placeholder="e.g. Linus Torvalds"
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                          <FormGroup>
                            <label className="text-muted small">Email Address</label>
                            <Input
                              type="email"
                              className="cs-input"
                              defaultValue={currentEmail}
                              onChange={(e) =>
                                setInfo({ ...info, email: e.target.value })
                              }
                              required
                            />
                          </FormGroup>
                          <Button
                            color="info"
                            type="submit"
                            size="sm"
                            className="cs-btn cs-btn-info mt-2"
                            disabled={saving}
                          >
                            {saving ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <i className="fas fa-save mr-1"></i> Save Changes
                              </>
                            )}
                          </Button>
                        </Form>
                      )}

                      {activeTab === "security" && (
                        <Form onSubmit={changePass}>
                          <h5 className="font-weight-600 text-white mb-3">
                            Change Password
                          </h5>
                          <Row>
                            <Col md="6">
                              <FormGroup>
                                <label className="text-muted small">
                                  Current Password
                                </label>
                                <Input
                                  type="password"
                                  className="cs-input"
                                  placeholder="Current Password"
                                  value={pass.currentPassword}
                                  onChange={(e) =>
                                    setPass({
                                      ...pass,
                                      currentPassword: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup>
                                <label className="text-muted small">
                                  New Password
                                </label>
                                <Input
                                  type="password"
                                  className="cs-input"
                                  placeholder="At least 8 characters"
                                  value={pass.newPassword}
                                  onChange={(e) =>
                                    setPass({
                                      ...pass,
                                      newPassword: e.target.value,
                                    })
                                  }
                                  required
                                  minLength={8}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                          <Button
                            color="info"
                            type="submit"
                            size="sm"
                            className="cs-btn cs-btn-info mt-2"
                            disabled={saving}
                          >
                            {saving ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <i className="fas fa-key mr-1"></i> Update Password
                              </>
                            )}
                          </Button>
                        </Form>
                      )}

                      {activeTab === "bio" && (
                        <Form onSubmit={changeBio}>
                          <h5 className="font-weight-600 text-white mb-3">
                            About You
                          </h5>
                          <FormGroup>
                            <label className="text-muted small">
                              Tell the community about your coding journey
                            </label>
                            <Input
                              type="textarea"
                              className="cs-input"
                              rows="5"
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Write a brief intro..."
                            />
                          </FormGroup>
                          <Button
                            color="info"
                            type="submit"
                            size="sm"
                            className="cs-btn cs-btn-info mt-2"
                            disabled={saving}
                          >
                            {saving ? (
                              <Spinner size="sm" />
                            ) : (
                              <>
                                <i className="fas fa-check mr-1"></i> Save Bio
                              </>
                            )}
                          </Button>
                        </Form>
                      )}
                    </CardBody>
                  </Card>
                ) : (
                  <Card className="cs-card p-4">
                    <CardBody className="p-0">
                      <h4 className="font-weight-700 text-white mb-3">
                        About {userData.name || userData.username}
                      </h4>
                      <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                        {userData.bio ||
                          "This user has not written a biography yet."}
                      </p>
                      <hr className="border-dark" />
                      <div className="d-flex align-items-center gap-3">
                        <Badge color="info" className="px-2 py-1">
                          Community Contributor
                        </Badge>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </Col>
            </Row>
          )}
        </Container>
        <DefaultFooter />
      </div>
    </>
  );
}

export default ProfilePage;
