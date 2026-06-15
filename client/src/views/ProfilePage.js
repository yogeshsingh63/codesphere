import React from "react";
import { useParams, useHistory } from "react-router-dom";
import Cookies from 'universal-cookie';

// reactstrap components
import {
  Container,
  Row,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Spinner,
  FormGroup,
  Input,
  Col,
  Button,
  Form
} from "reactstrap";
import { useAuthState } from "context/auth.js";
import { useAlertState } from "context/alert.js";

import fetch from "utils/fetch.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

function ProfilePage() {
  const { setMessageOptions, setErrorOptions, setFileListOptions } = useAlertState();
  const { isSignedIn, user, email } = useAuthState();
  const cookies = new Cookies();
  const history = useHistory();
  let { target } = useParams();

  if(!target) {
    target = user;
  }

  const [userData, setUserData] = React.useState({});
  const [loaded, setLoaded] = React.useState(false);

  const response = (json) => {
    if(!json.success) {
      return setErrorOptions({body: json.response, submit: () => {
        history.push("/profile");
        history.go(0);
      }});
    }
    setMessageOptions({ body: json.response, submit: () => {
      history.push("/profile");
      history.go(0);
    }});
  };

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + "/user/info?username=" + encodeURIComponent(target), {
      method: "GET"
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setUserData(json.response);
        setLoaded(true);
      }
      else {
        setErrorOptions({body: json.response, submit: () => {
          history.push("/home");
        }});
      }
    });
  }, [target, history, setErrorOptions]);

  const [ info, setInfo ] = React.useState({});
  const [ pass, setPass ] = React.useState({});
  const [ bio, setBio ] = React.useState("");

  const updateInfo = (e) => {
    e.preventDefault();

    fetch(process.env.REACT_APP_API_URL + '/user/update_info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: info.username || user,
        email: info.email || email,
        name: info.name || userData.name
      })
    })
    .then(resp => resp.json())
    .then(json => {
      if(!json.success) {
        return setErrorOptions({body: json.response, submit: () => {
          history.push("/profile");
        }});
      }
      setMessageOptions({ body: "Update successful!", submit: () => {
        history.push("/profile");
      }});
      cookies.set("authToken", json.response);
    });
  };

  const changePass = (e) => {
    e.preventDefault();
    fetch(process.env.REACT_APP_API_URL + '/user/update_pass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...pass })
    })
    .then(resp => resp.json())
    .then(response);
  }

  const changeBio = (e) => {
    e.preventDefault();
    fetch(process.env.REACT_APP_API_URL + '/user/update_bio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bio })
    })
    .then(resp => resp.json())
    .then(response);
  }

  const changePic = (file) => {
    fetch(process.env.REACT_APP_API_URL + '/user/update_pic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: file.code })
    })
    .then(resp => resp.json())
    .then(response);
  };

  const deletePic = () => {
    fetch(process.env.REACT_APP_API_URL + '/user/update_pic', {
      method: 'POST'
    })
    .then(resp => resp.json())
    .then(response);
  };

  React.useEffect(() => {
    document.body.classList.add("profile-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;

    return function cleanup() {
      document.body.classList.remove("profile-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  if(!isSignedIn) {
    history.push("/");
    return <></>;
  }

  return (
    <>
      <Navbar />
      <div className="wrapper">
        <ProfilePageHeader />
        <div className="section" style={{ background: '#faf9f6', padding: '48px 0', minHeight: 'calc(100vh - 220px - 64px)' }}>
          {loaded ? (
            <Container>
              <Row>
                <Card style={{ border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', width: '100%', marginBottom: '24px' }}>
                  <CardBody style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                      <img
                        className="rounded-circle"
                        src={userData.profilepic ?
                          process.env.REACT_APP_API_URL + '/file/' + userData.profilepic
                          : "https://ui-avatars.com/api/?name=" + userData.username
                        }
                        style={{ width: "8rem", height: "8rem", objectFit: 'cover', border: '4px solid #f1f5f9' }}
                        onError={(e) => {
                          if(target === user) {
                            fetch(process.env.REACT_APP_API_URL + '/user/update_pic', {
                              method: 'POST'
                            });
                          }
                          e.target.src = "https://ui-avatars.com/api/?name=" + userData.username
                        }}
                        alt={userData.username + "'s profile picture"}
                      />
                      <div style={{ flex: 1, minWidth: '250px' }}>
                        <CardTitle tag="h4" style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                          {userData.name ? `${userData.name} (${userData.username})` : userData.username}
                        </CardTitle>
                        <CardText style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.6, whiteSpace: "pre-line", margin: '0 0 16px 0' }}>
                          {userData.bio ? userData.bio : "Sadly, we don't have any information about them."}
                        </CardText>
                        <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Completed</span>
                            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{userData.completed} / {userData.enrolled + userData.created}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Created</span>
                            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{userData.created}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Row>

              {target === user && (
                <Row>
                  <Card style={{ border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', width: '100%', marginTop: '24px' }}>
                    <CardBody style={{ padding: '32px' }}>
                      <CardTitle tag="h4" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>My Account</CardTitle>

                      <Form role="form" onSubmit={updateInfo}>
                        <h6 className="heading-small text-muted mb-4" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                          User information
                        </h6>
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Username</label>
                              <Input
                                placeholder="Username"
                                type="text"
                                defaultValue={userData.username}
                                onChange={(e) => setInfo({...info, username: e.target.value })}
                                style={{ borderRadius: '8px' }}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Name</label>
                              <Input
                                placeholder="Name"
                                type="text"
                                defaultValue={userData.name}
                                onChange={(e) => setInfo({...info, name: e.target.value })}
                                style={{ borderRadius: '8px' }}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <FormGroup>
                              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email</label>
                              <Input
                                placeholder="Email"
                                type="email"
                                defaultValue={email}
                                onChange={(e) => setInfo({...info, email: e.target.value })}
                                style={{ borderRadius: '8px' }}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                              color="primary"
                              type="button"
                              size="sm"
                              onClick={() => setFileListOptions({title: "Select new profile picture:", submit: changePic})}
                              style={{ fontWeight: 600, borderRadius: '8px' }}
                            >
                              Change Picture
                            </Button>
                            <Button
                              outline
                              color="danger"
                              type="button"
                              size="sm"
                              onClick={deletePic}
                              style={{ fontWeight: 600, borderRadius: '8px' }}
                            >
                              Delete Picture
                            </Button>
                          </div>
                          <Button
                            color="primary"
                            type="submit"
                            size="sm"
                            style={{ fontWeight: 600, borderRadius: '8px' }}
                          >
                            Update Info
                          </Button>
                        </div>
                      </Form>

                      <Form role="form" onSubmit={changePass} className="mt-5">
                        <h6 className="heading-small text-muted mb-4" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                          Change Password
                        </h6>
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Current Password</label>
                              <Input
                                placeholder="Current Password"
                                type="password"
                                onChange={(e) => setPass({...pass, currentPassword: e.target.value })}
                                style={{ borderRadius: '8px' }}
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>New Password</label>
                              <Input
                                placeholder="New Password"
                                type="password"
                                onChange={(e) => setPass({...pass, newPassword: e.target.value })}
                                style={{ borderRadius: '8px' }}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <div className="text-right" style={{ marginTop: '16px' }}>
                          <Button
                            color="primary"
                            type="submit"
                            size="sm"
                            style={{ fontWeight: 600, borderRadius: '8px' }}
                          >
                            Update Password
                          </Button>
                        </div>
                      </Form>

                      <Form role="form" onSubmit={changeBio} className="mt-5">
                        <h6 className="heading-small text-muted mb-4" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                          About me
                        </h6>
                        <Row>
                          <Col>
                            <Input
                              placeholder="Write a few lines about yourself..."
                              name="bio"
                              defaultValue={userData.bio}
                              onChange={(e) => setBio(e.target.value)}
                              rows="4"
                              type="textarea"
                              style={{ borderRadius: '8px' }}
                            />
                            <div className="text-right" style={{ marginTop: '16px' }}>
                              <Button
                                color="primary"
                                type="submit"
                                size="sm"
                                style={{ fontWeight: 600, borderRadius: '8px' }}
                              >
                                Update Bio
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </Form>

                    </CardBody>
                  </Card>
                </Row>
              )}
            </Container>
          ) : (
            <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <Spinner color="primary" />
            </Container>
          )}
        </div>
        <DefaultFooter />
      </div>
    </>
  );
}

export default ProfilePage;
