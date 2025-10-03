import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("oauth2");

  return token ? element : <Navigate to="/" />;
};

export default PrivateRoute;
