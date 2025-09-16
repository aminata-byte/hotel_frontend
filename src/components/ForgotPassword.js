import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false); // 👈 nouvel état
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setShowResetForm(false);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/forgot-password",
        { email }
      );

      // Si succès → affiche message et attendre 3s avant de montrer reset form
      setMessage(res.data.message || "Email trouvé, préparez le reset...");
      setTimeout(() => setShowResetForm(true), 3000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Cet email n'existe pas dans notre base."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/reset-password", {
        email,
        password: newPassword,
      });
      setMessage("Mot de passe réinitialisé avec succès !");
      setShowResetForm(false);
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/login");
    } catch (error) {
      setMessage("Erreur lors de la réinitialisation.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Mot de passe oublié ?</h2>
        {!showResetForm ? (
          <>
            <p>Entrez votre adresse e-mail pour vérifier son existence.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Vérification..." : "Vérifier l'email"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p>Veuillez entrer votre nouveau mot de passe.</p>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Réinitialiser</button>
            </form>
          </>
        )}

        <div className="separator"></div>
        <p>
          <Link to="/login">Retour à la connexion</Link>
        </p>
        {message && <div className="info-message">{message}</div>}
      </div>
    </div>
  );
};

export default ForgotPassword;
