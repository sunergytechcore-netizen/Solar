// pages/AddUserPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Card,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Container,
} from "@mui/material";
import {
  ArrowBack,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Security,
  Group,
  CheckCircle,
  Email,
  Phone,
  Lock,
  Person,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PRIMARY_COLOR = "#1976d2";
const SECONDARY_COLOR = "#115293";

const ROLE_CONFIG = {
  Head_office: {
    label: "Head Office",
    icon: <Security />,
    description: "Full system access and administration rights",
    color: "#d32f2f",
  },
  ZSM: {
    label: "Zonal Sales Manager",
    icon: <Group />,
    description: "Manage regional teams and operations",
    color: "#ed6c02",
  },
  ASM: {
    label: "Area Sales Manager",
    icon: <Group />,
    description: "Manage local teams and field operations",
    color: "#2e7d32",
  },
  TEAM: {
    label: "Team Member",
    icon: <Person />,
    description: "Field operations and lead management",
    color: "#0288d1",
  },
};

export default function AddUserPage() {
  const navigate = useNavigate();
  const { fetchAPI, user: currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "",
    supervisor: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [supervisors, setSupervisors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Determine available roles based on current user's role
  const getAvailableRoles = () => {
    if (currentUser?.role === "Head_office") {
      return ["Head_office", "ZSM", "ASM", "TEAM"];
    } else if (currentUser?.role === "ZSM") {
      return ["ASM", "TEAM"];
    } else if (currentUser?.role === "ASM") {
      return ["TEAM"];
    }
    return [];
  };

  const roles = getAvailableRoles();

  // Fetch supervisors for TEAM role
  useEffect(() => {
    if (formData.role === "TEAM") {
      fetchSupervisors();
    }
  }, [formData.role]);

  const fetchSupervisors = async () => {
    try {
      const data = await fetchAPI(`/user/getAllUsers?page=1&limit=100`);
      if (data.success) {
        let filteredSupervisors = [];
        if (currentUser?.role === "Head_office") {
          filteredSupervisors = data.result.users.filter((u) =>
            ["Head_office", "ZSM", "ASM"].includes(u.role)
          );
        } else if (currentUser?.role === "ZSM") {
          filteredSupervisors = data.result.users.filter((u) =>
            ["ZSM", "ASM"].includes(u.role)
          );
        } else if (currentUser?.role === "ASM") {
          filteredSupervisors = data.result.users.filter(
            (u) => u.role === "ASM"
          );
        }
        setSupervisors(filteredSupervisors);
      }
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Personal Info
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Must be 10 digits";
    }

    // Account Details
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Minimum 8 characters required";
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Include uppercase letter and number";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: formData.role,
        status: "active",
      };

      // Add supervisor if TEAM role and supervisor selected
      if (formData.role === "TEAM" && formData.supervisor) {
        payload.supervisor = formData.supervisor;
      }

      const data = await fetchAPI("/user/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/user-management", {
            state: { showSnackbar: true, message: "User created successfully" }
          });
        }, 1500);
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (err) {
      setError(err.message || "An error occurred while creating user");
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Success State
  if (success) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          p: 3,
        }}
      >
        <Box textAlign="center">
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "success.main",
              color: "white",
              mb: 3,
              mx: "auto",
            }}
          >
            <CheckCircle sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            User Created Successfully!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            The new user has been added to the system.
          </Typography>
          <CircularProgress size={24} sx={{ color: PRIMARY_COLOR }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Redirecting to user management...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 1 }}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <IconButton
            onClick={() => navigate(-1)}
            size="medium"
            sx={{ color: "text.secondary" }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            Add New User
          </Typography>
        </Box>
        <Typography color="text.secondary" sx={{marginLeft:"52px"}}>
          Fill in the details below to create a new user account
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          borderRadius: 3,
          boxShadow: "none"
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} sx={{width:"350px"}}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
              size="medium"
            />
          </Grid>

          <Grid item xs={12} sm={6} sx={{width:"350px"}}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
              size="medium"
            />
          </Grid>

          <Grid item xs={12} sm={6} sx={{width:"350px"}}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              required
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} sx={{width:"350px"}}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              required
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
                inputProps: { maxLength: 10 },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} sx={{width:"350px"}}>
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              required
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} sx={{width:"350px"}}>
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              required
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info" sx={{ borderRadius: 2, mt: 1 }}>
              <Typography variant="body2">
                Password must contain at least 8 characters, including one uppercase letter and one number.
              </Typography>
            </Alert>
          </Grid>

          {/* Role Selection Section */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Role Assignment
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {errors.role && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {errors.role}
              </Alert>
            )}

            <Grid container spacing={2}>
              {roles.map((role) => {
                const config = ROLE_CONFIG[role];
                return (
                  <Grid item xs={12} sm={6} key={role}>
                    <Card
                      onClick={() => handleInputChange("role", role)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        width:"500px",
                        cursor: "pointer",
                        border: formData.role === role ? `2px solid ${config.color}` : "1px solid #e0e0e0",
                        bgcolor: formData.role === role ? `${config.color}10` : "background.paper",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: config.color,
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: config.color, width: 40, height: 40 }}>
                          {config.icon}
                        </Avatar>
                        <Box flex={1}>
                          <Typography fontWeight={600}>
                            {config.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {config.description}
                          </Typography>
                        </Box>
                        {formData.role === role && (
                          <CheckCircle sx={{ color: config.color }} />
                        )}
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>

          {/* Supervisor Selection for TEAM */}
          {formData.role === "TEAM" && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom sx={{ mt: 2 }}>
                Assign Supervisor
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={formData.supervisor}
                  onChange={(e) => handleInputChange("supervisor", e.target.value)}
                  displayEmpty
                  size="medium"
                >
                  <MenuItem value="">
                    <em>Select a supervisor (Optional)</em>
                  </MenuItem>
                  {supervisors.map((supervisor) => (
                    <MenuItem key={supervisor._id} value={supervisor._id}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: ROLE_CONFIG[supervisor.role]?.color }}>
                          {supervisor.firstName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {supervisor.firstName} {supervisor.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ROLE_CONFIG[supervisor.role]?.label}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Team members can be assigned to supervisors for better management
              </Typography>
            </Grid>
          )}

          {/* Hierarchy Info */}
          {currentUser && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ borderRadius: 2, mt: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Role Hierarchy
                </Typography>
                <Typography variant="body2">
                  {currentUser.role === "Head_office" && "Head Office → ZSM → ASM → TEAM"}
                  {currentUser.role === "ZSM" && "ZSM → ASM → TEAM"}
                  {currentUser.role === "ASM" && "ASM → TEAM"}
                </Typography>
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  You can only manage roles below your own in the hierarchy.
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* Action Buttons */}
          <Grid item xs={12} sx={{ mt: 4 }}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                onClick={() => navigate(-1)}
                variant="outlined"
                sx={{ borderRadius: 2, minWidth: 100 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PersonAdd />
                  )
                }
                sx={{
                  bgcolor: PRIMARY_COLOR,
                  color: "white",
                  borderRadius: 2,
                  minWidth: 150,
                  "&:hover": { bgcolor: SECONDARY_COLOR },
                }}
              >
                {loading ? "Creating..." : "Create User"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}