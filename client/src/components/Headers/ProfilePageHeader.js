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
        className="page-header clear-filter page-header-small"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          minHeight: '280px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-60%',
            right: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
        <Container>
          <Row className="align-items-center">
            <Col>
              <h3 className="title" style={{ color: 'white', margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>
                Welcome, {user}!
              </h3>
            </Col>
            <Col className="text-right">
              <div className="d-inline-block text-center" style={{ marginRight: '32px' }}>
                <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 700, margin: 0 }}>
                  {done}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.875rem' }}>
                  Rooms Done
                </p>
              </div>
              <div className="d-inline-block text-center">
                <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 700, margin: 0 }}>
                  {joined}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.875rem' }}>
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
