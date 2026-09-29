import React from "react";
import {
  Container,
  Button,
  Input,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Badge,
  Spinner,
  Row,
  Col,
} from "reactstrap";
import { Link, useHistory } from "react-router-dom";

import { useAlertState } from "context/alert.js";
import fetch from "utils/fetch.js";

import Navbar from "components/Navbars/Navbar.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";
import PaginatedTable from "components/Form/PaginatedTable.js";

function ListPage() {
  const history = useHistory();
  const { setMessageOptions, setErrorOptions } = useAlertState();

  const [rooms, setRooms] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    window.scrollTo(0, 0);

    fetch(process.env.REACT_APP_API_URL + "/room/list", {
      method: "GET",
    })
      .then((resp) => resp.json())
      .then((json) => {
        setLoading(false);
        if (json.success) {
          const list = Array.isArray(json.response)
            ? json.response
            : json.response?.rooms || [];
          setRooms(list);
          setItems(list);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    if (!search.trim()) {
      setItems(rooms);
      return;
    }
    const term = search.trim().toLowerCase();
    const filtered = rooms.filter((r) => {
      const titleMatch = r.title && String(r.title).toLowerCase().includes(term);
      const descMatch = r.desc && String(r.desc).toLowerCase().includes(term);
      const authorMatch =
        r.author && String(r.author).toLowerCase().includes(term);
      const codeMatch = r.code && String(r.code).toLowerCase().includes(term);
      return Boolean(titleMatch || descMatch || authorMatch || codeMatch);
    });
    setItems(filtered);
  }, [rooms, search]);

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
        if (json.success) {
          setMessageOptions({
            body: json.response,
            submit: () => {
              history.push("/home");
            },
          });
        } else {
          setErrorOptions({ body: json.response });
        }
      })
      .catch(() => {
        setErrorOptions({ body: "Failed to join room. Please try again." });
      });
  };

  const columns = [
    {
      title: "Room Name",
      field: "title",
      formatter: (item) => (
        <div>
          <span className="font-weight-600 text-white">{item.title}</span>
          {item.code && (
            <div className="text-muted small mt-1 font-mono">
              <code>{item.code.slice(0, 8)}</code>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Author",
      field: "author",
      formatter: (item) => (
        <Link
          to={"/profile/" + item.author}
          className="text-info font-weight-500"
        >
          @{item.author}
        </Link>
      ),
    },
    {
      title: "Description",
      field: "desc",
      formatter: (item) => (
        <span className="text-muted small" style={{ maxWidth: "300px" }}>
          {item.desc || "No description provided."}
        </span>
      ),
    },
    {
      title: "",
      field: "",
      formatter: (item) => (
        <Button
          onClick={() => join(item.code)}
          color="info"
          size="sm"
          className="cs-btn cs-btn-info m-0"
        >
          Join Room &rarr;
        </Button>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <div
        className="wrapper cs-page-wrapper"
        style={{ minHeight: "100vh", backgroundColor: "#080c14", color: "#f8fafc" }}
      >
        <div style={{ height: "4.5rem" }} />
        <Container className="py-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <h2 className="title mb-0 font-weight-700">Explore Rooms</h2>
                <Badge color="info" className="ml-2 px-2 py-1">
                  {rooms.length} Public
                </Badge>
              </div>
              <p className="text-muted mb-0">
                Browse interactive courses, challenges, and collaborative coding rooms created by the community.
              </p>
            </div>
            <Button
              tag={Link}
              to="/rooms/create"
              color="primary"
              className="cs-btn cs-btn-primary"
            >
              <i className="fas fa-plus mr-1"></i> Create Room
            </Button>
          </div>

          <div className="cs-panel p-4 mb-4">
            <Row className="align-items-center">
              <Col md="8">
                <FormGroup className="mb-0">
                  <InputGroup className="cs-input-group mb-0">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText className="bg-transparent border-0 text-muted">
                        <i className="fas fa-search"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Search rooms by title, author, description, or code..."
                      type="text"
                      className="cs-input border-0"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <InputGroupAddon addonType="append">
                        <Button
                          color="link"
                          className="text-muted p-2"
                          onClick={() => setSearch("")}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                </FormGroup>
              </Col>
              <Col md="4" className="text-md-right mt-3 mt-md-0 text-muted small">
                Showing {items.length} of {rooms.length} rooms
              </Col>
            </Row>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="info" />
              <div className="mt-3 text-muted">Loading rooms...</div>
            </div>
          ) : (
            <div className="cs-table-card">
              <PaginatedTable columns={columns} items={items} />
            </div>
          )}
        </Container>
        <DefaultFooter />
      </div>
    </>
  );
}

export default ListPage;
