import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import ForgotPassword from "./components/ForgotPassword";
import "./App.css";

// Composant pour la logique de connexion/inscription
const AuthComponent = ({
  isLogin,
  setIsLogin,
  handleLogin,
  handleRegister,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  registerName,
  setRegisterName,
  registerEmail,
  setRegisterEmail,
  registerPassword,
  setRegisterPassword,
  acceptTerms,
  setAcceptTerms,
  message,
  isLoading,
}) => {
  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="red-product-header">
          <h1>RED PRODUCT</h1>
        </div>

        {isLogin ? (
          <>
            <div className="login-section">
              <h2>Inscrivez-vous en tant que Admin</h2>
              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label>Nom :</label>
                  <input
                    type="text"
                    placeholder="Votre nom complet"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>E-mail :</label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe :</label>
                  <input
                    type="password"
                    placeholder="Votre mot de passe"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <p className="forgot-password-link">
                  <Link to="/forgot-password" className="link-button">
                    Mot de passe oublié ?
                  </Link>
                </p>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="login-submit-button"
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </button>
              </form>
              <div className="separator"></div>
              <p className="register-redirect">
                Vous n'avez pas de compte?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="link-button"
                >
                  S'inscrire
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <h2>S'inscrire</h2>
            <form onSubmit={handleRegister} className="register-form">
              <div className="form-group">
                <label>Nom :</label>
                <input
                  type="text"
                  placeholder="Votre nom complet"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>E-mail :</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe :</label>
                <input
                  type="password"
                  placeholder="Créez un mot de passe"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>
              <div className="terms-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Accepter les termes et la politique
                </label>
              </div>
              <div className="separator"></div>
              <button
                type="submit"
                disabled={isLoading}
                className="register-button"
              >
                {isLoading ? "Inscription..." : "S'inscrire"}
              </button>
              <div className="separator"></div>
              <p className="login-redirect">Vous avez déjà un compte ?</p>
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="login-button"
              >
                Se connecter
              </button>
            </form>
          </>
        )}

        {message && (
          <div
            className={
              message.includes("✅") ? "message-success" : "message-error"
            }
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

// Composant App principal
function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", {
        email: loginEmail,
        password: loginPassword,
      });
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setIsAuthenticated(true);
      setMessage("✅ Connexion réussie ! Bienvenue " + res.data.user.name);
    } catch (err) {
      setMessage("❌ Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    if (!acceptTerms) {
      setMessage("❌ Veuillez accepter les termes et la politique");
      setIsLoading(false);
      return;
    }
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/register", {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });
      setMessage(
        "✅ Inscription réussie ! Vous pouvez maintenant vous connecter."
      );
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setAcceptTerms(false);
      setIsLogin(true);
    } catch (err) {
      setMessage("❌ Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setMessage("");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <AuthComponent
                isLogin={isLogin}
                setIsLogin={setIsLogin}
                handleLogin={handleLogin}
                handleRegister={handleRegister}
                loginEmail={loginEmail}
                setLoginEmail={setLoginEmail}
                loginPassword={loginPassword}
                setLoginPassword={setLoginPassword}
                registerName={registerName}
                setRegisterName={setRegisterName}
                registerEmail={registerEmail}
                setRegisterEmail={setRegisterEmail}
                registerPassword={registerPassword}
                setRegisterPassword={setRegisterPassword}
                acceptTerms={acceptTerms}
                setAcceptTerms={setAcceptTerms}
                message={message}
                isLoading={isLoading}
              />
            )
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
