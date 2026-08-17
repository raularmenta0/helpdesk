import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";

import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

export default function MainLayout({ children }) {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const handleLogout = () => {

    localStorage.removeItem("user");

    navigate("/login");

    window.location.reload();
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
            backgroundColor: "#1976d2",
            color: "white",
          },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            p: 3,
            fontWeight: "bold",
            cursor: "pointer",
            textAlign: "center",
          }}
          onClick={() => navigate("/")}
        >
          HelpDesk
        </Typography>

        <Typography
          sx={{
            px: 3,
            pb: 2,
            opacity: 0.9,
            textAlign: "center",
          }}
        >
          {user?.name || "Usuario"}
        </Typography>

        <Divider
          sx={{
            bgcolor:
              "rgba(255,255,255,0.3)",
          }}
        />

        <List>

          {user?.role === "ADMIN" && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate("/")}
              >
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
          )}

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate("/tickets")}
            >
              <ListItemText primary="Tickets" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                navigate("/tickets/new")
              }
            >
              <ListItemText primary="Nuevo Ticket" />
            </ListItemButton>
          </ListItem>

          {user?.role === "ADMIN" && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={() =>
                  navigate("/users")
                }
              >
                <ListItemText primary="Usuarios" />
              </ListItemButton>
            </ListItem>
          )}

          <Divider
            sx={{
              my: 2,
              bgcolor:
                "rgba(255,255,255,0.3)",
            }}
          />

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
            >
              <LogoutIcon
                sx={{ mr: 1 }}
              />

              <ListItemText
                primary="Cerrar Sesión"
              />
            </ListItemButton>
          </ListItem>

          <Divider
  sx={{
    my: 2,
    bgcolor: "rgba(255,255,255,0.3)",
  }}
/>

<ListItem disablePadding>
  <ListItemButton
    onClick={() => {

      localStorage.removeItem("user");

      navigate("/login");

      window.location.reload();

    }}
  >
    <LogoutIcon
      sx={{
        mr: 2,
      }}
    />

    <ListItemText
      primary="Cerrar Sesión"
    />
  </ListItemButton>
</ListItem>

        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          backgroundColor: "#f5f7fa",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>

    </Box>
  );
}