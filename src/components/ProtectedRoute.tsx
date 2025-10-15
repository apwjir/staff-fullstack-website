import React, { useEffect, useState } from "react";
import { Spin, Layout } from "antd";
import { useAuth } from "./AuthProvider";
import LoginPage from "./LoginPage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [verifying, setVerifying] = useState(true);

  // Show loading while initial auth check or verification is happening
  if (loading || verifying) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f0f2f5",
        }}
      >
        <Spin size="large" />
      </Layout>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
