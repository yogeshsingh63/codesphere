import React from "react";
import { Link, useHistory } from "react-router-dom";
import Cookies from 'universal-cookie';
import fetch from "utils/fetch.js";
import { useAuthState } from "context/auth.js";
import Logo from "components/Brand/Logo.js";

function SignUpForm() {
  const cookies = new Cookies();
  const history = useHistory();
  const { refresh } = useAuthState();

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
        cookies.set("authToken", json.response, { path: "/" });
        try { sessionStorage.removeItem("auth"); sessionStorage.removeItem("rooms"); } catch {}
        refresh().finally(() => history.push("/home"));
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

  const strengthColors = { weak: '#be123c', okay: '#b45309', strong: '#15803d' };

  return (
    <div className="bg-[var(--cs-surface-elevated)]/80 backdrop-blur-xl border border-[var(--cs-border)] rounded-3xl shadow-xl flex flex-col overflow-hidden max-w-sm w-full mx-auto">
      {/* Header */}
      <div className="text-center px-8 pt-8 pb-4">
        <Logo size={52} className="mx-auto mb-4 shadow-md" />
        <h3 className="text-xl font-bold text-[var(--cs-ink)] tracking-tight">
          Create account
        </h3>
        <p className="text-[var(--cs-ink-muted)] text-xs mt-1.5 leading-relaxed">
          Collaborate on code, quizzes, and projects in real-time
        </p>

        {error && (
          <div role="alert" className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-medium rounded-xl border border-red-100 dark:border-red-500/20 text-left flex items-start gap-2">
            <i className="fas fa-exclamation-circle mt-0.5" aria-hidden="true"></i>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <form onSubmit={submitForm} className="px-8 pb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-xs font-semibold text-[var(--cs-ink)]">
            Username
          </label>
          <input
            id="username"
            placeholder="Choose a username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={6}
            autoComplete="username"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--cs-brand)] focus:border-transparent text-sm text-[var(--cs-ink)] transition-colors placeholder:text-[var(--cs-ink-faint)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-[var(--cs-ink)]">
            Email
          </label>
          <input
            id="email"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--cs-brand)] focus:border-transparent text-sm text-[var(--cs-ink)] transition-colors placeholder:text-[var(--cs-ink-faint)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-[var(--cs-ink)]">
            Password
          </label>
          <input
            id="password"
            placeholder="Create a password"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); scorePassword(e.target.value) } }
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--cs-brand)] focus:border-transparent text-sm text-[var(--cs-ink)] transition-colors placeholder:text-[var(--cs-ink-faint)]"
          />
          {password && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300" 
                  style={{ 
                    width: passStrength[1] === 'weak' ? '33%' : passStrength[1] === 'okay' ? '66%' : '100%', 
                    backgroundColor: strengthColors[passStrength[1]] 
                  }} 
                />
              </div>
              <span 
                className="text-[10px] font-bold capitalize"
                style={{ color: strengthColors[passStrength[1]] }}
              >
                {passStrength[1]}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="verify-password" className="text-xs font-semibold text-[var(--cs-ink)]">
            Confirm Password
          </label>
          <input
            id="verify-password"
            placeholder="Confirm your password"
            type="password"
            value={verifyPassword}
            onChange={e => setVerifyPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--cs-border)] bg-[var(--cs-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--cs-brand)] focus:border-transparent text-sm text-[var(--cs-ink)] transition-colors placeholder:text-[var(--cs-ink-faint)]"
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full bg-[var(--cs-brand)] hover:bg-[var(--cs-brand-hover)] disabled:opacity-50 text-white font-semibold py-3 rounded-xl mt-2 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          {disabled ? (
            <>
              <i className="fas fa-spinner animate-spin" aria-hidden="true"></i>
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="bg-black/[0.02] dark:bg-white/[0.03] border-t border-[var(--cs-border)] text-center py-4 px-8">
        <p className="text-xs text-[var(--cs-ink-muted)]">
          Already have an account? <Link to="/login" className="text-[var(--cs-brand)] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpForm;

