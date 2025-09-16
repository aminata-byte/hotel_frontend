import React, { useEffect, useState } from "react";
import axios from "axios";
import HotelFormModal from "./HotelFormModal";

// URL de l'API alignée avec App.js
const API_BASE_URL = "http://127.0.0.1:8000/api";

const Dashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [hotels, setHotels] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    formulaires: 0,
    messages: 0,
    utilisateurs: 0,
    emails: 0,
    hotels: 0,
    entites: 0,
  });

  // Fonction pour récupérer les informations de l'utilisateur
  const fetchUser = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Vous devez être connecté pour accéder au tableau de bord.");
      onLogout();
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      setError(
        "Impossible de charger les informations de l'utilisateur : " +
          (error.response?.data?.message || error.message)
      );
      onLogout();
    }
  };

  // Fonction pour récupérer la liste des hôtels
  const fetchHotels = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Vous devez être connecté pour voir vos hôtels.");
      onLogout();
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/my-hotels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(response.data);
      setStats((prev) => ({ ...prev, hotels: response.data.length }));
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la récupération des hôtels:", error);
      const errorMessage =
        error.response?.data?.message || "Impossible de charger les hôtels.";
      setError(errorMessage);
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer les autres statistiques (exemple générique)
  const fetchStats = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Vous devez être connecté pour voir les statistiques.");
      return;
    }
    try {
      // Exemple : Appels API pour récupérer formulaires, messages, utilisateurs, emails, entités
      // Remplace ces URLs par les endpoints réels de ton API
      const endpoints = [
        { key: "formulaires", url: `${API_BASE_URL}/forms` },
        { key: "messages", url: `${API_BASE_URL}/messages` },
        { key: "utilisateurs", url: `${API_BASE_URL}/users` },
        { key: "emails", url: `${API_BASE_URL}/emails` },
        { key: "entites", url: `${API_BASE_URL}/entities` },
      ];

      const promises = endpoints.map(({ key, url }) =>
        axios
          .get(url, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => ({ key, count: response.data.length || 0 }))
          .catch((error) => {
            console.error(`Erreur lors de la récupération de ${key}:`, error);
            return { key, count: 0 }; // Valeur par défaut en cas d'erreur
          })
      );

      const results = await Promise.all(promises);
      const newStats = results.reduce(
        (acc, { key, count }) => ({ ...acc, [key]: count }),
        { ...stats, hotels: stats.hotels } // Conserver la valeur des hôtels
      );

      setStats(newStats);
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
      setError("Impossible de charger certaines statistiques.");
    }
  };

  // Fonction pour créer un hôtel
  const handleCreateHotel = async (hotelData, setModalError) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setModalError("Vous devez être connecté pour créer un hôtel.");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/hotels`, hotelData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Nouvel hôtel créé :", response.data);
      await fetchHotels(); // Recharger les hôtels
      setIsModalOpen(false);
      setModalError(null);
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la création de l'hôtel:", error);
      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(", ")
        : error.response?.data?.message || "Échec de la création de l'hôtel.";
      setModalError(errorMessage);
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Charger les données au démarrage ou lorsque la section change
  useEffect(() => {
    fetchUser();
    fetchStats(); // Charger les stats pour le dashboard
    if (activeSection === "hotels") {
      fetchHotels();
    }
  }, [activeSection]);

  const handleAddHotelClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div>
            <div className="welcome-section">
              <h2>Bienvenue sur Hotel Manager, ami !</h2>
              <p>"L'hospitalité est la première des richesses"</p>
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="stats-grid">
              <div className="stat-card purple">
                <div className="stat-icon">📄</div>
                <div className="stat-info">
                  <h3>{stats.formulaires}</h3>
                  <p>Formulaires</p>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon">💬</div>
                <div className="stat-info">
                  <h3>{stats.messages}</h3>
                  <p>Messages</p>
                </div>
              </div>
              <div className="stat-card orange">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.utilisateurs}</h3>
                  <p>Utilisateurs</p>
                </div>
              </div>
              <div className="stat-card red">
                <div className="stat-icon">✉️</div>
                <div className="stat-info">
                  <h3>{stats.emails}</h3>
                  <p>E-mails</p>
                </div>
              </div>
              <div className="stat-card blue">
                <div className="stat-icon">🏨</div>
                <div className="stat-info">
                  <h3>{stats.hotels}</h3>
                  <p>Hôtels</p>
                </div>
              </div>
              <div className="stat-card indigo">
                <div className="stat-icon">🏢</div>
                <div className="stat-info">
                  <h3>{stats.entites}</h3>
                  <p>Entités</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "hotels":
        return (
          <div>
            <div className="section-header">
              <h2>Liste des Hôtels</h2>
              <button className="add-hotel-btn" onClick={handleAddHotelClick}>
                + Ajouter un Hôtel
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="hotels-list">
              {isLoading ? (
                <p>Chargement des hôtels...</p>
              ) : hotels.length === 0 ? (
                <p>Aucun hôtel disponible.</p>
              ) : (
                hotels.map((hotel) => (
                  <div key={hotel.id} className="hotel-card-detail">
                    {hotel.photo && (
                      <div className="hotel-photo-container">
                        <img
                          src={`http://127.0.0.1:8000/storage/${
                            hotel.photo
                          }?t=${new Date().getTime()}`}
                          alt={`Photo de ${hotel.name}`}
                          className="hotel-photo"
                          onError={(e) => {
                            console.error(
                              `Erreur de chargement de l'image pour ${hotel.name}: ${e}`
                            );
                            e.target.src = "/placeholder-image.jpg"; // Image de secours
                          }}
                        />
                      </div>
                    )}
                    <div className="hotel-header">
                      <h3>{hotel.name}</h3>
                      <span
                        className={`hotel-status ${
                          hotel.is_active ? "active" : "inactive"
                        }`}
                      >
                        {hotel.is_active ? "🟢 Actif" : "🔴 Inactif"}
                      </span>
                    </div>
                    <p className="hotel-info">📍 {hotel.address}</p>
                    <p className="hotel-info">📧 {hotel.email}</p>
                    <p className="hotel-info">📞 {hotel.phone_number}</p>
                    <p className="hotel-info">
                      💰 {hotel.price_per_night} {hotel.currency}/nuit
                    </p>
                    <div className="hotel-actions">
                      <button className="btn-edit">Modifier</button>
                      <button className="btn-delete">Supprimer</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="welcome-section">
            <h2>Sélectionnez une section</h2>
            <p>Choisissez une option dans le menu</p>
          </div>
        );
    }
  };

  return (
    <div className="modern-dashboard-container">
      <div className="modern-sidebar">
        <div className="sidebar-header">
          <h2>HOTEL MANAGER</h2>
        </div>
        <nav className="sidebar-menu">
          <button
            className={`menu-item ${
              activeSection === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            <span className="menu-icon">📊</span> Dashboard
          </button>
          <button
            className={`menu-item ${
              activeSection === "hotels" ? "active" : ""
            }`}
            onClick={() => setActiveSection("hotels")}
          >
            <span className="menu-icon">🏨</span> Liste des Hôtels
          </button>
        </nav>
        <div className="sidebar-footer">
          {user && (
            <div className="user-profile">
              <div className="user-avatar-text">
                {user.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="user-info">
                <p className="user-name">
                  {user.name
                    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
                    : "Utilisateur"}
                </p>
                <small className="user-role">
                  {user.role || "Administrateur"}
                </small>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <span className="menu-icon">🚪</span> Déconnexion
          </button>
        </div>
      </div>
      <div className="main-content">{renderContent()}</div>
      {isModalOpen && (
        <HotelFormModal
          onClose={handleCloseModal}
          onCreate={handleCreateHotel}
        />
      )}
      <style jsx>{`
        .modern-dashboard-container {
          display: flex;
          min-height: 100vh;
          background-color: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }
        .modern-sidebar {
          width: 280px;
          background-color: #2d3748;
          color: white;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .sidebar-header {
          padding: 2rem 2rem 1.5rem 2rem;
          border-bottom: 1px solid #4a5568;
        }
        .sidebar-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
        }
        .sidebar-menu {
          flex: 1;
          padding: 1rem 0;
        }
        .menu-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 1rem 2rem;
          background: none;
          border: none;
          color: #cbd5e0;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          margin-bottom: 0.5rem;
        }
        .menu-item:hover {
          background-color: #4a5568;
          color: white;
        }
        .menu-item.active {
          background-color: #3182ce;
          color: white;
          border-right: 4px solid #63b3ed;
        }
        .menu-icon {
          margin-right: 0.75rem;
          font-size: 1.2rem;
        }
        .sidebar-footer {
          margin-top: auto;
          padding: 1rem 0;
        }
        .user-profile {
          display: flex;
          align-items: center;
          padding: 1rem 2rem;
          background-color: #1a202c;
          border-top: 1px solid #4a5568;
          border-bottom: 1px solid #4a5568;
        }
        .user-avatar-text {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 0.75rem;
          background-color: #667eea;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          border: 2px solid #4a5568;
        }
        .user-info {
          display: flex;
          flex-direction: column;
        }
        .user-name {
          font-weight: bold;
          font-size: 0.9rem;
          margin: 0;
          color: #fff;
        }
        .user-role {
          font-size: 0.75rem;
          color: #a0aec0;
          margin: 0;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 1rem 2rem;
          background: none;
          border: none;
          color: #cbd5e0;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .logout-btn:hover {
          background-color: #e53e3e;
          color: white;
        }
        .main-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }
        .welcome-section {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
        }
        .welcome-section h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
          font-weight: 700;
        }
        .welcome-section p {
          margin: 0;
          font-size: 1rem;
          opacity: 0.9;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-left: 4px solid;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }
        .stat-card.purple {
          border-left-color: #9f7aea;
        }
        .stat-card.green {
          border-left-color: #48bb78;
        }
        .stat-card.orange {
          border-left-color: #ed8936;
        }
        .stat-card.red {
          border-left-color: #e53e3e;
        }
        .stat-card.blue {
          border-left-color: #3182ce;
        }
        .stat-card.indigo {
          border-left-color: #667eea;
        }
        .stat-icon {
          font-size: 2rem;
          margin-right: 1rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: #f7fafc;
        }
        .stat-info h3 {
          margin: 0 0 0.25rem 0;
          font-size: 2rem;
          font-weight: 700;
          color: #2d3748;
        }
        .stat-info p {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #4a5568;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .section-header h2 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
          color: #2d3748;
        }
        .add-hotel-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .add-hotel-btn:hover {
          transform: translateY(-2px);
        }
        .hotels-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .hotel-card-detail {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hotel-card-detail:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }
        .hotel-photo-container {
          margin: -1rem -1rem 0.75rem -1rem;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          overflow: hidden;
          height: 120px;
        }
        .hotel-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }
        .hotel-card-detail:hover .hotel-photo {
          transform: scale(1.05);
        }
        .hotel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .hotel-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #2d3748;
        }
        .hotel-status {
          font-size: 0.7rem;
          padding: 0.2rem 0.4rem;
          border-radius: 12px;
        }
        .hotel-status.active {
          background-color: #f0fff4;
          color: #38a169;
        }
        .hotel-status.inactive {
          background-color: #fed7d7;
          color: #e53e3e;
        }
        .hotel-info {
          margin: 0.3rem 0;
          color: #4a5568;
          font-size: 0.8rem;
        }
        .hotel-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .btn-edit,
        .btn-delete {
          padding: 0.3rem 0.6rem;
          border: 1px solid #e2e8f0;
          background: white;
          color: #4a5568;
          border-radius: 5px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-edit:hover {
          background: #38a169;
          color: white;
          border-color: #38a169;
        }
        .btn-delete:hover {
          background: #e53e3e;
          color: white;
          border-color: #e53e3e;
        }
        .error-message {
          color: #e53e3e;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          text-align: center;
        }
        @media (max-width: 1024px) {
          .hotels-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .modern-dashboard-container {
            flex-direction: column;
          }
          .modern-sidebar {
            width: 100%;
            position: relative;
          }
          .main-content {
            padding: 1rem;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .hotels-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
