// pages/ReportsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Snackbar,
} from "@mui/material";
import {
  BarChart,
  PieChart,
  Build,
  TrendingUp,
  Download,
  Visibility,
  Assessment,
  Close,
  CloudDownload,
  InsertDriveFile,
  Refresh,
  CheckCircle,
  Error,
  Downloading,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { format, parseISO, isValid } from "date-fns";

const primary = "#ff6d00";

// Report configurations with API endpoints
const REPORT_CONFIGS = [
  {
    key: "leads",
    title: "Leads Report",
    description: "Lead tracking and pipeline performance",
    icon: <TrendingUp />,
    endpoint: "/report/leads",
    columns: [
      { field: "firstName", label: "First Name" },
      { field: "lastName", label: "Last Name" },
      { field: "email", label: "Email" },
      { field: "phone", label: "Phone" },
      { field: "status", label: "Status" },
      { field: "source", label: "Source" },
      { field: "assignedManager", label: "Assigned ASM" },
      { field: "assignedUser", label: "Assigned TEAM" },
      { field: "createdAt", label: "Created Date" },
    ],
  },
  {
    key: "installation",
    title: "Installation Report",
    description: "Installation completion metrics and progress",
    icon: <Build />,
    endpoint: "/report/installations",
    columns: [
      { field: "customerName", label: "Customer" },
      { field: "status", label: "Status" },
      { field: "installationDate", label: "Installation Date" },
      { field: "assignedTeam", label: "Assigned Team" },
      { field: "completionDate", label: "Completion Date" },
    ],
  },
  {
    key: "expenses",
    title: "Expenses Report",
    description: "Expense tracking and approval status",
    icon: <PieChart />,
    endpoint: "/report/expenses",
    columns: [
      { field: "title", label: "Title" },
      { field: "amount", label: "Amount" },
      { field: "category", label: "Category" },
      { field: "status", label: "Status" },
      { field: "createdBy", label: "Created By" },
      { field: "expenseDate", label: "Expense Date" },
      { field: "approvedBy", label: "Approved By" },
    ],
  },
];

// Role-based access control
const ROLE_ACCESS = {
  Head_office: {
    canAccess: ["leads", "sales", "installation", "expenses"],
    canSeeAll: true,
  },
  ZSM: {
    canAccess: ["leads", "sales", "installation", "expenses"],
    canSeeAll: true,
  },
  ASM: {
    canAccess: ["leads", "expenses"],
    canSeeAll: false, // Can only see own team's data
  },
  TEAM: {
    canAccess: ["leads", "expenses"],
    canSeeAll: false, // Can only see own data
  },
};

// Utility function to format dates
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate)
      ? format(parsedDate, "MMM dd, yyyy")
      : "Invalid date";
  } catch {
    return "Invalid date";
  }
};

// View Details Modal Component
const ReportDetailsModal = ({ open, onClose, report, data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!data) return null;

  const formatCellValue = (value, field) => {
    if (!value) return "N/A";
    
    // Handle nested objects
    if (typeof value === 'object') {
      if (field === 'assignedManager' || field === 'assignedUser' || 
          field === 'createdBy' || field === 'approvedBy' || field === 'assignedTo') {
        return `${value.firstName || ''} ${value.lastName || ''}`.trim();
      }
      return JSON.stringify(value);
    }
    
    // Format dates
    if (field.includes('Date') || field.includes('At')) {
      return formatDate(value);
    }
    
    // Format amounts
    if (field === 'amount') {
      return `₹${value}`;
    }
    
    return value;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{report?.title} - Details</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {data.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No data available for this report
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  {report.columns.map((col) => (
                    <th
                      key={col.field}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: "bold",
                        borderBottom: "2px solid #e0e0e0",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((row, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #e0e0e0",
                      "&:hover": { backgroundColor: "#fafafa" },
                    }}
                  >
                    {report.columns.map((col) => (
                      <td key={col.field} style={{ padding: "12px 16px" }}>
                        {formatCellValue(row[col.field], col.field)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 10 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, textAlign: "center" }}
              >
                Showing first 10 of {data.length} records
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function ReportsPage() {
  const { user, fetchAPI } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const userRole = user?.role || "TEAM";
  const roleAccess = ROLE_ACCESS[userRole] || ROLE_ACCESS.TEAM;

  // State management
  const [loading, setLoading] = useState(false);
  const [reportsData, setReportsData] = useState({});
  const [downloadProgress, setDownloadProgress] = useState({});
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [stats, setStats] = useState({});

  // Filter reports based on role access
  const accessibleReports = REPORT_CONFIGS.filter(report => 
    roleAccess.canAccess.includes(report.key)
  );

  // Fetch all reports data on component mount
  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const results = {};
      const statsData = {};

      for (const report of accessibleReports) {
        try {
          // Build query parameters based on role
          let endpoint = report.endpoint;
          
          if (!roleAccess.canSeeAll) {
            // For ASM and TEAM, add user-specific parameters
            if (userRole === "ASM") {
              endpoint = `${report.endpoint}?managerId=${user._id}`;
            } else if (userRole === "TEAM") {
              endpoint = `${report.endpoint}?userId=${user._id}`;
            }
          }

          const response = await fetchAPI(endpoint);

          if (response.success) {
            const result = response.result;
            results[report.key] = result[report.key] || result.leads || result.sales || result.installations || result.expenses || [];
            
            // Calculate stats for each report
            switch (report.key) {
              case "leads":
                statsData[report.key] = {
                  total: result.totalLeads || 0,
                  count: result.leads?.length || 0,
                  statuses: result.leads?.reduce((acc, lead) => {
                    const status = lead.status || "Unknown";
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                  }, {}) || {},
                };
                break;
              
              case "installation":
                statsData[report.key] = {
                  total: result.totalInstallations || 0,
                  completed: result.completed || 0,
                  pending: result.pending || 0,
                  count: result.installations?.length || 0,
                  progress: result.totalInstallations > 0 
                    ? Math.round((result.completed / result.totalInstallations) * 100)
                    : 0,
                };
                break;
              
              case "expenses":
                statsData[report.key] = {
                  total: result.totalExpenses || 0,
                  amount: `₹${result.totalAmount || 0}`,
                  count: result.expenses?.length || 0,
                  statuses: result.expenses?.reduce((acc, expense) => {
                    const status = expense.status || "Unknown";
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                  }, {}) || {},
                };
                break;
            }
          } else {
            results[report.key] = [];
            console.error(`Failed to fetch ${report.title}:`, response.message);
          }
        } catch (error) {
          console.error(`Error fetching ${report.title}:`, error);
          results[report.key] = [];
        }
      }

      setReportsData(results);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching reports:", error);
      showSnackbar("Failed to load reports", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleView = (reportKey) => {
    const report = accessibleReports.find((r) => r.key === reportKey);
    setSelectedReport({
      ...report,
      data: reportsData[reportKey] || [],
    });
    setViewModalOpen(true);
  };

  const handleDownload = async (reportKey) => {
    const report = accessibleReports.find((r) => r.key === reportKey);
    const data = reportsData[reportKey] || [];

    if (data.length === 0) {
      showSnackbar("No data available to download", "warning");
      return;
    }

    setDownloadProgress((prev) => ({ ...prev, [reportKey]: 0 }));

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          const current = prev[reportKey] || 0;
          if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [reportKey]: current + 10 };
        });
      }, 50);

      // Download CSV
      await downloadCSV(report, data);

      clearInterval(progressInterval);
      setDownloadProgress((prev) => ({ ...prev, [reportKey]: 100 }));

      setTimeout(() => {
        setDownloadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[reportKey];
          return newProgress;
        });
      }, 500);

      showSnackbar(`${report.title} downloaded successfully!`, "success");
    } catch (error) {
      console.error("Download failed:", error);
      showSnackbar(`Failed to download ${report.title}`, "error");
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[reportKey];
        return newProgress;
      });
    }
  };

  const downloadCSV = async (report, data) => {
    const headers = report.columns.map((col) => col.label);
    const rows = data.map((item) =>
      report.columns
        .map((col) => {
          let value = item[col.field];
          
          // Handle nested objects
          if (typeof value === 'object' && value !== null) {
            if (col.field === 'assignedManager' || col.field === 'assignedUser' || 
                col.field === 'createdBy' || col.field === 'approvedBy' || col.field === 'assignedTo') {
              value = `${value.firstName || ''} ${value.lastName || ''}`.trim();
            } else {
              value = JSON.stringify(value);
            }
          }
          
          // Format dates
          if (col.field.includes('Date') || col.field.includes('At')) {
            value = formatDate(value);
          }
          
          // Format amounts
          if (col.field === 'amount') {
            value = `₹${value}`;
          }
          
          // Escape quotes and wrap in quotes if contains comma
          const escapedValue = String(value || "").replace(/"/g, '""');
          return value?.includes(",") ? `"${escapedValue}"` : escapedValue;
        })
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, "_")}_${format(
      new Date(),
      "yyyy-MM-dd"
    )}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBulkDownload = async () => {
    setLoading(true);
    try {
      for (const report of accessibleReports) {
        if (reportsData[report.key]?.length > 0) {
          await handleDownload(report.key);
          await new Promise((resolve) => setTimeout(resolve, 500)); // Delay between downloads
        }
      }
      showSnackbar("All reports downloaded successfully!", "success");
    } catch (error) {
      console.error("Bulk download failed:", error);
      showSnackbar("Failed to download all reports", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderStats = (reportKey) => {
    const stat = stats[reportKey];
    if (!stat) return null;

    switch (reportKey) {
      case "leads":
        return (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mb: 2 }}
            flexWrap="wrap"
          >
            <Chip
              label={`${stat.total} Leads`}
              size="small"
              color="primary"
              variant="outlined"
            />
            {Object.entries(stat.statuses || {}).slice(0, 2).map(([status, count]) => (
              <Chip
                key={status}
                label={`${count} ${status}`}
                size="small"
                color={
                  status.toLowerCase().includes("visit") ? "warning" :
                  status.toLowerCase().includes("converted") ? "success" :
                  "default"
                }
                variant="outlined"
              />
            ))}
          </Stack>
        );

      case "sales":
        return (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mb: 2 }}
            flexWrap="wrap"
          >
            <Chip
              label={`${stat.total} Sales`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={stat.revenue}
              size="small"
              color="success"
              variant="outlined"
            />
          </Stack>
        );

      case "installation":
        return (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mb: 2 }}
            flexWrap="wrap"
          >
            <Chip label={`${stat.total} Total`} size="small" color="info" variant="outlined" />
            <Chip label={`${stat.completed} ✓`} size="small" color="success" />
            <Chip label={`${stat.pending} ⏳`} size="small" color="warning" />
          </Stack>
        );

      case "expenses":
        return (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mb: 2 }}
            flexWrap="wrap"
          >
            <Chip
              label={`${stat.total} Expenses`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={stat.amount}
              size="small"
              color="success"
              variant="outlined"
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: "#ffffff",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          textAlign: { xs: "center", md: "left" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "flex-start" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            Available Reports ({userRole})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Access and download CSV reports based on your role permissions.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAllReports}
            disabled={loading}
            size={isMobile ? "small" : "medium"}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudDownload />}
            onClick={handleBulkDownload}
            disabled={loading || Object.keys(reportsData).length === 0}
            size={isMobile ? "small" : "medium"}
            sx={{
              bgcolor: primary,
              "&:hover": { bgcolor: "#e65c00" },
            }}
          >
            Download All
          </Button>
        </Stack>
      </Box>

      {/* Loading State */}
      {loading && !Object.keys(reportsData).length && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 12,
            flexDirection: "column",
            gap: 3,
          }}
        >
          <CircularProgress size={60} sx={{ color: primary }} />
          <Typography variant="h6" color="text.secondary">
            Loading reports...
          </Typography>
        </Box>
      )}

      {/* Reports Grid */}
      <Grid container spacing={3} justifyContent="center">
        {accessibleReports.map((report) => (
          <Grid item xs={12} sm={6} md={6} key={report.key}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                bgcolor: "white",
                p: 3,
                width: "500px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                border: "1px solid #f0f0f0",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transform: "translateY(-2px)",
                  transition: "all 0.3s ease",
                },
              }}
            >
              {/* Download Progress */}
              {downloadProgress[report.key] > 0 &&
                downloadProgress[report.key] < 100 && (
                  <LinearProgress
                    variant="determinate"
                    value={downloadProgress[report.key]}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      bgcolor: "rgba(255, 109, 0, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: primary,
                      },
                    }}
                  />
                )}

              <CardContent sx={{ width: "100%", p: 0 }}>
                {/* Icon + Title/Description */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    mb: 3,
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 2, sm: 0 },
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      bgcolor: `${primary}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: primary,
                      mr: { sm: 2 },
                      flexShrink: 0,
                    }}
                  >
                    {React.cloneElement(report.icon, { sx: { fontSize: 30 } })}
                  </Box>
                  <Box
                    sx={{
                      textAlign: { xs: "center", sm: "left" },
                      flexGrow: 1,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {report.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.description}
                    </Typography>
                  </Box>
                </Box>

                {/* Stats */}
                {renderStats(report.key)}

                <Divider
                  sx={{
                    border: "1px solid #ddd",
                    my: 3,
                  }}
                />

                {/* Record Count and CSV Icon */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    gap: 1,
                  }}
                >
                  <InsertDriveFile
                    sx={{ color: "text.secondary", fontSize: 20 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {reportsData[report.key]?.length || 0} records • CSV format
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Button
                    fullWidth={isMobile}
                    variant="contained"
                    startIcon={
                      downloadProgress[report.key] ? (
                        <Downloading />
                      ) : (
                        <Download />
                      )
                    }
                    onClick={() => handleDownload(report.key)}
                    disabled={
                      downloadProgress[report.key] > 0 ||
                      !reportsData[report.key]?.length
                    }
                    sx={{
                      bgcolor: primary,
                      borderRadius: 8,
                      px: isMobile ? 2 : 4,
                      py: 1.2,
                      textTransform: "none",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: isMobile ? "0.875rem" : "1rem",
                      minWidth: isMobile ? "auto" : 140,
                      "&:hover": {
                        bgcolor: "#e65c00",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(255, 109, 0, 0.3)",
                      },
                      "&:disabled": {
                        bgcolor: "rgba(255, 109, 0, 0.3)",
                      },
                    }}
                  >
                    {downloadProgress[report.key]
                      ? "Downloading..."
                      : "Download CSV"}
                  </Button>

                  <Button
                    fullWidth={isMobile}
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => handleView(report.key)}
                    disabled={!reportsData[report.key]?.length}
                    sx={{
                      borderColor: primary,
                      color: primary,
                      borderRadius: 8,
                      px: isMobile ? 2 : 4,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: isMobile ? "0.875rem" : "1rem",
                      minWidth: isMobile ? "auto" : 140,
                      "&:hover": {
                        borderColor: "#e65c00",
                        color: "#e65c00",
                        bgcolor: "rgba(255, 109, 0, 0.04)",
                      },
                      "&:disabled": {
                        borderColor: "rgba(0, 0, 0, 0.12)",
                        color: "rgba(0, 0, 0, 0.26)",
                      },
                    }}
                  >
                    View
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Data State */}
      {!loading && accessibleReports.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Assessment sx={{ fontSize: 60, color: "text.disabled" }} />
          <Typography variant="h6" color="text.secondary">
            No reports available for your role
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contact your administrator for report access.
          </Typography>
        </Box>
      )}

      {/* No Data State for accessible reports */}
      {!loading && accessibleReports.length > 0 && Object.keys(reportsData).length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Assessment sx={{ fontSize: 60, color: "text.disabled" }} />
          <Typography variant="h6" color="text.secondary">
            No data available for reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reports will appear here once data is available.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAllReports}
            sx={{ mt: 2 }}
          >
            Refresh Data
          </Button>
        </Box>
      )}

      {/* Footer */}
      <Box
        sx={{
          mt: 6,
          pt: 3,
          borderTop: "1px solid #e0e0e0",
          textAlign: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Logged in as: {user?.firstName} {user?.lastName} • Role: {userRole} • 
          Reports visible: {accessibleReports.length} • 
          Last updated: {format(new Date(), "MMM dd, yyyy HH:mm")}
        </Typography>
      </Box>

      {/* View Details Modal */}
      <ReportDetailsModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        data={selectedReport?.data || []}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          iconMapping={{
            success: <CheckCircle fontSize="inherit" />,
            error: <Error fontSize="inherit" />,
            warning: <Error fontSize="inherit" />,
            info: <Error fontSize="inherit" />,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}