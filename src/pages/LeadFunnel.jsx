// components/LeadFunnelDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Avatar,
  Divider,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Pagination,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Visibility,
  Close,
  Phone,
  Email,
  Business,
  CalendarToday,
  LocationOn,
  Notes,
  Person,
  ArrowForward,
  TrendingUp,
  Group,
  CheckCircle,
  Warning,
  MonetizationOn,
  Description,
  AssignmentInd,
  Search,
  FilterList,
  Sort,
  Download,
  Refresh,
  Timeline,
  PieChart,
  BarChart,
  ViewList,
  GridView,
  MoreVert,
  Speed,
  TableChart,
  NavigateNext,
  NavigateBefore,
  FirstPage,
  LastPage,
  ArrowUpward,
  ArrowDownward,
  Assessment,
  TrendingFlat,
  PlayCircle,
  StopCircle,
  PauseCircle,
  Edit,
  Delete,
  Share,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const PRIMARY_COLOR = "#1976d2";
const SECONDARY_COLOR = "#ff6d00";

const STAGE_CONFIG = {
  Visit: {
    color: "#1976d2",
    icon: <Person />,
    description: "Initial contact and site visit scheduled",
    bgColor: "#e3f2fd",
  },
  Registration: {
    color: "#4caf50",
    icon: <AssignmentInd />,
    description: "Customer registration completed",
    bgColor: "#e8f5e9",
  },
  "Bank Loan Apply": {
    color: "#9c27b0",
    icon: <MonetizationOn />,
    description: "Bank loan application submitted",
    bgColor: "#f3e5f5",
  },
  "Document Submission": {
    color: "#00bcd4",
    icon: <Description />,
    description: "Required documents submitted",
    bgColor: "#e0f7fa",
  },
  Disbursement: {
    color: "#ff9800",
    icon: <TrendingUp />,
    description: "Loan disbursed to customer",
    bgColor: "#fff3e0",
  },
  "Installation Completion": {
    color: "#009688",
    icon: <CheckCircle />,
    description: "Solar installation completed",
    bgColor: "#e0f2f1",
  },
  "Missed Leads": {
    color: "#f44336",
    icon: <Warning />,
    description: "Lost or inactive leads",
    bgColor: "#ffebee",
  },
};

const STAGE_ORDER = Object.keys(STAGE_CONFIG);

export default function LeadFunnelDashboard() {
  const { fetchAPI } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStage, setSelectedStage] = useState("Visit");
  const [selectedLead, setSelectedLead] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState("cards"); // "cards", "list", or "table"
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("-createdAt");
  const [showConversion, setShowConversion] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  // Fetch funnel data
  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAPI("/lead/funnel");

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load funnel data");
      }

      // Organize data with proper stage order
      const orderedFunnel = STAGE_ORDER.map((stageName) => {
        const stage = response.result.funnel.find((s) => s.stage === stageName);
        return (
          stage || {
            stage: stageName,
            count: 0,
            leads: [],
            percentage: "0.0",
          }
        );
      });

      setFunnelData({
        ...response.result,
        funnel: orderedFunnel,
      });
    } catch (err) {
      setError(err.message || "Failed to load funnel data");
      console.error("Funnel data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelData();
  }, []);

  // Get current stage data
  const currentStageData = funnelData?.funnel?.find(
    (s) => s.stage === selectedStage
  ) || {
    stage: selectedStage,
    count: 0,
    leads: [],
    percentage: "0",
  };

  const stageConfig = STAGE_CONFIG[selectedStage] || STAGE_CONFIG.Visit;

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    if (!currentStageData.leads) return [];

    let leads = [...currentStageData.leads];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      leads = leads.filter(
        (lead) =>
          lead.firstName?.toLowerCase().includes(query) ||
          lead.lastName?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.includes(query) ||
          lead.source?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    leads.sort((a, b) => {
      switch (sortBy) {
        case "firstName":
          return (a.firstName || "").localeCompare(b.firstName || "");
        case "-firstName":
          return (b.firstName || "").localeCompare(a.firstName || "");
        case "createdAt":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "-createdAt":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    return leads;
  }, [currentStageData.leads, searchQuery, sortBy]);

  // Paginate leads
  const paginatedLeads = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredLeads.slice(start, end);
  }, [filteredLeads, pagination.page, pagination.limit]);

  // Update pagination
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      totalPages: Math.ceil(filteredLeads.length / prev.limit),
      totalItems: filteredLeads.length,
      page:
        filteredLeads.length > 0
          ? Math.min(prev.page, Math.ceil(filteredLeads.length / prev.limit))
          : 1,
    }));
  }, [filteredLeads]);

  // Calculate conversion rates
  const calculateConversionRate = (fromStage, toStage) => {
    if (!funnelData) return { rate: "0%", value: 0 };

    const fromCount =
      funnelData.funnel.find((s) => s.stage === fromStage)?.count || 0;
    const toCount =
      funnelData.funnel.find((s) => s.stage === toStage)?.count || 0;

    if (fromCount === 0) return { rate: "0%", value: 0 };
    const rate = (toCount / fromCount) * 100;
    return { rate: `${rate.toFixed(1)}%`, value: rate };
  };

  // Get stage progression data
  const getStageProgression = () => {
    if (!funnelData) return [];

    const progression = [];
    for (let i = 0; i < STAGE_ORDER.length - 1; i++) {
      const fromStage = STAGE_ORDER[i];
      const toStage = STAGE_ORDER[i + 1];
      const conversion = calculateConversionRate(fromStage, toStage);
      progression.push({
        from: fromStage,
        to: toStage,
        ...conversion,
      });
    }
    return progression;
  };

  const stageProgression = getStageProgression();

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setOpenDialog(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event) => {
    setPagination((prev) => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 1,
    }));
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "500px",
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: PRIMARY_COLOR, mb: 2 }} />
          <Typography color="text.secondary">Loading funnel data...</Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={3}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
            mb: 2,
          }}
          action={
            <Button color="inherit" size="small" onClick={fetchFunnelData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (!funnelData) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No funnel data available
        </Typography>
        <Button variant="outlined" onClick={fetchFunnelData} sx={{ mt: 2 }}>
          Load Data
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* Header with Actions */}
      <Box sx={{ mb: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={3}
          mb={3}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#1e293b" }}
            >
              Lead Funnel Dashboard
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Track and manage leads through the entire sales pipeline
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip
                icon={<Timeline />}
                label="Pipeline View"
                sx={{ bgcolor: `${PRIMARY_COLOR}15`, color: PRIMARY_COLOR }}
              />
              <Chip
                icon={<Assessment />}
                label={`${funnelData.totalLeads || 0} Total Leads`}
                sx={{ bgcolor: `${SECONDARY_COLOR}15`, color: SECONDARY_COLOR }}
              />
              <Chip
                icon={<TrendingUp />}
                label="Real-time Analytics"
                sx={{ bgcolor: "#e8f5e9", color: "#4caf50" }}
              />
            </Box>
          </Box>

          <Box
            display="flex"
            gap={2}
            flexDirection={{ xs: "column", sm: "row" }}
            width={{ xs: "100%", sm: "auto" }}
          >
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchFunnelData}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Stats Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3} sx={{ width: "270px" }}>
            <StatCard
              title="Total Leads"
              value={funnelData.totalLeads || 0}
              icon={<Group />}
              color={PRIMARY_COLOR}
              trend="+12% from last month"
              trendDirection="up"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3} sx={{ width: "270px" }}>
            <StatCard
              title="Conversion Rate"
              value={`${stageProgression[0]?.rate || "0%"}`}
              icon={<TrendingUp />}
              color="#4caf50"
              trend={
                stageProgression[0]?.value > 50
                  ? "Excellent"
                  : "Needs improvement"
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3} sx={{ width: "270px" }}>
            <StatCard
              title="Avg. Stage Time"
              value="3.2 days"
              icon={<Speed />}
              color="#ff9800"
              trend="-0.5 days from last week"
              trendDirection="down"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3} sx={{ width: "270px" }}>
            <StatCard
              title="Missed Leads"
              value={
                funnelData.funnel?.find((s) => s.stage === "Missed Leads")
                  ?.count || 0
              }
              icon={<Warning />}
              color="#f44336"
              trend="Requires attention"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Main Dashboard Layout */}
      <Grid container spacing={3}>
        {/* Left Column - Stage Pipeline */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, overflow: "hidden", height: "100%" }}>
            <Box sx={{ p: 3, bgcolor: PRIMARY_COLOR, color: "white" }}>
              <Typography variant="h6" fontWeight="bold">
                Lead Pipeline
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Stage progression overview
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                {funnelData.funnel?.map((stage, index) => {
                  const config = STAGE_CONFIG[stage.stage];
                  const conversion =
                    index < STAGE_ORDER.length - 1
                      ? stageProgression[index]
                      : null;

                  return (
                    <React.Fragment key={stage.stage}>
                      <StageItem
                        stage={stage}
                        config={config}
                        isSelected={selectedStage === stage.stage}
                        onClick={() => setSelectedStage(stage.stage)}
                      />

                      {showConversion && conversion && stage.count > 0 && (
                        <Box sx={{ ml: 4, mb: 1 }}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={0.5}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              To {STAGE_ORDER[index + 1]}:
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              color={
                                conversion.value > 30 ? "#4caf50" : "#ff9800"
                              }
                            >
                              {conversion.rate}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(conversion.value, 100)}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              bgcolor: "#e0e0e0",
                              "& .MuiLinearProgress-bar": {
                                bgcolor:
                                  conversion.value > 30 ? "#4caf50" : "#ff9800",
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>
                      )}
                    </React.Fragment>
                  );
                })}
              </Stack>

              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showConversion}
                      onChange={(e) => setShowConversion(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label="Show conversion rates"
                />
              </Box>
            </Box>
          </Card>

          {/* Quick Stats Card */}
          <Card sx={{ borderRadius: 3, mt: 3, p: 3 , width:"400px" }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Pipeline Health
            </Typography>
            <Stack spacing={2}>
              <HealthMetric
                label="Pipeline Velocity"
                value="Good"
                color="#4caf50"
                icon={<PlayCircle />}
              />
              <HealthMetric
                label="Stage Stickiness"
                value="Medium"
                color="#ff9800"
                icon={<PauseCircle />}
              />
              <HealthMetric
                label="Lead Quality"
                value="High"
                color="#4caf50"
                icon={<TrendingUp />}
              />
            </Stack>
          </Card>
        </Grid>

        {/* Right Column - Stage Details */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, overflow: "hidden", height: "100%" , width:"725px" }}>
            {/* Stage Header */}
            <Box
              sx={{
                p: 3,
                bgcolor: `${stageConfig.color}15`,
                borderLeft: `4px solid ${stageConfig.color}`,
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={2}
              >
                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Avatar sx={{ bgcolor: stageConfig.color, color: "white" }}>
                      {stageConfig.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {selectedStage}
                      </Typography>
                      <Typography color="text.secondary">
                        {stageConfig.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={3} mt={2}>
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color={stageConfig.color}
                      >
                        {currentStageData.count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Leads
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        {currentStageData.percentage}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        of Pipeline
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="-createdAt">Newest</MenuItem>
                      <MenuItem value="createdAt">Oldest</MenuItem>
                      <MenuItem value="firstName">A to Z</MenuItem>
                      <MenuItem value="-firstName">Z to A</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>

            {/* Stage Content */}
            <Box sx={{ p: 3 }}>
              {/* Controls Bar */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                flexDirection={{ xs: "column", sm: "row" }}
                gap={2}
              >
                <Box display="flex" gap={2} width={{ xs: "100%", sm: "auto" }}>
                  <TextField
                    size="small"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ minWidth: 200 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box display="flex" gap={1}>
                    <Tooltip title="Card View">
                      <IconButton
                        size="small"
                        onClick={() => setViewMode("cards")}
                        sx={{
                          bgcolor:
                            viewMode === "cards"
                              ? `${PRIMARY_COLOR}15`
                              : "transparent",
                          color:
                            viewMode === "cards"
                              ? PRIMARY_COLOR
                              : "text.secondary",
                        }}
                      >
                        <GridView />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="List View">
                      <IconButton
                        size="small"
                        onClick={() => setViewMode("list")}
                        sx={{
                          bgcolor:
                            viewMode === "list"
                              ? `${PRIMARY_COLOR}15`
                              : "transparent",
                          color:
                            viewMode === "list"
                              ? PRIMARY_COLOR
                              : "text.secondary",
                        }}
                      >
                        <ViewList />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Table View">
                      <IconButton
                        size="small"
                        onClick={() => setViewMode("table")}
                        sx={{
                          bgcolor:
                            viewMode === "table"
                              ? `${PRIMARY_COLOR}15`
                              : "transparent",
                          color:
                            viewMode === "table"
                              ? PRIMARY_COLOR
                              : "text.secondary",
                        }}
                      >
                        <TableChart />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Showing {paginatedLeads.length} of {filteredLeads.length}{" "}
                  leads
                </Typography>
              </Box>

              {/* Leads Display */}
              {currentStageData.count === 0 ? (
                <EmptyStage stage={selectedStage} />
              ) : filteredLeads.length === 0 ? (
                <EmptySearch />
              ) : (
                <>
                  {viewMode === "cards" && (
                    <LeadCards
                      leads={paginatedLeads}
                      stageColor={stageConfig.color}
                      onView={handleViewLead}
                    />
                  )}

                  {viewMode === "list" && (
                    <LeadList
                      leads={paginatedLeads}
                      stageColor={stageConfig.color}
                      onView={handleViewLead}
                    />
                  )}

                  {viewMode === "table" && (
                    <LeadTable
                      leads={paginatedLeads}
                      stageColor={stageConfig.color}
                      onView={handleViewLead}
                    />
                  )}

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <Box
                      sx={{
                        mt: 4,
                        pt: 3,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="body2" color="text.secondary">
                            Rows per page:
                          </Typography>
                          <Select
                            size="small"
                            value={pagination.limit}
                            onChange={handleLimitChange}
                            sx={{ minWidth: 70 }}
                          >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={20}>20</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                          </Select>
                          <Typography variant="body2" color="text.secondary">
                            {(pagination.page - 1) * pagination.limit + 1}-
                            {Math.min(
                              pagination.page * pagination.limit,
                              pagination.totalItems
                            )}{" "}
                            of {pagination.totalItems}
                          </Typography>
                        </Box>

                        <Pagination
                          count={pagination.totalPages}
                          page={pagination.page}
                          onChange={handlePageChange}
                          color="primary"
                          size={isMobile ? "small" : "medium"}
                          showFirstButton
                          showLastButton
                          siblingCount={isMobile ? 0 : 1}
                        />
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Lead Detail Dialog */}
      <LeadDetailDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        lead={selectedLead}
        stage={selectedStage}
        isMobile={isMobile}
      />
    </Box>
  );
}

// Component: Stat Card
const StatCard = ({ title, value, icon, color, trend, trendDirection }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        height: "100%",
        transition: "all 0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Avatar sx={{ bgcolor: `${color}15`, color }}>{icon}</Avatar>
          {trendDirection === "up" && (
            <ArrowUpward sx={{ color: "#4caf50", fontSize: 20 }} />
          )}
          {trendDirection === "down" && (
            <ArrowDownward sx={{ color: "#f44336", fontSize: 20 }} />
          )}
        </Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {value}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {trend && (
          <Typography variant="caption" color="text.secondary">
            {trend}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Component: Stage Item
const StageItem = ({ stage, config, isSelected, onClick }) => {
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 2,
        transition: "all 0.2s",
        border: `2px solid ${isSelected ? config.color : "transparent"}`,
        bgcolor: isSelected ? `${config.color}10` : "transparent",
        "&:hover": {
          bgcolor: `${config.color}10`,
          transform: "translateX(4px)",
        },
      }}
    >
      <Avatar
        sx={{ bgcolor: config.color, color: "white", width: 40, height: 40 }}
      >
        {config.icon}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {stage.stage}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {stage.count} leads • {stage.percentage}%
        </Typography>
      </Box>
      <NavigateNext sx={{ color: "text.secondary" }} />
    </Paper>
  );
};

// Component: Health Metric
const HealthMetric = ({ label, value, color, icon }) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography variant="body2">{label}</Typography>
      </Box>
      <Chip
        label={value}
        size="small"
        sx={{
          bgcolor: `${color}20`,
          color,
          fontWeight: 600,
          borderRadius: 1,
        }}
      />
    </Box>
  );
};

// Component: Lead Cards (Grid View)
const LeadCards = ({ leads, stageColor, onView }) => {
  return (
    <Grid container spacing={3}>
      {leads.map((lead) => (
        <Grid item xs={12} sm={6} lg={4} key={lead._id}>
          <Card
            sx={{
              borderRadius: 3,
              height: "100%",
              transition: "all 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: stageColor, color: "white" }}>
                  {lead.firstName?.[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {lead.firstName} {lead.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {lead.email}
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={1.5} sx={{ mb: 3 }}>
                {lead.phone && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">{lead.phone}</Typography>
                  </Box>
                )}
                {lead.source && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Business fontSize="small" color="action" />
                    <Typography variant="body2">{lead.source}</Typography>
                  </Box>
                )}
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Added {new Date(lead.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                onClick={() => onView(lead)}
                sx={{
                  bgcolor: stageColor,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: stageColor,
                    opacity: 0.9,
                  },
                }}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Component: Lead List (List View)
const LeadList = ({ leads, stageColor, onView }) => {
  return (
    <Stack spacing={2}>
      {leads.map((lead) => (
        <Paper
          key={lead._id}
          sx={{
            p: 2,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "action.hover",
              transform: "translateX(4px)",
            },
          }}
        >
          <Avatar sx={{ bgcolor: stageColor, color: "white" }}>
            {lead.firstName?.[0]}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {lead.firstName} {lead.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {lead.email} • {lead.phone}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {lead.source && (
              <Chip label={lead.source} size="small" variant="outlined" />
            )}

            <Typography variant="caption" color="text.secondary">
              {new Date(lead.createdAt).toLocaleDateString()}
            </Typography>

            <Button
              variant="outlined"
              size="small"
              onClick={() => onView(lead)}
              sx={{
                borderRadius: 2,
                borderColor: stageColor,
                color: stageColor,
                "&:hover": {
                  borderColor: stageColor,
                  bgcolor: `${stageColor}10`,
                },
              }}
            >
              View
            </Button>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
};

// Component: Lead Table (Table View)
const LeadTable = ({ leads, stageColor, onView }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Lead</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Date Added</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead._id}
              hover
              sx={{ "&:hover": { bgcolor: "action.hover" } }}
            >
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{
                      bgcolor: stageColor,
                      color: "white",
                      width: 32,
                      height: 32,
                    }}
                  >
                    {lead.firstName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {lead.firstName} {lead.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {lead.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{lead.phone}</Typography>
              </TableCell>
              <TableCell>
                <Chip label={lead.source} size="small" variant="outlined" />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onView(lead)}
                  sx={{
                    borderRadius: 2,
                    borderColor: stageColor,
                    color: stageColor,
                    "&:hover": {
                      borderColor: stageColor,
                      bgcolor: `${stageColor}10`,
                    },
                  }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Component: Empty Stage
const EmptyStage = ({ stage }) => (
  <Box textAlign="center" py={8}>
    <Avatar
      sx={{
        width: 80,
        height: 80,
        bgcolor: "#e0e0e0",
        color: "#9e9e9e",
        mx: "auto",
        mb: 3,
      }}
    >
      <Group sx={{ fontSize: 40 }} />
    </Avatar>
    <Typography variant="h6" color="text.secondary" gutterBottom>
      No leads in {stage}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ maxWidth: 400, mx: "auto" }}
    >
      Leads will appear here as they progress through the pipeline. Focus on
      moving leads from previous stages.
    </Typography>
  </Box>
);

// Component: Empty Search
const EmptySearch = () => (
  <Box textAlign="center" py={8}>
    <Search sx={{ fontSize: 60, color: "#e0e0e0", mb: 2 }} />
    <Typography variant="h6" color="text.secondary" gutterBottom>
      No matching leads found
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Try adjusting your search criteria
    </Typography>
  </Box>
);

// Component: Lead Detail Dialog
const LeadDetailDialog = ({ open, onClose, lead, stage, isMobile }) => {
  if (!lead) return null;

  const stageConfig = STAGE_CONFIG[stage] || STAGE_CONFIG.Visit;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : 3 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          pb: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: stageConfig.color, color: "white" }}>
            {lead.firstName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {lead.firstName} {lead.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lead Details
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Contact Info */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <InfoRow
                        icon={<Phone />}
                        label="Phone"
                        value={lead.phone}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow
                        icon={<Email />}
                        label="Email"
                        value={lead.email}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow
                        icon={<Business />}
                        label="Source"
                        value={lead.source}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow
                        icon={<LocationOn />}
                        label="Location"
                        value={lead.city}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Stage History
                  </Typography>
                  <Stack spacing={1}>
                    <TimelineItem
                      stage={stage}
                      date={lead.createdAt}
                      isCurrent={true}
                      color={stageConfig.color}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Status Card */}
              <Card
                sx={{
                  borderRadius: 2,
                  borderLeft: `4px solid ${stageConfig.color}`,
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Current Status
                  </Typography>
                  <Chip
                    label={stage}
                    icon={stageConfig.icon}
                    sx={{
                      bgcolor: stageConfig.bgColor,
                      color: stageConfig.color,
                      fontWeight: 600,
                      mb: 2,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {stageConfig.description}
                  </Typography>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Actions
                  </Typography>
                  <Stack spacing={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Edit />}
                      size="small"
                    >
                      Edit Lead
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Phone />}
                      size="small"
                    >
                      Call Lead
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Email />}
                      size="small"
                    >
                      Send Email
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      size="small"
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, borderTop: 1, borderColor: "divider" }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button variant="contained" sx={{ bgcolor: PRIMARY_COLOR }}>
          Move to Next Stage
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Component: Info Row
const InfoRow = ({ icon, label, value }) => (
  <Box display="flex" alignItems="center" gap={2}>
    <Box sx={{ color: "primary.main" }}>{icon}</Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value || "Not provided"}
      </Typography>
    </Box>
  </Box>
);

// Component: Timeline Item
const TimelineItem = ({ stage, date, isCurrent, color }) => {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.Visit;

  return (
    <Box display="flex" alignItems="flex-start" gap={2}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: isCurrent ? color : "#e0e0e0",
          color: isCurrent ? "white" : "#9e9e9e",
        }}
      >
        {config.icon}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          {stage}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {date
            ? new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Date not available"}
        </Typography>
      </Box>
    </Box>
  );
};
