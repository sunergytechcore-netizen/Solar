// pages/ExpensesPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Stack,
  Select,
  MenuItem,
  FormControl,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  InputLabel,
  InputAdornment,
  Pagination,
  Paper,
  Avatar,
  LinearProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import {
  Download,
  Add,
  Edit,
  Delete,
  Visibility,
  Close,
  CheckCircle,
  Cancel,
  AttachMoney,
  PendingActions,
  Check,
  TrendingUp,
  FilterList,
  Search,
  Sort,
  MoreVert,
  Category,
  Person,
  DirectionsCar,
  Build,
  ElectricBolt,
  Campaign,
  Inventory,
  Flight,
  Restaurant,
  Lightbulb,
  Handyman,
  School,
  ListAlt,
  ReceiptLong,
  Refresh,
  AccountBalanceWallet,
  Speed,
  BarChart,
  TableChart,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { format, parseISO } from "date-fns";

const PRIMARY_COLOR = "#1976d2";
const SECONDARY_COLOR = "#dc004e";

const STATUS_CONFIG = {
  Approved: {
    color: "#4caf50",
    bg: "#e8f5e9",
    icon: <CheckCircle />,
  },
  Pending: {
    color: "#ff9800",
    bg: "#fff3e0",
    icon: <PendingActions />,
  },
  Rejected: {
    color: "#f44336",
    bg: "#ffebee",
    icon: <Cancel />,
  },
};

const CATEGORY_CONFIG = {
  Transport: { color: "#2196f3", icon: <DirectionsCar /> },
  Equipment: { color: "#4caf50", icon: <Build /> },
  Installation: { color: "#ff8c00", icon: <ElectricBolt /> },
  Marketing: { color: "#9c27b0", icon: <Campaign /> },
  "Office Supplies": { color: "#f44336", icon: <Inventory /> },
  Travel: { color: "#00bcd4", icon: <Flight /> },
  Meals: { color: "#ff9800", icon: <Restaurant /> },
  Utilities: { color: "#795548", icon: <Lightbulb /> },
  Maintenance: { color: "#607d8b", icon: <Handyman /> },
  Training: { color: "#673ab7", icon: <School /> },
  Other: { color: "#9e9e9e", icon: <ListAlt /> },
};

export default function ExpensesPage() {
  const { user, fetchAPI, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("-date");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalItems: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [actionType, setActionType] = useState(""); // "approve" or "reject"

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
    status: "Pending",
  });

  // Feedback states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Role-based permissions - FIXED AND UPDATED
  const userRole = user?.role || "";
  
  // All roles that can create expenses
  const canCreate = ["TEAM", "ASM", "ZSM", "Head_office"].includes(userRole);
  
  // All roles that can edit their own pending expenses
  const canEdit = ["TEAM", "ASM", "ZSM", "Head_office"].includes(userRole);
  
  // Only Head_office can delete expenses
  const canDelete = userRole === "Head_office";
  
  // ASM, ZSM, and Head_office can approve/reject expenses - FIXED
  const canUpdateStatus = ["ASM", "ZSM", "Head_office"].includes(userRole);
  
  // TEAM can only see their own expenses, others see all
  const canSeeOwn = userRole === "TEAM";

  // Tabs for different views
  const tabs = [
    { label: "All", value: "all", icon: <TableChart /> },
    { label: "Pending", value: "Pending", icon: <PendingActions /> },
    { label: "Approved", value: "Approved", icon: <CheckCircle /> },
    { label: "Rejected", value: "Rejected", icon: <Cancel /> },
  ];

  const currentTabValue = tabs[activeTab]?.value || "all";

  // Filter expenses by active tab and other filters
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Apply tab filter
    if (currentTabValue !== "all") {
      filtered = filtered.filter(
        (expense) => expense.status === currentTabValue
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (expense) => expense.category === categoryFilter
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (expense) =>
          expense.title?.toLowerCase().includes(query) ||
          expense.description?.toLowerCase().includes(query) ||
          expense.category?.toLowerCase().includes(query) ||
          expense.createdBy?.email?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "-date":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "amount":
          return a.amount - b.amount;
        case "-amount":
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [expenses, currentTabValue, searchQuery, sortBy, categoryFilter]);

  // Calculate paginated expenses
  const paginatedExpenses = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredExpenses.slice(start, end);
  }, [filteredExpenses, pagination.page, pagination.limit]);

  // Update pagination when filtered results change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      totalPages: Math.ceil(filteredExpenses.length / prev.limit),
      totalItems: filteredExpenses.length,
      page: filteredExpenses.length > 0 ? Math.min(prev.page, Math.ceil(filteredExpenses.length / prev.limit)) : 1,
    }));
  }, [filteredExpenses]);

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0";
    const num = parseFloat(amount);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toFixed(0)}`;
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchQuery && { search: searchQuery }),
        ...(sortBy && { sort: sortBy }),
        ...(canSeeOwn && { myExpenses: "true" }),
      });

      const data = await fetchAPI(`/expense/getAll?${params}`);

      if (data?.success) {
        setExpenses(data.result?.expenses || []);
      } else {
        throw new Error(data?.message || "Failed to fetch expenses");
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      showSnackbar(error.message || "Failed to fetch expenses", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    if (!isAuthenticated()) return;

    try {
      const endpoint = canSeeOwn ? "/expense/stats/my" : "/expense/stats";
      const data = await fetchAPI(endpoint);
      if (data?.success) {
        setStats(data.result || { total: 0, approved: 0, pending: 0, rejected: 0 });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Calculate category data for charts
  const calculateCategoryData = () => {
    const categoryMap = {};

    expenses.forEach((expense) => {
      const category = expense.category || "Other";
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += expense.amount || 0;
    });

    const totalAmount = Object.values(categoryMap).reduce(
      (sum, amount) => sum + amount,
      0
    );

    if (totalAmount === 0) {
      return {
        pieData: [],
        barData: [],
        totalAmount: 0,
      };
    }

    const pieData = Object.entries(categoryMap)
      .map(([category, amount], index) => ({
        id: index,
        value: amount,
        label: category,
        color: CATEGORY_CONFIG[category]?.color || "#9e9e9e",
      }))
      .sort((a, b) => b.value - a.value);

    const barData = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        color: CATEGORY_CONFIG[category]?.color || "#9e9e9e",
        icon: CATEGORY_CONFIG[category]?.icon || <ListAlt />,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { pieData, barData, totalAmount };
  };

  const { pieData, barData, totalAmount } = calculateCategoryData();

  // Handle form submission
  const handleSubmit = async () => {
    if (!isAuthenticated() || !canCreate) return;

    if (!formData.title || !formData.amount || !formData.category) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      const endpoint = selectedExpense
        ? `/expense/update/${selectedExpense._id}`
        : "/expense/create";

      const method = selectedExpense ? "PUT" : "POST";

      const data = await fetchAPI(endpoint, {
        method,
        body: JSON.stringify(submitData),
      });

      if (data?.success) {
        showSnackbar(
          selectedExpense
            ? "Expense updated successfully"
            : "Expense created successfully",
          "success"
        );
        setOpenDialog(false);
        resetForm();
        fetchExpenses();
        fetchStats();
      } else {
        throw new Error(data?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      showSnackbar(error.message || "Operation failed", "error");
    }
  };

  // Handle approval - FIXED for all three roles
  const handleStatusUpdate = async () => {
    if (!isAuthenticated() || !canUpdateStatus || !selectedExpense) return;

    try {
      const status = actionType === "approve" ? "Approved" : "Rejected";
      const data = await fetchAPI(`/expense/approve/${selectedExpense._id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      if (data?.success) {
        showSnackbar(`Expense ${actionType}d successfully`, "success");
        setOpenApproveDialog(false);
        setSelectedExpense(null);
        setActionType("");
        fetchExpenses();
        fetchStats();
      } else {
        throw new Error(data?.message || `${actionType} failed`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing expense:`, error);
      showSnackbar(error.message || `${actionType} failed`, "error");
    }
  };

  // Handle deletion
  const handleDelete = async () => {
    if (!isAuthenticated() || !canDelete || !selectedExpense) return;

    try {
      const data = await fetchAPI(`/expense/delete/${selectedExpense._id}`, {
        method: "DELETE",
      });

      if (data?.success) {
        showSnackbar("Expense deleted successfully", "success");
        setOpenDeleteDialog(false);
        setSelectedExpense(null);
        fetchExpenses();
        fetchStats();
      } else {
        throw new Error(data?.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      showSnackbar(error.message || "Delete failed", "error");
    }
  };

  // Handle edit
  const handleEdit = (expense) => {
    if (!canEdit) return;

    const isOwnExpense = expense.createdBy?._id === user?._id;
    const isPending = expense.status === "Pending";

    // Head_office can edit any pending expense
    if (userRole !== "Head_office" && !isOwnExpense) {
      showSnackbar("You can only edit your own expenses", "error");
      return;
    }

    if (!isPending) {
      showSnackbar("Only pending expenses can be edited", "error");
      return;
    }

    setSelectedExpense(expense);
    setFormData({
      title: expense.title || "",
      amount: expense.amount?.toString() || "",
      category: expense.category || "",
      description: expense.description || "",
      status: "Pending",
    });
    setOpenDialog(true);
  };

  // Handle approve/reject click
  const handleStatusClick = (expense, action) => {
    if (!canUpdateStatus) return;
    
    setSelectedExpense(expense);
    setActionType(action);
    setOpenApproveDialog(true);
  };

  // Helper functions
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      category: "",
      description: "",
      status: "Pending",
    });
    setSelectedExpense(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy hh:mm a");
    } catch {
      return "Invalid Date";
    }
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle limit change
  const handleLimitChange = (event) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: parseInt(event.target.value, 10),
      page: 1 
    }));
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated()) {
      fetchExpenses();
      fetchStats();
    }
  }, [isAuthenticated(), pagination.page, pagination.limit]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );
    const approvedAmount = expenses
      .filter((e) => e.status === "Approved")
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const pendingAmount = expenses
      .filter((e) => e.status === "Pending")
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const rejectedAmount = expenses
      .filter((e) => e.status === "Rejected")
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekAmount = expenses
      .filter((e) => e.createdAt && new Date(e.createdAt) >= oneWeekAgo)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    return [
      {
        label: "Total Expenses",
        value: formatCurrency(totalAmount),
        icon: <AccountBalanceWallet />,
        color: PRIMARY_COLOR,
        subLabel: `${expenses.length} items`,
      },
      {
        label: "Approved",
        value: formatCurrency(approvedAmount),
        icon: <CheckCircle />,
        color: "#4caf50",
        subLabel: `${expenses.filter(e => e.status === "Approved").length} items`,
      },
      {
        label: "Pending",
        value: formatCurrency(pendingAmount),
        icon: <PendingActions />,
        color: "#ff9800",
        subLabel: `${expenses.filter(e => e.status === "Pending").length} items`,
      },
      {
        label: "This Week",
        value: formatCurrency(thisWeekAmount),
        icon: <Speed />,
        color: "#2196f3",
        subLabel: "Last 7 days",
      },
    ];
  }, [expenses]);

  // Safe access to expense properties
  const getExpenseStatus = (expense) => expense?.status || "Pending";
  const getExpenseCategory = (expense) => expense?.category || "Other";
  const getExpenseTitle = (expense) => expense?.title || "Untitled";
  const getExpenseAmount = (expense) => expense?.amount || 0;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          flexDirection={{ xs: "column", sm: "row" }}
          gap={2}
          mb={3}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="#1a1a1a"
              gutterBottom
            >
              Expenses Management
            </Typography>
            <Typography color="text.secondary">
              {canSeeOwn
                ? "Track your expense submissions"
                : "Manage and track all expenses"}
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                fetchExpenses();
                fetchStats();
              }}
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
              }}
            >
              Refresh
            </Button>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  bgcolor: PRIMARY_COLOR,
                  color: "white",
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "#1565c0",
                  },
                }}
              >
                New Expense
              </Button>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => {
              setActiveTab(newValue);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                minHeight: 60,
                py: 2,
                minWidth: 120,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index} 
                label={tab.label} 
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Paper>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryStats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                width:"268px",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[8],
                },
                border: `1px solid ${stat.color}20`,
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.subLabel}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Category Distribution
              </Typography>
              <BarChart sx={{ color: 'text.secondary' }} />
            </Box>
            {pieData.length > 0 ? (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PieChart
                  series={[
                    {
                      data: pieData.slice(0, 5),
                      innerRadius: 50,
                      outerRadius: 100,
                      paddingAngle: 2,
                      cornerRadius: 5,
                    },
                  ]}
                  width={500}
                  height={300}
                  slotProps={{
                    legend: {
                      direction: "row",
                      position: { vertical: "bottom", horizontal: "middle" },
                      padding: 20,
                      labelStyle: {
                        fontSize: 12,
                        fontWeight: 500,
                      },
                      itemMarkWidth: 10,
                      itemMarkHeight: 10,
                      markGap: 5,
                      itemGap: 10,
                    },
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                  color: "text.secondary",
                }}
              >
                <Category sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                <Typography>No expense data available</Typography>
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} lg={4} sx={{width:"565px"}}>
          <Card sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Top Categories
              </Typography>
              <TrendingUp sx={{ color: 'text.secondary' }} />
            </Box>
            {barData.length > 0 ? (
              <Stack spacing={2}>
                {barData.slice(0, 5).map((item, index) => (
                  <Box key={index}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ color: item.color }}>
                          {item.icon}
                        </Box>
                        <Typography variant="body2" fontWeight={500}>
                          {item.category}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(item.amount)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.amount / (totalAmount || 1)) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: `${item.color}20`,
                        "& .MuiLinearProgress-bar": {
                          bgcolor: item.color,
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                      {((item.amount / (totalAmount || 1)) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                  color: "text.secondary",
                }}
              >
                <Typography>No category data available</Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Expenses Table */}
      <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
        {/* Table Header */}
        <Box
          sx={{
            p: 3,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "#fff",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Expense Records
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pagination.totalItems} total records • Page {pagination.page} of {pagination.totalPages}
            </Typography>
          </Box>

          <Box
            display="flex"
            gap={2}
            flexDirection={isMobile ? "column" : "row"}
            width={isMobile ? "100%" : "auto"}
            alignItems={isMobile ? "stretch" : "center"}
          >
            <TextField
              size="small"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              sx={{ width: isMobile ? "100%" : 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {Object.keys(CATEGORY_CONFIG).map((category) => (
                  <MenuItem key={category} value={category}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {CATEGORY_CONFIG[category].icon}
                      <span>{category}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                displayEmpty
              >
                <MenuItem value="-date">Newest First</MenuItem>
                <MenuItem value="date">Oldest First</MenuItem>
                <MenuItem value="-amount">Amount: High to Low</MenuItem>
                <MenuItem value="amount">Amount: Low to High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Table Content */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
            <CircularProgress />
          </Box>
        ) : paginatedExpenses.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 8,
              bgcolor: "#fafafa",
            }}
          >
            <ReceiptLong sx={{ fontSize: 60, color: "text.secondary", mb: 2, opacity: 0.5 }} />
            <Typography color="text.secondary" mb={2} variant="h6">
              No expenses found
            </Typography>
            <Typography color="text.secondary" mb={3} textAlign="center">
              {searchQuery || categoryFilter !== "all" || currentTabValue !== "all" 
                ? "Try adjusting your filters or search term" 
                : canCreate 
                  ? "Get started by creating your first expense" 
                  : "No expenses available"}
            </Typography>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  bgcolor: PRIMARY_COLOR,
                  color: "white",
                  "&:hover": {
                    bgcolor: "#1565c0",
                  },
                }}
              >
                Create First Expense
              </Button>
            )}
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedExpenses.map((expense) => {
                    const status = getExpenseStatus(expense);
                    const category = getExpenseCategory(expense);
                    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
                    const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
                    const isOwnExpense = expense.createdBy?._id === user?._id;
                    const canEditThis = canEdit && (isOwnExpense || userRole === "Head_office") && status === "Pending";

                    return (
                      <TableRow 
                        key={expense._id} 
                        hover
                        sx={{ 
                          '&:last-child td': { borderBottom: 0 },
                          '&:hover': { bgcolor: '#f9f9f9' }
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography fontWeight={600} color="text.primary">
                              {getExpenseTitle(expense)}
                            </Typography>
                            {expense.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {expense.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold" color="primary" variant="body1">
                            {formatCurrency(getExpenseAmount(expense))}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={category}
                            icon={categoryConfig.icon}
                            sx={{
                              bgcolor: `${categoryConfig.color}15`,
                              color: categoryConfig.color,
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: categoryConfig.color }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.primary">
                            {formatDate(expense.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={status}
                            icon={statusConfig.icon}
                            sx={{
                              bgcolor: statusConfig.bg,
                              color: statusConfig.color,
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: statusConfig.color }
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="View details">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedExpense(expense);
                                  setOpenViewDialog(true);
                                }}
                                sx={{ 
                                  color: "primary.main",
                                  bgcolor: '#e3f2fd',
                                  '&:hover': { bgcolor: '#bbdefb' }
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {canEditThis && (
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(expense)}
                                  sx={{ 
                                    color: "warning.main",
                                    bgcolor: '#fff3e0',
                                    '&:hover': { bgcolor: '#ffe0b2' }
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {/* FIXED: Show approve/reject buttons for ASM, ZSM, and Head_office */}
                            {canUpdateStatus && status === "Pending" && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStatusClick(expense, "approve")}
                                    sx={{ 
                                      color: "success.main",
                                      bgcolor: '#e8f5e9',
                                      '&:hover': { bgcolor: '#c8e6c9' }
                                    }}
                                  >
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStatusClick(expense, "reject")}
                                    sx={{ 
                                      color: "error.main",
                                      bgcolor: '#ffebee',
                                      '&:hover': { bgcolor: '#ffcdd2' }
                                    }}
                                  >
                                    <Cancel fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}

                            {/* Only Head_office can delete */}
                            {canDelete && (
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedExpense(expense);
                                    setOpenDeleteDialog(true);
                                  }}
                                  sx={{ 
                                    color: "error.main",
                                    bgcolor: '#ffebee',
                                    '&:hover': { bgcolor: '#ffcdd2' }
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Enhanced Pagination Footer */}
            <Box 
              sx={{ 
                p: 2, 
                borderTop: 1, 
                borderColor: "divider",
                bgcolor: "#fafafa",
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Items per page:
                </Typography>
                <Select
                  size="small"
                  value={pagination.limit}
                  onChange={handleLimitChange}
                  sx={{ minWidth: 80 }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
                <Typography variant="body2" color="text.secondary">
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={2}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  size={isMobile ? "small" : "medium"}
                  showFirstButton
                  showLastButton
                  siblingCount={isMobile ? 0 : 1}
                  boundaryCount={isMobile ? 1 : 2}
                />
              </Box>
            </Box>
          </>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      {canCreate && (
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6" fontWeight="bold">
                {selectedExpense ? "Edit Expense" : "New Expense"}
              </Typography>
              <IconButton 
                onClick={() => setOpenDialog(false)} 
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                size="medium"
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
                size="medium"
              />
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  label="Category"
                  size="medium"
                >
                  {Object.keys(CATEGORY_CONFIG).map((category) => (
                    <MenuItem key={category} value={category}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ color: CATEGORY_CONFIG[category].color }}>
                          {CATEGORY_CONFIG[category].icon}
                        </Box>
                        <span>{category}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add any additional details or notes..."
                size="medium"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)} 
              variant="outlined"
              fullWidth={isMobile}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={
                !formData.title || !formData.amount || !formData.category
              }
              sx={{ 
                bgcolor: PRIMARY_COLOR, 
                color: "white",
                "&:hover": {
                  bgcolor: "#1565c0",
                },
                fullWidth: isMobile
              }}
            >
              {selectedExpense ? "Update Expense" : "Create Expense"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight="bold">Expense Details</Typography>
            <IconButton 
              onClick={() => setOpenViewDialog(false)} 
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedExpense ? (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {getExpenseTitle(selectedExpense)}
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {formatCurrency(getExpenseAmount(selectedExpense))}
                </Typography>
              </Box>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Status
                  </Typography>
                  <Chip
                    label={getExpenseStatus(selectedExpense)}
                    icon={STATUS_CONFIG[getExpenseStatus(selectedExpense)]?.icon}
                    sx={{
                      bgcolor: STATUS_CONFIG[getExpenseStatus(selectedExpense)]?.bg,
                      color: STATUS_CONFIG[getExpenseStatus(selectedExpense)]?.color,
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: STATUS_CONFIG[getExpenseStatus(selectedExpense)]?.color }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Category
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {CATEGORY_CONFIG[getExpenseCategory(selectedExpense)]?.icon && (
                      <Box sx={{ color: CATEGORY_CONFIG[getExpenseCategory(selectedExpense)]?.color }}>
                        {CATEGORY_CONFIG[getExpenseCategory(selectedExpense)]?.icon}
                      </Box>
                    )}
                    <Typography fontWeight={500}>
                      {getExpenseCategory(selectedExpense)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Created Date
                  </Typography>
                  <Typography>
                    {formatDateTime(selectedExpense.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Created By
                  </Typography>
                  <Typography>
                    {selectedExpense.createdBy?.email || "N/A"}
                  </Typography>
                </Grid>
              </Grid>

              {selectedExpense.description && (
                <>
                  <Divider />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Description
                    </Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedExpense.description}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No expense data available</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
          <Button 
            onClick={() => setOpenViewDialog(false)} 
            variant="outlined"
            fullWidth={isMobile}
          >
            Close
          </Button>
          {canEdit &&
            selectedExpense &&
            (selectedExpense?.createdBy?._id === user?._id || userRole === "Head_office") &&
            getExpenseStatus(selectedExpense) === "Pending" && (
              <Button
                onClick={() => {
                  setOpenViewDialog(false);
                  handleEdit(selectedExpense);
                }}
                variant="contained"
                sx={{
                  bgcolor: PRIMARY_COLOR,
                  color: "white",
                  "&:hover": {
                    bgcolor: "#1565c0",
                  },
                  fullWidth: isMobile
                }}
              >
                Edit Expense
              </Button>
            )}
        </DialogActions>
      </Dialog>

      {/* Approve/Reject Dialog for ASM, ZSM, and Head_office */}
      <Dialog
        open={openApproveDialog}
        onClose={() => {
          setOpenApproveDialog(false);
          setSelectedExpense(null);
          setActionType("");
        }}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" fontWeight="bold">
            {actionType === "approve" ? "Approve Expense" : "Reject Expense"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography gutterBottom>
            Are you sure you want to {actionType} this expense?
          </Typography>
          {selectedExpense && (
            <Alert severity={actionType === "approve" ? "info" : "warning"} sx={{ mt: 2 }}>
              <Typography fontWeight={600}>
                {getExpenseTitle(selectedExpense)}
              </Typography>
              <Typography variant="body2">
                Amount: {formatCurrency(getExpenseAmount(selectedExpense))}
              </Typography>
              <Typography variant="body2">
                Category: {getExpenseCategory(selectedExpense)}
              </Typography>
              <Typography variant="body2">
                Created by: {selectedExpense.createdBy?.email || "N/A"}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
          <Button 
            onClick={() => {
              setOpenApproveDialog(false);
              setSelectedExpense(null);
              setActionType("");
            }} 
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            color={actionType === "approve" ? "success" : "error"}
            startIcon={actionType === "approve" ? <CheckCircle /> : <Cancel />}
            sx={{ color: "#fff" }}
          >
            {actionType === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog - Only for Head_office */}
      {canDelete && (
        <Dialog
          open={openDeleteDialog}
          onClose={() => {
            setOpenDeleteDialog(false);
            setSelectedExpense(null);
          }}
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" fontWeight="bold">Delete Expense</Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              This action cannot be undone.
            </Alert>
            <Typography gutterBottom>
              Are you sure you want to delete this expense?
            </Typography>
            {selectedExpense && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography fontWeight={600}>
                  {getExpenseTitle(selectedExpense)}
                </Typography>
                <Typography variant="body2">
                  Amount: {formatCurrency(getExpenseAmount(selectedExpense))}
                </Typography>
                <Typography variant="body2">
                  Category: {getExpenseCategory(selectedExpense)}
                </Typography>
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
            <Button 
              onClick={() => {
                setOpenDeleteDialog(false);
                setSelectedExpense(null);
              }} 
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              startIcon={<Delete />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" , color:"#fff" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}