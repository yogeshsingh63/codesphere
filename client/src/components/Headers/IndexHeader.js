import React from "react";
import { Container, Row, Col, Button, Badge } from "reactstrap";
import { Link } from "react-router-dom";

function IndexHeader() {
  const [activeTab, setActiveTab] = React.useState("python");

  const snippets = {
    python: {
      file: "solution.py",
      lang: "Python 3.11",
      code: `def solve_challenges(codebase: list[str]) -> dict:
    # CodeSphere automated test runner
    results = {
        "sandbox": "secure",
        "concurrency": "active",
        "latency_ms": 12.4
    }
    return {k: v for k, v in results.items() if v}

print(solve_challenges(["code", "sphere"]))`,
      output: `[Task] Running sandboxed execution...
[Task] Passed test case 1 / 1.
✓ All checks completed successfully (0.08s)`,
    },
    rust: {
      file: "main.rs",
      lang: "Rust 1.75",
      code: `fn main() {
    let platform = "CodeSphere";
    let version = 2.0;
    println!("Welcome to {} v{:.1}!", platform, version);
    println!("Real-time collaborative sandbox ready.");
}`,
      output: `[Task] Compiling main.rs...
Welcome to CodeSphere v2.0!
Real-time collaborative sandbox ready.
✓ Process finished with exit code 0`,
    },
    node: {
      file: "server.js",
      lang: "Node.js 22",
      code: `import { createServer } from "codesphere/collab";

const room = createServer({ roomId: "quantum-algo" });
room.on("sync", (users) => {
  console.log(\`Users connected: \${users.length}\`);
});`,
      output: `Users connected: 3
WebSocket peer sync active (24ms)
✓ Live state synchronized across all peers`,
    },
  };

  const currentSnippet = snippets[activeTab] || snippets.python;

  return (
    <div className="cs-hero-section position-relative overflow-hidden">
      {/* Background glow effects */}
      <div className="cs-hero-glow cs-hero-glow-1" />
      <div className="cs-hero-glow cs-hero-glow-2" />

      <Container className="position-relative cs-hero-container py-5">
        <Row className="align-items-center">
          <Col lg="6" className="text-left mb-5 mb-lg-0">
            <div className="d-inline-flex align-items-center cs-hero-badge mb-3">
              <span className="cs-pulse-dot mr-2"></span>
              <span>CodeSphere 2.0 &bull; Cloud IDE & Collaborative Learning</span>
            </div>

            <h1 className="cs-hero-title mb-3">
              Code, Learn &amp; Build <br />
              <span className="cs-gradient-text">In Real Time.</span>
            </h1>

            <p className="cs-hero-subtitle mb-4">
              An open-source interactive learning platform with instant multi-language code execution, peer collaboration, and challenge curriculum authoring.
            </p>

            <div className="d-flex flex-wrap gap-3 mb-4">
              <Button
                tag={Link}
                to="/register"
                color="info"
                size="lg"
                className="cs-btn cs-btn-info px-4 py-3 mr-3 mb-2 font-weight-600"
              >
                Get Started Free &rarr;
              </Button>
              <Button
                tag={Link}
                to="/rooms/list"
                color="secondary"
                outline
                size="lg"
                className="cs-btn cs-btn-ghost px-4 py-3 mr-3 mb-2 font-weight-600"
              >
                <i className="fas fa-compass mr-2"></i> Explore Rooms
              </Button>
              <Button
                tag={Link}
                to="/ide"
                color="secondary"
                outline
                size="lg"
                className="cs-btn cs-btn-ghost px-4 py-3 mb-2 font-weight-600"
              >
                <i className="fas fa-terminal mr-2"></i> Open IDE
              </Button>
            </div>

            <div className="d-flex align-items-center gap-4 pt-2 text-muted small cs-hero-metrics">
              <div className="d-flex align-items-center mr-4">
                <i className="fas fa-bolt text-warning mr-2"></i>
                <span>Zero Install Required</span>
              </div>
              <div className="d-flex align-items-center mr-4">
                <i className="fas fa-users text-info mr-2"></i>
                <span>Live Peer Sync</span>
              </div>
              <div className="d-flex align-items-center">
                <i className="fas fa-shield-alt text-success mr-2"></i>
                <span>Isolated Sandbox</span>
              </div>
            </div>
          </Col>

          {/* Interactive Live Editor Showcase on Right */}
          <Col lg="6">
            <div className="cs-editor-preview shadow-2xl rounded-xl">
              {/* Editor Window Header */}
              <div className="cs-editor-header d-flex justify-content-between align-items-center px-3 py-2 border-bottom border-dark">
                <div className="d-flex align-items-center gap-2">
                  <span className="cs-window-control cs-window-close"></span>
                  <span className="cs-window-control cs-window-min"></span>
                  <span className="cs-window-control cs-window-max"></span>
                  <span className="text-muted small ml-2 font-mono">
                    codesphere://workspace
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Badge color="dark" className="cs-badge-pill">
                    <span className="cs-pulse-dot mr-1"></span> 3 Collaborators
                  </Badge>
                </div>
              </div>

              {/* Language Tabs */}
              <div className="cs-editor-tabs d-flex border-bottom border-dark">
                {Object.keys(snippets).map((key) => (
                  <button
                    key={key}
                    className={`cs-editor-tab ${
                      activeTab === key ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(key)}
                  >
                    <i className="fas fa-file-code mr-1"></i>
                    {snippets[key].file}
                  </button>
                ))}
              </div>

              {/* Code Pane */}
              <div className="cs-editor-body p-3 font-mono text-left">
                <pre className="m-0 text-white cs-code-content">
                  <code>{currentSnippet.code}</code>
                </pre>
              </div>

              {/* Editor Console Output */}
              <div className="cs-editor-console p-3 border-top border-dark font-mono text-left">
                <div className="d-flex justify-content-between align-items-center text-muted small mb-2">
                  <span>TERMINAL OUTPUT</span>
                  <span className="text-success small">Status: 200 OK</span>
                </div>
                <pre className="m-0 cs-console-text text-muted">
                  <code>{currentSnippet.output}</code>
                </pre>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default IndexHeader;
