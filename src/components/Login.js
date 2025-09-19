import React, { useState } from "react";
import { authAPI } from "../services/api";
import "./AuthForm.css";

const Login = ({ switchToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await authAPI.login(formData);

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Option 1: Utiliser une fonction callback passée en props
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          // Option 2: Redirection directe
          window.location.href = "/dashboard";
        }

        // Optionnel: garder l'alerte pour confirmer
        // alert("Connexion réussie ! Bienvenue " + response.data.user.name);
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: "Email ou mot de passe incorrect" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <div>
          <h2>Connexion</h2>
          <p>Accédez à votre espace hôtelier</p>

          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div>
              <label>Adresse email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <span className="error">{errors.email[0]}</span>}
            </div>

            <div>
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <span className="error">{errors.password[0]}</span>
              )}
            </div>

            {/* AJOUTEZ CE BLOC POUR LE LIEN "MOT DE PASSE OUBLIÉ" */}
            <div>
              <a href="/forgot-password">Mot de passe oublié ?</a>
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div>
            Pas encore de compte ?{" "}
            <button type="button" onClick={switchToRegister}>
              S'inscrire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
