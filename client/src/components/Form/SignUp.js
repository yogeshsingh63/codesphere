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

function SignUp() {
  const { loginSuccess } = useAuthState();
  const history = useHistory();

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifyPassword, setVerifyPassword] = React.useState("");

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [strength, setStrength] = React.useState({ score: 0, label: "Too weak", color: "danger" });

  const calculateStrength = (pass) => {
    if (!pass) {
      setStrength({ score: 0, label: "Too weak", color: "danger" });
      return;
    }
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;

    if (score >= 75) {
      setStrength({ score, label: "Strong", color: "success" });
    } else if (score >= 50) {
      setStrength({ score, label: "Medium", color: "warning" });
    } else {
      setStrength({ score, label: "Weak", color: "danger" });
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    calculateStrength(val);
  };

  const submitForm = (e) => {
    e.preventDefault();
    setError("");

    if (password !== verifyPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    }

    setLoading(true);

    fetch(process.env.REACT_APP_API_URL + "/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })
      .then((resp) => resp.json())
      .then((json) => {
        setLoading(false);
        if (json.success) {
          loginSuccess(json.response, username, email);
          history.push("/home");
        } else {
          setError(json.response || "Failed to create account.");
        }
      })
      .catch(() => {
        setLoading(false);
        setError("Network error. Please verify the server is running.");
      });
  };

  return (
    <Card className="cs-card p-4">
      <CardBody className="p-0">
        <div className="text-center mb-4">
          <div className="cs-auth-icon-circle mx-auto mb-3">
            <i className="fas fa-user-plus text-primary fa-lg"></i>
          </div>
          <h3 className="font-weight-700 text-white mb-1">Create Account</h3>
          <p className="text-muted small mb-0">
            Join the CodeSphere collaborative learning platform
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
              placeholder="e.g. alex_dev"
              className="cs-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={6}
              autoComplete="username"
            />
            <div className="text-muted small mt-1 font-size-xs">
              Letters, numbers, and underscores (min 6 chars)
            </div>
          </FormGroup>

          <FormGroup className="mb-3">
            <label className="cs-label">Email Address</label>
            <Input
              type="email"
              placeholder="alex@example.com"
              className="cs-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </FormGroup>

          <FormGroup className="mb-3">
            <label className="cs-label">Password</label>
            <Input
              type="password"
              placeholder="At least 8 characters"
              className="cs-input"
              value={password}
              onChange={handlePasswordChange}
              required
              minLength={8}
              autoComplete="new-password"
            />
            {password && (
              <div className="mt-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-muted small">Strength</span>
                  <span className={`small font-weight-600 text-${strength.color}`}>
                    {strength.label}
                  </span>
                </div>
                <div
                  style={{
                    height: "4px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${strength.score}%`,
                      backgroundColor:
                        strength.color === "success"
                          ? "#10b981"
                          : strength.color === "warning"
                          ? "#f59e0b"
                          : "#ef4444",
                      transition: "all 0.25s ease",
                    }}
                  />
                </div>
              </div>
            )}
          </FormGroup>

          <FormGroup className="mb-4">
            <label className="cs-label">Confirm Password</label>
            <Input
              type="password"
              placeholder="Re-enter password"
              className="cs-input"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </FormGroup>

          <Button
            color="primary"
            type="submit"
            className="cs-btn cs-btn-primary w-100 py-2 font-weight-600"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" /> Creating account...
              </>
            ) : (
              "Complete Registration"
            )}
          </Button>

          <div className="text-center mt-4 pt-2 border-top border-dark">
            <span className="text-muted small">Already have an account? </span>
            <Link to="/login" className="text-info font-weight-600 small">
              Sign In &rarr;
            </Link>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}

export default SignUp;
