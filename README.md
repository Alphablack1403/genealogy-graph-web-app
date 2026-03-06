# 🌳 Árbol Genealógico Profesional

Una aplicación web interactiva y robusta para la gestión y visualización de genealogía familiar, construida con **React Flow**, **Express** y **SQLite**.

## ✨ Características Principales

-   **Visualización Dinámica**: Árbol interactivo con zoom, arrastre y organización automática.
-   **Layout Inteligente**: Uso de `dagre` para posicionar automáticamente a familiares (Abuelos → Padres → Hijos).
-   **Persistencia de Posiciones**: Los nodos guardan su posición en `localStorage` al ser arrastrados.
-   **Gestión Completa**: Panel lateral para añadir, editar o eliminar miembros de la familia.
-   **Conexiones Complejas**: Soporte para múltiples parejas y nodos de relación únicos.
-   **Seguridad y Privacidad**: Sistema de autenticación con **JWT** y registro de usuarios.
-   **Base de Datos Real**: Almacenamiento persistente en **SQLite** (vía `better-sqlite3`).
-   **Exportación**: Botón para exportar el árbol familiar completo como una imagen **PNG** de alta calidad.

---

## 🚀 Guía de Instalación y Ejecución

Para correr este proyecto en tu computadora, sigue estos pasos:

### 1. Requisitos Previos
-   Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).

### 2. Configuración del Backend
1.  Entra a la carpeta del servidor:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` (si no existe) y define las variables (puedes copiar el ejemplo):
    ```env
    JWT_SECRET=tu_clave_secreta_aqui
    PORT=3000
    DATABASE_URL=database.db
    ```
4.  Inicia el servidor:
    ```bash
    node index.js
    ```
    *El servidor correrá en `http://localhost:3000`.*

### 3. Configuración del Frontend
1.  Abre una nueva terminal en la raíz del proyecto.
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicia la aplicación en modo desarrollo:
    ```bash
    npm run dev
    ```
    *La app estará disponible en `http://localhost:5173`.*

---

## 🏗️ Detalles de Implementación (Arquitectura)

### Flujo de Datos
1.  **Backend (API Rest)**: Express gestiona las rutas protegidas. Al registrarse/loguearse, el servidor devuelve un token JWT que el frontend almacena.
2.  **Base de Datos**: SQLite almacena las personas con sus IDs de padres y madres. La tabla `persons` tiene una relación con `users` para que cada usuario tenga su árbol privado.
3.  **Frontend (React Flow)**: 
    -   `App.jsx` actúa como el controlador central.
    -   Se transforman los datos planos de la DB en un array de `nodes` y `edges` compatibles con React Flow.
    -   Si un nodo no tiene coordenadas guardadas, el motor **Dagre** calcula su jerarquía basándose en los `padreId/madreId`.

### Exportación de Imagen
Se utiliza `html-to-image` para capturar el contenedor de React Flow y convertirlo en un PNG, descargándolo automáticamente en el navegador mediante `downloadjs`.

---

## 📖 Manual de Usuario

1.  **Acceso**: Regístrate o inicia sesión para acceder a tu panel.
2.  **Añadir Familiares**: Usa el formulario lateral derecho. Introduce nombres y selecciona a los padres de la lista desplegable.
3.  **Organizar**: Puedes arrastrar los nodos a tu gusto. Si quieres que el sistema los ordene por ti, recarga la página (los nodos sin posición fija se auto-ajustarán).
4.  **Editar/Eliminar**: Haz clic en cualquier persona para cargar sus datos en el formulario. Podrás actualizar su información o eliminarla permanentemente.
5.  **Descargar**: Haz clic en el botón "Exportar a PNG" en la esquina superior derecha para guardar una copia de tu árbol.

---

## 🛠️ Tecnologías Utilizadas

-   **Frontend**: React 19, Vite, React Flow, Dagre, Lucide React (iconos).
-   **Backend**: Node.js, Express, Better-SQLite3, JWT, Bcrypt.js.
-   **Estilos**: CSS3 Moderno (Glassmorphism, Dark Mode).
