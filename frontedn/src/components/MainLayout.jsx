import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LogoutIcon from "@mui/icons-material/Logout";

import medLogo from "../assets/med-logo.png";
import sewsLogo from "../assets/simitomo-logo.png";

const drawerWidth = 280;

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(
  localStorage.getItem("user")
);

const role = user?.role;
  const handleLogout = () => {
    // Add logout logic here
  localStorage.removeItem("user");
  window.location.href = "/login";
};

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#2C3E91",
            color: "#FFFFFF",
            borderRight: "none",
          },
        }}
      >

        {/* CABECERA */}

        <Box
          sx={{
            p: 3,
            textAlign: "center",
            backgroundColor: "#FFFFFF",
          }}
        >
          <img
            src={medLogo}
            alt="MED Logo"
            style={{
              width: "100px",
              height: "auto",
              marginBottom: "10px",
            }}
          />

          <Typography
            variant="h6"
            sx={{
              mt: 2,
              fontWeight: "bold",
              color: "#2C3E91",
            }}
          >
            MED HelpDesk
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#555555",
            }}
          >
            TI Department
          </Typography>
        </Box>

        <Divider
          sx={{
            bgcolor: "rgba(255,255,255,0.20)",
          }}
        />

        {/* MENU */}

        <List>
          {role === "ADMIN" && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/")}>
              <ListItemIcon sx={{ color: "#FFFFFF" }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          )}

          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/tickets")}>
              <ListItemIcon sx={{ color: "#FFFFFF" }}>
                <ConfirmationNumberIcon />
              </ListItemIcon>
              <ListItemText primary="Tickets" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/tickets/new")}>
              <ListItemIcon sx={{ color: "#FFFFFF" }}>
                <AddCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Nuevo Ticket" />
            </ListItemButton>
          </ListItem>

          {role === "ADMIN" && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/reports")}>
              <ListItemIcon sx={{ color: "#FFFFFF" }}>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText primary="Reportes" />
            </ListItemButton>
          </ListItem>
          )}

          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon sx={{ color: "#FFFFFF" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
            </ListItemButton>
          </ListItem>
        </List>
        {/* FOOTER */}

        <Box
          sx={{
            mt: "auto",
            p: 2,
            textAlign: "center",
            backgroundColor: "#FFFFFF",
          }}
        >
          <img
            src={sewsLogo}
            alt="SEWS Logo"
            style={{
              width: "100px",
              height: "auto",
              marginBottom: "10px",
            }}
          />

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              color: "#2C3E91",
              fontWeight: "bold",
            }}
          >
            HelpDesk v1.0
          </Typography>
        </Box>
      </Drawer>

      {/* CONTENIDO */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100",
          minwidth: 0,
          minHeight: "100vh",
          backgroundColor: "#F4F5FA",
          p: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}