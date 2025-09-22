import axios from "axios";

// Configuration de base
export const API_BASE_URL = "https://hotelstockback-production.up.railway.app";
export const API_BASE_URL_API = `${API_BASE_URL}/api`;

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_BASE_URL_API,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter automatiquement le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide, déconnexion automatique
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Fonctions d'API pour l'authentification
export const authAPI = {
  login: (credentials) => api.post("/login", credentials),
  register: (userData) => api.post("/register", userData),
  logout: () => api.post("/logout"),
  forgotPassword: (email) => api.post("/forgot-password", { email }),
  resetPassword: (data) => api.post("/reset-password", data),
  getCurrentUser: () => api.get("/user"),
};

// Fonctions d'API pour les hôtels
export const hotelsAPI = {
  getPublicHotels: () => api.get("/hotels-public"),
  getMyHotels: () => api.get("/my-hotels"),
  getHotel: (id) => api.get(`/hotels/${id}`),
  createHotel: (hotelData) => {
    const formData = new FormData();
    Object.keys(hotelData).forEach((key) => {
      if (hotelData[key] !== null && hotelData[key] !== undefined) {
        formData.append(key, hotelData[key]);
      }
    });
    return api.post("/hotels", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateHotel: (id, hotelData) => {
    const formData = new FormData();
    Object.keys(hotelData).forEach((key) => {
      if (hotelData[key] !== null && hotelData[key] !== undefined) {
        formData.append(key, hotelData[key]);
      }
    });
    // Pour les mises à jour, ajouter _method pour Laravel
    formData.append("_method", "PUT");
    return api.post(`/hotels/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteHotel: (id) => api.delete(`/hotels/${id}`),
};

// Fonctions d'API pour les statistiques (ajustez selon vos besoins)
export const statsAPI = {
  getForms: () => api.get("/forms"),
  getMessages: () => api.get("/messages"),
  getUsers: () => api.get("/users"),
  getEmails: () => api.get("/emails"),
  getEntities: () => api.get("/entities"),
};

// Fonction utilitaire pour tester l'API
export const testAPI = () => api.get("/test");

export default api;
