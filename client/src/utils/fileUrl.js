import React from "react";
import fetch from "utils/fetch.js";

// Fetch a /file/:code download with the auth header and expose it as an
// object URL, so <img> tags keep working now that downloads require auth
// (plain <img> requests can't set headers, and cross-site cookies aren't
// sent in production). Returns null while loading or on failure.
export default function useFileUrl(code) {
  const [url, setUrl] = React.useState(null);

  React.useEffect(() => {
    if (!code) {
      setUrl(null);
      return;
    }
    let alive = true;
    let objectUrl = null;
    fetch(process.env.REACT_APP_API_URL + "/file/" + code)
      .then((resp) => {
        if (!resp.ok) throw new Error("not found");
        return resp.blob();
      })
      .then((blob) => {
        if (!alive) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (alive) setUrl(null);
      });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [code]);

  return url;
}
