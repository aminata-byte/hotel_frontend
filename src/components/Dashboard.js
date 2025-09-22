import React, { useEffect, useState } from "react";
import axios from "axios";
import { authAPI, hotelsAPI, statsAPI, API_BASE_URL } from "../services/api";
import HotelFormModal from "./HotelFormModal";

const Dashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [hotels, setHotels] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
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
    try {
      const response = await authAPI.getCurrentUser();
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
    try {
      setIsLoading(true);
      const response = await hotelsAPI.getMyHotels();
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

  // Fonction pour récupérer les autres statistiques (appels API réels)
  const fetchStats = async () => {
    try {
      // Appels API pour récupérer les vraies données
      const endpoints = [
        { key: "formulaires", apiCall: statsAPI.getForms },
        { key: "messages", apiCall: statsAPI.getMessages },
        { key: "utilisateurs", apiCall: statsAPI.getUsers },
        { key: "emails", apiCall: statsAPI.getEmails },
        { key: "entites", apiCall: statsAPI.getEntities },
      ];

      const promises = endpoints.map(({ key, apiCall }) =>
        apiCall()
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
    try {
      const response = await hotelsAPI.createHotel(hotelData);
      console.log("Nouvel hôtel créé :", response.data);
      await fetchHotels(); // Recharger les hôtels
      setIsModalOpen(false);
      setEditingHotel(null);
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

  // Fonction pour modifier un hôtel
  const handleEditHotel = (hotelId) => {
    const hotel = hotels.find((h) => h.id === hotelId);
    setEditingHotel(hotel);
    setIsModalOpen(true);
  };

  // Fonction pour mettre à jour un hôtel
  const handleUpdateHotel = async (hotelId, hotelData, setModalError) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setModalError("Vous devez être connecté pour modifier un hôtel.");
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/hotels/${hotelId}?_method=PUT`,
        hotelData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Hôtel modifié :", response.data);
      await fetchHotels(); // Recharger les hôtels
      setIsModalOpen(false);
      setEditingHotel(null);
      setModalError(null);
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la modification de l'hôtel:", error);
      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(", ")
        : error.response?.data?.message ||
          "Échec de la modification de l'hôtel.";
      setModalError(errorMessage);
    }
  };

  // Fonction pour supprimer un hôtel
  const handleDeleteHotel = async (hotelId, hotelName) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer l'hôtel "${hotelName}" ?`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Vous devez être connecté pour supprimer un hôtel.");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(`Hôtel ${hotelName} supprimé avec succès`);
      await fetchHotels(); // Recharger la liste des hôtels
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'hôtel:", error);
      const errorMessage =
        error.response?.data?.message || "Impossible de supprimer l'hôtel.";
      setError(errorMessage);
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
    fetchHotels(); // Charger les hôtels automatiquement au démarrage
  }, []);

  // Recharger les hôtels quand on change de section vers "hotels"
  useEffect(() => {
    if (activeSection === "hotels") {
      fetchHotels();
    }
  }, [activeSection]);

  const handleAddHotelClick = () => {
    setEditingHotel(null); // Reset l'hôtel en cours d'édition
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHotel(null);
    setError(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div>
            <div className="welcome-section">
              <h2>Bienvenue sur Hotel Manager</h2>
              <p>Tableau de bord administrateur</p>
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-info">
                  <h3>{stats.formulaires}</h3>
                  <p>Formulaires</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💬</div>
                <div className="stat-info">
                  <h3>{stats.messages}</h3>
                  <p>Messages</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.utilisateurs}</h3>
                  <p>Utilisateurs</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✉️</div>
                <div className="stat-info">
                  <h3>{stats.emails}</h3>
                  <p>E-mails</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏨</div>
                <div className="stat-info">
                  <h3>{stats.hotels}</h3>
                  <p>Hôtels</p>
                </div>
              </div>
              <div className="stat-card">
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
                          src={`${API_BASE_URL}/storage/${
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
                      <button
                        className="btn-edit"
                        onClick={() => handleEditHotel(hotel.id)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteHotel(hotel.id, hotel.name)}
                      >
                        Supprimer
                      </button>
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
          onUpdate={handleUpdateHotel}
          editingHotel={editingHotel}
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
          background-color: #494646ff;
          color: white;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .sidebar-header {
          padding: 2rem 2rem 1.5rem 2rem;
          border-bottom: 1px solid #333;
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
          color: #ccc;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          margin-bottom: 0.5rem;
        }
        .menu-item:hover {
          background-color: #333;
          color: white;
        }
        .menu-item.active {
          background-color: #444;
          color: white;
          border-right: 4px solid #666;
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
          background-color: #111;
          border-top: 1px solid #333;
          border-bottom: 1px solid #333;
        }
        .user-avatar-text {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 0.75rem;
          background-color: #666;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          border: 2px solid #444;
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
          color: #999;
          margin: 0;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 1rem 2rem;
          background: none;
          border: none;
          color: #ccc;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .logout-btn:hover {
          background-color: #333;
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
          background: #f9f9f9;
          color: #333;
          border-radius: 12px;
          border: 1px solid #e1e5e9;
        }
        .welcome-section h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
          font-weight: 700;
          color: #111;
        }
        .welcome-section p {
          margin: 0;
          font-size: 1rem;
          opacity: 0.8;
          color: #666;
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
          border-left: 4px solid #ddd;
          border: 1px solid #e1e5e9;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          border-left-color: #999;
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
          background-color: #f2f2f2;
          color: #333;
        }
        .stat-info h3 {
          margin: 0 0 0.25rem 0;
          font-size: 2rem;
          font-weight: 700;
          color: #111;
        }
        .stat-info p {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #666;
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
          color: #111;
        }
        .add-hotel-btn {
          background: #111;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .add-hotel-btn:hover {
          background: #333;
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
          border: 1px solid #e1e5e9;
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
          color: #111;
        }
        .hotel-status {
          font-size: 0.7rem;
          padding: 0.2rem 0.4rem;
          border-radius: 12px;
        }
        .hotel-status.active {
          background-color: #f0f0f0;
          color: #333;
        }
        .hotel-status.inactive {
          background-color: #f5f5f5;
          color: #666;
        }
        .hotel-info {
          margin: 0.3rem 0;
          color: #666;
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
          border: 1px solid #ddd;
          background: white;
          color: #666;
          border-radius: 5px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-edit:hover {
          background: #251f1fff;
          color: white;
          border-color: #111;
        }
        .btn-delete:hover {
          background: #666;
          color: white;
          border-color: #666;
        }
        .error-message {
          color: #d32f2f;
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
