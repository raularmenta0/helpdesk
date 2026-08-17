import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
  InputAdornment,
  CircularProgress,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const ADMIN_ROLES = [
  "admin",
  "administrador",
  "administrative",
  "superadmin",
];

const getUserRole = (user) => {
  return String(user?.role || "")
    .trim()
    .toLowerCase();
};

const isAdministrative = (user) => {
  const role = getUserRole(user);

  return ADMIN_ROLES.includes(role);
};

const getInitialRoute = (user) => {
  if (isAdministrative(user)) {
    return "/dashboard";
  }

  return "/tickets";
};

export default function Login() {
  const navigate = useNavigate();

  const [clockNumber, setClockNumber] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    if (event) {
      event.preventDefault();
    }

    if (loading) {
      return;
    }

    const cleanClockNumber = clockNumber.trim();

    if (!cleanClockNumber) {
      setError("Capture un número de reloj");
      setOpen(true);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOpen(false);

      const response = await api.get(
        `/users/clock/${encodeURIComponent(
          cleanClockNumber
        )}`
      );

      const user =
        response.data?.user || response.data;

      if (!user || typeof user !== "object") {
        throw new Error(
          "El servidor no devolvió información válida del usuario"
        );
      }

      const role = getUserRole(user);
      const destination = getInitialRoute(user);

      console.log("Usuario recibido:", user);
      console.log("Rol recibido:", role);
      console.log("Ruta destino:", destination);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Error iniciando sesión:",
        error
      );

      localStorage.removeItem("user");

      setError(
        error.response?.data?.error ||
          "Número de reloj no encontrado"
      );

      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg,#0D47A1,#1976D2,#42A5F5)",
      }}
    >
      <Paper
        elevation={12}
        sx={{
          p: 5,
          borderRadius: 5,
          width: {
            xs: "90%",
            sm: 450,
          },
          maxWidth: 450,
          textAlign: "center",
        }}
      >
        <SupportAgentIcon
          sx={{
            fontSize: 80,
            color: "#1976D2",
            mb: 2,
          }}
        />

        <Typography
          variant="h3"
          fontWeight="bold"
          color="#1A237E"
        >
          HelpDesk
        </Typography>

        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Portal de Soporte Sistemas MED
        </Typography>

        <Box
          component="form"
          onSubmit={handleLogin}
        >
          <TextField
            fullWidth
            label="Número de Reloj"
            value={clockNumber}
            disabled={loading}
            onChange={(event) => {
              setClockNumber(event.target.value);
            }}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              height: 55,
              fontWeight: "bold",
              fontSize: "1rem",
              borderRadius: 3,
              background:
                "linear-gradient(135deg,#1A237E,#3949AB)",

              "&:hover": {
                background:
                  "linear-gradient(135deg,#0D47A1,#1976D2)",
              },
            }}
          >
            {loading ? (
              <CircularProgress
                size={25}
                sx={{ color: "#fff" }}
              />
            ) : (
              "INGRESAR"
            )}
          </Button>
        </Box>

        <Typography
          variant="caption"
          display="block"
          sx={{
            mt: 4,
            color: "text.secondary",
          }}
        >
          Sistemas MED • HelpDesk v1.0
        </Typography>
      </Paper>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => {
          setOpen(false);
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{
            width: "100%",
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}