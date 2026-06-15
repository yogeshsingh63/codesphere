import React from "react";
import { useHistory } from "react-router-dom";
import { useAuthState } from "context/auth.js";
import fetch from "utils/fetch.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

import RoomCard from "components/Cards/RoomCard.js";
import InputModal from "components/Modals/InputModal.js";
import MessageModal from "components/Modals/MessageModal.js";

function HomePage() {
  const { isSignedIn } = useAuthState(true);
  const history = useHistory();

  const [joinModal, setJoinModal] = React.useState(false);
  const [messageModal, setMessageModal] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const [enrolled, setEnrolled] = React.useState([]);
  const [created, setCreated] = React.useState([]);
  const [completed, setCompleted] = React.useState([]);

  const join = (code) => {
    fetch(process.env.REACT_APP_API_URL + "/room/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    }).then(resp => resp.json()).then(json => {
      setMessage(json.response);
      setMessageModal(true);
      if(json.success) {
        load();
      }
    });
  }

  const getCompleted = (room) => {
    if(completed.length > 0) {
      return completed.find(c => c.room.code === room.code);
    }
    return null;
  }

  const load = () => {
    fetch(process.env.REACT_APP_API_URL + "/user/rooms", {
      method: "POST"
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setEnrolled(json.response.enrolled);
        setCreated(json.response.created);
        setCompleted(json.response.completed);
      }
    });
  }

  React.useEffect(() => {
    document.body.classList.add("profile-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;

    load();

    return function cleanup() {
      document.body.classList.remove("profile-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  if(!isSignedIn) {
    history.push("/");
    return <></>;
  }

  return (
    <>
      <Navbar />
      <div className="wrapper bg-[#faf9f6] min-h-screen pt-16 flex flex-col justify-between">
        <InputModal open={setJoinModal} isOpen={joinModal} submit={join} title="Join Room" body="Enter room code below:" button="Join" />
        <MessageModal open={setMessageModal} isOpen={messageModal} title="Join Room" body={message} />
        
        <div>
          <ProfilePageHeader />
          
          <main className="container mx-auto px-6 py-12 flex flex-col gap-12">
            {/* Enrolled Rooms Section */}
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2.5">
                <i className="fas fa-graduation-cap text-[#c2410c]"></i>
                <span>Enrolled Rooms</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full mb-4">
                {enrolled && enrolled.map((room, i) => (
                  <RoomCard 
                    key={i} 
                    completed={getCompleted(room)} 
                    {...room} 
                    buttons={[{to: "/rooms/view/" + room.code, text: "Open"}]} 
                  />
                ))}
                <RoomCard 
                  title="Join Room" 
                  desc="Join a new collaborative room here by entering its room code." 
                  buttons={[{onClick: () => {setJoinModal(true)}, text: "Join +"}]} 
                />
              </div>
            </div>

            {/* Created Rooms Section */}
            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2.5">
                <i className="fas fa-tools text-[#c2410c]"></i>
                <span>Created Rooms</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                {created && created.map((room, i) => (
                  <RoomCard 
                    key={i} 
                    completed={getCompleted(room)} 
                    {...room} 
                    buttons={[
                      {to: "/rooms/view/" + room.code, text: "Open"},
                      {to: "/rooms/edit/" + room.code, text: "Manage", color: "danger"}
                    ]} 
                  />
                ))}
                <RoomCard 
                  title="Create Room" 
                  desc="Create your own room with custom challenges and content here!" 
                  buttons={[{to: "/rooms/create", text: "Create +"}]} 
                />
              </div>
            </div>
          </main>
        </div>
        
        <DefaultFooter />
      </div>
    </>
  );
}

export default HomePage;

