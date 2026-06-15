import React from "react";
import { Link, useHistory } from "react-router-dom";
import { useAuthState } from "context/auth.js";
import { useAlertState } from "context/alert.js";
import fetch from "utils/fetch.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";
import PaginatedTable from "components/Form/PaginatedTable.js";

function ListPage() {
  const history = useHistory();
  const { isSignedIn } = useAuthState();
  const { setMessageOptions, setErrorOptions } = useAlertState();

  const [ rooms, setRooms ] = React.useState([]);
  const [ items, setItems ] = React.useState([]);
  const [ search, setSearch ] = React.useState("");

  React.useEffect(() => {
    document.body.classList.add("profile-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;

    return function cleanup() {
      document.body.classList.remove("profile-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + "/room/list", {
      method: "GET"
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setRooms(json.response);
      }
    });
  }, []);

  React.useEffect(() => {
    let filtered = rooms.filter(r => Object.keys(r).some(k => r[k].includes(search)));
    setItems(filtered);
  }, [rooms, search])

  if(!isSignedIn) {
    history.push("/");
    return null;
  }

  const join = (code) => {
    fetch(process.env.REACT_APP_API_URL + "/room/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setMessageOptions({body: json.response, submit: () => {history.push("/home")}});
      }
      else {
        setErrorOptions({body: json.response});
      }
    });
  };

  const columns = [
    {title: "Title", field: "title"},
    {title: "Author", field: "author", formatter: (item) => (
      <Link to={"/profile/" + item.author} className="text-[#c2410c] hover:underline font-semibold">{item.author}</Link>
    )},
    {title: "Code", field: "code"},
    {title: "Description", field: "desc"},
    {title: "", field: "", formatter: (item) => (
      <button 
        onClick={() => join(item.code)} 
        className="px-4 py-2 bg-[#c2410c] text-white hover:bg-[#a13207] text-xs font-semibold rounded-xl shadow-xs transition-all"
      >
        Join
      </button>
    )}
  ];

  return (
    <>
      <Navbar />
      <div className="wrapper bg-[#faf9f6] min-h-screen pt-16 flex flex-col justify-between">
        <div>
          <ProfilePageHeader />
          <div className="py-12">
            <div className="container mx-auto px-6">
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                <i className="fas fa-layer-group text-[#c2410c]"></i>
                <span>Room Listing</span>
              </h3>
              
              <div className="flex flex-col gap-1.5 mb-8 max-w-sm">
                <label className="text-xs font-semibold text-stone-700">Search Rooms</label>
                <div className="relative">
                  <input
                    placeholder="Type to search rooms..."
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm bg-white text-stone-900 transition-all placeholder:text-stone-400 shadow-xs"
                  />
                  <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
                </div>
              </div>
              
              <PaginatedTable columns={columns} items={items} />
            </div>
          </div>
        </div>
        <DefaultFooter />
      </div>
    </>
  );
}

export default ListPage;

