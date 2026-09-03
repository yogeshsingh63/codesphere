import React from "react";
import {Controlled as CodeMirror} from 'react-codemirror2';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/rust/rust';

import IDEFiles from "components/IDE/IDEFiles.js";

import { useAlertState } from "context/alert.js";

import storage from "utils/storage.js";
import fetch from "utils/fetch.js";

function buildWsUrl(apiUrl, token) {
  try {
    const base = (apiUrl || "").replace(/\/+$/, "");
    const wsBase = base.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:");
    return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
  } catch {
    return null;
  }
}

function IdeButton({ id, title, onClick, disabled, children }) {
  return (
    <button
      type="button"
      id={id}
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-xs transition-colors"
    >
      {children}
    </button>
  );
}

function IDE({navbarRef, checks, storageKey = null, useFileStorage = false, room, section, files, lang, collabCode, base, size="normal", onSave = () => {}, onComplete = () => {}}) {
  const { setInputOptions, setConfirmOptions, setSelectOptions, setErrorOptions } = useAlertState();
  const token = React.useMemo(() => {
    try {
      const raw = sessionStorage.getItem("auth");
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.token) return data.token;
      }
    } catch {}
    try {
      const match = document.cookie.match(/(?:^|; )authToken=([^;]*)/);
      if (match) return decodeURIComponent(match[1]);
    } catch {}
    return null;
  }, []);

  const [status, setStatus] = React.useState("disconnected");
  const [ws, setWS] = React.useState(null);
  const sendMessage = React.useCallback((payload) => {
    if(ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }, [ws]);
  const wsRef = React.useRef(null);
  const connectWS = React.useCallback(() => {
    if(wsRef.current && [WebSocket.OPEN, WebSocket.CONNECTING].includes(wsRef.current.readyState)) {
      return;
    }

    if(!token) {
      return;
    }

    const url = buildWsUrl(process.env.REACT_APP_API_URL, token);
    if (!url) return;
    let socket;
    try {
      socket = new WebSocket(url);
    } catch {
      setStatus("disconnected");
      return;
    }

    socket.onopen = () => {
      setStatus(prev => prev === "disconnected" ? "connected" : prev);
    }
    socket.onclose = () => {
      setStatus("disconnected");
    }
    
    wsRef.current = socket;
    setWS(socket);

    return () => {
      socket.close();
    };
  }, [token]);

  React.useEffect(() => {
    return connectWS();
  }, [connectWS]);
  const [active, setActive] = React.useState({
    files: [],
    folder: "/",
    file: {},
    sideFolder: "",
    lang: {},
    open: [],
    output: [],
    input: "",
    loaded: false
  });

  const transferred = React.useRef(false);
  const [collab, setCollab] = React.useState(false);
  const [count, setCount] = React.useState(0);

  const [languages, setLanguages] = React.useState([]);

  const codeBottomRef = React.createRef();
  const codeTopRef = React.createRef();

  const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  }

  React.useEffect(() => {
    if(!ws)
      return;

    ws.onmessage = function (event) {
      let data = JSON.parse(event.data);

      if(data.count)
        setCount(data.count);

      if(data.type === "stdout") {
        if(!data.msg.startsWith("[Task]"))
          setStatus("connected");
        setActive(prev => ({...prev, output: prev.output.concat([{type: "stdout", content: data.msg}])}));
      }
      else if(data.type === "stderr") {
        if(!data.msg.startsWith("[Task]"))
          setStatus("connected");
        setActive(prev => ({...prev, output: prev.output.concat([{type: "stderr", content: data.msg}])}));
      }
      else if(data.type === "pending") {
        setStatus("pending");
      }
      else if(data.type === "completed") {
        onComplete();
      }
      else if(data.type === "collab") {
        setCollab(true);
        if(data.meta === "error") {
          setErrorOptions({body: data.msg});
        }
        else if(data.meta === "create") {
          setInputOptions({value: window.location.origin + "/ide?collab=" + data.msg, title: "Collab URL", body: "Send this URL to someone you want to share your code with."});
        }
        else if(data.meta === "update") {
          if(data.msg)
            setActive(data.msg);
          transferred.current = true;
        }
        else if(data.meta === "please_update") {
          setActive(prev => ({...prev, key: Math.random()}));
        }
      }
    }
  }, [ws, onComplete, setErrorOptions, setInputOptions]);

  React.useEffect(() => {
    if(!section || !collab || status === "disconnected")
      return;
    sendMessage({
      type: "collab",
      meta: "leave"
    });
  }, [collab, section, sendMessage, status]);

  React.useEffect(() => {
    if(status === "connected" && collabCode && !collab) {
      setCollab(true);
      sendMessage({
        type: "collab",
        meta: "join",
        code: collabCode
      });
    }
  }, [collab, collabCode, sendMessage, status]);

  const syntaxTable = {
    'python': 'text/x-python',
    'node': 'text/javascript',
    'java': 'text/x-java',
    'c': 'text/x-csrc',
    'c++': 'text/x-c++src',
    'c#': 'text/x-csharp',
    "rust": 'text/x-rustsrc'
  }

  React.useEffect(() => {
    let cancelled = false;
    fetch(process.env.REACT_APP_API_URL + "/code/langs")
    .then(resp => resp.json())
    .then(async (json) => {
      if(cancelled) return;
      if(json.success) {
        let langs = Array.isArray(json.response) ? json.response : [];
        if(lang) {
          const found = langs.find(l => l.lang === lang);
          langs = found ? [found] : [];
        }
        if (langs.length === 0) {
          setErrorOptions({ body: `Language "${lang || "unknown"}" is not available.` });
          return;
        }

        const loadFiles = async () => {
          for(let location of files) {
            for(let i = 0; i < location.files.length; i++) {
              if(!location.folder.endsWith("/"))
                location.folder += "/";
              try {
                const r = await fetch(process.env.REACT_APP_API_URL + "/file/" + location.files[i].code);
                const ct = r.headers.get("content-type") || "";
                if (!r.ok || ct.includes("application/json")) {
                  location.files[i].content = "";
                } else {
                  location.files[i].content = await r.text();
                }
              } catch {
                location.files[i].content = "";
              }
            }
          }
          return files;
        }

        if(files && files.length !== 0) {
          let data = await loadFiles();
          if (cancelled) return;
          for(let i = 0; i < langs.length; i++) {
            langs[i].template = data;
          }
        }
        if (cancelled) return;
        setLanguages(langs);

        if(collabCode)
          return;

        if(!useFileStorage && storageKey) {
          let saved = null;
          try { saved = storage.load(storageKey); } catch {}
          if (saved) {
            setActive({...saved, lang: langs.find(l => l.lang === saved?.lang?.lang) ?? langs[0], output: [], input: "", loaded: true});
            return;
          }
        }
        {
          let selected = langs[0];
          if (!selected?.template?.[0]) return;
          let open = [];
          if(selected.template[0].files[0]) {
            open = [
              {filename: selected.template[0].files[0].filename, folder: selected.template[0].folder}
            ];
          }
          let start = null;

          if(selected.template[0].files[0])
            start = clone(selected.template[0].files[0]);

          setActive({
            files: clone(selected.template),
            folder: "/",
            file: start,
            lang: selected,
            open,
            output: [],
            input: "",
            loaded: true,
            sideFolder: ""
          });
        }
      }
      else {
        setErrorOptions({ body: json.response || "Unable to load languages." });
      }
    }).catch(() => {
      if (!cancelled) setErrorOptions({ body: "Network error loading languages." });
    });
    return () => { cancelled = true; };
  }, [files, collabCode, lang, storageKey, useFileStorage, setErrorOptions]);

  React.useEffect(() => {
    function handleResize() {
      if(navbarRef.current && codeBottomRef.current && codeTopRef.current) {
        let height = window.innerHeight;

        height -= navbarRef.current.parentElement.parentElement.offsetHeight;
        height -= codeBottomRef.current.offsetHeight;
        height -= codeTopRef.current.offsetHeight;

        let prevHeight = document.getElementsByClassName("react-codemirror2")[0].style.height;
        if(Math.abs(height - parseInt(prevHeight)) < 10) {
          // skip resizing unless large height difference
          return;
        }

        height += "px";

        document.getElementsByClassName("react-codemirror2")[0].style.height = height;
        document.getElementsByClassName("CodeMirror cm-s-material")[0].style.height = height;
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [navbarRef, codeBottomRef, codeTopRef]);

  React.useEffect(() => {
    if(!useFileStorage && storageKey && active && active.loaded && active.file && active.files) {
      // if(JSON.stringify(active.lang.template) !== JSON.stringify(active.files))
      // not sure if i want this check to be active or not...
      storage.save(storageKey, active);
    }

    if(collab && status !== "disconnected" && !transferred.current) {
      sendMessage({
        type: "collab",
        meta: "update",
        msg: active
      });
    }
    transferred.current = false;
  }, [active, collab, sendMessage, status, storageKey, useFileStorage]);

  const run = () => {
    setActive(prev => ({...prev, output: []}));

    sendMessage({
      type: "run",
      files: active.files,
      input: active.input,
      lang: active.lang.lang
    });
  };

  const check = () => {
    if(room && section && active?.lang?.lang) {
      setActive(prev => ({...prev, output: []}));

      sendMessage({
        type: "check",
        room,
        section,
        token,
        files: active.files,
        lang: active.lang.lang,
      });
    }
  }

  const stdinChange = () => {
    setInputOptions({
      title: "Set Input",
      body: "Enter program input (stdin) below:",
      type: "textarea",
      value: active.input,
      submit: (input) => setActive(prev => ({...prev, input}))
    });
  }

  const langChange = () => {
    setSelectOptions({
      title: "Select Language",
      body: "Select programming language below:",
      choices: languages.map(lang => lang.name),
      submit: (name) => {
        if(!name)
          return;

        let lang = languages.find(check => check.name === name);

        setActive(prev => ({
          ...prev,
          files: clone(lang.template),
          folder: "/",
          file: clone(lang.template[0].files[0]),
          lang: lang,
          open: [
            {filename: lang.template[0].files[0].filename, folder: lang.template[0].folder}
          ],
          loaded: true,
          sideFolder: ""
        }));
      }
    });
  }

  const resetAlert = () => {
    setConfirmOptions({
      title: "Reset",
      body: "Do you want to reset your code?",
      submit: (status) => {
        if(status) {
          setActive(prev => ({
            ...prev,
            files: clone(active.lang.template),
            folder: "/",
            file: clone(active.lang.template[0].files[0]),
            lang: active.lang,
            open: [
              {filename: active.lang.template[0].files[0].filename, folder: active.lang.template[0].folder}
            ],
            loaded: true,
            sideFolder: ""
          }));
        }
      }
    })
  }

  const collabStart = () => {
    ws.send(JSON.stringify({
      type: "collab",
      meta: "create"
    }));
    setCollab(true);
  }

  return (
    <>
      <div className={size === "normal" ? "w-full lg:w-1/3 ide" : "w-full lg:w-1/2 ide"}>
        <div className="ide-top-files" ref={codeTopRef}>
          <IDEFiles active={active} setActive={setActive} size={size} />
        </div>
        {(active.file && active.lang) ? (
          <CodeMirror
            value={active.file.content}
            options={{
              mode: active.lang ? syntaxTable[active.lang.lang] : "text/x-python",
              theme: 'material',
              lineNumbers: true,
              lineWrapping: true
            }}
            onBeforeChange={(editor, data, value) => {
              let file = {...active.file, content: value};
              let files = active.files;

              let location = active.files.findIndex(f => f.folder === active.folder);
              if(location !== -1) {
                let index = active.files[location].files.findIndex(f => f.filename === active.file.filename);
                files[location].files[index] = file;

                setActive({...active, file, files});
              }
            }}
          />
        ) : (
          <div className="react-codemirror2 CodeMirror cm-s-material" role="status" aria-label="Loading editor"></div>
        )}
        <div className="ide-bottom" ref={codeBottomRef}>
          {status === "disconnected" ? (
            <button type="button" onClick={connectWS} className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold px-3 py-1.5 transition-colors">Reconnect</button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <IdeButton id="ide-run" title="Run" onClick={run} disabled={status !== "connected"}><i className="fas fa-play" aria-hidden="true"></i></IdeButton>

              <IdeButton id="ide-reset" title="Reset" onClick={resetAlert}><i className="fas fa-sync-alt" aria-hidden="true"></i></IdeButton>

              <IdeButton id="ide-input" title="Input" onClick={stdinChange}><i className="fas fa-pencil-alt" aria-hidden="true"></i></IdeButton>

              {(languages && languages.length > 1) && (
                <IdeButton id="ide-language" title={active.lang ? active.lang.name : "Loading..."} onClick={langChange}><i className="fas fa-code" aria-hidden="true"></i></IdeButton>
              )}

              {checks && (
                <IdeButton id="ide-check" title="Check" onClick={check} disabled={status !== "connected"}><i className="fas fa-check" aria-hidden="true"></i></IdeButton>
              )}
              {(useFileStorage && !collabCode && base) && (
                <IdeButton id="ide-save" title="Save" onClick={() => onSave(clone(active.files))}><i className="fas fa-save" aria-hidden="true"></i></IdeButton>
              )}
              <IdeButton id="ide-collab" title="Collab" onClick={collabStart} disabled={collab}>{collab ? <>{count} </> : null}<i className="fas fa-code-branch" aria-hidden="true"></i></IdeButton>
            </div>
          )}
        </div>
      </div>
      <div className={size === "normal" ? "w-full lg:w-2/3 room-output p-0" : "w-full lg:w-1/2 room-output p-0"}>
        <div className="ide-top flex items-center justify-between gap-2">
          <span>{active.lang && active.lang.name ? active.lang.name : "Loading..."}</span>
          {status === "connected" && <span className="m-0 mr-2 ide-badge inline-flex items-center gap-2 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold px-2.5 py-0.5">Connected<i className="fas fa-check" aria-hidden="true"></i></span>}
          {status === "pending" && <span className="m-0 mr-2 ide-badge inline-flex items-center gap-2 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold px-2.5 py-0.5">Sending<i className="fas fa-circle-notch animate-spin" aria-hidden="true"></i></span>}
          {status === "disconnected" && <span className="m-0 mr-2 ide-badge inline-flex items-center gap-2 rounded-full bg-red-500/20 text-red-200 text-xs font-semibold px-2.5 py-0.5">Disconnected<i className="fas fa-times" aria-hidden="true"></i></span>}
        </div>
        <div className="p-3 room-terminal" aria-live="polite">
          {active.output && active.output.map((message, i) => (
            message.type === "stdout" ? <div key={i}>{message.content}</div> : <div key={i} className="room-output-error">{message.content}</div>
          ))}
        </div>
      </div>
    </>
  );
}

export default IDE;
