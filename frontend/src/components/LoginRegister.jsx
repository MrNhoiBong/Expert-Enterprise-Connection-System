import { useState } from "react";
import { login, register } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function LoginRegister() {
  const [role, setRole] = useState("expert");       // role mặc định
  const [mode, setMode] = useState("login");        // chế độ mặc định
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      let res;
      if (mode === "login") {
        res = await login(role, form);
      } else {
        res = await register(role, form);
      }

      // giả sử backend trả về { token: "...", user: {...} }
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", role);
      }

      // sau khi login/register thành công → chuyển hướng
      navigate(`/dashboard/${role}`);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Login / Register</h1>

      {/* chọn role */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="mb-2 p-2 border rounded"
      >
        <option value="expert">Expert</option>
        <option value="enterprise">Enterprise</option>
        <option value="foundation">Foundation</option>
      </select>

      {/* chọn chế độ */}
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="mb-2 p-2 border rounded"
      >
        <option value="login">Login</option>
        <option value="register">Register</option>
      </select>

      {/* input email */}
      <input
        type="email"
        placeholder="Email"
        className="mb-2 p-2 border rounded w-64"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      {/* input password */}
      <input
        type="password"
        placeholder="Password"
        className="mb-2 p-2 border rounded w-64"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      {/* nút submit */}
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {mode === "login" ? "Login" : "Register"}
      </button>
    </div>
  );
}
