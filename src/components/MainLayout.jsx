// layouts/MainLayout.jsx
import React, { useState, useEffect } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import '../MainLayout.css'

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const sidebarWidth = 280;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#fff",
        overflow: "hidden",
      }}
    >
      <Topbar toggleDrawer={toggleDrawer} isMobile={isMobile} />
      
      <Sidebar
        open={drawerOpen}
        toggleDrawer={toggleDrawer}
        isMobile={isMobile}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          minHeight: "100vh",
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(!isMobile &&
            drawerOpen && {
              marginLeft: `${sidebarWidth}px`,
              width: `calc(100% - ${sidebarWidth}px)`,
            }),
          pt: "64px",
          position: "relative",
          left: 0,
        }}
      >
        <Box
          className="main-content-wrapper" // Added class for targeting
          sx={{
            width: "100%",
            minHeight: "calc(100vh - 64px)",
            p: { xs: 2, sm: 2.5, md: 3 },
            maxWidth: "100% !important",
            margin: "0 !important",
            boxSizing: "border-box",
            display: "block",
            position: "relative",
            // Add border-radius here if you want it on the content wrapper
            borderRadius: "12px", // Adjust this value as needed
            backgroundColor: "background.paper", // Add background for contrast
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;