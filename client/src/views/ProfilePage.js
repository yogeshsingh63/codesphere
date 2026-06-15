import React from "react";
import { useParams, useHistory } from "react-router-dom";
import Cookies from 'universal-cookie';
import { useAuthState } from "context/auth.js";
import { useAlertState } from "context/alert.js";
import fetch from "utils/fetch.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

function ProfilePage() {
  const { setMessageOptions, setErrorOptions, setFileListOptions } = useAlertState();
  const { isSignedIn, user, email } = useAuthState();
  const cookies = new Cookies();
  const history = useHistory();
  let { target } = useParams();

  if(!target) {
    target = user;
  }

  const [userData, setUserData] = React.useState({});
  const [loaded, setLoaded] = React.useState(false);

  const response = (json) => {
    if(!json.success) {
      return setErrorOptions({body: json.response, submit: () => {
        history.push("/profile");
        history.go(0);
      }});
    }
    setMessageOptions({ body: json.response, submit: () => {
      history.push("/profile");
      history.go(0);
    }});
  };

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + "/user/info?username=" + encodeURIComponent(target), {
      method: "GET"
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setUserData(json.response);
        setLoaded(true);
      }
      else {
        setErrorOptions({body: json.response, submit: () => {
          history.push("/home");
        }});
      }
    });
  }, [target, history, setErrorOptions]);

  const [ info, setInfo ] = React.useState({});
  const [ pass, setPass ] = React.useState({});
  const [ bio, setBio ] = React.useState("");

  const updateInfo = (e) => {
    e.preventDefault();

    fetch(process.env.REACT_APP_API_URL + '/user/update_info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: info.username || user,
        email: info.email || email,
        name: info.name || userData.name
      })
    })
    .then(resp => resp.json())
    .then(json => {
      if(!json.success) {
        return setErrorOptions({body: json.response, submit: () => {
          history.push("/profile");
        }});
      }
      setMessageOptions({ body: "Update successful!", submit: () => {
        history.push("/profile");
      }});
      cookies.set("authToken", json.response);
    });
  };

  const changePass = (e) => {
    e.preventDefault();
    fetch(process.env.REACT_APP_API_URL + '/user/update_pass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...pass })
    })
    .then(resp => resp.json())
    .then(response);
  }

  const changeBio = (e) => {
    e.preventDefault();
    fetch(process.env.REACT_APP_API_URL + '/user/update_bio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bio })
    })
    .then(resp => resp.json())
    .then(response);
  }

  const changePic = (file) => {
    fetch(process.env.REACT_APP_API_URL + '/user/update_pic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: file.code })
    })
    .then(resp => resp.json())
    .then(response);
  };

  const deletePic = () => {
    fetch(process.env.REACT_APP_API_URL + '/user/update_pic', {
      method: 'POST'
    })
    .then(resp => resp.json())
    .then(response);
  };

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

  if(!isSignedIn) {
    history.push("/");
    return <></>;
  }

  return (
    <>
      <Navbar />
      <div className="wrapper bg-[#faf9f6] min-h-screen pt-16 flex flex-col justify-between">
        <div>
          <ProfilePageHeader />
          <div className="py-12">
            {loaded ? (
              <div className="container mx-auto px-6 max-w-4xl flex flex-col gap-8">
                {/* Profile Overview Card */}
                <div className="bg-white border border-stone-200/60 rounded-3xl p-8 md:p-10 shadow-sm">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <img
                      className="rounded-full w-32 h-32 object-cover border-4 border-stone-100 shadow-sm shrink-0"
                      src={userData.profilepic ?
                        process.env.REACT_APP_API_URL + '/file/' + userData.profilepic
                        : "https://ui-avatars.com/api/?name=" + userData.username
                      }
                      onError={(e) => {
                        if(target === user) {
                          fetch(process.env.REACT_APP_API_URL + '/user/update_pic', {
                            method: 'POST'
                          });
                        }
                        e.target.src = "https://ui-avatars.com/api/?name=" + userData.username
                      }}
                      alt={userData.username + "'s profile picture"}
                    />
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight mb-2">
                        {userData.name ? `${userData.name} (${userData.username})` : userData.username}
                      </h4>
                      <p className="text-stone-600 text-sm leading-relaxed mb-6 whitespace-pre-line max-w-2xl">
                        {userData.bio ? userData.bio : "Sadly, we don't have any information about them."}
                      </p>
                      
                      <div className="flex justify-center md:justify-start gap-8 border-t border-stone-100 pt-6">
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">Completed</span>
                          <div className="text-lg font-bold text-stone-900">{userData.completed} / {userData.enrolled + userData.created}</div>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">Created</span>
                          <div className="text-lg font-bold text-stone-900">{userData.created}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Account Sections */}
                {target === user && (
                  <div className="bg-white border border-stone-200/60 rounded-3xl p-8 md:p-10 shadow-sm flex flex-col gap-10">
                    <h4 className="text-lg font-bold text-stone-900 tracking-tight pb-3 border-b border-stone-100">My Account</h4>

                    {/* Form 1: User Info */}
                    <form onSubmit={updateInfo} className="flex flex-col gap-6">
                      <h6 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                        User information
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-stone-700">Username</label>
                          <input
                            placeholder="Username"
                            type="text"
                            defaultValue={userData.username}
                            onChange={(e) => setInfo({...info, username: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm text-stone-900 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-stone-700">Name</label>
                          <input
                            placeholder="Name"
                            type="text"
                            defaultValue={userData.name}
                            onChange={(e) => setInfo({...info, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm text-stone-900 transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-stone-700">Email</label>
                        <input
                          placeholder="Email"
                          type="email"
                          defaultValue={email}
                          onChange={(e) => setInfo({...info, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm text-stone-900 transition-all"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mt-2">
                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={() => setFileListOptions({title: "Select new profile picture:", submit: changePic})}
                            className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white font-semibold rounded-xl text-xs shadow-sm transition-all"
                          >
                            Change Picture
                          </button>
                          <button
                            type="button"
                            onClick={deletePic}
                            className="px-4 py-2 border border-red-250 text-red-650 hover:bg-red-50/50 rounded-xl text-xs font-semibold transition-all"
                          >
                            Delete Picture
                          </button>
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#c2410c] hover:bg-[#a13207] text-white font-semibold rounded-xl text-xs shadow-sm transition-all self-end sm:self-auto"
                        >
                          Update Info
                        </button>
                      </div>
                    </form>

                    {/* Form 2: Change Password */}
                    <form onSubmit={changePass} className="flex flex-col gap-6 pt-6 border-t border-stone-100">
                      <h6 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                        Change Password
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-stone-700">Current Password</label>
                          <input
                            placeholder="Current Password"
                            type="password"
                            onChange={(e) => setPass({...pass, currentPassword: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm text-stone-900 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-stone-700">New Password</label>
                          <input
                            placeholder="New Password"
                            type="password"
                            onChange={(e) => setPass({...pass, newPassword: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm text-stone-900 transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#c2410c] hover:bg-[#a13207] text-white font-semibold rounded-xl text-xs shadow-sm transition-all"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>

                    {/* Form 3: Update Bio */}
                    <form onSubmit={changeBio} className="flex flex-col gap-6 pt-6 border-t border-stone-100">
                      <h6 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                        About me
                      </h6>
                      <div className="flex flex-col gap-1.5">
                        <textarea
                          placeholder="Write a few lines about yourself..."
                          name="bio"
                          defaultValue={userData.bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows="4"
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm text-stone-900 transition-all placeholder:text-stone-400 resize-none"
                        />
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#c2410c] hover:bg-[#a13207] text-white font-semibold rounded-xl text-xs shadow-sm transition-all"
                        >
                          Update Bio
                        </button>
                      </div>
                    </form>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center min-h-[250px] w-full">
                <i className="fas fa-spinner animate-spin text-[#c2410c] text-3xl"></i>
              </div>
            )}
          </div>
        </div>
        
        <DefaultFooter />
      </div>
    </>
  );
}

export default ProfilePage;

