import { useState, useEffect } from "react";

import MainLayout from "../components/MainLayout";
import api from "../services/api";

import { useNavigate } from "react-router-dom";

import {
  Snackbar,
  Alert,
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from "@mui/material";

export default function NewTicket() {
  const [priority, setPriority] = useState("Media");

  const [categories, setCategories] = useState([]);

  const [clockNumber, setClockNumber] = useState("");

  const [user, setUser] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");

  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category_id: "",
    description: "",
  });

  useEffect(() => {
    api
      .get("/categories")
      .then((response) => {
        setCategories(response.data);
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const searchUser = async () => {
    if (!clockNumber.trim()) {
      return;
    }

    try {
      const response = await api.get(`/users/clock/${clockNumber}`);

      setUser(response.data);
    } catch (error) {
      console.error(error);

      setUser(null);

      alert("Usuario no encontrado");
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Debe capturar un número de reloj válido");
      return;
    }

    if (!formData.category_id) {
      alert("Seleccione un tipo de soporte");
      return;
    }

    if (!formData.description.trim()) {
      alert("Capture la descripción");
      return;
    }

    try {
      const payload = {
        requester_id: user.id,
        area_id: user.area_id,
        department_id: user.department_id,
        category_id: Number(formData.category_id),
        subject:
          categories.find(
            (c) => c.id === Number(formData.category_id)
          )?.name || "HelpDesk",
        description: formData.description,
        priority_id:
          priority === "Baja"
            ? 1
            : priority === "Media"
            ? 2
            : priority === "Alta"
            ? 3
            : 4,
        status_id: 1,
      };

      const response = await api.post("/tickets", payload);

      setSuccessMessage(
        `Ticket ${response.data.ticket_number} creado correctamente`
      );

      setOpenSnackbar(true);

      setClockNumber("");

      setUser(null);

      setFormData({
        category_id: "",
        description: "",
      });

      setPriority("Media");

      setTimeout(() => {
        navigate("/tickets");
      }, 2000);
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.error || error.message);
    }
  };

  return (
    <MainLayout>
      <Typography
        variant="h3"
        sx={{
          mb: 4,
          color: "#2C3E91",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Nuevo Ticket
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            color: "#2C3E91",
            fontWeight: "bold",
          }}
        >
          Información del Solicitante
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="No. Reloj"
              value={clockNumber}
              onChange={(e) => setClockNumber(e.target.value)}
              onBlur={searchUser}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Nombre"
              value={user?.name || ""}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Correo"
              value={user?.email || ""}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Área"
              value={user?.areas?.name || ""}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Departamento"
              value={user?.departments?.name || ""}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: "#2C3E91",
            fontWeight: "bold",
          }}
        >
          Información del Ticket
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            width: "100%",
          }}
        >
          <TextField
            select
            label="Tipo de Soporte"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            fullWidth
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 1,
                fontWeight: "bold",
              }}
            >
              Prioridad
            </Typography>

            <RadioGroup
              row
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <FormControlLabel
                value="Baja"
                control={<Radio color="success" />}
                label="Baja"
              />

              <FormControlLabel
                value="Media"
                control={<Radio color="info" />}
                label="Media"
              />

              <FormControlLabel
                value="Alta"
                control={<Radio color="warning" />}
                label="Alta"
              />

              <FormControlLabel
                value="Critica"
                control={<Radio color="error" />}
                label="Crítica"
              />
            </RadioGroup>
          </Box>

          <TextField
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={12}
            fullWidth
          />
        </Box>
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          sx={{
            backgroundColor: "#2C3E91",
          }}
        >
          Crear Ticket
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}