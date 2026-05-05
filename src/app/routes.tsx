import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Dashboard } from "./pages/Dashboard";
import { Record } from "./pages/Record";
import { Timeline } from "./pages/Timeline";
import { Vault } from "./pages/Vault";
import { Share } from "./pages/Share";
import { Profile } from "./pages/Profile";
import { DashboardLayout } from "./components/DashboardLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/app",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "record",
        element: <Record />,
      },
      {
        path: "timeline",
        element: <Timeline />,
      },
      {
        path: "vault",
        element: <Vault />,
      },
      {
        path: "share",
        element: <Share />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
]);
