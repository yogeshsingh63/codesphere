import React from "react";
import Cookies from 'universal-cookie';

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Form,
  Input,
  FormGroup,
  Label,
  Alert
} from "reactstrap";

import fetch from "utils/fetch.js";

function LoginForm() {
  const cookies = new Cookies();

  const [error, setError] = React.useState("");
  const [disabled, setDisabled] = React.useState(false);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const submitForm = (e) => {
    e.preventDefault();

    setDisabled(true);

    fetch(process.env.REACT_APP_API_URL + '/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password})
    })
    .then(resp => resp.json())
    .then(json => {
      setDisabled(false);

      if(json.success) {
        cookies.set("authToken", json.response);
        window.location = "/home";
      }
      else {
        setError(json.response);
      }
    })
    .catch(err => {
      setDisabled(false);
      setError("Network error. Please try again.");
    });
  }

  return (
    <Card style={{ border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardHeader className="text-center" style={{ background: 'transparent', borderBottom: 'none', padding: '32px 24px 0' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <i className="fas fa-code" style={{ color: '#6366f1', fontSize: '24px' }}></i>
        </div>
        <CardTitle tag="h3" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
          Welcome back
        </CardTitle>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '8px' }}>
          Sign in to your account
        </p>
        {error && (
          <Alert color="danger" style={{ fontSize: '0.8125rem', padding: '10px 14px', borderRadius: '8px' }}>
            {error}
          </Alert>
        )}
      </CardHeader>
      <CardBody style={{ padding: '24px' }}>
        <Form onSubmit={submitForm}>
          <FormGroup className="mb-3">
            <Label for="username" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={6}
              style={{ borderRadius: '8px' }}
            />
          </FormGroup>
          <FormGroup className="mb-3">
            <Label for="password" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Password</Label>
            <Input
              id="password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              style={{ borderRadius: '8px' }}
            />
          </FormGroup>
          <Button
            color="primary"
            type="submit"
            block
            size="lg"
            disabled={disabled}
            style={{ fontWeight: 600, borderRadius: '10px', marginTop: '8px' }}
          >
            {disabled ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>
      </CardBody>
      <CardFooter className="text-center" style={{ background: 'transparent', borderTop: '1px solid #f1f5f9', padding: '16px 24px' }}>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
          Don&apos;t have an account? <a href="/register" style={{ color: '#6366f1', fontWeight: 600 }}>Sign up</a>
        </p>
      </CardFooter>
    </Card>
  );
}

export default LoginForm;
