import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import MainLayout from "../components/MainLayout";

import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";

import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  Button,
  Checkbox,
  IconButton,
} from "@mui/material";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const initialDashboardData = {
  total: 0,
  nuevos: 0,
  enProceso: 0,
  realizados: 0,
  vencidos: 0,
};

const initialSatisfactionData = {
  average: 0,
  total: 0,
  distribution: [
    {
      rating: 1,
      total: 0,
    },
    {
      rating: 2,
      total: 0,
    },
    {
      rating: 3,
      total: 0,
    },
    {
      rating: 4,
      total: 0,
    },
    {
      rating: 5,
      total: 0,
    },
  ],
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(
    initialDashboardData
  );

  const [satisfaction, setSatisfaction] =
    useState(initialSatisfactionData);

  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    loadDashboard();
    loadSatisfaction();
    loadTasks();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get(
        "/dashboard"
      );

      setData({
        ...initialDashboardData,
        ...(response.data || {}),
      });
    } catch (error) {
      console.error(
        "Error cargando dashboard:",
        error
      );
    }
  };

  const loadSatisfaction = async () => {
    try {
      const response = await api.get(
        "/dashboard/satisfaction"
      );

      const responseData = response.data || {};

      setSatisfaction({
        average: Number(
          responseData.average || 0
        ),
        total: Number(
          responseData.total || 0
        ),
        distribution:
          Array.isArray(
            responseData.distribution
          )
            ? responseData.distribution
            : initialSatisfactionData.distribution,
      });
    } catch (error) {
      console.error(
        "Error cargando satisfacción:",
        error
      );

      setSatisfaction(
        initialSatisfactionData
      );
    }
  };

  const loadTasks = async () => {
    try {
      const response = await api.get(
        "/tasks"
      );

      setTasks(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error cargando tareas:",
        error
      );
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      alert("Capture el título de la tarea");
      return;
    }

    try {
      await api.post("/tasks", {
        title: newTask.title.trim(),
        description:
          newTask.description.trim(),
      });

      setNewTask({
        title: "",
        description: "",
      });

      await loadTasks();
    } catch (error) {
      console.error(
        "Error creando tarea:",
        error
      );

      alert(
        error?.response?.data?.error ||
          error.message
      );
    }
  };

  const handleToggleTask = async (id) => {
    try {
      await api.put(`/tasks/${id}/toggle`);
      await loadTasks();
    } catch (error) {
      console.error(
        "Error actualizando tarea:",
        error
      );
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      await loadTasks();
    } catch (error) {
      console.error(
        "Error eliminando tarea:",
        error
      );
    }
  };

  const ticketChartData = [
    {
      name: "Nuevos",
      total: data.nuevos,
    },
    {
      name: "En Proceso",
      total: data.enProceso,
    },
    {
      name: "Realizados",
      total: data.realizados,
    },
    {
      name: "Vencidos",
      total: data.vencidos,
    },
  ];

  const satisfactionChartData =
    satisfaction.distribution.map((item) => ({
      name: `${item.rating} estrella${
        item.rating === 1 ? "" : "s"
      }`,
      rating: item.rating,
      total: Number(item.total || 0),
    }));

  const ticketColors = [
    "#283593",
    "#0288d1",
    "#3949AB",
    "#4FC3F7",
  ];

  const satisfactionColors = [
    "#D32F2F",
    "#F57C00",
    "#FBC02D",
    "#7CB342",
    "#2E7D32",
  ];

  const cardStyle = (backgroundColor) => ({
    width: "100%",
    height: 180,
    borderRadius: 4,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: backgroundColor,
    color: "#fff",
    boxShadow:
      "0px 8px 25px rgba(0,0,0,0.18)",
    transition: "0.3s",
    cursor: "pointer",

    "&:hover": {
      transform: "translateY(-5px)",
    },
  });

  return (
    <MainLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          minHeight: "100vh",
          bgcolor: "#f5f7fa",
          p: 2,
          overflowX: "hidden",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          color="#2C3E91"
          gutterBottom
        >
          Sistema de Tickets HelpDesk
        </Typography>

        {/* KPI DE TICKETS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(5, 1fr)",
            },
            gap: 3,
            mt: 5,
            width: "100%",
          }}
        >
          <Paper
            elevation={6}
            onClick={() => {
              navigate("/tickets");
            }}
            sx={cardStyle(
              "linear-gradient(135deg,#0D47A1,#1976D2)"
            )}
          >
            <ConfirmationNumberIcon
              sx={{
                fontSize: 50,
                mb: 1,
              }}
            />

            <Typography variant="h6">
              Total Tickets
            </Typography>

            <Typography
              variant="h2"
              fontWeight="bold"
            >
              {data.total}
            </Typography>
          </Paper>

          <Paper
            elevation={6}
            onClick={() => {
              navigate(
                "/tickets?status=1"
              );
            }}
            sx={cardStyle(
              "linear-gradient(135deg,#1A237E,#3949AB)"
            )}
          >
            <FiberNewIcon
              sx={{
                fontSize: 50,
                mb: 1,
              }}
            />

            <Typography variant="h6">
              Nuevos
            </Typography>

            <Typography
              variant="h2"
              fontWeight="bold"
            >
              {data.nuevos}
            </Typography>
          </Paper>

          <Paper
            elevation={6}
            onClick={() => {
              navigate(
                "/tickets?status=3"
              );
            }}
            sx={cardStyle(
              "linear-gradient(135deg,#1565C0,#42A5F5)"
            )}
          >
            <BuildCircleIcon
              sx={{
                fontSize: 50,
                mb: 1,
              }}
            />

            <Typography variant="h6">
              En Proceso
            </Typography>

            <Typography
              variant="h2"
              fontWeight="bold"
            >
              {data.enProceso}
            </Typography>
          </Paper>

          <Paper
            elevation={6}
            onClick={() => {
              navigate(
                "/tickets?status=6"
              );
            }}
            sx={cardStyle(
              "linear-gradient(135deg,#283593,#5C6BC0)"
            )}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 50,
                mb: 1,
              }}
            />

            <Typography variant="h6">
              Realizados
            </Typography>

            <Typography
              variant="h2"
              fontWeight="bold"
            >
              {data.realizados}
            </Typography>
          </Paper>

          <Paper
            elevation={6}
            onClick={() => {
              navigate(
                "/tickets?status=9"
              );
            }}
            sx={cardStyle(
              "linear-gradient(135deg,#546E7A,#90A4AE)"
            )}
          >
            <WarningIcon
              sx={{
                fontSize: 50,
                mb: 1,
              }}
            />

            <Typography variant="h6">
              Vencidos
            </Typography>

            <Typography
              variant="h2"
              fontWeight="bold"
            >
              {data.vencidos}
            </Typography>
          </Paper>
        </Box>

        {/* RESUMEN DE SATISFACCIÓN */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "300px 1fr",
            },
            gap: 4,
            mt: 5,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 3,
              borderRadius: 3,
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              background:
                "linear-gradient(135deg,#fffdf5,#ffffff)",
            }}
          >
            <StarIcon
              sx={{
                fontSize: 60,
                color: "#F5B301",
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              fontWeight="bold"
              color="#2C3E91"
            >
              Satisfacción general
            </Typography>

            <Typography
              variant="h2"
              fontWeight="bold"
              sx={{
                color: "#F5B301",
                mt: 1,
              }}
            >
              {Number(
                satisfaction.average || 0
              ).toFixed(2)}
              <Typography
                component="span"
                variant="h5"
                color="text.secondary"
              >
                {" "}
                / 5
              </Typography>
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {satisfaction.total} evaluación
              {satisfaction.total === 1
                ? ""
                : "es"}
            </Typography>

            <Typography
              sx={{
                color: "#F5B301",
                fontSize: 25,
                letterSpacing: 2,
                mt: 1,
              }}
            >
              ★★★★★
            </Typography>
          </Paper>

          <Paper
            elevation={6}
            sx={{
              p: 3,
              borderRadius: 3,
              minHeight: 300,
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              mb={3}
              color="#2C3E91"
            >
              Evaluaciones por calificación
            </Typography>

            <ResponsiveContainer
              width="100%"
              height={260}
            >
              <BarChart
                data={satisfactionChartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  label={{
                    value: "Cantidad",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    value,
                    "Evaluaciones",
                  ]}
                />

                <Bar
                  dataKey="total"
                  name="Evaluaciones"
                  fill="#F5B301"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* GRÁFICAS DE TICKETS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
            },
            gap: 4,
            mt: 5,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              mb={3}
              color="#2C3E91"
            >
              Tickets por Estado
            </Typography>

            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <BarChart
                data={ticketChartData}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="total"
                  fill="#1976d2"
                  radius={[
                    5,
                    5,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          <Paper
            elevation={6}
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              mb={3}
              color="#2C3E91"
            >
              Distribución de Tickets
            </Typography>

            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <PieChart>
                <Pie
                  data={ticketChartData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {ticketChartData.map(
                    (entry, index) => (
                      <Cell
                        key={`ticket-cell-${index}`}
                        fill={
                          ticketColors[
                            index %
                              ticketColors.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* DISTRIBUCIÓN VISUAL DE SATISFACCIÓN */}
        <Paper
          elevation={6}
          sx={{
            mt: 5,
            p: 3,
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            mb={3}
            color="#2C3E91"
          >
            Distribución de satisfacción
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(5, 1fr)",
              },
              gap: 2,
            }}
          >
            {satisfactionChartData.map(
              (item) => (
                <Box
                  key={item.rating}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    textAlign: "center",
                    backgroundColor:
                      "#f7f8fc",
                    border: "1px solid #e0e4ef",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      color:
                        satisfactionColors[
                          item.rating - 1
                        ],
                    }}
                  >
                    {item.rating}{" "}
                    <span
                      style={{
                        color: "#F5B301",
                      }}
                    >
                      ★
                    </span>
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="#2C3E91"
                  >
                    {item.total}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    evaluación
                    {item.total === 1
                      ? ""
                      : "es"}
                  </Typography>
                </Box>
              )
            )}
          </Box>
        </Paper>

        {/* TAREAS */}
        <Paper
          elevation={6}
          sx={{
            mt: 5,
            p: 3,
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            color="#2C3E91"
            mb={2}
          >
            Tareas Sistemas MED
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mb: 4,
            }}
          >
            <TextField
              label="Título"
              value={newTask.title}
              onChange={(event) => {
                setNewTask({
                  ...newTask,
                  title: event.target.value,
                });
              }}
              fullWidth
            />

            <TextField
              label="Descripción"
              multiline
              rows={3}
              value={newTask.description}
              onChange={(event) => {
                setNewTask({
                  ...newTask,
                  description:
                    event.target.value,
                });
              }}
              fullWidth
            />

            <Button
              variant="contained"
              onClick={handleCreateTask}
              sx={{
                backgroundColor: "#2C3E91",
              }}
            >
              Agregar Tarea
            </Button>
          </Box>

          {tasks.map((task) => (
            <Paper
              key={task.id}
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Checkbox
                  checked={Boolean(
                    task.completed
                  )}
                  onChange={() => {
                    handleToggleTask(task.id);
                  }}
                />

                <Box>
                  <Typography
                    fontWeight="bold"
                    sx={{
                      textDecoration:
                        task.completed
                          ? "line-through"
                          : "none",
                    }}
                  >
                    {task.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {task.description}
                  </Typography>
                </Box>
              </Box>

              <IconButton
                color="error"
                onClick={() => {
                  handleDeleteTask(task.id);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Paper>
          ))}
        </Paper>
      </Box>
    </MainLayout>
  );
}