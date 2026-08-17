import { useEffect, useState } from "react";

import MainLayout from "../components/MainLayout";
import api from "../services/api";

import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
} from "@mui/material";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Reports() {
  const [data, setData] = useState(null);

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const COLORS = [
    "#0D47A1",
    "#1976D2",
    "#1A237E",
    "#3949AB",
    "#42A5F5",
    "#90A4AE",
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response =
        await api.get("/reports", {
          params: {
            startDate,
            endDate,
          },
        });

      console.log(
        "REPORTES:",
        response.data
      );

      setData(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  const handleExportPDF =
  () => {

    window.open(
      "http://172.30.124.92:3000/reports/export/pdf",
      "_blank"
    );

  };

  const handleExportExcel =
  () => {

    window.open(
      "http://172.30.124.92:3000/reports/export/excel",
      "_blank"
    );

  };

  const ReportSection = ({
    title,
    reportData,
  }) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns:
          "1fr 1fr",
        gap: 3,
        mb: 5,
      }}
    >
      <Paper
        elevation={5}
        sx={{
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
          {title}
        </Typography>

        <ResponsiveContainer
          width="100%"
          height={350}
        >
          <BarChart data={reportData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="total"
              fill="#1976D2"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Paper
        elevation={5}
        sx={{
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
          {title}
        </Typography>

        <ResponsiveContainer
          width="100%"
          height={350}
        >
          <PieChart>
            <Pie
              data={reportData}
              dataKey="total"
              nameKey="name"
              outerRadius={120}
              label
            >
              {reportData.map(
                (entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[
                        index %
                          COLORS.length
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
  );

  if (!data) {
    return (
      <MainLayout>
        <Typography>
          Cargando...
        </Typography>
      </MainLayout>
    );
  }

  return (
    <MainLayout>

      <Typography
        variant="h3"
        fontWeight="bold"
        color="#2C3E91"
        mb={4}
      >
        Reportes
      </Typography>

      {/* FILTROS */}

      <Box
  sx={{
    display: "flex",
    gap: 3,
    mb: 4,
    flexWrap: "wrap",
    alignItems: "flex-end",
  }}
>
  <Box>
    <Typography
      variant="body2"
      sx={{
        mb: 1,
        fontWeight: "bold",
        color: "#2C3E91",
      }}
    >
      Fecha Inicio
    </Typography>

    <TextField
      type="date"
      value={startDate}
      onChange={(e) =>
        setStartDate(e.target.value)
      }
      size="small"
      sx={{
        minWidth: 180,
      }}
    />
  </Box>

  <Box>
    <Typography
      variant="body2"
      sx={{
        mb: 1,
        fontWeight: "bold",
        color: "#2C3E91",
      }}
    >
      Fecha Fin
    </Typography>

    <TextField
      type="date"
      value={endDate}
      onChange={(e) =>
        setEndDate(e.target.value)
      }
      size="small"
      sx={{
        minWidth: 180,
      }}
    />
  </Box>

  <Button
    variant="contained"
    onClick={loadReports}
    sx={{
      backgroundColor: "#2C3E91",
      height: 40,
    }}
  >
    Aplicar
  </Button>
</Box>

      {/* EXPORTACIONES */}

      <Box
        sx={{
          display: "flex",
          gap: 3,
          mb: 4,
        }}
      >
        <Button
          variant="contained"
          startIcon={
            <PictureAsPdfIcon />
          }
          onClick={
            handleExportPDF
          }
          sx={{
            backgroundColor:
              "#2C3E91",
          }}
        >
          Exportar PDF
        </Button>

        <Button
          variant="outlined"
          startIcon={
            <TableViewIcon />
          }
          onClick={
            handleExportExcel
          }
        >
          Exportar Excel
        </Button>
      </Box>

      {/* KPI */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            "repeat(5,1fr)",
          gap: 3,
          mb: 5,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 2,
            textAlign: "center",
          }}
        >
          Total: {data.total}
        </Paper>

        <Paper
          elevation={4}
          sx={{
            p: 2,
            textAlign: "center",
          }}
        >
          Nuevos: {data.nuevos}
        </Paper>

        <Paper
          elevation={4}
          sx={{
            p: 2,
            textAlign: "center",
          }}
        >
          En Proceso: {data.enProceso}
        </Paper>

        <Paper
          elevation={4}
          sx={{
            p: 2,
            textAlign: "center",
          }}
        >
          Realizados: {data.realizados}
        </Paper>

        <Paper
          elevation={4}
          sx={{
            p: 2,
            textAlign: "center",
          }}
        >
          Vencidos: {data.vencidos}
        </Paper>
      </Box>

      <ReportSection
        title="Tickets por Mes"
        reportData={data.monthly || []}
      />

      <ReportSection
        title="Tickets por Semana"
        reportData={data.weekly || []}
      />

      <ReportSection
        title="Tipo de Soporte"
        reportData={data.categories || []}
      />

      <ReportSection
        title="Prioridades"
        reportData={data.priorities || []}
      />

      <ReportSection
        title="Departamentos"
        reportData={data.departments || []}
      />

    </MainLayout>
  );
}