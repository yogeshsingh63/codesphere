import React from "react";
import { Link, useLocation } from "react-router-dom";

import { useAlertState } from "context/alert.js";

import fetch from "utils/fetch.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import IDE from "components/IDE/IDE.js";

function IDEPage() {
  const navbarRef = React.useRef(null);
  const collab = new URLSearchParams(useLocation().search).get("collab");
  const { setFileListOptions, setErrorOptions, setMessageOptions } = useAlertState();

  const [files, setFiles] = React.useState([]);
  const [base, setBase] = React.useState("");

  const loadFolder = React.useCallback((folders, base) => {
    const normalized = (Array.isArray(folders) ? folders : []).map((entry) => {
      let folder = String(entry.folder || "/");
      if (base !== "/") {
        folder = folder.slice(String(base).length) || "/";
      }
      if (!folder.endsWith("/")) folder += "/";
      return { ...entry, folder };
    });

    setFiles(normalized);
    setBase(base);
  }, []);

  const openPicker = React.useCallback(() => {
    setFileListOptions({
      title: "Select Folder",
      submitFolder: loadFolder
    });
  }, [setFileListOptions, loadFolder]);

  const saveFiles = (folders) => {
    if(!base) {
      return;
    }
    const data = (Array.isArray(folders) ? folders : []).map((entry) => {
      let folder = base + entry.folder;
      if(folder !== "/" && folder.endsWith("/"))
        folder = folder.slice(0, -1);
      return { ...entry, folder };
    });

    fetch(process.env.REACT_APP_API_URL + "/file/update", {
      method: "POST",
      body: JSON.stringify({ data: data })
    })
      .then(r => r.json())
      .then(json => {
        if(json.success) {
          setMessageOptions({body: json.response});
        }
        else {
          setErrorOptions({body: json.response});
        }
      })
      .catch(err => {
        setErrorOptions({body: "There was an error saving your files."});
      });
  }

  return (
    <div className="room-wrapper flex h-screen flex-col bg-[var(--cs-surface)]">
      <Navbar />
      <div className="mt-16 flex items-center justify-between gap-3 border-b border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            to="/home"
            aria-label="Back to dashboard"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--cs-border)] text-[var(--cs-ink-muted)] transition-colors hover:text-[var(--cs-brand)]"
          >
            <i className="fas fa-arrow-left text-xs" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-extrabold tracking-tight text-[var(--cs-ink)]">
              {collab ? "Shared session" : "My playground"}
            </h1>
            <p className="truncate text-[11px] font-medium text-[var(--cs-ink-faint)]">
              {collab ? `Collab code ${collab.slice(0, 8)}…` : base ? `Folder ${base}` : "Pick a folder to start coding"}
            </p>
          </div>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[var(--cs-brand-soft)] px-3 py-1 text-[11px] font-bold text-[var(--cs-brand)] sm:inline-flex">
          <i className="fas fa-bolt" aria-hidden="true" /> Autosaves locally
        </span>
      </div>
      <main id="main" className="m-0 min-h-0 flex-1 p-0">
        {!collab && files.length === 0 ? (
          <div className="container mx-auto flex h-full items-center justify-center px-4 py-10 sm:px-6">
            <div className="w-full max-w-md rounded-3xl border border-dashed border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cs-brand-soft)] text-[var(--cs-brand)]">
                <i className="fas fa-folder-open text-xl" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold tracking-tight text-[var(--cs-ink)]">Choose a folder to begin</h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-[var(--cs-ink-muted)]">
                Your files live in your personal storage. Select a folder to load it into the editor.
              </p>
              <button
                type="button"
                onClick={openPicker}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--cs-brand)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--cs-brand-hover)]"
              >
                <i className="fas fa-folder-open text-xs" aria-hidden="true" /> Select folder
              </button>
            </div>
          </div>
        ) : (
          <IDE
            size="full"
            useFileStorage={true}
            navbarRef={navbarRef}
            files={files}
            collabCode={collab}
            base={base}
            onSave={saveFiles}
          />
        )}
      </main>
    </div>
  );
}

export default IDEPage;

