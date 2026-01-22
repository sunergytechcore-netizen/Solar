import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Stack,
  MenuItem,
  Select,
  FormControl,
  Grid,
  Input,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  AlertTitle,
  Avatar,
  alpha,
} from "@mui/material";
import {
  Add,
  Description,
  Close,
  FilterList,
  Upload,
  CloudUpload,
  Download,
  People,
  TrendingUp,
  Warning,
  Refresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const primary = "#ff6d00";
const API_BASE = (process.env.REACT_APP_API_URL || "https://admin.saurashakti.com").replace(/\/+$/, "");

// Role-based access control
const ALLOWED_ROLES = ["ASM", "ZSM", "Head_office"];

const hasAccess = (userRole) => ALLOWED_ROLES.includes(userRole);

export default function InputLeadsPage() {
  const [filter, setFilter] = useState("Today");
  const [selectedFile, setSelectedFile] = useState(null);
  const [leadsData, setLeadsData] = useState({
    totalLeads: 0,
    activeLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    todayLeads: 0,
    thisWeekLeads: 0,
    thisMonthLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { fetchAPI, getUserRole } = useAuth();
  const userRole = getUserRole();
  const theme = useTheme();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Check access
  const canImportLeads = hasAccess(userRole);

  // Stats cards data - memoized
  const statsCards = useMemo(
    () => [
      { 
        label: "Total Leads", 
        value: leadsData.totalLeads, 
        color: primary,
        icon: <People />,
        subText: "All time leads",
        trend: leadsData.todayLeads > 0 ? `+${leadsData.todayLeads} today` : "No new leads"
      },
      { 
        label: "Active Leads", 
        value: leadsData.activeLeads, 
        color: "#4caf50",
        icon: <TrendingUp />,
        subText: "Currently active",
        trend: "Follow up required"
      },
      { 
        label: "Converted", 
        value: leadsData.convertedLeads, 
        color: "#c2185b",
        icon: <People />,
        subText: "Successfully converted",
        trend: `${leadsData.conversionRate}% rate`
      },
      { 
        label: "This Month", 
        value: leadsData.thisMonthLeads, 
        color: "#9c27b0",
        icon: <TrendingUp />,
        subText: "Monthly performance",
        trend: leadsData.thisWeekLeads > 0 ? `+${leadsData.thisWeekLeads} this week` : "No weekly leads"
      },
    ],
    [leadsData]
  );

  // Fetch leads stats - optimized
  const fetchLeadsStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchAPI("/lead/stats");

      if (response?.success && response.result?.stats) {
        setLeadsData({
          totalLeads: response.result.stats.totalLeads || 0,
          activeLeads: response.result.stats.activeLeads || 0,
          convertedLeads: response.result.stats.convertedLeads || 0,
          conversionRate: response.result.stats.conversionRate || 0,
          todayLeads: response.result.stats.todayLeads || 0,
          thisWeekLeads: response.result.stats.thisWeekLeads || 0,
          thisMonthLeads: response.result.stats.thisMonthLeads || 0,
        });
      } else {
        throw new Error(response?.message || "Failed to fetch leads stats");
      }
    } catch (error) {
      console.error("Error fetching leads stats:", error);
      showSnackbar("Failed to load leads statistics", "error");
      setLeadsData({
        totalLeads: 0,
        activeLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
        todayLeads: 0,
        thisWeekLeads: 0,
        thisMonthLeads: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAPI]);

  // Initial load
  useEffect(() => {
    if (canImportLeads) {
      fetchLeadsStats();
    }
  }, [fetchLeadsStats, canImportLeads]);

  // File validation helper
  const validateFile = useCallback((file) => {
    const allowedTypes = [".xlsx", ".csv"];
    const ext = "." + file.name.split(".").pop().toLowerCase();
    
    if (!allowedTypes.includes(ext)) {
      throw new Error(`Only ${allowedTypes.join(", ")} files are allowed`);
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("File size must be less than 10MB");
    }
    
    return true;
  }, []);

  // Handle file change
  const handleFileChange = useCallback((e) => {
    if (!canImportLeads) {
      showSnackbar("You don't have permission to import leads", "error");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    try {
      validateFile(file);
      setSelectedFile(file);
      showSnackbar(`Selected: ${file.name}`, "success");
    } catch (error) {
      showSnackbar(error.message, "error");
      e.target.value = null;
    }
  }, [validateFile, canImportLeads]);

  // Import leads function
  const handleImportLeads = useCallback(async () => {
    if (!canImportLeads) {
      showSnackbar("You don't have permission to import leads", "error");
      return;
    }

    if (!selectedFile) {
      showSnackbar("Please select a file first", "warning");
      return;
    }

    setUploading(true);
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("uploadedBy", userRole || "Unknown");

      const response = await fetch(`${API_BASE}/lead/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await response.text();

      // Check for HTML response (auth error)
      if (text.trimStart().startsWith("<!DOCTYPE") || text.includes("<html")) {
        throw new Error("Authentication failed. Please log in again.");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || "Import failed");
      }

      showSnackbar(data.message || "Leads imported successfully!", "success");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      fetchLeadsStats(); // Refresh stats
    } catch (error) {
      console.error("Import error:", error);
      showSnackbar(error.message || "Failed to import leads", "error");
    } finally {
      setUploading(false);
    }
  }, [selectedFile, fetchLeadsStats, canImportLeads, userRole]);

  // Event handlers
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
    showSnackbar("File removed", "info");
  }, []);

  const addLead = useCallback(() => navigate("/add-lead"), [navigate]);

  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
    // You can add filter logic here if needed
  }, []);

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Download template
  const downloadTemplate = useCallback(() => {
    const templateUrl = `${API_BASE}/templates/leads_template.csv`;
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'leads_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar("Template download started", "info");
  }, [showSnackbar]);

  // Check if user has access to this page
  if (!canImportLeads) {
    return (
      <Box sx={{ p: 3, textAlign: "center", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Alert severity="warning" sx={{ maxWidth: 500, borderRadius: 2 }}>
          <AlertTitle>Access Restricted</AlertTitle>
          Only ASM, ZSM, and Head Office can import leads.
          <br />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Your role: <strong>{userRole || "Unknown"}</strong>
          </Typography>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </Alert>
      </Box>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <CircularProgress size={60} sx={{ color: primary }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%", borderRadius: 1 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            fontWeight="bold"
            color="#1a1a1a"
            gutterBottom
          >
            Lead Management
          </Typography>
          <Typography color="text.secondary">
            Import and manage leads - Access: {userRole}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <FormControl sx={{ minWidth: { xs: "100%", sm: 140 } }}>
            <Select
              value={filter}
              onChange={handleFilterChange}
              sx={{ bgcolor: "white", borderRadius: 2, height: 40 }}
              size="small"
            >
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="Week">This Week</MenuItem>
              <MenuItem value="Month">This Month</MenuItem>
              <MenuItem value="Year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            startIcon={<Refresh />}
            onClick={fetchLeadsStats}
            variant="outlined"
            sx={{ borderRadius: 2, height: 40 }}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} mb={6}>
        {statsCards.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                bgcolor: "white",
                width:"265px",
                height: "100%",
                borderLeft: `4px solid ${stat.color}`,
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(stat.color, 0.1),
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
              >
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 0.5 }}>
                {stat.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {stat.subText}
              </Typography>
              <Typography variant="caption" sx={{ color: stat.color, fontWeight: 500, display: "block", mt: 1 }}>
                {stat.trend}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Leads Section */}
      <Card
        sx={{
          borderRadius: 2,
          p: { xs: 3, sm: 4 },
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "white",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Import New Leads
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Bulk import leads from Excel/CSV files or add manually
        </Typography>

        {/* Two Options: Manual Add & Bulk Import */}
        <Grid container spacing={4}>
          {/* Manual Add Option */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                borderRadius: 2,
                border: "2px dashed",
                width:"530px",
                borderColor: alpha(primary, 0.3),
                bgcolor: alpha(primary, 0.02),
                height: "100%",
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: alpha(primary, 0.1),
                  color: primary,
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Add />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Add Single Lead
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add individual leads with detailed information
              </Typography>
              <Button
                onClick={addLead}
                variant="contained"
                startIcon={<Add />}
                fullWidth
                sx={{
                  bgcolor: primary,
                  "&:hover": { bgcolor: "#e65c00" },
                  borderRadius: 2,
                }}
              >
                Add New Lead
              </Button>
            </Card>
          </Grid>

          {/* Bulk Import Option */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                borderRadius: 2,
                border: "2px dashed",
                borderColor: alpha("#2196f3", 0.3),
                bgcolor: alpha("#2196f3", 0.02),
                height: "100%",
                width:"530px",
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: alpha("#2196f3", 0.1),
                  color: "#2196f3",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <CloudUpload />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Bulk Import
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Import multiple leads from Excel/CSV file
              </Typography>

              <Input
                inputRef={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileChange}
                sx={{ display: "none" }}
                id="file-upload"
              />
              
              {!selectedFile ? (
                <>
                  <label htmlFor="file-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<Upload />}
                      fullWidth
                      sx={{
                        bgcolor: "#2196f3",
                        "&:hover": { bgcolor: "#1976d2" },
                        borderRadius: 2,
                        mb: 2,
                      }}
                    >
                      Select File
                    </Button>
                  </label>
                </>
              ) : (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    mb: 2,
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Description sx={{ color: primary }} />
                      <Box>
                        <Typography fontWeight={600} noWrap>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Stack>
                    <IconButton size="small" onClick={handleRemoveFile}>
                      <Close />
                    </IconButton>
                  </Stack>
                  <Button
                    variant="contained"
                    onClick={handleImportLeads}
                    disabled={uploading}
                    fullWidth
                    sx={{ mt: 2, borderRadius: 2 }}
                    startIcon={uploading ? <CircularProgress size={20} /> : null}
                  >
                    {uploading ? "Importing..." : "Import Leads"}
                  </Button>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>

        {/* Instructions */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            bgcolor: "grey.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            📋 Import Instructions
          </Typography>
          <Stack spacing={1} sx={{ pl: 2 }}>
            <Typography variant="body2">
              1. Use the template with required columns: <strong>name, phone, email, source, status</strong>
            </Typography>
            <Typography variant="body2">
              2. Save file as <strong>.xlsx</strong> or <strong>.csv</strong> format
            </Typography>
            <Typography variant="body2">
              3. Maximum file size: <strong>10MB</strong>
            </Typography>
            <Typography variant="body2">
              4. Required permissions: <strong>ASM, ZSM, or Head Office</strong>
            </Typography>
            <Button
              onClick={downloadTemplate}
              variant="text"
              startIcon={<Download />}
              sx={{ mt: 1, alignSelf: 'flex-start' }}
            >
              Download Template
            </Button>
          </Stack>
        </Box>

        {/* Quick Tips */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: alpha("#ff9800", 0.1),
            borderRadius: 2,
            border: "1px solid",
            borderColor: alpha("#ff9800", 0.3),
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Warning sx={{ color: "#ff9800" }} />
            <Typography variant="body2">
              <strong>Tip:</strong> Ensure phone numbers are in correct format (10 digits). Invalid data may be skipped during import.
            </Typography>
          </Stack>
        </Box>
      </Card>
    </Box>
  ); 
}