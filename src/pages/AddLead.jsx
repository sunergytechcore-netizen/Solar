import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Container,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  MenuItem,
  Divider,
  alpha,
  Fade,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  Person,
  Email,
  Phone,
  LocationOn,
  Home,
  Badge,
  Map,
  PinDrop,
  Public,
  CheckCircle,
  Error as ErrorIcon,
  Add,
  Assignment,
  Place,
  Business,
  Description,
  Warning,
  Info,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const primary = "#ff6d00";
const secondary = "#1a237e";
const successColor = "#4caf50";
const errorColor = "#f44336";
const warningColor = "#ff9800";
const infoColor = "#2196f3";

export default function CreateLeadPage() {
  const navigate = useNavigate();
  const { fetchAPI, user, getUserRole } = useAuth();
  const theme = useTheme();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    consumerNumber: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    zone: "",
    notes: "",
    source: "Manual Entry",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
    duration: 4000,
  });

  // Check if user has permission to create leads
  useEffect(() => {
    const checkPermission = () => {
      const userRole = getUserRole();
      const allowedRoles = ["Head_office", "ASM", "ZSM", "TEAM"];
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        setAccessDenied(true);
        showSnackbar(
          "Access Denied. You don't have permission to create leads.",
          "error"
        );
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      }
    };
    
    checkPermission();
  }, [getUserRole, navigate]);

  // Show snackbar helper
  const showSnackbar = useCallback((message, severity = "success", duration = 4000) => {
    setSnackbar({
      open: true,
      message,
      severity,
      duration,
    });
  }, []);

  // Close snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Mark form as touched
    if (!formTouched) {
      setFormTouched(true);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors, formTouched]);

  // Validate individual field - ONLY FIRST NAME AND PHONE
  const validateField = useCallback((name, value) => {
    const fieldErrors = {};
    
    switch (name) {
      case "firstName":
        if (!value.trim()) {
          fieldErrors.firstName = "First name is required";
        }
        break;
        
      case "phone":
        if (!value.trim()) {
          fieldErrors.phone = "Phone number is required";
        }
        break;
        
      default:
        break;
    }
    
    return fieldErrors;
  }, []);

  // Validate form on blur - ONLY FOR FIRST NAME AND PHONE
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "firstName" || name === "phone") {
      const fieldErrors = validateField(name, value);
      setErrors(prev => ({ ...prev, ...fieldErrors }));
    }
  }, [validateField]);

  // Full form validation - ONLY FIRST NAME AND PHONE
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Only validate first name and phone
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      consumerNumber: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      zone: "",
    });
    setErrors({});
    setFormTouched(false);
  }, []);

  // Form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showSnackbar("Please fill in the required fields before submitting", "error");
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare payload - all other fields accepted as-is
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim(),
        address: {
          consumerNumber: formData.consumerNumber.trim() || null,
          street: formData.street.trim() || null,
          city: formData.city.trim() || null,
          state: formData.state.trim() || null,
          postalCode: formData.postalCode.trim() || null,
          zones: formData.zone.trim() || null,
        },
        createdBy: user?._id || null,
        assignedTo: user?._id || null, // Auto-assign to creator
        status: "New",
      };
      
      // API call
      const response = await fetchAPI("/lead/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      // Handle response
      if (response?.success) {
        setSubmitted(true);
        showSnackbar("Lead created successfully!", "success");
        
        // Reset form after delay
        setTimeout(() => {
          resetForm();
          setSubmitted(false);
          navigate("/all-leads");
        }, 1500);
      } else {
        // Handle API errors
        const errorMessage = response?.message || response?.error || "Failed to create lead";
        
        if (response?.errors) {
          // Field-specific errors from backend
          const backendErrors = {};
          response.errors.forEach(error => {
            backendErrors[error.field] = error.message;
          });
          setErrors(backendErrors);
          showSnackbar("Please fix the highlighted errors", "error");
        } else if (response?.type === "VALIDATION_ERROR") {
          showSnackbar(errorMessage, "error");
        } else if (response?.type === "DUPLICATE_ERROR") {
          showSnackbar("A lead with this phone number already exists", "error");
        } else {
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Create lead error:", error);
      
      // Handle different error types
      let errorMessage = "Failed to create lead. Please try again.";
      
      if (error.message.includes("Network")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message.includes("401") || error.message.includes("403")) {
        errorMessage = "Authentication error. Please log in again.";
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.message.includes("500")) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [formData, fetchAPI, navigate, validateForm, user, showSnackbar, resetForm]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (formTouched) {
      if (window.confirm("Are you sure? All unsaved changes will be lost.")) {
        navigate("/all-leads");
      }
    } else {
      navigate("/all-leads");
    }
  }, [formTouched, navigate]);

  // Text field style
  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: "background.paper",
      transition: "all 0.2s ease",
      "& fieldset": { 
        border: "1.5px solid",
        borderColor: alpha("#000", 0.12),
      },
      "&:hover fieldset": { 
        borderColor: primary,
      },
      "&.Mui-focused fieldset": { 
        border: `2px solid ${primary}`,
        boxShadow: `0 0 0 3px ${alpha(primary, 0.08)}`,
      },
      "&.Mui-error fieldset": {
        borderColor: errorColor,
      },
    },
    "& .MuiInputBase-input": {
      fontSize: "0.95rem",
      padding: "14px 16px",
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.9rem",
      "&.Mui-focused": {
        color: primary,
      },
    },
    "& .MuiFormHelperText-root": {
      fontSize: "0.8rem",
      marginLeft: 0,
    },
  };

  // Button styles
  const actionButtonStyle = {
    borderRadius: 2,
    px: 4,
    py: 1.25,
    fontWeight: 600,
    fontSize: "0.95rem",
    minWidth: 120,
    textTransform: "none",
    boxShadow: "none",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      transform: "translateY(-1px)",
    },
    "&:disabled": {
      opacity: 0.7,
      transform: "none",
    },
  };

  // Field status indicator - ONLY FOR FIRST NAME AND PHONE
  const getFieldStatus = useCallback((fieldName) => {
    const value = formData[fieldName];
    const error = errors[fieldName];
    
    // Only show status for firstName and phone
    if (fieldName !== "firstName" && fieldName !== "phone") {
      return { color: "text.disabled", icon: null };
    }
    
    if (error) return { color: errorColor, icon: <Warning fontSize="small" /> };
    if (value && !error) return { color: successColor, icon: <CheckCircle fontSize="small" /> };
    return { color: "text.disabled", icon: null };
  }, [formData, errors]);

  // If access is denied, show access denied message
  if (accessDenied) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, minHeight: "80vh", display: "flex", alignItems: "center" }}>
        <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3, textAlign: "center", width: "100%" }}>
          <ErrorIcon sx={{ fontSize: 64, color: errorColor, mb: 3, mx: "auto" }} />
          <Typography variant="h5" fontWeight="bold" color="error" gutterBottom>
            Access Restricted
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
            You don't have the necessary permissions to create leads.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate("/dashboard")}
            sx={{ borderRadius: 2, px: 4 }}
            startIcon={<ArrowBack />}
          >
            Return to Dashboard
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.duration}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: "100%",
            borderRadius: 2,
            boxShadow: 3,
            alignItems: "center",
            "& .MuiAlert-icon": {
              alignItems: "center",
            },
          }}
          iconMapping={{
            success: <CheckCircle fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />,
            warning: <Warning fontSize="inherit" />,
            info: <Info fontSize="inherit" />,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ 
        minHeight: "100vh",
        p: { xs: 2, sm: 3, md: 4 },
      }}>
        <Container maxWidth="lg" disableGutters>
          {/* Header Section */}
          <Box sx={{ mb: 5 }}>
            <Stack 
              direction={{ xs: "column", sm: "row" }} 
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={3}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Button 
                  onClick={handleCancel}
                  variant="text"
                  sx={{ 
                    minWidth: "auto",
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(primary, 0.08),
                    "&:hover": { bgcolor: alpha(primary, 0.15) },
                  }}
                >
                  <ArrowBack sx={{ color: primary }} />
                </Button>
                <Box>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    fontWeight="bold" 
                    color="text.primary"
                  >
                    Create New Lead
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Add fontSize="small" />
                    Fill in the lead details below. Fields marked with * are required.
                  </Typography>
                </Box>
              </Stack>
              
              {formTouched && !loading && (
                <Chip
                  label="Unsaved Changes"
                  color="warning"
                  variant="outlined"
                  icon={<Warning />}
                  size="small"
                />
              )}
            </Stack>
          </Box>

          {/* Main Form */}
          <Paper 
            component="form"
            onSubmit={handleSubmit}
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              p: { xs: 3, sm: 4, md: 5 },
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              mb: 4,
            }}
          >
            <Fade in={true} timeout={300}>
              <Box>
                {/* Personal Information Section */}
                <Box sx={{ mb: 5 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                    <Avatar sx={{ bgcolor: alpha(primary, 0.1), color: primary }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Personal Information
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Basic details about the lead
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        name="firstName"
                        label="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!errors.firstName}
                        helperText={errors.firstName || "Enter lead's first name"}
                        placeholder="John"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person fontSize="small" color={getFieldStatus("firstName").color} />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyle}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="lastName"
                        label="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        helperText="Optional - Enter lead's last name"
                        placeholder="Doe"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person fontSize="small" color="text.disabled" />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyle}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        helperText="Optional - Enter lead's email"
                        placeholder="john@example.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email fontSize="small" color="text.disabled" />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyle}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        name="phone"
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!errors.phone}
                        helperText={errors.phone || "Enter lead's phone number"}
                        placeholder="9876543210"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone fontSize="small" color={getFieldStatus("phone").color} />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyle}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Address Information Section */}
                <Box sx={{ mb: 5 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                    <Avatar sx={{ bgcolor: alpha(secondary, 0.1), color: secondary }}>
                      <Place />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Address Information
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Optional - Fill if you have address details
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="consumerNumber"
                        label="Consumer Number"
                        value={formData.consumerNumber}
                        onChange={handleChange}
                        placeholder="CN12345"
                        helperText="Optional - Unique consumer identifier"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Badge fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyle}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="street"
                        label="Street Address"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="123 Main Street"
                        helperText="Optional"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Home fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyle}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="city"
                        label="City"
                        value={formData.city}
                        onChange={handleChange}
                        helperText="Optional"
                        placeholder="Bangalore"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyle}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="state"
                        label="State"
                        value={formData.state}
                        onChange={handleChange}
                        helperText="Optional"
                        placeholder="Karnataka"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Map fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyle}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="postalCode"
                        label="Postal Code"
                        value={formData.postalCode}
                        onChange={handleChange}
                        helperText="Optional"
                        placeholder="560001"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PinDrop fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyle}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="zone"
                        label="Zone/Area"
                        value={formData.zone}
                        onChange={handleChange}
                        placeholder="North Zone"
                        helperText="Optional"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Public fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyle}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Form Actions */}
                <Box sx={{ 
                  mt: 6, 
                  pt: 4, 
                  borderTop: 1, 
                  borderColor: "divider",
                  display: "flex", 
                  justifyContent: "space-between",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={loading}
                    sx={{
                      ...actionButtonStyle,
                      borderColor: "divider",
                      color: "text.secondary",
                      "&:hover": {
                        borderColor: errorColor,
                        color: errorColor,
                      },
                    }}
                  >
                    Cancel
                  </Button>

                  <Stack direction="row" spacing={2}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={resetForm}
                      disabled={loading || !formTouched}
                      sx={{
                        ...actionButtonStyle,
                        borderColor: warningColor,
                        color: warningColor,
                        "&:hover": {
                          borderColor: warningColor,
                          bgcolor: alpha(warningColor, 0.04),
                        },
                      }}
                    >
                      Reset Form
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || submitted}
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : submitted ? (
                          <CheckCircle />
                        ) : (
                          <Add />
                        )
                      }
                      sx={{
                        ...actionButtonStyle,
                        bgcolor: successColor,
                        "&:hover": { bgcolor: "#43a047" },
                      }}
                    >
                      {loading ? "Creating..." : submitted ? "Lead Created!" : "Create Lead"}
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Fade>
          </Paper>

          {/* Information Card */}
          <Card sx={{ 
            borderRadius: 3,
            p: 3,
            bgcolor: alpha(infoColor, 0.03),
            border: "1px solid",
            borderColor: alpha(infoColor, 0.1),
          }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Info sx={{ color: infoColor, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                  Important Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>Required Fields:</strong> Only First Name and Phone Number are mandatory.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>All Other Fields:</strong> All other fields are optional and can be filled later.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>Phone Number:</strong> Enter any valid phone number format.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>Email:</strong> Optional field, no email format validation.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>Address Fields:</strong> All address fields are completely optional.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • <strong>Auto-assignment:</strong> Leads are automatically assigned to you as the creator.
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Container>
      </Box>
    </>
  );
}