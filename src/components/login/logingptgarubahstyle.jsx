import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css"; // Scoped CSS untuk halaman login

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "" || password === "") {
      toast.error("Email and Password are required!");
      return;
    }

    // Simulasi login sukses
    toast.success("Login Successful!");
    setEmail("");
    setPassword("");
  };

  const handleRegister = () => {
    toast.info("Registration functionality coming soon!");
  };

  return (
    <div className="login-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className="btn login-btn">Login</button>
        <button type="button" className="btn register-btn" onClick={handleRegister}>
          Register
        </button>
      </form>
    </div>
  );
};

export default Login;
