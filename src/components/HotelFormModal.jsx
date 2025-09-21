import React, { useState, useEffect } from "react";

const HotelFormModal = ({ onClose, onCreate, onUpdate, editingHotel = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone_number: "",
    price_per_night: "",
    currency: "XOF",
    photo: null,
  });
  const [error, setError] = useState(null);

  // Pré-remplir le formulaire si on modifie un hôtel
  useEffect(() => {
    if (editingHotel) {
      setFormData({
        name: editingHotel.name || "",
        address: editingHotel.address || "",
        email: editingHotel.email || "",
        phone_number: editingHotel.phone_number || "",
        price_per_night: editingHotel.price_per_night || "",
        currency: editingHotel.currency || "XOF",
        photo: null, // Ne pas pré-remplir la photo
      });
    }
  }, [editingHotel]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("address", formData.address);
    data.append("email", formData.email);
    data.append("phone_number", formData.phone_number);
    data.append("price_per_night", formData.price_per_night);
    data.append("currency", formData.currency);

    if (formData.photo) data.append("photo", formData.photo);

    // Si on modifie, utiliser onUpdate, sinon onCreate
    if (editingHotel) {
      onUpdate(editingHotel.id, data, setError);
    } else {
      onCreate(data, setError);
    }
  };

  const isEditMode = !!editingHotel;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button className="back-btn" onClick={onClose}>
            &larr;
          </button>
          <h3>{isEditMode ? "Modifier l'hôtel" : "Créer un nouvel hôtel"}</h3>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nom de l'hôtel</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Adresse</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">Numéro de téléphone</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price_per_night">Prix par nuit</label>
            <input
              type="number"
              id="price_per_night"
              name="price_per_night"
              value={formData.price_per_night}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="currency">Devise</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="XOF">XOF</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="form-group file-input-group">
            <label htmlFor="photo">
              {isEditMode ? "Changer la photo (optionnel)" : "Ajouter une photo"}
            </label>
            <div className="file-input-container">
              <input
                type="file"
                id="photo"
                name="photo"
                onChange={handleChange}
                style={{ display: "none" }}
                accept="image/*"
              />
              <label htmlFor="photo" className="file-input-btn">
                Choisir un fichier
              </label>
              <span className="file-name">
                {formData.photo ? formData.photo.name : "Aucun fichier choisi"}
              </span>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-create">
              {isEditMode ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background-color: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .modal-content { background:white; padding:2rem; border-radius:12px; width:90%; max-width:800px; display:flex; flex-direction:column; gap:1.5rem; }
        .modal-header { display:flex; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:1rem; }
        .modal-header h3 { margin:0; font-size:1.5rem; font-weight:600; }
        .back-btn { background:none; border:none; font-size:1.5rem; cursor:pointer; color:#4a5568; }
        .modal-form { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
        .form-group { display:flex; flex-direction:column; }
        .form-group label { font-size:0.9rem; font-weight:600; color:#4a5568; margin-bottom:0.5rem; }
        .form-group input, .form-group select { padding:0.75rem; border:1px solid #e2e8f0; border-radius:8px; font-size:1rem; }
        .file-input-group { grid-column:1 / -1; }
        .file-input-container { display:flex; align-items:center; gap:1rem; }
        .file-input-btn { background-color:#e2e8f0; border:1px solid #cbd5e0; padding:0.5rem 1rem; border-radius:8px; cursor:pointer; font-weight:600; }
        .modal-actions { display:flex; justify-content:flex-end; gap:1rem; margin-top:1rem; grid-column:1 / -1; }
        .btn-cancel, .btn-create { padding:0.75rem 1.5rem; border-radius:8px; cursor:pointer; font-weight:600; }
        .btn-cancel { background:none; border:1px solid #cbd5e0; color:#4a5568; }
        .btn-create { background-color:#3182ce; color:white; border:none; }
        .error-message { color: #e53e3e; font-size: 0.9rem; text-align: center; grid-column: 1 / -1; }
        @media (max-width:768px) { .modal-form { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
};

export default HotelFormModal;