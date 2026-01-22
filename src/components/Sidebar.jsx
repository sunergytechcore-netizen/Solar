// components/Sidebar.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  SwipeableDrawer,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Avatar,
  Badge,
  Chip,
} from "@mui/material";
import {
  Dashboard,
  Group,
  PersonAddAlt1,
  AccountBalance,
  Description,
  ReceiptLong,
  TaskAlt,
  ReportProblem,
  Assignment,
  ListAlt,
  FilterList,
  MonetizationOn,
  People,
  BarChart,
  Settings,
  Person,
  Logout,
  ChevronLeft,
  ChevronRight,
  Home,
  TrendingUp,
  Download,
  Upload,
  Payment,
  Analytics,
  ManageAccounts,
  PendingActions,
  CreditCard,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../saura_shakti_logo.png"; // Import the logo

// Constants
const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 80;
const MIN_SWIPE_DISTANCE = 50;

// Icon colors based on menu items
const ICON_COLORS = {
  Dashboard: "#ff6d00",
  "Total Visits": "#2196f3",
  Registration: "#4caf50",
  "Bank Loan Apply": "#9c27b0",
  "Document": "#ff9800",
  "Bank at Pending": "#ff5722",
  Disbursement: "#00bcd4",
  Installation: "#8bc34a",
  "Missed Leads": "#f44336",
  "Import Leads": "#ff5722",
  "All Leads": "#3f51b5",
  "Lead Funnel": "#009688",
  Expense: "#795548",
  "User Management": "#673ab7",
  "Team Management": "#673ab7",
  Reports: "#607d8b",
};

const Sidebar = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const menuContentRef = useRef(null);

  // Media queries
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [activeItem, setActiveItem] = useState("");

  // Save collapsed state
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Update active item based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    setActiveItem(currentPath);
  }, [location.pathname]);

  // Handle scroll on mobile
  const handleMenuScroll = useCallback(
    (e) => {
      if (!isMobile) return;

      const scrollTop = e.target.scrollTop;
      setScrollTop(scrollTop);
      setScrolled(scrollTop > 10);
    },
    [isMobile]
  );

  // Role-based configurations
  const roleConfig = useMemo(() => {
    const config = {
      Head_office: {
        label: "Head Office",
        icon: <Home sx={{ fontSize: 20 }} />,
        color: "#ff6d00",
        gradient: "linear-gradient(135deg, #ff6d00 0%, #ff9100 100%)",
        badgeColor: "warning",
      },
      ZSM: {
        label: "Zonal Manager",
        icon: <TrendingUp sx={{ fontSize: 20 }} />,
        color: "#1a237e",
        gradient: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
        badgeColor: "primary",
      },
      ASM: {
        label: "Area Manager",
        icon: <Group sx={{ fontSize: 20 }} />,
        color: "#2e7d32",
        gradient: "linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)",
        badgeColor: "success",
      },
      TEAM: {
        label: "Field Executive",
        icon: <Person sx={{ fontSize: 20 }} />,
        color: "#6a1b9a",
        gradient: "linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)",
        badgeColor: "secondary",
      },
    };

    return (
      config[user?.role] || {
        label: "User",
        icon: <Person sx={{ fontSize: 20 }} />,
        color: "#666",
        gradient: "linear-gradient(135deg, #666 0%, #888 100%)",
        badgeColor: "default",
      }
    );
  }, [user]);

  // Role-based menu permissions
  const hasPermission = useCallback(
    (requiredRoles) => {
      if (!user?.role) return false;
      return requiredRoles.includes(user.role);
    },
    [user]
  );

  const menuItems = useMemo(() => {
    const allItems = [
      // Main Dashboard (for all roles)
      {
        text: "Dashboard",
        icon: <Dashboard />,
        path: "/dashboard",
        exact: true,
        roles: ["Head_office", "ZSM", "ASM", "TEAM"],
      },
      // Visit Management (for all roles)
      {
        text: "Total Visits",
        icon: <Group />,
        path: "/total-visits",
        roles: ["Head_office", "ZSM", "ASM", "TEAM"],
      },
      {
        text: "Registration",
        icon: <PersonAddAlt1 />,
        path: "/registration",
        roles: ["Head_office", "ZSM", "ASM", "TEAM"],
      },
      // Sales Funnel - Updated sequence
      {
        text: "Bank Loan Apply",
        icon: <AccountBalance />,
        path: "/bank-loan-apply",
        roles: ["Head_office", "ZSM", "ASM", "TEAM"],
      },
      {
        text: "Document",
        icon: <Description />,
        path: "/document-submission",
        roles: ["Head_office", "ZSM", "ASM", "TEAM"],
      },
      {
        text: "Bank at Pending",
        icon: <PendingActions />,
        path: "/bank-at-pending",
        roles: ["Head_office", "ZSM", "ASM", "TEAM"],
      },
      {
        text: "Disbursement",
        icon: <ReceiptLong />,
        path: "/disbursement",
        roles: ["Head_office", "ZSM", "ASM", "TEAM"],
      },
      {
        text: "Installation",
        icon: <TaskAlt />,
        path: "/installation-completion",
        roles: ["Head_office", "ZSM", "ASM", "TEAM"],
      },
      {
        text: "Missed Leads",
        icon: <ReportProblem />,
        path: "/missed-leads",
        roles: ["Head_office", "ZSM", "ASM", "TEAM"],
      },
      {
        text: "Import Leads",
        icon: <Upload />,
        path: "/import-leads",
        roles: ["Head_office", "ZSM"],
      },
      {
        text: "All Leads",
        icon: <ListAlt />,
        path: "/all-leads",
        roles: ["Head_office", "ZSM", "ASM", "TEAM"],
      },
      {
        text: "Lead Funnel",
        icon: <FilterList />,
        path: "/lead-funnel",
        roles: ["Head_office", "ZSM", "ASM", "TEAM"],
      },
      {
        text: "Expense",
        icon: <Payment />,
        path: "/expense",
        roles: ["Head_office", "ZSM", "ASM", "TEAM"],
      },
      {
        text: "User Management",
        icon: <ManageAccounts />,
        path: "/user-management",
        roles: ["Head_office", "ZSM", "ASM"],
      },
      {
        text: "Reports",
        icon: <Analytics />,
        path: "/reports",
        roles: ["Head_office", "ZSM", "ASM"],
      },
    ];

    // Filter items based on user role
    return allItems.filter((item) => hasPermission(item.roles));
  }, [hasPermission]);

  // Check if item is active
  const isActive = useCallback(
    (path, exact = false) => {
      if (exact) {
        return activeItem === path;
      }
      return activeItem.startsWith(path);
    },
    [activeItem]
  );

  // Navigation handler
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      if (isMobile) {
        toggleDrawer();
      }
    },
    [navigate, isMobile, toggleDrawer]
  );

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback(
    (e) => {
      if (isMobile) {
        setTouchStart(e.targetTouches[0].clientX);
      }
    },
    [isMobile]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (isMobile && touchStart !== null) {
        setTouchEnd(e.targetTouches[0].clientX);
      }
    },
    [isMobile, touchStart]
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || !isMobile) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;

    if (isLeftSwipe && open) {
      toggleDrawer();
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, isMobile, open, toggleDrawer]);

  // Get user initials for avatar
  const getUserInitials = useCallback(() => {
    if (!user?.firstName && !user?.lastName) return "U";
    return `${user?.firstName?.[0] || ""}${
      user?.lastName?.[0] || ""
    }`.toUpperCase();
  }, [user]);

  // Get user full name
  const getUserFullName = useCallback(() => {
    if (!user?.firstName && !user?.lastName) return "User";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }, [user]);

  // Get icon color based on menu item text
  const getIconColor = useCallback(
    (text, isActive) => {
      if (isActive) return "#ffffff";
      return ICON_COLORS[text] || theme.palette.text.secondary;
    },
    [theme]
  );

  // Get background color for active item
  const getActiveBgColor = useCallback(
    (text) => {
      const baseColor = ICON_COLORS[text] || theme.palette.primary.main;
      return alpha(baseColor, 0.9);
    },
    [theme]
  );

  // Render menu item with proper icon colors
  const renderMenuItem = useCallback(
    (item) => {
      const active = isActive(item.path, item.exact);
      const iconColor = getIconColor(item.text, active);
      const bgColor = active ? getActiveBgColor(item.text) : "transparent";
      const textColor = active ? "#ffffff" : theme.palette.text.primary;
      const hoverBgColor = active
        ? alpha(getActiveBgColor(item.text), 0.8)
        : alpha(theme.palette.action.hover, 0.05);

      if (!isCollapsed || isMobile) {
        return (
          <ListItemButton
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            sx={{
              pl: 2,
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              bgcolor: bgColor,
              color: textColor,
              "&:hover": {
                bgcolor: hoverBgColor,
              },
              py: 1.25,
              px: 2,
              border: active
                ? `2px solid ${
                    ICON_COLORS[item.text] || theme.palette.primary.main
                  }`
                : "2px solid transparent",
              transition: "all 0.2s ease",
              minHeight: 48,
              boxShadow: active
                ? `0 4px 12px ${alpha(
                    ICON_COLORS[item.text] || theme.palette.primary.main,
                    0.3
                  )}`
                : "none",
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, mr: 2 }}>
              {React.cloneElement(item.icon, {
                sx: {
                  fontSize: 22,
                  color: iconColor,
                  filter: active ? "brightness(0) invert(1)" : "none",
                },
              })}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: "0.95rem",
                fontWeight: active ? 700 : 600,
                color: textColor,
              }}
            />
          </ListItemButton>
        );
      }

      return (
        <Tooltip key={item.path} title={item.text} placement="right" arrow>
          <ListItemButton
            onClick={() => handleNavigate(item.path)}
            sx={{
              justifyContent: "center",
              borderRadius: 2,
              my: 0.5,
              bgcolor: bgColor,
              "&:hover": {
                bgcolor: hoverBgColor,
              },
              p: 1.25,
              minHeight: 48,
              minWidth: 48,
              border: active
                ? `2px solid ${
                    ICON_COLORS[item.text] || theme.palette.primary.main
                  }`
                : "2px solid transparent",
              boxShadow: active
                ? `0 4px 12px ${alpha(
                    ICON_COLORS[item.text] || theme.palette.primary.main,
                    0.3
                  )}`
                : "none",
            }}
          >
            <ListItemIcon sx={{ justifyContent: "center", minWidth: "auto" }}>
              {React.cloneElement(item.icon, {
                sx: {
                  fontSize: 22,
                  color: iconColor,
                  filter: active ? "brightness(0) invert(1)" : "none",
                },
              })}
            </ListItemIcon>
          </ListItemButton>
        </Tooltip>
      );
    },
    [
      isCollapsed,
      isMobile,
      theme,
      isActive,
      handleNavigate,
      getIconColor,
      getActiveBgColor,
    ]
  );

  // Desktop Sidebar content
  const DesktopSidebarContent = useMemo(
    () => (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fff",
          borderRight: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
          width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          boxShadow: "none",
        }}
      >
        {/* Logo Section - Updated with imported logo */}
        <Box
          sx={{
            p: isCollapsed ? 1.5 : 2,
            minHeight: isCollapsed ? 80 : 100,
            display: "flex",
            flexDirection: isCollapsed ? "column" : "row",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: isCollapsed ? 0 : 1.5,
            cursor: "pointer",
            bgcolor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            },
            transition: "background-color 0.2s ease",
          }}
          onClick={() => handleNavigate("/dashboard")}
        >
          {/* Logo Container */}
          <Box
            sx={{
              width: isCollapsed ? 50 : 60,
              height: isCollapsed ? 50 : 60,
              borderRadius: isCollapsed ? "50%" : "12px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "white",
              border: isCollapsed 
                ? `2px solid ${theme.palette.primary.main}`
                : "none",
              boxShadow: isCollapsed 
                ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                : "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
            }}
          >
            <img
              src={logo}
              alt="Saura Shakti Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: isCollapsed ? "8px" : "10px",
              }}
            />
          </Box>
          
          {!isCollapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                color={theme.palette.primary.main}
                sx={{
                  fontSize: "1.3rem",
                  lineHeight: 1.2,
                  mb: 0.5,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Saura Shakti
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: "0.75rem",
                  display: "block",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Solar Management
              </Typography>
            </Box>
          )}
        </Box>

        {/* Menu Content */}
        <Box
          ref={menuContentRef}
          onScroll={handleMenuScroll}
          sx={{
            flex: 1,
            overflowY: "auto",
            py: 2,
            px: isCollapsed ? 1 : 2,
            bgcolor: "#fff",
            "&::-webkit-scrollbar": {
              width: "6px",
              display: "none",
            },
          }}
        >
          {/* Menu Items */}
          {!isCollapsed && (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  px: 2,
                  mb: 1,
                  display: "block",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                }}
              >
                Main
              </Typography>
              <List sx={{ p: 0 }}>
                {menuItems.map((item) => renderMenuItem(item))}
              </List>
            </>
          )}

          {/* Collapsed view */}
          {isCollapsed && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <List sx={{ p: 0 }}>
                {menuItems.map((item) => renderMenuItem(item))}
              </List>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: isCollapsed ? 1 : 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            position: "relative",
            "&::before": scrolled
              ? {
                  content: '""',
                  position: "absolute",
                  top: -1,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: `linear-gradient(to right, transparent, ${theme.palette.divider}, transparent)`,
                }
              : {},
          }}
        >
          {/* Collapse Toggle */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: isCollapsed ? 0.5 : 1,
            }}
          >
            <Tooltip
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              arrow
            >
              <IconButton
                onClick={() => setIsCollapsed(!isCollapsed)}
                size="small"
                sx={{
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                  width: isCollapsed ? 32 : 36,
                  height: isCollapsed ? 32 : 36,
                  transition: "all 0.2s ease",
                }}
              >
                {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Version and Logout */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: isCollapsed ? 0 : 1,
            }}
          >
            {!isCollapsed && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 500,
                }}
              >
                v2.1.0
              </Typography>
            )}
            <Tooltip
              title="Logout"
              placement={isCollapsed ? "right" : "top"}
              arrow
            >
              <IconButton
                size="small"
                onClick={logout}
                sx={{
                  color: theme.palette.error.main,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.error.main, 0.2),
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <Logout fontSize={isCollapsed ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    ),
    [
      theme,
      isCollapsed,
      menuItems,
      handleNavigate,
      logout,
      renderMenuItem,
      scrolled,
      handleMenuScroll,
    ]
  );

  // Mobile Sidebar content
  const MobileSidebarContent = useMemo(
    () => (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fff",
          width: isSmallMobile ? "100vw" : SIDEBAR_WIDTH,
          boxShadow: "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Header */}
        <Fade in={!scrolled || scrollTop === 0}>
          <Box
            sx={{
              p: 3,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              transition: "all 0.3s ease",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Mobile Logo */}
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "12px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={logo}
                  alt="Saura Shakti Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "10px",
                  }}
                />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color={theme.palette.primary.main}
                >
                  Saura Shakti
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Solar Management
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Mobile Menu Content */}
        <Box
          ref={menuContentRef}
          onScroll={handleMenuScroll}
          sx={{
            flex: 1,
            overflowY: "auto",
            py: 2,
            px: 2,
            bgcolor: "#fff",
            "&::-webkit-scrollbar": {
              width: "6px",
              display: "none",
            },
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              px: 2,
              mb: 1,
              display: "block",
              fontWeight: 700,
              letterSpacing: "1px",
              fontSize: "0.75rem",
              textTransform: "uppercase",
            }}
          >
            Main
          </Typography>

          <List sx={{ p: 0 }}>
            {menuItems.map((item) => renderMenuItem(item))}
          </List>

          {/* Spacer for better scrolling */}
          <Box sx={{ height: 20 }} />
        </Box>

        {/* Mobile Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: "center",
            flexShrink: 0,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.75rem", fontWeight: 500 }}
          >
            © 2025 Saura Shakti • v2.1.0
          </Typography>
          <IconButton
            onClick={logout}
            sx={{
              mt: 1,
              color: theme.palette.error.main,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              "&:hover": {
                bgcolor: alpha(theme.palette.error.main, 0.2),
              },
            }}
          >
            <Logout />
          </IconButton>
        </Box>
      </Box>
    ),
    [
      theme,
      menuItems,
      logout,
      renderMenuItem,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      scrolled,
      scrollTop,
      isSmallMobile,
      handleMenuScroll,
    ]
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
              boxSizing: "border-box",
              borderRight: `1px solid ${theme.palette.divider}`,
              overflowX: "hidden",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
              boxShadow: "none",
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          {DesktopSidebarContent}
        </Drawer>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <SwipeableDrawer
          anchor="left"
          open={open}
          onClose={toggleDrawer}
          onOpen={toggleDrawer}
          swipeAreaWidth={20}
          disableSwipeToOpen={false}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: isSmallMobile ? "100vw" : SIDEBAR_WIDTH,
              maxWidth: "100vw",
              boxSizing: "border-box",
              boxShadow: "none",
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          {MobileSidebarContent}
        </SwipeableDrawer>
      )}
    </>
  );
};

export default Sidebar;