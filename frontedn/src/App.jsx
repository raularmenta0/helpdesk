import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import NewTicket from "./pages/NewTicket";
import Login from "./pages/Login";
import Reports from "./pages/Reports";

const ADMIN_ROLES = [
  "admin",
  "administrador",
  "administrative",
  "superadmin",
];

/**
 * Obtiene el usuario guardado de forma segura.
 */
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Error leyendo el usuario almacenado:",
      error
    );

    localStorage.removeItem("user");

    return null;
  }
};

/**
 * Obtiene el rol normalizado.
 */
const getUserRole = (user) => {
  return String(user?.role || "")
    .trim()
    .toLowerCase();
};

/**
 * Determina si el usuario es administrativo.
 */
const isAdministrative = (user) => {
  const role = getUserRole(user);

  return ADMIN_ROLES.includes(role);
};

/**
 * Redirección de la ruta principal.
 */
const HomeRedirect = () => {
  const user = getStoredUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (isAdministrative(user)) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/tickets"
      replace
    />
  );
};

/**
 * Protege rutas que requieren sesión.
 */
const PrivateRoute = ({ children }) => {
  const user = getStoredUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
};

/**
 * Protege rutas exclusivas para administradores.
 */
const AdminRoute = ({ children }) => {
  const user = getStoredUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!isAdministrative(user)) {
    return (
      <Navigate
        to="/tickets"
        replace
      />
    );
  }

  return children;
};

/**
 * Rutas internas de la aplicación.
 *
 * useLocation provoca que las rutas se vuelvan a evaluar
 * cada vez que cambia la URL o después del login.
 */
const AppRoutes = () => {
  useLocation();

  const user = getStoredUser();

  return (
    <Routes>
      {/* Login */}
      <Route
        path="/login"
        element={
          user ? (
            <HomeRedirect />
          ) : (
            <Login />
          )
        }
      />

      {/* Ruta principal */}
      <Route
        path="/"
        element={<HomeRedirect />}
      />

      {/* Dashboard: solamente administradores */}
      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />

      {/* Tickets: usuarios autenticados */}
      <Route
        path="/tickets"
        element={
          <PrivateRoute>
            <Tickets />
          </PrivateRoute>
        }
      />

      {/* Crear ticket */}
      <Route
        path="/tickets/new"
        element={
          <PrivateRoute>
            <NewTicket />
          </PrivateRoute>
        }
      />

      {/* Detalle del ticket */}
      <Route
        path="/tickets/:id"
        element={
          <PrivateRoute>
            <TicketDetail />
          </PrivateRoute>
        }
      />

      {/* Reportes: solamente administradores */}
      <Route
        path="/reports"
        element={
          <AdminRoute>
            <Reports />
          </AdminRoute>
        }
      />

      {/* Cualquier ruta no encontrada */}
      <Route
        path="*"
        element={<HomeRedirect />}
      />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;