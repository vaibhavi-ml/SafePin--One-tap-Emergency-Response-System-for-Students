import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pass);

      if (email.includes("warden")) {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError("Invalid login.");
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: "80px auto" }}>
      <h2>Login</h2>

      <form onSubmit={loginUser}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <button style={{ width: "100%" }}>Login</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
