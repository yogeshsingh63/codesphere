import React from "react";
import Cookies from 'universal-cookie';
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

  const strengthColors = { weak: '#be123c', okay: '#b45309', strong: '#15803d' };

  return (
    <div className="bg-white/75 backdrop-blur-xl border border-stone-200/50 rounded-3xl shadow-xl flex flex-col overflow-hidden max-w-sm w-full mx-auto">
      {/* Header */}
      <div className="text-center px-8 pt-8 pb-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-code text-[#c2410c] text-xl"></i>
        </div>
        <h3 className="text-xl font-bold text-stone-900 tracking-tight">
          Create account
        </h3>
        <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">
          Collaborate on code, quizzes, and projects in real-time
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-650 text-xs font-medium rounded-xl border border-red-100 text-left flex items-start gap-2">
            <i className="fas fa-exclamation-circle mt-0.5"></i>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <form onSubmit={submitForm} className="px-8 pb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-xs font-semibold text-stone-700">
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
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm text-stone-900 transition-all placeholder:text-stone-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-stone-700">
            Email
          </label>
          <input
            id="email"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm text-stone-900 transition-all placeholder:text-stone-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-stone-700">
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
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm text-stone-900 transition-all placeholder:text-stone-400"
          />
          {password && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-350" 
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
          <label htmlFor="verify-password" className="text-xs font-semibold text-stone-700">
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
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm text-stone-900 transition-all placeholder:text-stone-400"
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full bg-[#c2410c] hover:bg-[#a13207] disabled:opacity-50 text-white font-semibold py-3 rounded-xl mt-2 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {disabled ? (
            <>
              <i className="fas fa-spinner animate-spin"></i>
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="bg-stone-50 border-t border-stone-100 text-center py-4 px-8">
        <p className="text-xs text-stone-500">
          Already have an account? <a href="/login" className="text-[#c2410c] font-semibold hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default SignUpForm;

