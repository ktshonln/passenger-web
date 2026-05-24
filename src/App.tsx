import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./MainLayout";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import InternalError from "./pages/InternalError";
import Forbidden from "./pages/Forbidden";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Wallet from "./pages/Wallet";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="signup" element={<Signup />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
            <Route path="wallet" element={<Wallet />} />
          </Route>

          <Route path="trips" element={<Trips />} />
          <Route path="trips/:id" element={<TripDetail />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="cookies" element={<Cookies />} />
        </Route>
        <Route path="500" element={<InternalError />} />
        <Route path="403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
