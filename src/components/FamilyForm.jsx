import React, { useState, useEffect } from "react";

export default function FamilyForm({ nodes, agregarPersona, selectedPerson, onCancelEdit, onUpdatePerson, onDeletePerson }) {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    padreId: "",
    madreId: ""
  });

  useEffect(() => {
    if (selectedPerson) {
      setFormData({
        nombres: selectedPerson.nombres || "",
        apellidoPaterno: selectedPerson.apellidoPaterno || "",
        apellidoMaterno: selectedPerson.apellidoMaterno || "",
        padreId: selectedPerson.padreId || "",
        madreId: selectedPerson.madreId || ""
      });
    } else {
      setFormData({
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        padreId: "",
        madreId: ""
      });
    }
  }, [selectedPerson]);

  const personas = nodes.filter((n) => !n.id.startsWith("pareja"));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPerson) {
      onUpdatePerson(selectedPerson.id, formData);
    } else {
      agregarPersona(formData);
      setFormData({
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        padreId: "",
        madreId: ""
      });
    }
  };

  return (
    <div
      style={{
        width: "360px",
        padding: "20px",
        borderRight: "1px solid #333",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        background: "#1e1e1e",
        color: "#eee",
        boxShadow: "2px 0 5px rgba(0,0,0,0.3)"
      }}
    >
      <h3 style={{ margin: "0 0 10px 0" }}>
        {selectedPerson ? "Editar familiar" : "Nuevo familiar"}
      </h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "0.85rem", color: "#888" }}>Nombres</label>
          <input
            name="nombres"
            placeholder="Nombres"
            value={formData.nombres}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "0.85rem", color: "#888" }}>Apellido paterno</label>
          <input
            name="apellidoPaterno"
            placeholder="Apellido paterno"
            value={formData.apellidoPaterno}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "0.85rem", color: "#888" }}>Apellido materno</label>
          <input
            name="apellidoMaterno"
            placeholder="Apellido materno"
            value={formData.apellidoMaterno}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "0.85rem", color: "#888" }}>Padre</label>
          <select
            name="padreId"
            value={formData.padreId}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Ninguno</option>
            {personas.filter(p => p.id !== selectedPerson?.id).map((p) => (
              <option key={p.id} value={p.id}>
                {p.data.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "0.85rem", color: "#888" }}>Madre</label>
          <select
            name="madreId"
            value={formData.madreId}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Ninguna</option>
            {personas.filter(p => p.id !== selectedPerson?.id).map((p) => (
              <option key={p.id} value={p.id}>
                {p.data.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button type="submit" style={primaryButtonStyle}>
            {selectedPerson ? "Guardar cambios" : "Agregar persona"}
          </button>

          {selectedPerson && (
            <button
              type="button"
              onClick={onCancelEdit}
              style={secondaryButtonStyle}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {selectedPerson && (
        <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #333" }}>
          <button
            onClick={() => onDeletePerson(selectedPerson.id)}
            style={dangerButtonStyle}
          >
            Eliminar persona
          </button>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#2d2d2d",
  color: "white",
  fontSize: "0.9rem",
  width: "100%",
  boxSizing: "border-box"
};

const primaryButtonStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  background: "#4f46e5",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
  transition: "background 0.2s"
};

const secondaryButtonStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "transparent",
  color: "#ccc",
  cursor: "pointer"
};

const dangerButtonStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  background: "#ef4444",
  color: "white",
  fontWeight: "600",
  cursor: "pointer"
};
