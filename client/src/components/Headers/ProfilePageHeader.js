import React from "react";
import { useAuthState } from "context/auth.js";
import fetch from "utils/fetch.js";

function ProfilePageHeader() {
  const { user } = useAuthState();

  const [done, setDone] = React.useState(0);
  const [joined, setJoined] = React.useState(0);

  React.useEffect(() => {
    if(sessionStorage.rooms) {
      try {
        let data = JSON.parse(sessionStorage.rooms);
        if(data.time && data.time + 1000*60*3 > +new Date()) {
          setJoined(data.joined);
          setDone(data.done);
          return;
        }
        else {
          sessionStorage.removeItem("rooms");
        }
      }
      catch(err) {}
    }

    fetch(process.env.REACT_APP_API_URL + "/user/rooms", {
      method: "POST"
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        const enrolled = json.response?.enrolled ?? [];
        const completed = json.response?.completed ?? [];
        let data = {
          joined: enrolled.length,
          done: completed.filter(t => t?.sections?.length && t?.room?.sections?.length && t.sections.length === t.room.sections.length).length,
          time: +new Date()
        };
        try { sessionStorage.rooms = JSON.stringify(data); } catch {}
        setJoined(data.joined);
        setDone(data.done);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="bg-gradient-to-br from-[var(--cs-brand-soft)] to-transparent border-b border-[var(--cs-border)] py-10">
      <div className="container mx-auto px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-[var(--cs-ink)] tracking-tight">
            Welcome back, {user}!
          </h3>
          <p className="text-[var(--cs-ink-muted)] text-xs mt-1.5 font-medium">
            Manage your collaborative programming rooms
          </p>
        </div>
        
        <div className="flex gap-10">
          <div className="text-center">
            <span className="block text-3xl font-black text-[var(--cs-brand)] tracking-tight leading-none mb-1" aria-live="polite">
              {done}
            </span>
            <span className="text-[var(--cs-ink-faint)] text-[10px] font-bold uppercase tracking-wider">
              Rooms Done
            </span>
          </div>
          
          <div className="text-center">
            <span className="block text-3xl font-black text-[var(--cs-brand)] tracking-tight leading-none mb-1" aria-live="polite">
              {joined}
            </span>
            <span className="text-[var(--cs-ink-faint)] text-[10px] font-bold uppercase tracking-wider">
              Rooms Joined
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePageHeader;

