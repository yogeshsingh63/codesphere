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

function SignUpForm() {
  const cookies = new Cookies();

  const [error, setError] = React.useState("");
  const [disabled, setDisabled] = React.useState(false);

  const [passStrength, setPassStrength] = React.useState(["text-danger", "weak"]);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifyPassword, setVerifyPassword] = React.useState("");
  const [email, setEmail] = React.useState("");

  const submitForm = (e) => {
    e.preventDefault();

    setDisabled(true);

    if(verifyPassword !== password) {
      setDisabled(false);
      return setError("The passwords are not the same!");
    }

    fetch(process.env.REACT_APP_API_URL + '/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, email, password})
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

  const scorePassword = (pass) => {
    let score = 0;

    if (!pass)
        return setPassStrength(["text-danger", "weak"]);

    let letters = {};
    for (let i = 0; i < pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    let variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    }

    let variationCount = 0;
    for (let check in variations) {
        variationCount += (variations[check]) ? 1 : 0;
    }
    score += parseInt((variationCount - 1) * 10);

    if (score >= 80)
      return setPassStrength(["text-success", "strong"]);
    if (score >= 50)
      return setPassStrength(["text-warning", "okay"]);
    return setPassStrength(["text-danger", "weak"]);
  }

  const strengthColors = { weak: '#ef4444', okay: '#f59e0b', strong: '#10b981' };

  return (
    <Card style={{ border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardHeader className="text-center" style={{ background: 'transparent', borderBottom: 'none', padding: '32px 24px 0' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <i className="fas fa-code" style={{ color: '#6366f1', fontSize: '24px' }}></i>
        </div>
        <CardTitle tag="h3" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
          Create account
        </CardTitle>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '8px' }}>
          Start your coding journey
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
              placeholder="Choose a username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={6}
              style={{ borderRadius: '8px' }}
            />
          </FormGroup>
          <FormGroup className="mb-3">
            <Label for="email" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Email</Label>
            <Input
              id="email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ borderRadius: '8px' }}
            />
          </FormGroup>
          <FormGroup className="mb-3">
            <Label for="password" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Password</Label>
            <Input
              id="password"
              placeholder="Create a password"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); scorePassword(e.target.value) } }
              required
              minLength={8}
              style={{ borderRadius: '8px' }}
            />
            {password && (
              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: passStrength[1] === 'weak' ? '33%' : passStrength[1] === 'okay' ? '66%' : '100%', height: '100%', background: strengthColors[passStrength[1]], borderRadius: '2px', transition: 'all 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: strengthColors[passStrength[1]], fontWeight: 600, textTransform: 'capitalize' }}>
                  {passStrength[1]}
                </span>
              </div>
            )}
          </FormGroup>
          <FormGroup className="mb-3">
            <Label for="verify-password" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Confirm Password</Label>
            <Input
              id="verify-password"
              placeholder="Confirm your password"
              type="password"
              value={verifyPassword}
              onChange={e => setVerifyPassword(e.target.value)}
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
            {disabled ? 'Creating account...' : 'Create Account'}
          </Button>
        </Form>
      </CardBody>
      <CardFooter className="text-center" style={{ background: 'transparent', borderTop: '1px solid #f1f5f9', padding: '16px 24px' }}>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
          Already have an account? <a href="/login" style={{ color: '#6366f1', fontWeight: 600 }}>Sign in</a>
        </p>
      </CardFooter>
    </Card>
  );
}

export default SignUpForm;
