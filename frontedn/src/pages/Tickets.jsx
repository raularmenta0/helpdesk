import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import MainLayout from "../components/MainLayout";

import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Chip,
  Box,
  MenuItem,
  Rating,
  Alert,
  Snackbar,
} from "@mui/material";

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

const normalizeText = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const isTicketResolved = (ticket) => {
  const status = normalizeText(
    ticket?.statuses?.name
  );

  return (
    status === "realizado" ||
    status === "resuelto"
  );
};

const getTicketSurvey = (ticket) => {
  return (
    ticket?.survey ||
    ticket?.ticket_surveys ||
    null
  );
};

export default function Tickets() {
  const navigate = useNavigate();

  const user = getStoredUser();

  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [savingSurveyId, setSavingSurveyId] =
    useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    try {
      if (!user?.id) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const isAdmin =
        normalizeText(user.role) === "admin";

      let url = "";

      if (isAdmin) {
        url = statusFilter
          ? `/tickets?status_id=${statusFilter}`
          : "/tickets";
      } else {
        url = statusFilter
          ? `/tickets?user_id=${user.id}&status_id=${statusFilter}`
          : `/tickets?user_id=${user.id}`;
      }

      const response = await api.get(url);

      setTickets(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error cargando tickets:",
        error
      );

      showSnackbar(
        error.response?.data?.error ||
          "No se pudieron cargar los tickets",
        "error"
      );
    }
  };

  const showSnackbar = (
    message,
    severity = "success"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((current) => ({
      ...current,
      open: false,
    }));
  };

  const handleSatisfactionChange = async (
    event,
    ticketId,
    rating
  ) => {
    // Evita que se ejecute el onClick de la fila
    event.stopPropagation();

    if (!rating) {
      return;
    }

    const ticket = tickets.find(
      (currentTicket) =>
        currentTicket.id === ticketId
    );

    if (!ticket) {
      return;
    }

    const existingSurvey =
      getTicketSurvey(ticket);

    if (existingSurvey) {
      showSnackbar(
        "Este ticket ya fue evaluado",
        "warning"
      );

      return;
    }

    if (!isTicketResolved(ticket)) {
      showSnackbar(
        "El ticket debe estar resuelto para evaluarlo",
        "warning"
      );

      return;
    }

    try {
      setSavingSurveyId(ticketId);

      const response = await api.post(
        `/tickets/${ticketId}/satisfaction`,
        {
          rating,
        }
      );

      const savedSurvey =
        response.data?.satisfaction || {
          rating,
        };

      setTickets((currentTickets) =>
        currentTickets.map((currentTicket) =>
          currentTicket.id === ticketId
            ? {
                ...currentTicket,
                survey: savedSurvey,
              }
            : currentTicket
        )
      );

      showSnackbar(
        "Gracias. Tu evaluación fue guardada correctamente.",
        "success"
      );
    } catch (error) {
      console.error(
        "Error guardando la evaluación:",
        error
      );

      const errorMessage =
        error.response?.data?.error ||
        "No se pudo guardar la evaluación";

      showSnackbar(
        errorMessage,
        "error"
      );
    } finally {
      setSavingSurveyId(null);
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) => {
      const searchValue =
        search.toLowerCase();

      return (
        ticket.ticket_number
          ?.toLowerCase()
          .includes(searchValue) ||
        ticket.subject
          ?.toLowerCase()
          .includes(searchValue)
      );
    }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Nuevo":
        return "info";

      case "En Proceso":
        return "warning";

      case "Realizado":
      case "Resuelto":
        return "success";

      case "Vencido":
        return "error";

      default:
        return "default";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critica":
      case "Crítica":
        return "error";

      case "Alta":
        return "warning";

      case "Media":
        return "info";

      case "Baja":
        return "success";

      default:
        return "default";
    }
  };

  return (
    <MainLayout>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: "bold",
          color: "#2C3E91",
        }}
      >
        Tickets
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <TextField
          label="Buscar Ticket"
          variant="outlined"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          sx={{
            minWidth: 350,
          }}
        />

        <TextField
          select
          label="Estado"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
          }}
          sx={{
            minWidth: 220,
          }}
        >
          <MenuItem value="">
            Todos
          </MenuItem>

          <MenuItem value="1">
            Nuevo
          </MenuItem>

          <MenuItem value="3">
            En Proceso
          </MenuItem>

          <MenuItem value="6">
            Realizado
          </MenuItem>

          <MenuItem value="9">
            Vencido
          </MenuItem>
        </TextField>
      </Box>

      <Paper
        elevation={4}
        sx={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Ticket</strong>
              </TableCell>

              <TableCell>
                <strong>Asunto</strong>
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  minWidth: 230,
                }}
              >
                <strong>Satisfacción</strong>
              </TableCell>

              <TableCell>
                <strong>Estado</strong>
              </TableCell>

              <TableCell>
                <strong>Prioridad</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{
                    py: 4,
                    color: "text.secondary",
                  }}
                >
                  No se encontraron tickets
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => {
                const survey =
                  getTicketSurvey(ticket);

                const resolved =
                  isTicketResolved(ticket);

                const isSaving =
                  savingSurveyId === ticket.id;

                return (
                  <TableRow
                    key={ticket.id}
                    hover
                    sx={{
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate(
                        `/tickets/${ticket.id}`
                      );
                    }}
                  >
                    <TableCell>
                      {ticket.ticket_number}
                    </TableCell>

                    <TableCell>
                      {ticket.subject}
                    </TableCell>

                    <TableCell
                      align="center"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      {resolved ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Rating
                            value={
                              survey?.rating || 0
                            }
                            max={5}
                            precision={1}
                            readOnly={
                              Boolean(survey) ||
                              isSaving
                            }
                            disabled={isSaving}
                            onChange={(
                              event,
                              newValue
                            ) => {
                              handleSatisfactionChange(
                                event,
                                ticket.id,
                                newValue
                              );
                            }}
                            sx={{
                              "& .MuiRating-iconFilled":
                                {
                                  color: "#F5B301",
                                },
                              "& .MuiRating-iconHover":
                                {
                                  color: "#FFCA28",
                                },
                            }}
                          />

                          {survey ? (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "success.main",
                              }}
                            >
                              Evaluado
                            </Typography>
                          ) : isSaving ? (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                              }}
                            >
                              Guardando...
                            </Typography>
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                              }}
                            >
                              Selecciona una calificación
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography
                          component="span"
                          sx={{
                            color: "text.disabled",
                          }}
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          ticket.statuses?.name ||
                          "Sin estado"
                        }
                        color={getStatusColor(
                          ticket.statuses?.name
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          ticket.priorities?.name ||
                          "Sin prioridad"
                        }
                        color={getPriorityColor(
                          ticket.priorities?.name
                        )}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={handleCloseSnackbar}
          sx={{
            width: "100%",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}