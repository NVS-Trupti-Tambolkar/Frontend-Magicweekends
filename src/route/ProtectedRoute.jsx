// src/components/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
// import { Vortex } from "react-loader-spinner";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  console.log("User in ProtectedRoute:", user);

  if (loading) {
    return (
      //     <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-700 opacity-50 flex justify-center items-center z-10">
      //       <Vortex
      //         visible={true}
      //         height="80"
      //         width="80"
      //         ariaLabel="vortex-loading"
      //         wrapperStyle={{}}
      //         wrapperClass="vortex-wrapper"
      //         colors={["black", "gray", "black", "gray", "black", "gray"]}
      //       />
      //     </div>
      <span>Loading...</span>
    ); // Show loading indicator
  }

  if (!user) {
    console.log("User not authenticated");

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
};

export default ProtectedRoute;
