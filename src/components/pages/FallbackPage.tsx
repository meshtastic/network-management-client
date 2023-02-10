import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const FallbackPage = () => {
  const location = useLocation();

  return (
    <div className="flex flex-1 flex-col justify-center align-middle bg-gray-100">
      <div className="m-auto text-gray-600 text-center">
        <p>Could not find page at &quot;{location.pathname}&quot;</p>
        <NavLink className="underline" to="/">
          Go home
        </NavLink>
      </div>
    </div>
  );
};

export default FallbackPage;
