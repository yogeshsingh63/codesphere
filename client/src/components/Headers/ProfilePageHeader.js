import React from "react";
import asset from "utils/asset.js";

import { Container, Row, Col } from "reactstrap";
import { useAuthState } from "context/auth.js";

import fetch from "utils/fetch.js";

function ProfilePageHeader() {
  const { user } = useAuthState();

  const [done, setDone] = React.useState(0);
  const [joined, setJoined] = React.useState(0);

  React.useEffect(() => {
    if(sessionStorage.rooms) {
      try {
        let data = JSON.parse(sessionStorage.rooms);
        if(data.time && data.time + 1000*60*3 > +new Date()) {
          setJoined(data.joined);
          setDone(data.done);
          return;
        }
        else {
          sessionStorage.removeItem("rooms");
        }
      }
      catch(err) {}
    }

    fetch(process.env.REACT_APP_API_URL + "/user/rooms", {
      method: "POST"
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        let data = {
          joined: json.response.enrolled.length,
          done: json.response.completed.map(t => t.sections.length === t.room.sections.length).filter(Boolean).length,
          time: +new Date()
        };
        sessionStorage.rooms = JSON.stringify(data);
        setJoined(data.joined);
        setDone(data.done);
      }
    });
  }, []);

  return (
    <>
      <div
        className="page-header page-header-small"
        style={{
          background: 'linear-gradient(135deg, #fdf8f5 0%, #f5e3d7 100%)',
          minHeight: '220px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #e7e5e4'
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col>
              <h3 className="title" style={{ color: '#1c1917', margin: 0, fontSize: '1.875rem', fontWeight: 800 }}>
                Welcome back, {user}!
              </h3>
            </Col>
            <Col className="text-right">
              <div className="d-inline-block text-center" style={{ marginRight: '40px' }}>
                <h2 style={{ color: '#c2410c', fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>
                  {done}
                </h2>
                <p style={{ color: '#78716c', margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>
                  Rooms Done
                </p>
              </div>
              <div className="d-inline-block text-center">
                <h2 style={{ color: '#c2410c', fontSize: '2.25rem', fontWeight: 800, margin: 0 }}>
                  {joined}
                </h2>
                <p style={{ color: '#78716c', margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>
                  Rooms Joined
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default ProfilePageHeader;
