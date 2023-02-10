import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const FallbackPage = () => {
  const location = useLocation();

  return (
    <div>
      <p>404: page not found at &quot;{location.pathname}&quot;</p>
      <div>
        <NavLink to="/">Go home</NavLink>
      </div>
    </div>
  );
};

export default FallbackPage;
