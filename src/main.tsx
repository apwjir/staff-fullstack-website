import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Dashboard from "./pages/Dashboard.tsx";
import Setting from "./pages/Setting.tsx";
import Order from "./pages/Order.tsx";
import Billing from "./pages/Billing.tsx";
import Navbar from "./components/Nav.tsx";

function Layout() {
  return (
    <div>
      <Navbar /> {/* จะโชว์ทุกหน้า */}
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Layout จะหุ้มทุกหน้า
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
    <RouterProvider router={router} />
  </StrictMode>
);
