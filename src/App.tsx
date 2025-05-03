import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./MainLayout";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Routes>
      <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="signup" element={<Signup />} />
      <Route path="login" element={<Login />} />
      <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<NotFound />} />
      </Routes>
      </BrowserRouter> 
     
    </div>
  );
};

export default App;
