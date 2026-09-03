import React from "react";
import { FileIcon } from 'react-file-icon';

// reactstrap components
import {
  Button,
  Modal,
} from "reactstrap";
// core components

import fetch from "utils/fetch.js";
import { useAlertState } from "context/alert.js";

function FileListModal({open, isOpen, submit, submitFolder, title = "Files"}){
  const [response, setResponse] = React.useState({});
  const [files, setFiles] = React.useState([]);
  const [folders, setFolders] = React.useState([]);

  const [space, setSpace] = React.useState(0);
  const [cwd, setCwd] = React.useState("/");

  const { setPleaseWaitOptions, setConfirmOptions, setErrorOptions, setMessageOptions, setDragDropOptions, setInputOptions } = useAlertState();

  const refresh = React.useCallback(() => {
    fetch(process.env.REACT_APP_API_URL + "/file/list", {
      method: "POST",
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setResponse(json.response);
      }
      else {
        open(false);
      }
    });
  }, [open]);

  React.useEffect(() => {
    if(isOpen)
      refresh();
  }, [isOpen, refresh]);

  const update = React.useCallback(() => {
    if(Object.keys(response).length === 0)
      return;

    let max = 128*1024*1024;
    let total = 0;
    for(let i = 0; i < response.length; i++) {
      total += response[i].files.reduce((t, c) => t + c.size, 0);
    }

    setSpace((total / max)*100);
    setFiles(response.find(s => s.folder === cwd)?.files || []);

    let base = cwd;
    if(base === "/")
      base = "";

    let subfolders = response.map(s => s.folder).filter(f => f !== cwd && f.startsWith(cwd) && f.split("/").length === base.split("/").length + 1);
    setFolders(subfolders);
  }, [cwd, response]);

  React.useEffect(() => {
    update();
  }, [response, cwd, update]);

  const back = () => {
    setCwd(cwd.split("/").slice(0, -1).join("/") || "/");
  }

  const copyFile = (i) => {
    navigator.clipboard.writeText(process.env.REACT_APP_API_URL + "/file/" + files[i].code);
    setMessageOptions({body: "File URL copied to clipboard."});
  };

  const delFile = (i) => {
    setConfirmOptions({
      title: "Delete File",
      body: `Are you sure you want to delete ${files[i].filename}?`,
      submit: (status) => {
        if(status) {
          fetch(process.env.REACT_APP_API_URL + "/file/delete", {
            method: "POST",
            body: JSON.stringify({ code: files[i].code, folder: cwd }),
          }).then(r => r.json()).then(json => {
            if(json.success)
              setMessageOptions({body: json.response});
            else
              setErrorOptions({body: json.response});

            refresh();
          });
        }
      }
    });
  };

  const delFolder = (folder) => {
    setConfirmOptions({
      title: "Delete Folder",
      body: `Are you sure you want to delete ${folder.split("/").pop()}?`,
      submit: (status) => {
        if(status) {
          fetch(process.env.REACT_APP_API_URL + "/file/del_folder", {
            method: "POST",
            body: JSON.stringify({ folder }),
          }).then(r => r.json()).then(json => {
            if(json.success)
              setMessageOptions({body: json.response});
            else
              setErrorOptions({body: json.response});

            setCwd("/");
            refresh();
          });
        }
      }
    });
  }

  const upload = (files) => {
    if(files && files[0]) {
      setPleaseWaitOptions({isOpen: true});

      let file = files[0];

      let formData = new FormData();
      formData.append("file", file);
      formData.append("folder", cwd);

      fetch(process.env.REACT_APP_API_URL + "/file/upload", {
        method: 'POST',
        body: formData
      }).then(r => r.json()).then(json => {
        setPleaseWaitOptions({isOpen: false});

        if(json.success)
          setMessageOptions({body: json.response});
        else
          setErrorOptions({body: json.response});
        refresh();
      });
    }
  }

  const newFolder = (folder) => {
    let newPath = cwd.split("/").concat([folder.replace(/\//g, "").trim()]).join("/").replace(/\/\/+/g, '/');
    if(folder) {
      fetch(process.env.REACT_APP_API_URL + "/file/new_folder", {
        method: 'POST',
        body: JSON.stringify({ folder: newPath })
      }).then(r => r.json()).then(json => {
        if(json.success)
          setMessageOptions({body: json.response});
        else
          setErrorOptions({body: json.response});
        refresh();
      });
    }
  }

  // https://gist.github.com/yrq110/ebfc2cf66dae63f514bca22c62c40a93
  const humanFileSize = (size) => {
    if(!size || size <= 0) return '0 B';
    let i = Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  }

  const usedMB = (space / 100) * 128;
  const usedLabel = usedMB < 0.1 && space > 0 ? humanFileSize((space / 100) * 128 * 1024 * 1024) : `${usedMB.toFixed(usedMB < 10 ? 1 : 0)} MB`;

  return (
    <>
      <Modal toggle={() => open(false)} isOpen={isOpen} scrollable>
        <div className="modal-header">
          <div className="min-w-0">
            <h5 className="modal-title">
              {title}
            </h5>
            <p className="mt-0.5 truncate font-mono text-[11px] font-medium text-[var(--cs-ink-faint)]" title={cwd}>
              {cwd}
            </p>
          </div>
          <button
            aria-label="Close"
            className="close"
            type="button"
            onClick={() => open(false)}
          >
            <span aria-hidden={true}>×</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button size="sm" color="info" onClick={() => setDragDropOptions({submit: upload, multiple: false, key: Math.random()})}>
              <i className="fas fa-upload mr-1.5" aria-hidden="true" />Upload File
            </Button>
            <Button size="sm" color="secondary" onClick={() => setInputOptions({submit: newFolder, title: "New Folder", body: "Enter new folder name:"})}>
              <i className="fas fa-folder-plus mr-1.5" aria-hidden="true" />New Folder
            </Button>
            {(cwd === "/" && submitFolder) && (
              <Button size="sm" color="success" className="ml-auto" onClick={() => {submitFolder(JSON.parse(JSON.stringify(response.filter(s => s.folder.startsWith(cwd)))), cwd); open(false);}}>
                <i className="fas fa-check mr-1.5" aria-hidden="true" />Use this folder
              </Button>
            )}
          </div>
          <div className="file-list-container rounded-xl border border-[var(--cs-border)]">
            {cwd !== "/" && (
              <button
                type="button"
                onClick={back}
                className="flex w-full items-center gap-3 border-b border-[var(--cs-border)] px-3 py-2.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/[0.04] text-[var(--cs-ink-muted)] dark:bg-white/[0.06]">
                  <i className="fas fa-turn-up" aria-hidden="true"></i>
                </span>
                <span className="text-sm font-semibold text-[var(--cs-ink-muted)]">..</span>
              </button>
            )}
            {folders && folders.map((folder, i) => (
              <div key={i} className="flex w-full items-center gap-3 border-b border-[var(--cs-border)] px-3 py-2.5 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setCwd(folder)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--cs-brand-soft)] text-[var(--cs-brand)]">
                    <i className="fas fa-folder" aria-hidden="true"></i>
                  </span>
                  <span className="truncate text-sm font-semibold text-[var(--cs-ink)]">
                    {folder.split("/").pop()}
                  </span>
                </button>
                <span className="flex shrink-0 items-center gap-1.5">
                  {submitFolder && (
                    <Button size="sm" color="info" onClick={() => {submitFolder(JSON.parse(JSON.stringify(response.filter(s => s.folder.startsWith(folder)))), folder); open(false);}}>Select</Button>
                  )}
                  <Button size="sm" color="danger" aria-label={`Delete folder ${folder.split("/").pop()}`} onClick={(e) => {delFolder(folder); e.stopPropagation();}}><i className="fas fa-trash" aria-hidden="true"></i></Button>
                </span>
              </div>
            ))}
            {files && files.map((file, i) => (
              <div key={i} className="flex w-full items-center gap-3 border-b border-[var(--cs-border)] px-3 py-2.5 last:border-b-0">
                <span className="h-9 w-9 shrink-0">
                  <FileIcon extension={file.filename.split('.').pop()} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[var(--cs-ink)]" title={file.filename}>
                    {file.filename}
                  </span>
                  <span className="block text-[11px] font-medium text-[var(--cs-ink-faint)]">
                    {humanFileSize(file.size)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {submit && (
                    <Button size="sm" color="info" onClick={() => {submit(files[i]); open(false);}}>Select</Button>
                  )}
                  <Button size="sm" color="secondary" aria-label={`Copy link for ${file.filename}`} onClick={() => copyFile(i)}><i className="fas fa-copy" aria-hidden="true"></i></Button>
                  <Button size="sm" color="danger" aria-label={`Delete ${file.filename}`} onClick={() => delFile(i)}><i className="fas fa-trash" aria-hidden="true"></i></Button>
                </span>
              </div>
            ))}
            {(!folders || folders.length === 0) && (!files || files.length === 0) && (
              <p className="px-4 py-8 text-center text-sm text-[var(--cs-ink-faint)]">
                This folder is empty. Upload a file or create a subfolder to get started.
              </p>
            )}
          </div>
          <div className="mt-3 rounded-xl border border-[var(--cs-border)] bg-black/[0.02] px-3 py-2.5 dark:bg-white/[0.03]">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold">
              <span className="text-[var(--cs-ink-muted)]">
                {usedLabel} of 128 MB used
              </span>
              <span className="text-[var(--cs-ink-faint)]">{Math.round(space)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10" role="progressbar" aria-valuenow={Math.round(space)} aria-valuemin="0" aria-valuemax="100" aria-label="Storage used">
              <div className="h-full rounded-full bg-[var(--cs-brand)] transition-all" style={{ width: `${Math.min(space, 100)}%` }} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default FileListModal;