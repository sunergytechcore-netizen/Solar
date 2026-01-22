import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  alpha,
  Skeleton,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  Visibility,
  People,
  PersonAdd,
  Group,
  AccountBalance,
  Description,
  Payments,
  CheckCircle,
  TrendingUp,
  Mail,
  Phone,
  ArrowUpward,
  ArrowDownward,
  Today,
  CalendarMonth,
  Event,
  Refresh,
  NavigateNext,
  TrendingFlat,
  AccessTime,
  TaskAlt,
  Warning,
  AssignmentTurnedIn,
  Cancel,
  TrendingDown,
  SentimentDissatisfied,
  Info,
  Schedule,
  HourglassEmpty,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../contexts/DashboardContext";
import { useAuth } from "../contexts/AuthContext";

// Constants
const PRIMARY_COLOR = "#ff6d00";

const getInitials = (name) => {
  if (!name || typeof name !== "string") return "??";
  return name
    .split(" ")
    .map((n) => n?.[0] || "")
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Period options with icons
const PERIOD_OPTIONS = [
  { value: "today", label: "Today", icon: <Today fontSize="small" /> },
  {
    value: "weekly",
    label: "Weekly",
    icon: <CalendarMonth fontSize="small" />,
  },
  { value: "monthly", label: "Monthly", icon: <Event fontSize="small" /> },
  { value: "yearly", label: "Yearly", icon: <AccessTime fontSize="small" /> },
];

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case "Visit":
      return "primary";
    case "Registration":
      return "success";
    case "Disbursement":
      return "info";
    case "Bank Loan Apply":
      return "warning";
    case "Document Submission":
      return "secondary";
    default:
      return "default";
  }
};

// Empty State Components
const EmptyStateCard = ({ title, message, icon, action }) => (
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
      bgcolor: "white",
      border: "1px solid #f5f5f5",
      height: "100%",
      minHeight: 300,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: 4,
    }}
  >
    <CardContent sx={{ textAlign: "center" }}>
      {icon}
      <Typography
        variant="h6"
        color="text.secondary"
        gutterBottom
        sx={{ mt: 2 }}
      >
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      {action}
    </CardContent>
  </Card>
);

export default function UnifiedDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Responsive breakpoints
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmall = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMedium = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));

  const { user } = useAuth();
  const {
    dashboardData,
    loading,
    error,
    fetchDashboardData,
    refreshDashboard,
    formatDateTime,
    getRoleDisplayName,
  } = useDashboard();

  // State
  const [timeFilter, setTimeFilter] = useState("today");
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle time filter change
  const handleTimeFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setTimeFilter(newFilter);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshDashboard();
    setRefreshing(false);
  };

  // Navigation handlers
  const handleNavigateTo = (path) => {
    navigate(path);
  };

  // Process stats data based on API response
  useEffect(() => {
    if (dashboardData?.overview) {
      const processedStats = processStats();
      setStats(processedStats);
    }
  }, [dashboardData, timeFilter, theme, user?.role]);

  // Process stats based on dashboard data and user role
  const processStats = () => {
    try {
      if (!dashboardData?.overview) {
        return [];
      }

      const { overview } = dashboardData;
      const userRole = user?.role;

      // Base stats for all roles
      const baseStats = [
        {
          title: "Total Visits",
          value: (overview.totalVisits || 0).toString(),
          change: overview.totalVisits > 0 ? "+8%" : "0%",
          trend: overview.totalVisits > 0 ? "up" : "flat",
          icon: <Visibility sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />,
          color: theme.palette.primary.main,
          subtitle: getTimeSubtitle(),
          navigateTo: "/total-visits",
        },
        {
          title: "Missed Leads",
          value: (overview.totalMissedLeads || 0).toString(),
          change: overview.totalMissedLeads > 0 ? "+5%" : "0%",
          trend: overview.totalMissedLeads > 0 ? "up" : "down",
          icon: <Cancel sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />,
          color: theme.palette.error.main,
          subtitle: getTimeSubtitle(),
          navigateTo: "/missed-leads",
        },
        {
          title: "Registrations",
          value: (overview.totalRegistrations || 0).toString(),
          change: overview.totalRegistrations > 0 ? "+15%" : "0%",
          trend: overview.totalRegistrations > 0 ? "up" : "flat",
          icon: <PersonAdd sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />,
          color: theme.palette.success.main,
          subtitle: getTimeSubtitle(),
          navigateTo: "/registration",
        },
      ];

      // Role-specific additional stats
      let roleSpecificStats = [];

      if (userRole === "Head_office" || userRole === "ZSM") {
        roleSpecificStats = [
          {
            title: "Bank Loan Apply",
            value: (overview.totalBankLoanApply || 0).toString(),
            change: overview.totalBankLoanApply > 0 ? "+5%" : "0%",
            trend: overview.totalBankLoanApply > 0 ? "up" : "flat",
            icon: (
              <AccountBalance sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
            ),
            color: "#2196f3",
            subtitle: getTimeSubtitle(),
            navigateTo: "/bank-loan-apply",
          },
          {
            title: "Document Submission",
            value: (overview.totalDocumentSubmission || 0).toString(),
            change: overview.totalDocumentSubmission > 0 ? "+12%" : "0%",
            trend: overview.totalDocumentSubmission > 0 ? "up" : "flat",
            icon: <Description sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />,
            color: theme.palette.warning.main,
            subtitle: getTimeSubtitle(),
            navigateTo: "/document-submission",
          },
          {
            title: "Disbursement",
            value: `₹${(overview.totalDisbursement || 0).toLocaleString(
              "en-IN"
            )}`,
            change: overview.totalDisbursement > 0 ? "+18%" : "0%",
            trend: overview.totalDisbursement > 0 ? "up" : "flat",
            icon: <Payments sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />,
            color: "#00bcd4",
            subtitle: getTimeSubtitle(),
            navigateTo: "/disbursement",
          },
          {
            title: "Installation Completion",
            value: (overview.totalInstallations || 0).toString(),
            change: overview.totalInstallations > 0 ? "+8%" : "0%",
            trend: overview.totalInstallations > 0 ? "up" : "flat",
            icon: <CheckCircle sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />,
            color: "#4caf50",
            subtitle: getTimeSubtitle(),
            navigateTo: "/installation-completion",
          },
          {
            title: "Team Members",
            value: (overview.totalTeamMembers || 0).toString(),
            change: overview.totalTeamMembers > 0 ? "+3%" : "0%",
            trend: overview.totalTeamMembers > 0 ? "up" : "flat",
            icon: <Group sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />,
            color: "#9c27b0",
            subtitle: "Active members",
            navigateTo: "/team-members",
          },
        ];
      } else if (userRole === "ASM") {
        roleSpecificStats = [
          {
            title: "Team Members",
            value: (overview.totalTeamMembers || 0).toString(),
            change: overview.totalTeamMembers > 0 ? "+2%" : "0%",
            trend: overview.totalTeamMembers > 0 ? "up" : "flat",
            icon: <Group sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />,
            color: theme.palette.secondary.main,
            subtitle: "Under management",
            navigateTo: "/my-team",
          },
          {
            title: "Total Leads",
            value: (overview.totalLeads || 0).toString(),
            change: overview.totalLeads > 0 ? "+10%" : "0%",
            trend: overview.totalLeads > 0 ? "up" : "flat",
            icon: (
              <AssignmentTurnedIn
                sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }}
              />
            ),
            color: "#4caf50",
            subtitle: getTimeSubtitle(),
            navigateTo: "/all-leads",
          },
          {
            title: "Conversion Rate",
            value: overview.conversionRate
              ? `${overview.conversionRate}%`
              : "0%",
            change: "+5%",
            trend: "up",
            icon: <TrendingUp sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />,
            color: "#ff9800",
            subtitle: "Visit to Registration",
            navigateTo: "/performance",
          },
        ];
      } else if (userRole === "TEAM") {
        roleSpecificStats = [
          {
            title: "Total Leads",
            value: (overview.totalLeads || 0).toString(),
            change: overview.totalLeads > 0 ? "+10%" : "0%",
            trend: overview.totalLeads > 0 ? "up" : "flat",
            icon: (
              <AssignmentTurnedIn
                sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }}
              />
            ),
            color: "#4caf50",
            subtitle: getTimeSubtitle(),
            navigateTo: "/all-leads",
          },
          {
            title: "Today's Target",
            value: overview.todaysTarget?.toString() || "0/5",
            change: "+20%",
            trend: "up",
            icon: <TaskAlt sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />,
            color: PRIMARY_COLOR,
            subtitle: "Visits completed",
            navigateTo: "/my-targets",
          },
          {
            title: "Conversion Rate",
            value: overview.conversionRate
              ? `${overview.conversionRate}%`
              : "0%",
            change: "+3%",
            trend: "up",
            icon: <TrendingUp sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />,
            color: "#2196f3",
            subtitle: "This month",
            navigateTo: "/my-performance",
          },
        ];
      }

      // Combine base and role-specific stats
      const allStats = [...baseStats, ...roleSpecificStats];

      // Responsive stats display
      if (isXSmall) return allStats.slice(0, 4);
      if (isSmall) return allStats.slice(0, 6);
      if (isMedium) return allStats.slice(0, 8);
      return allStats;
    } catch (err) {
      console.error("Error in processStats:", err);
      return [];
    }
  };

  // Get time subtitle based on filter
  const getTimeSubtitle = () => {
    switch (timeFilter) {
      case "today":
        return "Today";
      case "weekly":
        return "This week";
      case "monthly":
        return "This month";
      case "yearly":
        return "This year";
      default:
        return "";
    }
  };

  // Get data for sections with error handling
  const getRecentVisits = useMemo(() => {
    try {
      if (
        !dashboardData?.recentData?.visits ||
        !Array.isArray(dashboardData.recentData.visits)
      ) {
        return [];
      }
      return dashboardData.recentData.visits.slice(0, 4);
    } catch (err) {
      return [];
    }
  }, [dashboardData]);

  const getRecentRegistrations = useMemo(() => {
    try {
      if (
        !dashboardData?.recentData?.registrations ||
        !Array.isArray(dashboardData.recentData.registrations)
      ) {
        return [];
      }
      return dashboardData.recentData.registrations.slice(0, 4);
    } catch (err) {
      return [];
    }
  }, [dashboardData]);

  // Check if missedLeads array exists (empty array is valid)
  const hasMissedLeadsData = useMemo(() => {
    try {
      return dashboardData?.recentData?.missedLeads !== undefined;
    } catch (err) {
      return false;
    }
  }, [dashboardData]);

  const getRecentMissedLeads = useMemo(() => {
    try {
      // Check if missedLeads exists (even if it's an empty array)
      if (dashboardData?.recentData?.missedLeads !== undefined) {
        return dashboardData.recentData.missedLeads.slice(0, 4);
      }
      return [];
    } catch (err) {
      return [];
    }
  }, [dashboardData]);

  const getRecentActivities = useMemo(() => {
    try {
      if (
        !dashboardData?.activities ||
        !Array.isArray(dashboardData.activities)
      ) {
        return [];
      }
      return dashboardData.activities.slice(0, 6);
    } catch (err) {
      return [];
    }
  }, [dashboardData]);

  const getTeamMembers = useMemo(() => {
    try {
      if (
        !dashboardData?.team?.members ||
        !Array.isArray(dashboardData.team.members)
      ) {
        return [];
      }
      return dashboardData.team.members.slice(0, 8);
    } catch (err) {
      return [];
    }
  }, [dashboardData]);

  const getTeamPerformance = useMemo(() => {
    try {
      if (
        !dashboardData?.teamPerformance ||
        !Array.isArray(dashboardData.teamPerformance)
      ) {
        return [];
      }
      return dashboardData.teamPerformance.slice(0, 5);
    } catch (err) {
      return [];
    }
  }, [dashboardData]);

  // Check if dashboard has any data
  const hasDashboardData = useMemo(() => {
    if (!dashboardData) return false;

    const { overview, recentData, activities, team, teamPerformance } =
      dashboardData;

    const hasOverviewData = overview && Object.keys(overview).length > 0;
    const hasRecentData =
      recentData &&
      ((recentData.visits && recentData.visits.length > 0) ||
        (recentData.registrations && recentData.registrations.length > 0) ||
        recentData.missedLeads !== undefined);
    const hasActivities = activities && activities.length > 0;
    const hasTeamData = team && team.members && team.members.length > 0;
    const hasPerformanceData = teamPerformance && teamPerformance.length > 0;

    return (
      hasOverviewData ||
      hasRecentData ||
      hasActivities ||
      hasTeamData ||
      hasPerformanceData
    );
  }, [dashboardData]);

  // Responsive grid spacing
  const getGridSpacing = () => {
    if (isXSmall) return 1.5;
    if (isSmall) return 2;
    return 3;
  };

  // Loading skeleton
  if (loading && !dashboardData) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 4 }} />

        <Grid container spacing={getGridSpacing()} mb={4}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={6} sm={4} md={3} key={item}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={getGridSpacing()}>
          <Grid item xs={12} lg={8}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Main error state
  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              RETRY
            </Button>
          }
        >
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  // No data state
  if (!hasDashboardData && !loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box mb={4}>
          <Typography
            variant={isXSmall ? "h5" : "h4"}
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            {getRoleDisplayName()} Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.firstName || "User"}!
          </Typography>
        </Box>

        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "#fafafa",
            borderRadius: 2,
            border: "1px dashed #e0e0e0",
          }}
        >
          <Info sx={{ fontSize: 64, color: "info.main", mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No Data Available
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 600, mx: "auto" }}
          >
            Your dashboard is currently empty. Start by creating visits or
            registrations to see your performance data.
          </Typography>
          <Button
            variant="contained"
            onClick={handleRefresh}
            startIcon={<Refresh />}
            size="large"
          >
            Refresh Dashboard
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        minHeight: "100vh",
        bgcolor: "#ffffff",
      }}
    >
      {/* Header */}
      <Box mb={{ xs: 2, sm: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 1, sm: 2 },
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Box>
            <Typography
              variant={isXSmall ? "h5" : "h4"}
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              {getRoleDisplayName()} Dashboard
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Welcome back, {user?.firstName || "User"}! Here's your performance
              summary
            </Typography>
            {dashboardData && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5 }}
              >
                Last updated: {formatDateTime(new Date())}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: { xs: 1, sm: 2 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <ToggleButtonGroup
              value={timeFilter}
              exclusive
              onChange={handleTimeFilterChange}
              aria-label="time filter"
              size="small"
              sx={{
                width: { xs: "100%", sm: "auto" },
                flexWrap: { xs: "wrap", sm: "nowrap" },
                "& .MuiToggleButton-root": {
                  flex: { xs: 1, sm: "none" },
                  px: { xs: 1, sm: 1.5 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
              }}
            >
              {PERIOD_OPTIONS.map((option) => (
                <ToggleButton key={option.value} value={option.value}>
                  {option.icon}
                  <Box
                    component="span"
                    sx={{ ml: 1, display: { xs: "none", sm: "inline" } }}
                  >
                    {option.label}
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              size="small"
              sx={{
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                alignSelf: { xs: "flex-end", sm: "center" },
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={getGridSpacing()} mb={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                  height: "100%",
                  width: "272px",
                  minHeight: { xs: 110, sm: 120, md: 140 },
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  bgcolor: "white",
                  border: "1px solid #f5f5f5",
                  "&:hover": {
                    transform: { xs: "none", sm: "translateY(-4px)" },
                    boxShadow: "0px 8px 16px rgba(0,0,0,0.12)",
                  },
                }}
                onClick={() =>
                  stat.navigateTo && handleNavigateTo(stat.navigateTo)
                }
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant={isXSmall ? "h6" : "h5"}
                        fontWeight="bold"
                        color={stat.color}
                        gutterBottom
                        sx={{
                          fontSize: {
                            xs: "1.1rem",
                            sm: "1.25rem",
                            md: "1.5rem",
                          },
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        }}
                      >
                        {stat.subtitle}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: { xs: 0.75, sm: 1 },
                        borderRadius: 2,
                        bgcolor: alpha(stat.color, 0.1),
                        color: stat.color,
                        ml: 1,
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mt: { xs: 0.5, sm: 1 },
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpward
                          sx={{
                            fontSize: { xs: 12, sm: 14 },
                            color: "success.main",
                          }}
                        />
                      ) : stat.trend === "down" ? (
                        <ArrowDownward
                          sx={{
                            fontSize: { xs: 12, sm: 14 },
                            color: "error.main",
                          }}
                        />
                      ) : (
                        <TrendingFlat
                          sx={{
                            fontSize: { xs: 12, sm: 14 },
                            color: "text.secondary",
                          }}
                        />
                      )}
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color={
                          stat.trend === "up"
                            ? "success.main"
                            : stat.trend === "down"
                            ? "error.main"
                            : "text.secondary"
                        }
                        sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                      >
                        {stat.change}
                      </Typography>
                    </Box>
                    <NavigateNext
                      sx={{
                        fontSize: { xs: 14, sm: 16 },
                        color: "text.secondary",
                        opacity: 0.7,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={getGridSpacing()}>
        {/* Recent Visits - 1st Column */}
        <Grid item xs={12} md={6} lg={4} sx={{ width: "370px" }}>
          {getRecentVisits.length === 0 ? (
            <EmptyStateCard
              title="No Recent Visits"
              message="No recent visits found. Create a new visit to get started."
              icon={
                <Visibility
                  sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5 }}
                />
              }
              action={
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/create-visit")}
                >
                  Create Visit
                </Button>
              }
            />
          ) : (
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                bgcolor: "white",
                border: "1px solid #f5f5f5",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Recent Visits
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleNavigateTo("/total-visits")}
                    endIcon={<NavigateNext />}
                    sx={{ bgcolor: PRIMARY_COLOR, color: "#fff" }}
                  >
                    View All
                  </Button>
                </Box>
                <Stack spacing={2}>
                  {getRecentVisits.map((visit, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}`,
                        height: "100%",
                        bgcolor: PRIMARY_COLOR,
                        color: "#fff",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography
                          fontWeight="600"
                          sx={{ fontSize: "0.95rem" }}
                        >
                          {visit.firstName} {visit.lastName}
                        </Typography>
                        <Chip
                          label={visit.visitStatus || "Not Assigned"}
                          size="small"
                          color={
                            visit.visitStatus === "Completed"
                              ? "success"
                              : "warning"
                          }
                          variant="outlined"
                          sx={{
                            fontSize: "0.7rem",
                            bgcolor: "#fff",
                            color: PRIMARY_COLOR,
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Phone fontSize="small" sx={{ fontSize: 14 }} />
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "0.8rem" }}
                          >
                            {visit.phone || "N/A"}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Mail fontSize="small" sx={{ fontSize: 14 }} />
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "0.8rem" }}
                          >
                            {visit.email || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                      {visit.assignedUser && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontSize: "0.75rem",
                            display: "block",
                            mt: 0.5,
                          }}
                        >
                          Assigned to: {visit.assignedUser?.firstName}{" "}
                          {visit.assignedUser?.lastName}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Recent Registrations - 2nd Column */}
        <Grid item xs={12} md={6} lg={4} sx={{ width: "370px" }}>
          {getRecentRegistrations.length === 0 ? (
            <EmptyStateCard
              title="No Recent Registrations"
              message="No recent registrations found. Complete a visit to create a registration."
              icon={
                <PersonAdd
                  sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5 }}
                />
              }
              action={
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/registration")}
                >
                  View Registration
                </Button>
              }
            />
          ) : (
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                bgcolor: "white",
                border: "1px solid #f5f5f5",
                height: "100%",
                minHeight: 400,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="success.main"
                  >
                    Recent Registrations
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleNavigateTo("/registration")}
                    endIcon={<NavigateNext />}
                    sx={{ color: "success.main" }}
                  >
                    View All
                  </Button>
                </Box>
                <Stack spacing={2}>
                  {getRecentRegistrations.map((reg, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          theme.palette.success.main,
                          0.1
                        )}`,
                        bgcolor: alpha(theme.palette.success.main, 0.03),
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: alpha(theme.palette.success.main, 0.3),
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography
                          fontWeight="600"
                          sx={{ fontSize: "0.95rem" }}
                        >
                          {reg.firstName} {reg.lastName}
                        </Typography>
                        <Chip
                          label="Registered"
                          size="small"
                          color="success"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Phone fontSize="small" sx={{ fontSize: 14 }} />
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "0.8rem" }}
                          >
                            {reg.phone || "N/A"}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Mail fontSize="small" sx={{ fontSize: 14 }} />
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "0.8rem" }}
                          >
                            {reg.email || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                      {reg.dateOfRegistration && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.75rem" }}
                        >
                          Registered:{" "}
                          {new Date(
                            reg.dateOfRegistration
                          ).toLocaleDateString()}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Recent Missed Leads - 3rd Column */}
        <Grid item xs={12} md={6} lg={4} sx={{ width: "370px" }}>
          {/* Check if missedLeads data exists (even if empty array) */}
          {hasMissedLeadsData ? (
            getRecentMissedLeads.length === 0 ? (
              <EmptyStateCard
                title="No Missed Leads"
                message="Great job! No missed leads in recent data."
                icon={
                  <CheckCircle
                    sx={{ fontSize: 48, color: "success.main", opacity: 0.7 }}
                  />
                }
                action={
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/missed-leads")}
                  >
                    View All Missed Leads
                  </Button>
                }
              />
            ) : (
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                  bgcolor: "white",
                  border: "1px solid #f5f5f5",
                  height: "100%",
                  minHeight: 400,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="error.main"
                    >
                      Recent Missed Leads
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleNavigateTo("/missed-leads")}
                      endIcon={<NavigateNext />}
                      sx={{ color: "error.main" }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Stack spacing={2}>
                    {getRecentMissedLeads.map((lead, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: `1px solid ${alpha(
                            theme.palette.error.main,
                            0.1
                          )}`,
                          bgcolor: alpha(theme.palette.error.main, 0.03),
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: alpha(theme.palette.error.main, 0.3),
                            bgcolor: alpha(theme.palette.error.main, 0.05),
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            fontWeight="600"
                            sx={{ fontSize: "0.95rem" }}
                          >
                            {lead.firstName} {lead.lastName}
                          </Typography>
                          <Chip
                            label="Missed"
                            size="small"
                            color="error"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Phone fontSize="small" sx={{ fontSize: 14 }} />
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.8rem" }}
                            >
                              {lead.phone || "N/A"}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Mail fontSize="small" sx={{ fontSize: 14 }} />
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.8rem" }}
                            >
                              {lead.email || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                        {lead.missedDate && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            Missed:{" "}
                            {new Date(lead.missedDate).toLocaleDateString()}
                          </Typography>
                        )}
                        {lead.reason && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: "0.75rem",
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            Reason: {lead.reason}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )
          ) : // If missedLeads doesn't exist in API response, show recent activities
          getRecentActivities.length === 0 ? (
            <EmptyStateCard
              title="No Recent Activity"
              message="No recent activities found. Your activity feed will appear here."
              icon={
                <Schedule
                  sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5 }}
                />
              }
              action={
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRefresh}
                  startIcon={<Refresh />}
                >
                  Check for Updates
                </Button>
              }
            />
          ) : (
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                bgcolor: "white",
                border: "1px solid #f5f5f5",
                height: "100%",
                minHeight: 400,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" color="info.main">
                    Recent Activity
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleNavigateTo("/activities")}
                    endIcon={<NavigateNext />}
                    sx={{ color: "info.main" }}
                  >
                    View All
                  </Button>
                </Box>
                <Stack spacing={2}>
                  {getRecentActivities.map((activity, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          theme.palette[getStatusColor(activity.status)]
                            ?.main || "#e0e0e0",
                          0.1
                        )}`,
                        bgcolor: alpha(
                          theme.palette[getStatusColor(activity.status)]
                            ?.main || "#e0e0e0",
                          0.03
                        ),
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: alpha(
                            theme.palette[getStatusColor(activity.status)]
                              ?.main || "#e0e0e0",
                            0.3
                          ),
                          bgcolor: alpha(
                            theme.palette[getStatusColor(activity.status)]
                              ?.main || "#e0e0e0",
                            0.05
                          ),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor:
                              theme.palette[getStatusColor(activity.status)]
                                ?.main || "#9e9e9e",
                            width: 36,
                            height: 36,
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                          }}
                        >
                          {getInitials(activity.leadName)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            fontWeight="500"
                            sx={{ fontSize: "0.85rem" }}
                          >
                            {activity.leadName}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mt: 0.5,
                            }}
                          >
                            <Chip
                              label={activity.status}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                bgcolor: alpha(
                                  theme.palette[getStatusColor(activity.status)]
                                    ?.main || "#e0e0e0",
                                  0.1
                                ),
                                color:
                                  theme.palette[getStatusColor(activity.status)]
                                    ?.main || "#757575",
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.7rem" }}
                            >
                              {activity.updatedAt
                                ? new Date(
                                    activity.updatedAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </Typography>
                          </Box>
                          {activity.assignedTo && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                mt: 0.5,
                                fontSize: "0.7rem",
                              }}
                            >
                              Assigned to: {activity.assignedTo}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Team Overview - Only for Head_office, ZSM, ASM */}
        {(user?.role === "Head_office" ||
          user?.role === "ZSM" ||
          user?.role === "ASM") && (
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "none",
                bgcolor: "white",
                mt: 2,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: PRIMARY_COLOR }}
                  >
                    Team Overview
                  </Typography>
                  {getTeamMembers.length > 0 && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleNavigateTo("/team-members")}
                      endIcon={<NavigateNext />}
                      sx={{ color: PRIMARY_COLOR }}
                    >
                      View All Team
                    </Button>
                  )}
                </Box>

                {getTeamMembers.length === 0 ? (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: "center",
                      bgcolor: "#f9f9f9",
                      borderRadius: 2,
                    }}
                  >
                    <Group
                      sx={{
                        fontSize: 48,
                        color: "text.secondary",
                        opacity: 0.5,
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No Team Members
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
                    >
                      You don't have any team members assigned yet.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {getTeamMembers.map((member, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            width: "350px",
                            border: `1px solid ${alpha(
                              theme.palette.secondary.main,
                              0.1
                            )}`,
                            bgcolor: PRIMARY_COLOR,
                            color: "#fff",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: "#fff",
                                color: PRIMARY_COLOR,
                                width: 48,
                                height: 48,
                                fontSize: "1rem",
                                fontWeight: "bold",
                              }}
                            >
                              {getInitials(
                                `${member.firstName || ""} ${
                                  member.lastName || ""
                                }`
                              )}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight="600">
                                {member.firstName || ""} {member.lastName || ""}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", color: "#fff" }}
                              >
                                {member.role || "Team Member"}
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Chip
                              label={
                                member.status === "active"
                                  ? "Active"
                                  : "Inactive"
                              }
                              size="small"
                              color={
                                member.status === "active" ? "success" : "error"
                              }
                              sx={{
                                fontSize: "0.7rem",
                                color: PRIMARY_COLOR,
                                bgcolor: "#fff",
                              }}
                            />
                            {member.createdAt && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: "0.7rem", color:"#fff" }}
                              >
                                {new Date(
                                  member.createdAt
                                ).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>

                          {member.email && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mt: 1,
                              }}
                            >
                              <Mail fontSize="small" sx={{ fontSize: 12 }} />
                              <Typography
                                variant="caption"
                                sx={{ fontSize: "0.7rem" }}
                              >
                                {member.email}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Activity Cards in One Row */}
        {getRecentActivities.length > 0 && (
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "none",
                bgcolor: "white",
                mt: 2,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    Recent Activities
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleNavigateTo("/activities")}
                    endIcon={<NavigateNext />}
                    sx={{ color: "warning.main" }}
                  >
                    View All Activities
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {getRecentActivities.map((activity, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          width: "360px",
                          border: `1px solid ${alpha(
                            theme.palette[getStatusColor(activity.status)]
                              ?.main || "#e0e0e0",
                            0.1
                          )}`,
                          bgcolor: alpha(
                            theme.palette[getStatusColor(activity.status)]
                              ?.main || "#e0e0e0",
                            0.03
                          ),
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            borderColor: alpha(
                              theme.palette[getStatusColor(activity.status)]
                                ?.main || "#e0e0e0",
                              0.3
                            ),
                            bgcolor: alpha(
                              theme.palette[getStatusColor(activity.status)]
                                ?.main || "#e0e0e0",
                              0.05
                            ),
                            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
                            mb: 1,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor:
                                theme.palette[getStatusColor(activity.status)]
                                  ?.main || "#9e9e9e",
                              width: 40,
                              height: 40,
                              fontSize: "0.85rem",
                              fontWeight: "bold",
                            }}
                          >
                            {getInitials(activity.leadName)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              fontWeight="600"
                              sx={{ fontSize: "0.9rem" }}
                            >
                              {activity.leadName}
                            </Typography>
                            <Chip
                              label={activity.status}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "0.7rem",
                                fontWeight: 500,
                                mt: 0.5,
                                bgcolor: alpha(
                                  theme.palette[getStatusColor(activity.status)]
                                    ?.main || "#e0e0e0",
                                  0.15
                                ),
                                color:
                                  theme.palette[getStatusColor(activity.status)]
                                    ?.main || "#757575",
                              }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ mt: 1.5 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", fontSize: "0.75rem" }}
                          >
                            <Box component="span" sx={{ fontWeight: 500 }}>
                              Updated:
                            </Box>{" "}
                            {activity.updatedAt
                              ? new Date(activity.updatedAt).toLocaleString()
                              : "N/A"}
                          </Typography>
                          {activity.assignedTo && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                mt: 0.5,
                                fontSize: "0.75rem",
                              }}
                            >
                              <Box component="span" sx={{ fontWeight: 500 }}>
                                Assigned to:
                              </Box>{" "}
                              {activity.assignedTo}
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Quick Actions - Floating Button for Mobile */}
      {isXSmall && (
        <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              bgcolor: PRIMARY_COLOR,
              borderRadius: "50%",
              minWidth: "auto",
              width: 56,
              height: 56,
              boxShadow: 3,
              "&:hover": {
                bgcolor: "#e65100",
                boxShadow: 6,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
