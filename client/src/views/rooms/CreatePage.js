import React from "react";
import { Link, useParams, useLocation, useHistory } from "react-router-dom";
import { sortableContainer, sortableElement } from 'react-sortable-hoc';

import fetch from "utils/fetch.js";

import { useAuthState } from "context/auth.js";
import { useAlertState } from "context/alert.js";

// core components
import AuthNavbar from "components/Navbars/AuthNavbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

import SectionCard from "components/Cards/SectionCard.js";
import PaginatedTable from "components/Form/PaginatedTable.js";

import EditSection from "components/Modals/EditSection.js";
import ExportModal from "components/Modals/ExportModal.js";
import ImportModal from "components/Modals/ImportModal.js";

function CreatePage() {
  const history = useHistory();
  const { user, isSignedIn } = useAuthState();
  const { setErrorOptions, setMessageOptions, setInputOptions, setConfirmOptions } = useAlertState();

  const isEditing = useLocation().pathname.startsWith("/rooms/edit/");
  const { code } = useParams();

  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");

  const [members, setMembers] = React.useState([]);

  const [isPublic, setPublic] = React.useState(false);

  const [editModal, setEditModal] = React.useState(false);
  const [exportModal, setExportModal] = React.useState(false);
  const [importModal, setImportModal] = React.useState(false);

  const [sections, setSections] = React.useState([]);

  const sectionsRef = React.useRef(sections);
  const sectionRef = React.useRef({});

  const editSection = (title) => {
    let section = sectionsRef.current.find(section => section.title === title);
    if(!section) {
      setErrorOptions({body: "No section found with that title."});
    }

    sectionRef.current = section;
    setEditModal(true);
  }

  const deleteSection = (title) => {
    setSections([...sectionsRef.current].filter(check => check.title !== title));
  }

  const fixupSection = (section) => {
    return {...section, onClick: editSection, onDelete: deleteSection}
  }

  const createSection = (title) => {
    if(sectionsRef.current.find(section => section.title === title)) {
      return setErrorOptions({body: "A section already exists with that title."});
    }
    if(!title) {
      return setErrorOptions({body: "You must provide a title."});
    }

    setSections([...sectionsRef.current, {
      title,
      type: "info"
    }]);
  }

  const finishSection = (modified) => {
    let index = sectionsRef.current.findIndex(section => section.title === sectionRef.current.title);
    let newSections = [...sectionsRef.current];
    newSections[index] = modified;
    setSections(newSections);
  }

  const finishImport = (json) => {
    let data = JSON.parse(json);
    setTitle(data.title);
    setDesc(data.desc);
    setSections(data.sections);
    setPublic(data.public);

    if(data.members)
      setMembers(data.members);
  }

  const saveRoom = () => {
    let roomData = { title, desc, sections: sectionsRef.current, "public": isPublic };
    fetch(process.env.REACT_APP_API_URL + (isEditing ? "/room/edit" : "/room/create"), {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ roomData, code })
    }).then(resp => resp.json()).then(json => {
      if(json.success) {
        setMessageOptions({body: json.response, submit: () => {history.push("/home")}});
      }
      else {
        setErrorOptions({body: json.response});
      }
    });
  }

  const deleteRoom = (confirm) => {
    if(!confirm) {
        return;
    }

    fetch(process.env.REACT_APP_API_URL + "/room/delete", {
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
        setErrorOptions({body: json.response, submit: () => {history.push("/home")}});
      }
    });
  }

  const SortableItem = sortableElement(({value}) => <SectionCard {...value} />);

  const SortableContainer = sortableContainer(({children}) => {
    return <div>{children}</div>;
  });

  const onSortEnd = ({ oldIndex, newIndex }) => {
    let modified = [...sectionsRef.current];
    modified.splice(newIndex, 0, modified.splice(oldIndex, 1)[0]);
    setSections(modified);
  };

  React.useEffect(() => {
    document.body.classList.add("profile-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;

    if(isEditing) {
      fetch(process.env.REACT_APP_API_URL + `/room/info`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      }).then(resp => resp.json()).then(json => {
        if(json.success) {
          if(json.response.author !== user) {
            return setErrorOptions({body: "You are not this room's creator!", submit: () => {history.push("/home")}});
          }

          for(let i = 0; i < json.response.sections.length; i++) {
            delete json.response.sections[i].completed;
            if(json.response.sections[i].checks && json.response.sections[i].checks.length === 0)
              delete json.response.sections[i].checks;
            if(json.response.sections[i].answers && json.response.sections[i].answers.length === 0)
              delete json.response.sections[i].answers;
          }

          finishImport(JSON.stringify(json.response));
        }
        else {
          setErrorOptions({body: "No room was found with that code.", submit: () => {history.push("/home")}});
        }
      });
    }

    return function cleanup() {
      document.body.classList.remove("profile-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, [code, history, isEditing, user, setErrorOptions]);

  React.useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  if(!isSignedIn) {
    history.push("/");
    return <></>;
  }

  return (
    <>
      <AuthNavbar />
      <div className="wrapper bg-[#faf9f6] min-h-screen pt-16 flex flex-col justify-between">
        <EditSection open={setEditModal} isOpen={editModal} section={sectionRef.current} submit={finishSection} key={sectionRef.current.title} />
        <ExportModal open={setExportModal} isOpen={exportModal} data={JSON.stringify({title, desc, sections: sectionsRef.current, "public": isPublic}, null, " ".repeat(4))} />
        <ImportModal open={setImportModal} isOpen={importModal} submit={finishImport} />

        <div>
          <ProfilePageHeader />
          <div className="py-12">
            <div className="container mx-auto px-6 max-w-4xl">
              <h3 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
                <i className="fas fa-tools text-[#c2410c]"></i>
                <span>Room {isEditing ? "Editor": "Creator"}</span>
              </h3>
              {isEditing && (
                <p className="text-xs text-stone-500 mb-6 font-medium">
                  Room Code: <strong className="text-[#c2410c]">{code}</strong>
                </p>
              )}
              
              <h4 className="text-sm font-bold text-stone-800 mb-4 tracking-tight">Room Details</h4>
              <div className="bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm mb-8">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="title-input" className="text-xs font-semibold text-stone-700">Room Title</label>
                    <input
                      placeholder="Enter title"
                      type="text"
                      id="title-input"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm bg-stone-50/50 text-stone-900 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="desc-input" className="text-xs font-semibold text-stone-700">Description</label>
                    <input
                      placeholder="Enter description"
                      type="text"
                      id="desc-input"
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent text-sm bg-stone-50/50 text-stone-900 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-stone-700">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={e => setPublic(e.target.checked)}
                        className="w-4 h-4 rounded border-stone-300 text-[#c2410c] focus:ring-[#c2410c]"
                      />
                      <span>Public Room</span>
                    </label>
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-stone-800 mb-4 tracking-tight">Sections</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <SortableContainer onSortEnd={onSortEnd} axis="xy">
                  <div className="contents">
                    {sections.map((value, index) => (
                      <SortableItem key={index} index={index} value={fixupSection(value)} />
                    ))}
                  </div>
                </SortableContainer>
                <SectionCard 
                  title="Create Section" 
                  desc="Create a new section here." 
                  button="Create +" 
                  onClick={() => setInputOptions({title: "Enter Section Title:", body: "", submit: createSection})}
                />
              </div>

              {(isEditing && members && members.length > 0) && (
                <div className="mt-10">
                  <h4 className="text-sm font-bold text-stone-800 mb-1 tracking-tight">Members</h4>
                  <p className="text-xs text-stone-500 mb-4 font-medium">Total enrolled: {members.length} </p>

                  <PaginatedTable
                    columns={[
                      {title: "Username", field: "username", formatter: (item) => (
                        <Link to={"/profile/" + item.username} className="text-[#c2410c] hover:underline font-semibold">{item.username}</Link>
                      )},
                      {title: "Completion", field: "completed", formatter: (item) => (
                        <span className="text-xs text-stone-600 font-medium">
                          {item.completed ? item.completed.length : 0} / {sections.length} sections
                        </span>
                      )}
                    ]}
                    items={members}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t border-stone-200/60">
                <button 
                  type="button" 
                  onClick={() => history.push("/home")} 
                  className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-100/60 rounded-xl text-xs font-semibold transition-all self-start sm:self-auto"
                >
                  &larr; Back
                </button>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                  <button 
                    type="button" 
                    onClick={() => setExportModal(true)} 
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                  >
                    Export
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setImportModal(true)} 
                    className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-100/60 rounded-xl text-xs font-semibold transition-all"
                  >
                    Import
                  </button>
                  {isEditing && (
                    <button 
                      type="button" 
                      onClick={() => setConfirmOptions({
                        title: "Confirm Deletion",
                        body: "Are you sure you want to delete this room?",
                        submit: deleteRoom,
                        yesColor: "danger",
                        noColor: "primary"
                      })} 
                      className="px-4 py-2 border border-red-200 text-red-650 hover:bg-red-50/50 rounded-xl text-xs font-semibold transition-all"
                    >
                      Delete
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={saveRoom} 
                    className="px-4 py-2 bg-[#c2410c] hover:bg-[#a13207] text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DefaultFooter />
      </div>
    </>
  );
}

export default CreatePage;

