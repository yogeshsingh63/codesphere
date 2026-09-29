import React from "react";
import { Container, Row, Col, Button, Badge } from "reactstrap";
import { Link } from "react-router-dom";

import Navbar from "components/Navbars/Navbar.js";
import IndexHeader from "components/Headers/IndexHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

function Index() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: "fas fa-users-cog",
      tag: "Live Sync",
      title: "Real-Time Collaboration",
      desc: "Code with peers, mentors, or students simultaneously. Full file tree synchronization and real-time cursor awareness make remote pair programming effortless.",
      badgeColor: "info",
    },
    {
      icon: "fas fa-shield-virus",
      tag: "Sandbox Engine",
      title: "Isolated Code Execution",
      desc: "Execute code safely in sandboxed environments with zero client overhead. Supports Python, Node.js, C, C++, C#, Java, and Rust with stdin/stdout streaming.",
      badgeColor: "success",
    },
    {
      icon: "fas fa-tasks",
      tag: "Learning Engine",
      title: "Modular Curriculum Rooms",
      desc: "Create or participate in interactive rooms featuring rich markdown documentation, automated test cases, multiple-choice quizzes, and flag challenges.",
      badgeColor: "primary",
    },
    {
      icon: "fas fa-file-export",
      tag: "Educator Tools",
      title: "Import & Export Courseware",
      desc: "Educators can author entire syllabi with built-in Markdown editor and test runners, exporting portable room manifests to share across classrooms.",
      badgeColor: "warning",
    },
  ];

  const languages = [
    { name: "Python", icon: "fab fa-python", desc: "Python 3.11" },
    { name: "JavaScript", icon: "fab fa-node-js", desc: "Node.js 22" },
    { name: "Rust", icon: "fas fa-cog", desc: "Rust 1.75" },
    { name: "C++", icon: "fas fa-code", desc: "GCC 13" },
    { name: "Java", icon: "fab fa-java", desc: "OpenJDK 21" },
    { name: "C#", icon: "fas fa-terminal", desc: ".NET 8" },
  ];

  return (
    <>
      <Navbar />
      <div
        className="wrapper cs-page-wrapper"
        style={{
          backgroundColor: "#080c14",
          color: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <IndexHeader />

        {/* Feature Cards Grid */}
        <section className="cs-section py-5">
          <Container className="py-5">
            <div className="text-center max-w-700 mx-auto mb-5">
              <Badge color="info" className="cs-badge-pill mb-2">
                Core Capabilities
              </Badge>
              <h2 className="cs-section-title font-weight-700 mb-3">
                Everything you need to teach, learn, and build code.
              </h2>
              <p className="text-muted cs-section-subtitle">
                Engineered for students, educators, and developer teams who demand reliable interactive environments without setup friction.
              </p>
            </div>

            <Row>
              {features.map((item, index) => (
                <Col lg="6" md="6" key={index} className="mb-4">
                  <div className="cs-feature-card h-100 p-4 rounded-xl border border-dark">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="cs-feature-icon-wrapper">
                        <i className={`${item.icon} text-info fa-lg`}></i>
                      </div>
                      <Badge color={item.badgeColor} className="cs-badge-pill">
                        {item.tag}
                      </Badge>
                    </div>
                    <h4 className="font-weight-600 text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-muted mb-0 small line-height-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Supported Languages Strip */}
        <section className="cs-section cs-section-alt py-5 border-top border-bottom border-dark">
          <Container className="py-4">
            <div className="text-center mb-4">
              <h4 className="font-weight-700 text-white mb-1">
                Supported Language Environments
              </h4>
              <p className="text-muted small mb-0">
                Run, debug, and test code across major modern software development stacks.
              </p>
            </div>

            <Row className="justify-content-center">
              {languages.map((lang, idx) => (
                <Col lg="2" md="4" sm="6" xs="6" key={idx} className="mb-3">
                  <div className="cs-lang-pill text-center p-3 rounded">
                    <i className={`${lang.icon} fa-2x text-info mb-2`}></i>
                    <div className="font-weight-600 text-white small">
                      {lang.name}
                    </div>
                    <div className="text-muted font-size-xs">{lang.desc}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Call to Action Banner */}
        <section className="cs-section py-5">
          <Container className="py-5">
            <div className="cs-cta-banner p-5 rounded-2xl text-center border border-info">
              <h2 className="font-weight-700 text-white mb-3">
                Ready to transform the way you code and learn?
              </h2>
              <p className="text-muted max-w-600 mx-auto mb-4">
                Join our community of developers, teachers, and students. Sign up in seconds with zero configuration required.
              </p>
              <div className="d-flex justify-content-center flex-wrap gap-3">
                <Button
                  tag={Link}
                  to="/register"
                  color="info"
                  size="lg"
                  className="cs-btn cs-btn-info px-4 py-2 font-weight-600 mr-3 mb-2"
                >
                  Create Free Account &rarr;
                </Button>
                <Button
                  tag={Link}
                  to="/login"
                  color="secondary"
                  outline
                  size="lg"
                  className="cs-btn cs-btn-ghost px-4 py-2 font-weight-600 mb-2"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </Container>
        </section>

        <DefaultFooter />
      </div>
    </>
  );
}

export default Index;
