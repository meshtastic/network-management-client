import React from "react";
import { NavLink } from "react-router-dom";

const FallbackPage = () => (
  <div>
    <p>404: page not found :/</p>
    <div>
      <NavLink to="/">Go home</NavLink>
    </div>
  </div>
);

export default FallbackPage;
