import React from "react";
import asset from "utils/asset.js";
import { Link } from "react-router-dom"; 
import { useAuthState } from "context/auth.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import IndexHeader from "components/Headers/IndexHeader.js";
import DarkFooter from "components/Footers/DarkFooter.js";
import SignUp from "components/Form/SignUp.js";

function Index() {
  const { isSignedIn } = useAuthState();

  React.useEffect(() => {
    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
      <Navbar />
      <div className="wrapper bg-stone-50">
        <IndexHeader />
        
        <main className="main">
          {/* Section 1: Features */}
          <div className="py-20 bg-white border-b border-stone-200/50">
            <div className="container mx-auto px-6 flex flex-col gap-16">
              
              {/* Row 1: Interactive Shared Sandboxes */}
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div className="w-full lg:w-1/2">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-6">
                    Interactive Shared Sandboxes
                  </h2>
                  <p className="text-stone-600 leading-relaxed text-base md:text-lg">
                    CodeSphere connects creators, instructors, and developers through active terminals, allowing real-time inspection, shared editor sessions, and interactive debugging. Invite peers or instructors directly to your workspace to debug in real-time.
                  </p>
                </div>
                <div className="w-full lg:w-1/2 flex justify-center">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/40 shadow-sm max-w-lg w-full">
                    <img
                      alt="Real-time Collaboration"
                      src={asset("assets/img/code-collab.svg")}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Custom Programming Curriculums */}
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div className="w-full lg:w-1/2 lg:order-2">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mb-6">
                    Custom Programming Curriculums
                  </h2>
                  <p className="text-stone-600 leading-relaxed text-base md:text-lg">
                    Design coding challenges, author markdown tutorials, and organize coding sections. CodeSphere offers robust toolsets to launch, share, and track custom programming paths for groups or classrooms.
                  </p>
                </div>
                <div className="w-full lg:w-1/2 lg:order-1 flex justify-center">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/40 shadow-sm max-w-lg w-full">
                    <img
                      alt="Custom Courses & Challenges"
                      src={asset("assets/img/code-version-control.svg")}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Bottom CTA */}
          <div className="py-24 bg-[#faf9f6] border-b border-stone-200/50">
            <div className="container mx-auto px-6 text-center max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-6">
                {isSignedIn ? "Your Workspace is Ready" : "Set Up Your Collaborative Room"}
              </h2>
              <p className="text-stone-650 text-base md:text-lg mb-10 leading-relaxed">
                {isSignedIn
                  ? "Continue building challenges, collaborating with peers, or managing your coding classrooms from your dashboard."
                  : "Create an interactive space in seconds. Author coding rooms, pair-program with peers, and tackle programming challenges together in the browser."}
              </p>
              
              {isSignedIn ? (
                <Link
                  to="/home"
                  className="inline-flex items-center gap-2 bg-[#c2410c] hover:bg-[#a13207] text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Go to Dashboard &rarr;
                </Link>
              ) : (
                <div className="flex justify-center gap-4">
                  <Link
                    to="/register"
                    className="bg-[#c2410c] hover:bg-[#a13207] text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    className="border border-[#c2410c] text-[#c2410c] hover:bg-stone-100/50 font-semibold px-8 py-4 rounded-xl transition-all"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div> 
          </div>

          {/* Section 3: Conditional SignUp Card */}
          {!isSignedIn && (
            <div
              className="py-20 bg-[#faf9f6] flex items-center justify-center border-b border-stone-200/50"
              id="signup"
            >
              <div className="container mx-auto px-6 flex justify-center">
                <div className="w-full max-w-md">
                  <SignUp />
                </div>
              </div>
            </div>
          )}
        </main>
        
        <DarkFooter />
      </div>
    </>
  );
}

export default Index;
