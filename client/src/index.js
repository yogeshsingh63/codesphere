import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { AuthProvider } from "context/auth.js";
import { AlertProvider } from "context/alert.js";
import { ThemeProvider } from "context/theme.js";

import "assets/css/tailwind.css";
import "assets/css/tokens.css";
import "assets/css/vendor-compat.css";
import "assets/scss/styles.scss";

import "../node_modules/highlight.js/styles/monokai-sublime.css";

import Index from "views/Index.js";
import LoginPage from "views/LoginPage.js";
import RegisterPage from "views/RegisterPage.js";
import LogoutPage from "views/LogoutPage.js";
import HomePage from "views/HomePage.js";
import ProfilePage from "views/ProfilePage.js";
import IDEPage from "views/IDEPage.js";
import NotFoundPage from "views/NotFoundPage.js";
import PrivateRoute from "components/Routing/PrivateRoute.js";
import ErrorBoundary from "components/Routing/ErrorBoundary.js";

import CreatePage from "views/rooms/CreatePage.js";
import ViewPage from "views/rooms/ViewPage.js";
import ListPage from "views/rooms/ListPage.js";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AlertProvider>
            <ErrorBoundary>
              <a href="#main" className="cs-skip-link">Skip to content</a>
              <Switch>
                <Route
                  path="/login"
                  render={(props) => <LoginPage {...props} />}
                />
                <Route
                  path="/register"
                  render={(props) => <RegisterPage {...props} />}
                />
                <Route
                  path="/logout"
                  render={(props) => <LogoutPage {...props} />}
                />
                <PrivateRoute path="/home" component={HomePage} />
                <PrivateRoute path="/profile/:target?" component={ProfilePage} />
                <PrivateRoute path="/ide" component={IDEPage} />
                <PrivateRoute
                  path="/rooms/create"
                  component={CreatePage}
                />
                <PrivateRoute
                  path="/rooms/edit/:code"
                  component={CreatePage}
                />
                <PrivateRoute
                  path="/rooms/view/:code"
                  component={ViewPage}
                />
                <PrivateRoute
                  path="/rooms/list"
                  component={ListPage}
                />
                <Route exact path="/" render={(props) => <Index {...props} />} />
                <Route component={NotFoundPage} />
              </Switch>
            </ErrorBoundary>
          </AlertProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
