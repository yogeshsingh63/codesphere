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
        let data = {
          joined: json.response.enrolled.length,
          done: json.response.completed.map(t => t.sections.length === t.room.sections.length).filter(Boolean).length,
          time: +new Date()
        };
        sessionStorage.rooms = JSON.stringify(data);
        setJoined(data.joined);
        setDone(data.done);
      }
    });
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#fdf8f5] to-[#f5e3d7] border-b border-stone-200/60 py-10">
      <div className="container mx-auto px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">
            Welcome back, {user}!
          </h3>
          <p className="text-stone-550 text-xs mt-1.5 font-medium">
            Manage your collaborative programming rooms
          </p>
        </div>
        
        <div className="flex gap-10">
          <div className="text-center">
            <span className="block text-3xl font-black text-[#c2410c] tracking-tight leading-none mb-1">
              {done}
            </span>
            <span className="text-stone-500 text-[10px] font-bold uppercase tracking-wider">
              Rooms Done
            </span>
          </div>
          
          <div className="text-center">
            <span className="block text-3xl font-black text-[#c2410c] tracking-tight leading-none mb-1">
              {joined}
            </span>
            <span className="text-stone-500 text-[10px] font-bold uppercase tracking-wider">
              Rooms Joined
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePageHeader;

