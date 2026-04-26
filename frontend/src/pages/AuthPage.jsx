import { useState } from "react";
import { loginUser, registerUser } from "../services/authApi";

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function switchMode(nextMode) {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "register") {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long.");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        await registerUser({
          email: normalizedEmail,
          password,
        });

        setSuccessMessage("Account created. Signing you in...");
      }

      const loginResult = await loginUser({
        email: normalizedEmail,
        password,
      });

      onAuthSuccess(loginResult.access_token, loginResult.user);
    } catch (error) {
      setErrorMessage(error.message || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Secure Access</p>
        <h1 className="page-title auth-title">System-Aware Smart Scheduler</h1>
        <p className="section-text">
          Create an account or sign in to access your personal tasks and
          schedules.
        </p>

        <div className="auth-toggle-row">
          <button
            type="button"
            className={
              mode === "login"
                ? "auth-toggle-button active"
                : "auth-toggle-button"
            }
            onClick={() => switchMode("login")}
          >
            Login
          </button>

          <button
            type="button"
            className={
              mode === "register"
                ? "auth-toggle-button active"
                : "auth-toggle-button"
            }
            onClick={() => switchMode("register")}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-grid">
            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
              />
            </label>

            <label className="form-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>

            {mode === "register" ? (
              <label className="form-field">
                <span>Confirm Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </label>
            ) : null}
          </div>

          <div className="form-actions">
            <button className="action-button" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "login"
                  ? "Signing In..."
                  : "Creating Account..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>

            {successMessage ? <p className="success-text">{successMessage}</p> : null}
          </div>

          {errorMessage ? <p className="error-text auth-error">{errorMessage}</p> : null}
        </form>
      </div>
    </div>
  );
}