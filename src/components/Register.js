import React, { useState } from "react";
import { authAPI } from "../services/api";
import "./AuthForm.css";

const Register = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Effacer l'erreur du champ quand l'utilisateur commence à taper
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
    setSuccessMessage("");

    // Validation simple côté client
    if (formData.password !== formData.password_confirmation) {
      setErrors({
        password_confirmation: "Les mots de passe ne correspondent pas",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Préparer les données pour l'API (sans password_confirmation)
      const apiData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      const response = await authAPI.register(apiData);

      if (response.status === 201) {
        setSuccessMessage(
          "Inscription réussie ! Vous pouvez maintenant vous connecter."
        );
        // Réinitialiser le formulaire
        setFormData({
          name: "",
          email: "",
          password: "",
          password_confirmation: "",
        });

        // Basculer automatiquement vers le login après 2 secondes
        setTimeout(() => {
          switchToLogin();
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response && error.response.data.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "Une erreur est survenue. Veuillez réessayer." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Créer un compte</h2>
        <p className="auth-subtitle">Rejoignez notre plateforme hôtelière</p>

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        {errors.general && (
          <div className="alert alert-error">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
              required
            />
            {errors.name && (
              <span className="error-message">{errors.name[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              required
            />
            {errors.email && (
              <span className="error-message">{errors.email[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              required
            />
            {errors.password && (
              <span className="error-message">{errors.password[0]}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password_confirmation">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className={errors.password_confirmation ? "error" : ""}
              required
            />
            {errors.password_confirmation && (
              <span className="error-message">
                {typeof errors.password_confirmation === "string"
                  ? errors.password_confirmation
                  : errors.password_confirmation[0]}
              </span>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>

        <p className="auth-switch">
          Vous avez déjà un compte?
          <button type="button" onClick={switchToLogin} className="link-button">
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
