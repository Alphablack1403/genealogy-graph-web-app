import React, { useState } from "react";
import { login, register } from "../services/api";

export default function Auth({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (isLogin) {
                await login(username, password);
                onLoginSuccess();
            } else {
                await register(username, password);
                alert("Registro exitoso. Ahora puedes iniciar sesión.");
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message || "Error al autenticar");
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{ marginBottom: "20px" }}>{isLogin ? "Iniciar sesión" : "Crear cuenta"}</h2>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <input
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={inputStyle}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                    />
                    {error && <p style={{ color: "#ff4d4d", fontSize: "0.85rem" }}>{error}</p>}
                    <button type="submit" style={buttonStyle}>
                        {isLogin ? "Entrar" : "Registrarse"}
                    </button>
                </form>
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    style={toggleStyle}
                >
                    {isLogin ? "¿No tienes cuenta? Registrate" : "¿Ya tienes cuenta? Inicia sesión"}
                </button>
            </div>
        </div>
    );
}

const containerStyle = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#121212",
    color: "white"
};

const cardStyle = {
    background: "#1e1e1e",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center"
};

const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
};

const inputStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#2d2d2d",
    color: "white",
    fontSize: "1rem"
};

const buttonStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#4f46e5",
    color: "white",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer"
};

const toggleStyle = {
    background: "none",
    border: "none",
    color: "#818cf8",
    marginTop: "20px",
    cursor: "pointer",
    fontSize: "0.9rem"
};
