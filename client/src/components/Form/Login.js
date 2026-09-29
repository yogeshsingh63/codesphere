import React from "react";
import { Link, useHistory } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Alert,
  Spinner,
} from "reactstrap";

import { useAuthState } from "context/auth.js";
import fetch from "utils/fetch.js";

function Login() {
  const { loginSuccess } = useAuthState();
  const history = useHistory();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submitForm = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    fetch(process.env.REACT_APP_API_URL + "/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((resp) => resp.json())
      .then((json) => {
        setLoading(false);
        if (json.success) {
          loginSuccess(json.response, username, "");
          history.push("/home");
        } else {
          setError(json.response || "Invalid username or password.");
        }
      })
      .catch(() => {
        setLoading(false);
        setError("Network error. Please check your server connection.");
      });
  };

  return (
    <Card className="cs-card p-4">
      <CardBody className="p-0">
        <div className="text-center mb-4">
          <div className="cs-auth-icon-circle mx-auto mb-3">
            <i className="fas fa-terminal text-info fa-lg"></i>
          </div>
          <h3 className="font-weight-700 text-white mb-1">Sign In</h3>
          <p className="text-muted small mb-0">
            Access your CodeSphere workspace and rooms
          </p>
        </div>

        {error && (
          <Alert color="danger" className="cs-alert-danger small py-2 mb-3">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </Alert>
        )}

        <Form onSubmit={submitForm}>
          <FormGroup className="mb-3">
            <label className="cs-label">Username</label>
            <Input
              type="text"
              placeholder="Enter your username"
              className="cs-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={6}
              autoComplete="username"
            />
          </FormGroup>

          <FormGroup className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="cs-label mb-0">Password</label>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              className="cs-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
            />
          </FormGroup>

          <Button
            color="info"
            type="submit"
            className="cs-btn cs-btn-info w-100 py-2 font-weight-600"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" /> Signing in...
              </>
            ) : (
              "Sign In to CodeSphere"
            )}
          </Button>

          <div className="text-center mt-4 pt-2 border-top border-dark">
            <span className="text-muted small">Don't have an account? </span>
            <Link to="/register" className="text-info font-weight-600 small">
              Create an account &rarr;
            </Link>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}

export default Login;
