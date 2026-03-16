import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import LoginRegister from "./components/LoginRegister";
import Dashboard from "./components/Dashboard";
import NotFound from "./pages/NotFound";

function App() {
  // kiểm tra trạng thái login từ localStorage
  const isLoggedIn = !!localStorage.getItem("token"); 
  // giả sử backend trả về token khi login thành công và ta lưu vào localStorage

  return (
    <Router>
      <Routes>
        {/* Khi truy cập "/" thì check login */}
        <Route
          path="/"
          element={isLoggedIn ? <Home /> : <Navigate to="/auth" />}
        />
        <Route path="/auth" element={<LoginRegister />} />
        <Route path="/dashboard/:role" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
