import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { AuthProvider } from "context/auth.js";
import { AlertProvider } from "context/alert.js";

import ProtectedRoute from "components/Routes/ProtectedRoute.js";
import PublicOnlyRoute from "components/Routes/PublicOnlyRoute.js";

import "assets/css/bootstrap.min.css";
import "assets/scss/now-ui-kit.scss";
import "assets/demo/demo.css";
import "assets/scss/styles.scss";

import "../node_modules/highlight.js/styles/monokai-sublime.css";

import Index from "views/Index.js";
import LoginPage from "views/LoginPage.js";
import RegisterPage from "views/RegisterPage.js";
import LogoutPage from "views/LogoutPage.js";
import HomePage from "views/HomePage.js";
import ProfilePage from "views/ProfilePage.js";
import IDEPage from "views/IDEPage.js";

import CreatePage from "views/rooms/CreatePage.js";
import ViewPage from "views/rooms/ViewPage.js";
import ListPage from "views/rooms/ListPage.js";
import NotFoundPage from "views/NotFoundPage.js";

const root = createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <BrowserRouter>
      <AlertProvider>
        <Switch>
          <Route exact path="/" component={Index} />
          <PublicOnlyRoute exact path="/login" component={LoginPage} />
          <PublicOnlyRoute exact path="/register" component={RegisterPage} />
          <Route exact path="/logout" component={LogoutPage} />
          
          <ProtectedRoute exact path="/home" component={HomePage} />
          <ProtectedRoute exact path="/profile/:target?" component={ProfilePage} />
          <ProtectedRoute exact path="/ide" component={IDEPage} />
          <ProtectedRoute exact path="/rooms/list" component={ListPage} />
          <ProtectedRoute exact path="/rooms/create" component={CreatePage} />
          <ProtectedRoute exact path="/rooms/edit/:code" component={CreatePage} />
          <ProtectedRoute exact path="/rooms/view/:code" component={ViewPage} />
          
          <Route component={NotFoundPage} />
        </Switch>
      </AlertProvider>
    </BrowserRouter>
  </AuthProvider>
);
