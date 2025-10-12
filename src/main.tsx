import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.tsx";
import Setting from "./pages/Setting.tsx";
import Order from "./pages/Order.tsx";
import Billing from "./pages/Billing.tsx";
import Navbar from "./components/Nav.tsx";
import LoginPage from "./components/LoginPage.tsx";
import AuthProvider, { useAuth } from "./components/AuthProvider.tsx";
import { ConfigProvider, App } from 'antd';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Layout with Authentication Check
export function Layout() {
  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <Outlet />
      </div>
    </ProtectedRoute>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "billing", element: <Billing /> },
      { path: "order", element: <Order /> },
      { path: "setting", element: <Setting /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1c1919ff',
          borderRadius: 8,
        },
      }}
    >
      <App>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </App>
    </ConfigProvider>
  </StrictMode>
);
