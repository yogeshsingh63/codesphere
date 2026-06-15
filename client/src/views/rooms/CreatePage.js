import React from "react";
import { Link, useParams, useLocation, useHistory } from "react-router-dom";
// reactstrap components
import {
  Button,
  Container,
  Row,
  Col,
  Input,
  Form,
  FormGroup,
  Label
} from "reactstrap";
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
      <div className="wrapper">
        <EditSection open={setEditModal} isOpen={editModal} section={sectionRef.current} submit={finishSection} key={sectionRef.current.title} />
        <ExportModal open={setExportModal} isOpen={exportModal} data={JSON.stringify({title, desc, sections: sectionsRef.current, "public": isPublic}, null, " ".repeat(4))} />
        <ImportModal open={setImportModal} isOpen={importModal} submit={finishImport} />

        <ProfilePageHeader />
        <div className="section" style={{ background: '#faf9f6', padding: '48px 0', minHeight: 'calc(100vh - 220px - 64px)' }}>
          <Container>
            <h3 className="title" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Room {isEditing ? "Editor": "Creator"}
            </h3>
            {isEditing && <h5 style={{ fontSize: '0.925rem', color: '#64748b', marginBottom: '24px' }}>Room Code: <strong style={{ color: '#6366f1' }}>{code}</strong></h5>}
            
            <h4 className="title" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>Room Details</h4>
            <Card style={{ border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
              <CardBody style={{ padding: '28px' }}>
                <Row>
                  <Col>
                    <Form>
                      <FormGroup>
                        <label htmlFor="title-input" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Room Title</label>
                        <Input
                          placeholder="Enter title"
                          type="text"
                          id="title-input"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          style={{ borderRadius: '8px' }}
                        />
                      </FormGroup>
                      <FormGroup>
                        <label htmlFor="desc-input" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Description</label>
                        <Input
                          placeholder="Enter description"
                          type="text"
                          id="desc-input"
                          value={desc}
                          onChange={e => setDesc(e.target.value)}
                          style={{ borderRadius: '8px' }}
                        />
                      </FormGroup>
                      <FormGroup check className="pl-0" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Label check style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                          <Input
                            type="checkbox"
                            checked={isPublic}
                            onChange={e => setPublic(e.target.checked)}
                            style={{ position: 'static', margin: 0, width: '16px', height: '16px', borderRadius: '4px' }}
                          />
                          Public Room
                        </Label>
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            <h4 className="title" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginTop: '36px', marginBottom: '16px' }}>Sections</h4>
            <Row style={{ gap: '16px', paddingLeft: '15px' }}>
              <SortableContainer onSortEnd={onSortEnd} axis="x">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {sections.map((value, index) => (
                    <SortableItem key={index} index={index} value={fixupSection(value)} />
                  ))}
                </div>
              </SortableContainer>
              <SectionCard title="Create Section" desc="Create a new section here." button="Create +" onClick={() => setInputOptions({title: "Enter Section Title:", body: "", submit: createSection})}/>
            </Row>

            {(isEditing && members && members.length > 0) && (
              <>
                <h4 className="title" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginTop: '36px', marginBottom: '8px' }}>Members</h4>
                <h5 style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>Total enrolled: {members.length} </h5>

                <PaginatedTable
                  columns={[
                    {title: "Username", field: "username", formatter: (item) => (
                      <Link to={"/profile/" + item.username} style={{ color: '#c2410c', fontWeight: 500 }}>{item.username}</Link>
                    )},
                    {title: "Completion", field: "completed", formatter: (item) => (
                      <>{item.completed ? item.completed.length : 0} / {sections.length} sections</>
                    )}
                  ]}
                  items={members}
                />

                <br />
              </>
            )}

            <Row style={{ marginTop: '36px', borderTop: '1px solid #e2e8f0', paddingTop: '24px', marginLeft: 0, marginRight: 0 }}>
              <Col className="p-0">
                <Button color="primary" outline type="button" size="sm" onClick={() => history.push("/home")} style={{ fontWeight: 600, borderRadius: '8px' }}>&larr; Back</Button>
              </Col>
              <Col className="text-right p-0" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button color="success" type="button" size="sm" onClick={() => setExportModal(true)} style={{ fontWeight: 600, borderRadius: '8px' }}>Export</Button>
                <Button color="primary" outline type="button" size="sm" onClick={() => setImportModal(true)} style={{ fontWeight: 600, borderRadius: '8px' }}>Import</Button>
                {isEditing && (
                  <Button color="danger" type="button" size="sm" onClick={() => setConfirmOptions({
                      title: "Confirm Deletion",
                      body: "Are you sure you want to delete this room?",
                      submit: deleteRoom,
                      yesColor: "danger",
                      noColor: "primary"
                  })} style={{ fontWeight: 600, borderRadius: '8px' }}>Delete</Button>
                )}
                <Button color="primary" type="button" size="sm" onClick={saveRoom} style={{ fontWeight: 600, borderRadius: '8px' }}>Save</Button>
              </Col>
            </Row>
          </Container>
        </div>
        <DefaultFooter />
      </div>
    </>
  );
}

export default CreatePage;
