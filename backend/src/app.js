// Cargar las variables de entorno antes de importar rutas o servicios
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const express = require("express");
const cors = require("cors");

const {
  startTicketStatusJob,
} = require("./jobs/ticketStatusJob");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  return res.json({
    message: "HelpDesk API funcionando",
  });
});

app.get(
  "/test-satisfaction-routew",
  (req, res) => {
    return res.json({
      message: "Ruta de satisfacción funcionando",
    });
  }
);

// Dashboard
app.use(
  "/dashboard",
  require("./routes/dashboardRoutes")
);

// Tickets
app.use(
  "/tickets",
  require("./routes/ticketRoutes")
);

// Satisfacción
app.use(
  "/tickets",
  require("./routes/satisfactionRoutes")
);

// Usuarios
app.use(
  "/users",
  require("./routes/userRoutes")
);

// Estados
app.use(
  "/statuses",
  require("./routes/statusRoutes")
);

// Prioridades
app.use(
  "/priorities",
  require("./routes/prioritiesRoutes")
);

// Categorías
app.use(
  "/categories",
  require("./routes/categoriesRoutes")
);

// Áreas
app.use(
  "/areas",
  require("./routes/areasRoutes")
);

// Departamentos
app.use(
  "/departments",
  require("./routes/departmentsRoutes")
);

// Comentarios
app.use(
  "/tickets",
  require("./routes/ticketCommentsRoutes")
);

// Historial
app.use(
  "/tickets",
  require("./routes/ticketHistoryRoutes")
);

// Tareas
app.use(
  "/tasks",
  require("./routes/tasksRoutes")
);

// Reportes
app.use(
  "/reports",
  require("./routes/reportsRoutes")
);



// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Servidor iniciado en puerto ${PORT}`
  );

  startTicketStatusJob();

  console.log(
    "Job de actualización automática iniciado"
  );
});
