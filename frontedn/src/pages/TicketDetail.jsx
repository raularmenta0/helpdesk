import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";

import MainLayout from "../components/MainLayout";
import api from "../services/api";

import {
  Snackbar,
  Alert,
  Typography,
  Paper,
  Chip,
  Divider,
  Box,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
} from "@mui/material";


export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(
  localStorage.getItem("user")
);

const role = user?.role;

  const [openSnackbar, setOpenSnackbar] =
  useState(false);

  const [successMessage, setSuccessMessage] =
  useState("");

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] =
  useState("");
  const [history, setHistory] = useState([]);

  const loadComments = async () => {
    try {
      const response = await api.get(
        `/tickets/${id}/comments`
      );

      setComments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await api.get(
        `/tickets/${id}/history`
      );

      setHistory(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  api
    .get(`/tickets/${id}`)
    .then((response) => {
      setTicket(response.data);

      setSelectedStatus(
        response.data.status_id
      );
    })
    .catch(console.error);

  api
    .get("/statuses")
    .then((response) => {
      setStatuses(response.data);
    })
    .catch(console.error);

  loadComments();
  loadHistory();
}, [id]);

  
  const handleSaveComment = async () => {
    if (!newComment.trim()) {
      alert("Capture un comentario");
      return;
    }

    try {
      await api.post(
  `/tickets/${id}/comments`,
  {
    user_id: user.id,
    comment: newComment,
  }
);
      setNewComment("");

      loadComments();

    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.error ||
        error.message
      );
    }
  };

  const handleUpdateStatus = async () => {
  try {

    await api.put(
      `/tickets/${id}/status`,
      {
        status_id: Number(
          selectedStatus
        ),
      }
    );

    const response =
      await api.get(
        `/tickets/${id}`
      );

    setTicket(response.data);

    loadHistory();

    setSuccessMessage(
      "Estado actualizado correctamente"
    );

    setOpenSnackbar(true);

    setTimeout(() => {
      navigate("/tickets");
    }, 2000);

  } catch (error) {

    console.error(error);

    window.alert(
      error?.response?.data?.error ||
      error.message
    );

  }
};

  if (!ticket) {
    return (
      <MainLayout>
        <Typography>
          Cargando ticket...
        </Typography>
      </MainLayout>
    );
  }

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
        Detalle del Ticket
      </Typography>

      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
        }}
      >
      <Typography
          variant="h5"
          sx={{
            mt: 4,
            mb: 2,
            color: "#2C3E91",
            fontWeight: "bold",
          }}
        >
          Historial de Cambios
        </Typography>

        {history.map((item) => (
          <Paper
            key={item.id}
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: "#fafafa",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
            >
              {item.action}
            </Typography>

            <Typography
              variant="caption"
              display="block"
              sx={{
                mb: 1,
              }}
            >
              {new Date(item.created_at).toLocaleString()}
            </Typography>

            {item.users && (
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                }}
              >
                <strong>Usuario:</strong>{" "}
                {item.users.name}
              </Typography>
            )}
            <Typography>
              {item.details}
            </Typography>
          </Paper>
        ))}

        {/* ENCABEZADO */}

        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            mb: 3,
          }}
        >
          {ticket.ticket_number}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
          }}
        >
          <Chip
            label={ticket.statuses?.name || "Sin Estado"}
            color="primary"
          />

          <Chip
            label={
              ticket.priorities?.name ||
              "Sin Prioridad"
            }
            color="warning"
          />
        </Box>
        
        {role === "ADMIN" && (
  <Box
    sx={{
      display: "flex",
      gap: 2,
      alignItems: "center",
      mb: 4,
    }}
  >
    <Select
      value={selectedStatus}
      onChange={(e) =>
        setSelectedStatus(
          e.target.value
        )
      }
      size="small"
      sx={{
        minWidth: 250,
      }}
    >
      {statuses.map((status) => (
        <MenuItem
          key={status.id}
          value={status.id}
        >
          {status.name}
        </MenuItem>
      ))}
    </Select>

    <Button
      variant="contained"
      onClick={handleUpdateStatus}
      sx={{
        backgroundColor: "#2C3E91",
      }}
    >
      Actualizar Estado
    </Button>
  </Box>
)}

        <Divider sx={{ mb: 4 }} />

        {/* INFORMACIÓN DEL SOLICITANTE */}

        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: "#2C3E91",
            fontWeight: "bold",
          }}
        >
          Información del Solicitante
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: "#fafafa",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Usuario:</strong>{" "}
                {ticket.users_tickets_requester_idTousers?.name || "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography>
                <strong>No. Reloj:</strong>{" "}
                {ticket.users_tickets_requester_idTousers?.clock_number || "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography>
                <strong>Correo:</strong>{" "}
                {ticket.users_tickets_requester_idTousers?.email || "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Área:</strong>{" "}
                {ticket.areas?.name || "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Departamento:</strong>{" "}
                {ticket.departments?.name || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* INFORMACIÓN DEL TICKET */}

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

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: "#fafafa",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography>
                <strong>Estado:</strong>{" "}
                {ticket.statuses?.name || "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography>
                <strong>Prioridad:</strong>{" "}
                {ticket.priorities?.name || "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography>
                <strong>Tipo de Soporte:</strong>{" "}
                {ticket.categories?.name || "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography>
                <strong>Fecha de Creación:</strong>{" "}
                {ticket.created_at
                  ? new Date(ticket.created_at).toLocaleString()
                  : "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ASUNTO */}

        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: "#2C3E91",
            fontWeight: "bold",
          }}
        >
          Asunto
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: "#fafafa",
          }}
        >
          <Typography>
            {ticket.subject}
          </Typography>
        </Paper>

        {/* DESCRIPCIÓN */}

        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: "#2C3E91",
            fontWeight: "bold",
          }}
        >
          Descripción
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 4,
            minHeight: 200,
            backgroundColor: "#fafafa",
            whiteSpace: "pre-wrap",
          }}
        >
          <Typography>
            {ticket.description}
          </Typography>
        </Paper>

        {/* COMENTARIOS */}

        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: "#2C3E91",
            fontWeight: "bold",
          }}
        >
          Comentarios
        </Typography>

        {comments.map((comment) => (
          <Paper
            key={comment.id}
            variant="outlined"
            sx={{
              p: 2,
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
            >
              {comment.users?.name}
            </Typography>

            <Typography
              variant="caption"
              display="block"
              sx={{
                mb: 1,
              }}
            >
              {new Date(
                comment.created_at
              ).toLocaleString()}
            </Typography>

            <Typography>
              {comment.comment}
            </Typography>
          </Paper>
        ))}

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mt: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
            }}
          >
            Agregar Comentario
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            value={newComment}
            onChange={(e) =>
              setNewComment(e.target.value)
            }
            placeholder="Escriba un comentario..."
          />

          <Button
            variant="contained"
            onClick={handleSaveComment}
            sx={{
              mt: 2,
              backgroundColor: "#2C3E91",
            }}
          >
            Guardar Comentario
          </Button>
        </Paper>
      </Paper>
      <Snackbar
  open={openSnackbar}
  autoHideDuration={2000}
  onClose={() =>
    setOpenSnackbar(false)
  }
  anchorOrigin={{
    vertical: "bottom",
    horizontal: "right",
  }}
>
  <Alert
    severity="success"
    variant="filled"
    sx={{
      width: "100%",
    }}
  >
    {successMessage}
  </Alert>
</Snackbar>
    </MainLayout>
  );
}