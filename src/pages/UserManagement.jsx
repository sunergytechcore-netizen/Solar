// pages/UserManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Snackbar,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  Switch,
  DialogContentText,
  Fade,
  Zoom,
  Badge,
  alpha,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Person,
  Search,
  FilterList,
  Visibility,
  Lock,
  LockOpen,
  Refresh,
  CheckCircle,
  Cancel,
  MoreVert,
  Clear,
  Phone,
  Email,
  PersonAdd,
  Check,
  Close,
  Group,
  SupervisorAccount,
  VerifiedUser,
  Block,
  ContentCopy,
  VisibilityOff,
  PersonRemove,
  AssignmentInd,
  AdminPanelSettings,
  Warning,
  Info,
  People,
  Security,
  TrendingUp,
  PersonOff,
  PowerSettingsNew,
  PowerOff,
  ToggleOn,
  ToggleOff,
  FiberManualRecord,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Circle,
  CircleOutlined,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PRIMARY_COLOR = "#1976d2";
const SECONDARY_COLOR = "#115293";

const ROLE_CONFIG = {
  Head_office: {
    color: "#ff6d00",
    bg: alpha("#ff6d00", 0.1),
    icon: <AdminPanelSettings fontSize="small" />,
    label: "Head Office",
    level: 1,
  },
  ZSM: {
    color: "#2e7d32",
    bg: alpha("#2e7d32", 0.1),
    icon: <SupervisorAccount fontSize="small" />,
    label: "Zonal Sales Manager",
    level: 2,
  },
  ASM: {
    color: "#c2185b",
    bg: alpha("#c2185b", 0.1),
    icon: <SupervisorAccount fontSize="small" />,
    label: "Area Sales Manager",
    level: 3,
  },
  TEAM: {
    color: "#1976d2",
    bg: alpha("#1976d2", 0.1),
    icon: <Group fontSize="small" />,
    label: "Team Member",
    level: 4,
  },
};

const STATUS_CONFIG = {
  active: {
    color: "#4caf50",
    bg: alpha("#4caf50", 0.1),
    icon: <CheckCircle fontSize="small" />,
    label: "Active",
    description: "User can access the system",
    actionIcon: <ToggleOn />,
  },
  inactive: {
    color: "#f44336",
    bg: alpha("#f44336", 0.1),
    icon: <Block fontSize="small" />,
    label: "Inactive",
    description: "User cannot access the system",
    actionIcon: <ToggleOff />,
  },
};

// Statistics Card Component
const StatCard = ({ title, value, icon, color, subtext }) => (
  <Card
    sx={{
      borderRadius: 2,
      height: "100%",
      boxShadow: 1,
      transition: "transform 0.2s",
      "&:hover": { transform: "translateY(-4px)" },
    }}
  >
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar
          sx={{ bgcolor: alpha(color, 0.1), color, width: 56, height: 56 }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="bold" color={color}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {subtext && (
            <Typography variant="caption" color="text.secondary">
              {subtext}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// Edit User Modal Component
const EditUserModal = ({ open, onClose, user, onSave, currentUserRole }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { safeFetchAPI } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "",
        status: user.status || "active",
      });
    }
  }, [user]);

  // Filter roles based on current user's role hierarchy
  const getAvailableRoles = useMemo(() => {
    const currentRoleLevel = ROLE_CONFIG[currentUserRole]?.level || 0;

    const allRoles = Object.entries(ROLE_CONFIG)
      .filter(([roleKey, config]) => {
        // Head_office can assign any role
        if (currentUserRole === "Head_office") return true;

        // Other roles can only assign roles below their level
        return config.level > currentRoleLevel;
      })
      .map(([value, config]) => ({
        value,
        label: config.label,
        icon: config.icon,
        level: config.level,
      }))
      .sort((a, b) => a.level - b.level);

    return allRoles;
  }, [currentUserRole]);

  // Check if current user can edit this user's role
  const canEditRole = useMemo(() => {
    if (!user || !currentUserRole) return false;

    // Head_office can edit any role (including other Head_office)
    if (currentUserRole === "Head_office") return true;

    const userRoleLevel = ROLE_CONFIG[user.role]?.level || 0;
    const currentRoleLevel = ROLE_CONFIG[currentUserRole]?.level || 0;

    // Can edit if user role is below current user's role
    return userRoleLevel > currentRoleLevel;
  }, [user, currentUserRole]);

  // Check if current user can edit this user's status
  const canEditStatus = useMemo(() => {
    if (!user || !currentUserRole) return false;

    // Head_office can edit all users' status
    if (currentUserRole === "Head_office") return true;

    // ZSM can edit ASM and TEAM status (roles below ZSM)
    if (currentUserRole === "ZSM") {
      const userRoleLevel = ROLE_CONFIG[user.role]?.level || 0;
      const currentRoleLevel = ROLE_CONFIG[currentUserRole]?.level || 0;
      return userRoleLevel > currentRoleLevel;
    }

    // ASM can edit TEAM status only
    if (currentUserRole === "ASM") return user.role === "TEAM";

    return false;
  }, [user, currentUserRole]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (
      formData.phoneNumber &&
      !/^[0-9+\-\s]{10,}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Invalid phone number";
    }
    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };

      if (canEditRole) updateData.role = formData.role;
      if (canEditStatus) updateData.status = formData.status;

      const response = await safeFetchAPI(`/user/update/${user._id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      // Check for permission errors
      if (!response.success) {
        if (response.type === "PERMISSION_DENIED") {
          console.log("permission denied...", response.type)
          setErrors({
            submit:
              response.message ||
              "You don't have permission to update this user. You can only update users in your zone.",
          });
        } else {
          setErrors({
            submit: response.message || "Failed to update user",
          });
        }
        return;
      }

      // Check if response has result field
      if (response.result) {
        onSave(response.result);
        onClose();
      } else {
        // If no result field, use the response itself
        onSave(response);
        onClose();
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setErrors({
        submit: error.message || "An error occurred while updating the user",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setFormData((prev) => ({
      ...prev,
      status: newStatus,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.default",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6" fontWeight="bold">
            Edit User
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Stack spacing={3} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
                size="medium"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
                size="medium"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
                required
                size="medium"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange("phoneNumber")}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                size="medium"
              />
            </Grid>

            {canEditRole && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.role} required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={handleChange("role")}
                    label="Role"
                    size="medium"
                  >
                    {getAvailableRoles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {role.icon}
                          <Typography>{role.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.role && (
                    <Typography variant="caption" color="error">
                      {errors.role}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            )}
          </Grid>

          {canEditStatus && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Account Status
              </Typography>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={formData.status}
                  onChange={handleStatusChange}
                  sx={{ mt: 1 }}
                >
                  <Stack spacing={2}>
                    <Paper
                      variant={
                        formData.status === "active" ? "outlined" : "elevation"
                      }
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border:
                          formData.status === "active"
                            ? `2px solid ${STATUS_CONFIG.active.color}`
                            : "1px solid",
                        borderColor:
                          formData.status === "active"
                            ? STATUS_CONFIG.active.color
                            : "divider",
                        bgcolor:
                          formData.status === "active"
                            ? alpha(STATUS_CONFIG.active.color, 0.05)
                            : "background.paper",
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: alpha(STATUS_CONFIG.active.color, 0.08),
                        },
                      }}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, status: "active" }))
                      }
                    >
                      <FormControlLabel
                        value="active"
                        control={
                          <Radio
                            checked={formData.status === "active"}
                            icon={<CircleOutlined />}
                            checkedIcon={<Circle />}
                            sx={{
                              color: STATUS_CONFIG.active.color,
                              "&.Mui-checked": {
                                color: STATUS_CONFIG.active.color,
                              },
                            }}
                          />
                        }
                        label={
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Avatar
                              sx={{
                                bgcolor: alpha(STATUS_CONFIG.active.color, 0.1),
                                color: STATUS_CONFIG.active.color,
                              }}
                            >
                              <CheckCircle />
                            </Avatar>
                            <Box>
                              <Typography
                                fontWeight={600}
                                color={STATUS_CONFIG.active.color}
                              >
                                Active
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                User can access and use the system
                              </Typography>
                            </Box>
                          </Stack>
                        }
                        sx={{ m: 0, width: "100%" }}
                      />
                    </Paper>

                    <Paper
                      variant={
                        formData.status === "inactive"
                          ? "outlined"
                          : "elevation"
                      }
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border:
                          formData.status === "inactive"
                            ? `2px solid ${STATUS_CONFIG.inactive.color}`
                            : "1px solid",
                        borderColor:
                          formData.status === "inactive"
                            ? STATUS_CONFIG.inactive.color
                            : "divider",
                        bgcolor:
                          formData.status === "inactive"
                            ? alpha(STATUS_CONFIG.inactive.color, 0.05)
                            : "background.paper",
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: alpha(STATUS_CONFIG.inactive.color, 0.08),
                        },
                      }}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, status: "inactive" }))
                      }
                    >
                      <FormControlLabel
                        value="inactive"
                        control={
                          <Radio
                            checked={formData.status === "inactive"}
                            icon={<CircleOutlined />}
                            checkedIcon={<Circle />}
                            sx={{
                              color: STATUS_CONFIG.inactive.color,
                              "&.Mui-checked": {
                                color: STATUS_CONFIG.inactive.color,
                              },
                            }}
                          />
                        }
                        label={
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Avatar
                              sx={{
                                bgcolor: alpha(
                                  STATUS_CONFIG.inactive.color,
                                  0.1
                                ),
                                color: STATUS_CONFIG.inactive.color,
                              }}
                            >
                              <Block />
                            </Avatar>
                            <Box>
                              <Typography
                                fontWeight={600}
                                color={STATUS_CONFIG.inactive.color}
                              >
                                Inactive
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                User cannot access the system
                              </Typography>
                            </Box>
                          </Stack>
                        }
                        sx={{ m: 0, width: "100%" }}
                      />
                    </Paper>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {formData.status === "active"
                    ? "Active users can log in and perform their assigned roles."
                    : "Inactive users cannot log in to the system. Their data remains preserved."}
                </Typography>
              </Alert>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Check />}
          sx={{ bgcolor: PRIMARY_COLOR }}
          size="large"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Password View Dialog (Only for Head_office)
const PasswordViewDialog = ({ open, onClose, user, fetchAPI }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchPassword();
    }
  }, [open, user]);

  const fetchPassword = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const data = await fetchAPI(`/user/getViewPassword/${user._id}`);
      if (data.success) {
        setPassword(data.result.viewPassword || "");
      } else {
        setPassword("Unable to fetch password");
      }
    } catch (error) {
      console.error("Error fetching password:", error);
      setPassword("Error loading password");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (
      password &&
      password !== "Unable to fetch password" &&
      password !== "Error loading password"
    ) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6" fontWeight="bold">
            View Password
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {user && (
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  bgcolor: ROLE_CONFIG[user.role]?.color || PRIMARY_COLOR,
                  width: 60,
                  height: 60,
                }}
              >
                {user.firstName?.[0]}
              </Avatar>
              <Box>
                <Typography
                  fontWeight={600}
                  variant="h6"
                  sx={{ marginTop: "14px" }}
                >
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email} • {ROLE_CONFIG[user.role]?.label}
                </Typography>
                <Chip
                  label={user.status === "active" ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor:
                      user.status === "active"
                        ? STATUS_CONFIG.active.bg
                        : STATUS_CONFIG.inactive.bg,
                    color:
                      user.status === "active"
                        ? STATUS_CONFIG.active.color
                        : STATUS_CONFIG.inactive.color,
                  }}
                />
              </Box>
            </Stack>

            <Alert severity="warning">
              <Typography variant="subtitle2" fontWeight={600}>
                Security Notice
              </Typography>
              <Typography variant="body2">
                This password is only visible to Head Office. Please handle this
                sensitive information securely.
              </Typography>
            </Alert>

            {loading ? (
              <Stack alignItems="center" spacing={2} py={3}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Loading password...
                </Typography>
              </Stack>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  position: "relative",
                  bgcolor: "grey.50",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "monospace",
                    letterSpacing: "0.1em",
                    textAlign: "center",
                    wordBreak: "break-all",
                    color: "text.primary",
                    fontWeight: 600,
                  }}
                >
                  {password}
                </Typography>
                <IconButton
                  onClick={handleCopyPassword}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    color: copied ? "success.main" : "primary.main",
                    bgcolor: "background.paper",
                    "&:hover": {
                      bgcolor: "background.paper",
                    },
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
                {copied && (
                  <Fade in={copied}>
                    <Typography
                      variant="caption"
                      color="success.main"
                      sx={{ position: "absolute", top: -20, right: 0 }}
                    >
                      Copied!
                    </Typography>
                  </Fade>
                )}
              </Paper>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {!loading &&
          password &&
          password !== "Unable to fetch password" &&
          password !== "Error loading password" && (
            <Button
              onClick={handleCopyPassword}
              variant="contained"
              startIcon={<ContentCopy />}
              sx={{ bgcolor: PRIMARY_COLOR }}
            >
              Copy Password
            </Button>
          )}
      </DialogActions>
    </Dialog>
  );
};

// Status Toggle Component
const StatusToggle = ({ user, onToggle, loading, currentUserRole }) => {
  const canToggle = useMemo(() => {
    if (!user || !currentUserRole) return false;

    // Head_office can toggle any user's status
    if (currentUserRole === "Head_office") return true;

    // ZSM can toggle ASM and TEAM status (roles below ZSM)
    if (currentUserRole === "ZSM") {
      const userRoleLevel = ROLE_CONFIG[user.role]?.level || 0;
      const currentRoleLevel = ROLE_CONFIG[currentUserRole]?.level || 0;
      return userRoleLevel > currentRoleLevel;
    }

    // ASM can toggle TEAM status only
    if (currentUserRole === "ASM") return user.role === "TEAM";

    return false;
  }, [user, currentUserRole]);

  const statusConfig = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;

  if (!canToggle) {
    return (
      <Chip
        label={statusConfig.label}
        size="small"
        icon={statusConfig.icon}
        sx={{
          bgcolor: statusConfig.bg,
          color: statusConfig.color,
          fontWeight: 600,
          "& .MuiChip-icon": { color: statusConfig.color },
        }}
      />
    );
  }

  return (
    <Tooltip
      title={user.status === "active" ? "Deactivate User" : "Activate User"}
    >
      <IconButton
        size="small"
        onClick={() => onToggle(user)}
        disabled={loading}
        sx={{
          color:
            user.status === "active"
              ? STATUS_CONFIG.inactive.color
              : STATUS_CONFIG.active.color,
          bgcolor:
            user.status === "active"
              ? alpha(STATUS_CONFIG.inactive.color, 0.1)
              : alpha(STATUS_CONFIG.active.color, 0.1),
          "&:hover": {
            bgcolor:
              user.status === "active"
                ? alpha(STATUS_CONFIG.inactive.color, 0.2)
                : alpha(STATUS_CONFIG.active.color, 0.2),
          },
          transition: "all 0.2s",
        }}
      >
        {loading ? (
          <CircularProgress size={20} />
        ) : user.status === "active" ? (
          <Lock fontSize="small" />
        ) : (
          <LockOpen fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
};

// Mobile User Card Component
const MobileUserCard = ({
  user,
  onEdit,
  onToggleStatus,
  onAssign,
  onViewPassword,
  onDelete,
  currentUserRole,
  currentUserId,
  statusLoading,
}) => {
  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.TEAM;
  const statusConfig = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;

  // Check permissions based on role hierarchy
  const canEdit = useMemo(() => {
    if (!currentUserRole || !user) return false;

    // Allow self-edit for all roles
    if (user._id === currentUserId) return true;

    const userRoleLevel = ROLE_CONFIG[user.role]?.level || 999;
    const currentRoleLevel = ROLE_CONFIG[currentUserRole]?.level || 0;

    // Head_office can edit any user
    if (currentUserRole === "Head_office") return true;

    // ZSM can edit ASM and TEAM (roles below)
    if (currentUserRole === "ZSM") {
      return userRoleLevel > currentRoleLevel;
    }

    // ASM can edit TEAM only
    if (currentUserRole === "ASM") {
      return user.role === "TEAM";
    }

    return false;
  }, [currentUserRole, user, currentUserId]);

  const canToggleStatus = canEdit;
  const canAssign =
    user.role === "TEAM" &&
    ["ZSM", "ASM", "Head_office"].includes(currentUserRole);
  const canViewPassword = currentUserRole === "Head_office";
  const canDelete =
    currentUserRole === "Head_office" && user.role !== "Head_office";

  return (
    <Card sx={{ mb: 2, borderRadius: 3, overflow: "hidden", boxShadow: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          {/* User Info */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: roleConfig.color, width: 56, height: 56 }}>
              {user.firstName?.[0]}
            </Avatar>
            <Box flex={1}>
              <Typography fontWeight="bold" variant="subtitle1">
                {user.firstName} {user.lastName}
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip
                  label={roleConfig.label}
                  size="small"
                  sx={{
                    bgcolor: roleConfig.bg,
                    color: roleConfig.color,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
                <Chip
                  label={statusConfig.label}
                  size="small"
                  icon={statusConfig.icon}
                  sx={{
                    bgcolor: statusConfig.bg,
                    color: statusConfig.color,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    "& .MuiChip-icon": { color: statusConfig.color },
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          {/* Contact Info */}
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Email fontSize="small" color="action" />
              <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                {user.email}
              </Typography>
            </Stack>
            {user.phoneNumber && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {user.phoneNumber}
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Actions */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            pt={1}
          >
            <Stack direction="row" spacing={1}>
              {canEdit && (
                <Tooltip title="Edit User">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(user)}
                    sx={{
                      color: "primary.main",
                      bgcolor: alpha(PRIMARY_COLOR, 0.1),
                      "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.2) },
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {canViewPassword && (
                <Tooltip title="View Password">
                  <IconButton
                    size="small"
                    onClick={() => onViewPassword(user)}
                    sx={{
                      color: "warning.main",
                      bgcolor: alpha("#ff9800", 0.1),
                      "&:hover": { bgcolor: alpha("#ff9800", 0.2) },
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <StatusToggle
                user={user}
                onToggle={onToggleStatus}
                loading={statusLoading[user._id]}
                currentUserRole={currentUserRole}
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              {canAssign && !user.supervisor && (
                <Tooltip title="Assign Manager">
                  <IconButton
                    size="small"
                    onClick={() => onAssign(user)}
                    sx={{
                      color: "info.main",
                      bgcolor: alpha("#00bcd4", 0.1),
                      "&:hover": { bgcolor: alpha("#00bcd4", 0.2) },
                    }}
                  >
                    <PersonAdd fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {canDelete && (
                <Tooltip title="Delete User">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(user)}
                    sx={{
                      color: "error.main",
                      bgcolor: alpha("#f44336", 0.1),
                      "&:hover": { bgcolor: alpha("#f44336", 0.2) },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Enhanced Status Filter Component
const StatusFilter = ({ value, onChange }) => {
  const statusOptions = [
    {
      value: "all",
      label: "All Status",
      icon: <People />,
      color: PRIMARY_COLOR,
    },
    {
      value: "active",
      label: "Active",
      icon: <CheckCircle />,
      color: STATUS_CONFIG.active.color,
    },
    {
      value: "inactive",
      label: "Inactive",
      icon: <Block />,
      color: STATUS_CONFIG.inactive.color,
    },
  ];

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(e, newValue) => newValue && onChange(newValue)}
      aria-label="status filter"
      size="small"
      sx={{ width: "100%" }}
    >
      {statusOptions.map((option) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          sx={{
            flex: 1,
            py: 1.5,
            border: `1px solid ${
              value === option.value ? option.color : "divider"
            }`,
            bgcolor:
              value === option.value ? alpha(option.color, 0.1) : "transparent",
            color: value === option.value ? option.color : "text.secondary",
            "&:hover": {
              bgcolor: alpha(option.color, 0.05),
            },
            "&.Mui-selected": {
              bgcolor: alpha(option.color, 0.1),
              color: option.color,
              "&:hover": {
                bgcolor: alpha(option.color, 0.15),
              },
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {option.icon}
            <Typography
              variant="body2"
              fontWeight={value === option.value ? 600 : 400}
            >
              {option.label}
            </Typography>
          </Stack>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default function UserManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { safeFetchAPI, user: currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State Management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState(null);
  const [selectedManager, setSelectedManager] = useState("");
  const [managers, setManagers] = useState([]);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [userToViewPassword, setUserToViewPassword] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Loading states
  const [statusLoading, setStatusLoading] = useState({});
  const [assignLoading, setAssignLoading] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {},
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Role-based permissions
  const userRole = currentUser?.role || "";

  // Who can add users?
  const canAddUser = ["Head_office", "ZSM", "ASM"].includes(userRole);

  // Who can view passwords? (Head_office only)
  const canViewPassword = userRole === "Head_office";

  // Who can delete users? (Head_office only)
  const canDeleteUsers = userRole === "Head_office";

  // Filter options based on role
  const roleOptions = useMemo(() => {
    const allRoles = [
      { value: "all", label: "All Roles", icon: <People /> },
      ...Object.entries(ROLE_CONFIG).map(([value, config]) => ({
        value,
        label: config.label,
        icon: config.icon,
      })),
    ];

    if (userRole === "ASM") {
      // ASM only sees TEAM members
      return allRoles.filter(
        (role) => role.value === "all" || role.value === "TEAM"
      );
    }

    if (userRole === "ZSM") {
      // ZSM sees ASM and TEAM (no Head_office)
      return allRoles.filter(
        (role) => role.value === "all" || ["ASM", "TEAM"].includes(role.value)
      );
    }

    // Head_office sees all roles
    return allRoles;
  }, [userRole]);

  // Check if current user can edit a specific user based on role hierarchy
  const canEditUser = (user) => {
    if (!user || !currentUser) return false;

    const targetUserRole = user.role;
    const currentUserRole = currentUser.role;

    // Get role levels
    const targetRoleLevel = ROLE_CONFIG[targetUserRole]?.level || 999;
    const currentRoleLevel = ROLE_CONFIG[currentUserRole]?.level || 0;

    // Head_office can edit any user (including other Head_office)
    if (currentUserRole === "Head_office") return true;

    // ZSM can edit ASM and TEAM (roles below ZSM)
    if (currentUserRole === "ZSM") {
      return targetRoleLevel > currentRoleLevel; // ASM (3) and TEAM (4) are > ZSM (2)
    }

    // ASM can only edit TEAM members
    if (currentUserRole === "ASM") {
      return targetUserRole === "TEAM"; // TEAM (4) only
    }

    return false;
  };

  // Check if current user can edit this specific user (with self-edit handling)
  const canEditThisUser = (user) => {
    if (!user || !currentUser) return false;

    // Check basic permission
    if (!canEditUser(user)) return false;

    // Allow self-edit for all roles (users should be able to edit their own profile)
    if (user._id === currentUser._id) return true;

    // Additional business logic:
    // 1. ZSM cannot edit other ZSM
    if (currentUser.role === "ZSM" && user.role === "ZSM") return false;
    
    // 2. ASM cannot edit other ASM
    if (currentUser.role === "ASM" && user.role === "ASM") return false;

    return true;
  };

  // Fetch users with role-based filtering - FIXED FOR ZSM
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      // Add search filters
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      // Role-based data filtering - FIXED FOR ZSM
      if (userRole === "ASM") {
        // ASM only sees their own TEAM members
        params.append("role", "TEAM");
        // ASM sees team members assigned to them
        if (currentUser?._id) {
          params.append("managedBy", currentUser._id);
        }
      } else if (userRole === "ZSM") {
        // ZSM sees all ASM and TEAM members under them
        if (currentUser?._id) {
          params.append("managedBy", currentUser._id);
        }
        // ZSM should see ASM and TEAM only
        // Remove role filter if it's 'all'
        if (roleFilter !== 'all') {
          params.append("role", roleFilter);
        }
      }
      // Head_office sees all users (ZSM, ASM, TEAM) - no filters needed

      const data = await safeFetchAPI(`/user/getAllUsers?${params.toString()}`);

      // Check for permission errors
      if (data.type === "PERMISSION_DENIED") {
        showSnackbar(
          data.error || "You don't have permission to view users in this zone",
          "warning"
        );
        setUsers([]);
        setFilteredUsers([]);
        return;
      }

      if (data.success) {
        let fetchedUsers = data.result?.users || [];

        // Client-side filtering based on role - FIXED FOR ZSM
        if (userRole === "ZSM") {
          // ZSM should see ASM and TEAM only (no Head_office)
          fetchedUsers = fetchedUsers.filter((user) =>
            ["ASM", "TEAM"].includes(user.role)
          );
        } else if (userRole === "ASM") {
          // ASM should see only TEAM members
          fetchedUsers = fetchedUsers.filter((user) => user.role === "TEAM");
        } else if (userRole === "Head_office") {
          // Head_office should see ZSM, ASM, and TEAM (no other Head_office)
          fetchedUsers = fetchedUsers.filter(
            (user) => user.role !== "Head_office"
          );
        }

        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);

        // Calculate statistics
        const total = fetchedUsers.length;
        const active = fetchedUsers.filter((u) => u.status === "active").length;
        const inactive = fetchedUsers.filter(
          (u) => u.status === "inactive"
        ).length;

        // Calculate by role
        const byRole = {};
        fetchedUsers.forEach((user) => {
          const role = user.role;
          if (!byRole[role]) {
            byRole[role] = { total: 0, active: 0, inactive: 0 };
          }
          byRole[role].total++;
          if (user.status === "active") byRole[role].active++;
          else byRole[role].inactive++;
        });

        setStats({ total, active, inactive, byRole });
      } else {
        showSnackbar(data.message || "Failed to fetch users", "error");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar(error.message || "Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  }, [
    safeFetchAPI,
    page,
    rowsPerPage,
    searchTerm,
    roleFilter,
    statusFilter,
    userRole,
    currentUser?._id,
  ]);

  // Fetch managers for assignment
  const fetchManagers = useCallback(async () => {
    try {
      let params = new URLSearchParams({ page: "1", limit: "100" });

      if (userRole === "ASM") {
        // ASM can only assign to themselves
        params.append("_id", currentUser._id);
      } else if (userRole === "ZSM") {
        // ZSM can assign to themselves or ASMs
        params.append("role", "ZSM,ASM");
      } else if (userRole === "Head_office") {
        // Head_office can assign to ZSM or ASM
        params.append("role", "ZSM,ASM");
      }

      const data = await safeFetchAPI(`/user/getAllUsers?${params.toString()}`);
      if (data.success) {
        setManagers(data.result.users || []);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  }, [safeFetchAPI, userRole, currentUser?._id]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch managers when assign dialog opens
  useEffect(() => {
    if (assignDialogOpen) {
      fetchManagers();
    }
  }, [assignDialogOpen, fetchManagers]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = [...users];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phoneNumber?.includes(searchTerm)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
    setPage(0);
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Helper functions
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleEditUser = (user) => {
    if (!canEditThisUser(user)) {
      showSnackbar("You don't have permission to edit this user", "error");
      return;
    }
    setUserToEdit(user);
    setEditModalOpen(true);
  };

  const handleSaveEditedUser = (updatedUser) => {
    setUsers((prev) =>
      prev.map((user) => (user._id === updatedUser._id ? updatedUser : user))
    );
    showSnackbar("User updated successfully", "success");
  };

  const handleViewPassword = (user) => {
    if (!canViewPassword) {
      showSnackbar("Only Head Office can view passwords", "error");
      return;
    }
    setUserToViewPassword(user);
    setPasswordDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !canDeleteUsers) {
      showSnackbar("Only Head Office can delete users", "error");
      return;
    }

    // Head Office cannot delete other Head Office
    if (userToDelete.role === "Head_office") {
      showSnackbar("Cannot delete Head Office users", "error");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      return;
    }

    try {
      const response = await safeFetchAPI(`/user/delete/${userToDelete._id}`, {
        method: "DELETE",
      });

      // Check for permission errors
      if (response.type === "PERMISSION_DENIED") {
        showSnackbar(
          response.error || "You don't have permission to delete this user",
          "error"
        );
        return;
      }

      showSnackbar("User deleted successfully", "success");
      setUsers((prev) => prev.filter((user) => user._id !== userToDelete._id));
    } catch (error) {
      showSnackbar(error.message || "Failed to delete user", "error");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleAssignManager = async () => {
    if (!userToAssign || !selectedManager) {
      showSnackbar("Please select a manager", "error");
      return;
    }

    if (userRole === "ASM" && selectedManager !== currentUser._id) {
      showSnackbar("ASM can only assign to themselves", "error");
      return;
    }

    setAssignLoading(true);
    try {
      const response = await safeFetchAPI("/user/asignUserToManager", {
        method: "POST",
        body: JSON.stringify({
          userId: userToAssign._id,
          managerId: selectedManager,
        }),
      });

      // Check for permission errors
      if (response.type === "PERMISSION_DENIED") {
        showSnackbar(
          response.error || "You don't have permission to assign this user",
          "error"
        );
        return;
      }

      showSnackbar("User assigned to manager successfully", "success");
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userToAssign._id
            ? { ...user, supervisor: selectedManager }
            : user
        )
      );
    } catch (error) {
      showSnackbar(error.message || "Failed to assign manager", "error");
    } finally {
      setAssignLoading(false);
      setAssignDialogOpen(false);
      setUserToAssign(null);
      setSelectedManager("");
    }
  };

  const handleToggleStatus = async (user) => {
    if (!user?._id) return;

    // Check permission based on role hierarchy
    const canToggle = canEditThisUser(user);

    if (!canToggle) {
      showSnackbar(
        "You don't have permission to change this user's status",
        "error"
      );
      return;
    }

    setStatusLoading((prev) => ({ ...prev, [user._id]: true }));

    try {
      const newStatus = user.status === "active" ? "inactive" : "active";
      const response = await safeFetchAPI(`/user/update/${user._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });

      // Check for permission errors
      if (response.type === "PERMISSION_DENIED") {
        showSnackbar(
          response.error || "You can only update users in your zone",
          "error"
        );
        return;
      }

      if (response.success) {
        showSnackbar(
          `User ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully`,
          "success"
        );
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...u, status: newStatus } : u
          )
        );
      } else {
        showSnackbar(
          response.message || "Failed to update user status",
          "error"
        );
      }
    } catch (error) {
      showSnackbar(error.message || "Failed to update user status", "error");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [user._id]: false }));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: "100vh" }}>
      {/* Header */}
      <Stack spacing={3} mb={4}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              User Management
            </Typography>
            <Typography color="text.secondary">
              {userRole === "ASM"
                ? "Manage your team members"
                : userRole === "ZSM"
                ? "Manage ASM and TEAM members in your zone"
                : "Manage all users in the system"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchUsers}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
            {canAddUser && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/add-user")}
                sx={{
                  bgcolor: PRIMARY_COLOR,
                  color: "white",
                  borderRadius: 2,
                  "&:hover": { bgcolor: SECONDARY_COLOR },
                }}
              >
                Add User
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Statistics Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} sx={{ width: "370px" }}>
            <StatCard
              title="Total Users"
              value={stats.total}
              icon={<People />}
              color={PRIMARY_COLOR}
              subtext={`${userRole} View`}
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ width: "370px" }}>
            <StatCard
              title="Active Users"
              value={stats.active}
              icon={<CheckCircle />}
              color="#4caf50"
              subtext={`${((stats.active / stats.total) * 100 || 0).toFixed(
                1
              )}% of total`}
            />
          </Grid>
          <Grid item xs={12} sm={4} sx={{ width: "370px" }}>
            <StatCard
              title="Inactive Users"
              value={stats.inactive}
              icon={<Block />}
              color="#f44336"
              subtext={`${((stats.inactive / stats.total) * 100 || 0).toFixed(
                1
              )}% of total`}
            />
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
          <Stack spacing={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4} sx={{ width: "500px" }}>
                <TextField
                  fullWidth
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3} sx={{ width: "180px" }}>
                <FormControl fullWidth size="medium">
                  <InputLabel>Role Filter</InputLabel>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    label="Role Filter"
                  >
                    {roleOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {option.icon}
                          <span>{option.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  onClick={handleClearFilters}
                  variant="outlined"
                  startIcon={<Clear />}
                  disabled={
                    !searchTerm &&
                    roleFilter === "all" &&
                    statusFilter === "all"
                  }
                  size="medium"
                >
                  Clear
                </Button>
              </Grid>
            </Grid>

            {/* Active/Inactive Summary */}
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" spacing={4}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FiberManualRecord
                      sx={{ color: STATUS_CONFIG.active.color, fontSize: 12 }}
                    />
                    <Typography variant="body2">
                      <strong>{stats.active}</strong> Active
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FiberManualRecord
                      sx={{ color: STATUS_CONFIG.inactive.color, fontSize: 12 }}
                    />
                    <Typography variant="body2">
                      <strong>{stats.inactive}</strong> Inactive
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Showing {filteredUsers.length} of {stats.total} users
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </Paper>
      </Stack>

      {/* Content */}
      {isMobile ? (
        // Mobile View
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Paper
              sx={{ p: 4, textAlign: "center", borderRadius: 3, boxShadow: 2 }}
            >
              <Person
                sx={{
                  fontSize: 60,
                  color: "text.secondary",
                  mb: 2,
                  opacity: 0.5,
                }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No users found
              </Typography>
              <Typography color="text.secondary" mb={3}>
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : canAddUser
                  ? "Add your first user to get started"
                  : "No users available"}
              </Typography>
              {canAddUser && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/add-user")}
                  sx={{ bgcolor: PRIMARY_COLOR }}
                >
                  Add First User
                </Button>
              )}
            </Paper>
          ) : (
            <>
              {filteredUsers.map((user) => (
                <MobileUserCard
                  key={user._id}
                  user={user}
                  onEdit={handleEditUser}
                  onToggleStatus={handleToggleStatus}
                  onAssign={(user) => {
                    setUserToAssign(user);
                    setAssignDialogOpen(true);
                  }}
                  onViewPassword={handleViewPassword}
                  onDelete={(user) => {
                    setUserToDelete(user);
                    setDeleteDialogOpen(true);
                  }}
                  currentUserRole={userRole}
                  currentUserId={currentUser?._id}
                  statusLoading={statusLoading}
                />
              ))}
              <Box display="flex" justifyContent="center" mt={2}>
                <TablePagination
                  component="div"
                  count={filteredUsers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </Box>
            </>
          )}
        </Box>
      ) : (
        // Desktop View
        <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box p={4} textAlign="center">
              <Person
                sx={{
                  fontSize: 60,
                  color: "text.secondary",
                  mb: 2,
                  opacity: 0.5,
                }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No users found
              </Typography>
              <Typography color="text.secondary" mb={3}>
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : canAddUser
                  ? "Add your first user to get started"
                  : "No users available"}
              </Typography>
              {canAddUser && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/add-user")}
                  sx={{ bgcolor: PRIMARY_COLOR }}
                >
                  Add First User
                </Button>
              )}
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                        User
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                        Contact
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                        Role
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                        Manager
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, fontSize: "0.875rem" }}
                        align="center"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((user) => {
                        const roleConfig =
                          ROLE_CONFIG[user.role] || ROLE_CONFIG.TEAM;
                        const statusConfig =
                          STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
                        const canEdit = canEditThisUser(user);
                        const canToggle = canEdit;
                        const canAssign =
                          user.role === "TEAM" &&
                          ["ZSM", "ASM", "Head_office"].includes(userRole);
                        const canView = canViewPassword;
                        const canDelete =
                          canDeleteUsers && user.role !== "Head_office";

                        return (
                          <TableRow
                            key={user._id}
                            hover
                            sx={{
                              "&:hover": { bgcolor: "action.hover" },
                              "&.MuiTableRow-root": {
                                "&:nth-of-type(even)": {
                                  bgcolor: "grey.50",
                                },
                              },
                            }}
                          >
                            <TableCell>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={2}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: roleConfig.color,
                                    width: 40,
                                    height: 40,
                                  }}
                                >
                                  {user.firstName?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography
                                    fontWeight={600}
                                    variant="subtitle2"
                                  >
                                    {user.firstName} {user.lastName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    ID: {user._id?.slice(-6)}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ wordBreak: "break-word" }}
                                >
                                  {user.email}
                                </Typography>
                                {user.phoneNumber && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {user.phoneNumber}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={roleConfig.label}
                                size="small"
                                icon={roleConfig.icon}
                                sx={{
                                  bgcolor: roleConfig.bg,
                                  color: roleConfig.color,
                                  fontWeight: 600,
                                  "& .MuiChip-icon": {
                                    color: roleConfig.color,
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {statusLoading[user._id] ? (
                                <CircularProgress size={20} />
                              ) : (
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <Chip
                                    label={statusConfig.label}
                                    size="small"
                                    icon={statusConfig.icon}
                                    sx={{
                                      bgcolor: statusConfig.bg,
                                      color: statusConfig.color,
                                      fontWeight: 600,
                                      "& .MuiChip-icon": {
                                        color: statusConfig.color,
                                      },
                                    }}
                                  />
                                  {canToggle && (
                                    <Tooltip
                                      title={
                                        user.status === "active"
                                          ? "Deactivate User"
                                          : "Activate User"
                                      }
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={() => handleToggleStatus(user)}
                                        sx={{
                                          color:
                                            user.status === "active"
                                              ? STATUS_CONFIG.inactive.color
                                              : STATUS_CONFIG.active.color,
                                        }}
                                      >
                                        {user.status === "active" ? (
                                          <Lock fontSize="small" />
                                        ) : (
                                          <LockOpen fontSize="small" />
                                        )}
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Stack>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.supervisor ? (
                                <Chip
                                  label="Assigned"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              ) : canAssign ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<PersonAdd />}
                                  onClick={() => {
                                    setUserToAssign(user);
                                    setAssignDialogOpen(true);
                                  }}
                                >
                                  Assign
                                </Button>
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                >
                                  N/A
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="center"
                              >
                                {/* View Password Button (Head_office only) */}
                                {canView && (
                                  <Tooltip title="View Password">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleViewPassword(user)}
                                      sx={{ color: "warning.main" }}
                                    >
                                      <Visibility />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                {/* Edit Button */}
                                {canEdit && (
                                  <Tooltip title="Edit User">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditUser(user)}
                                      sx={{ color: "primary.main" }}
                                    >
                                      <Edit />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                {/* Delete Button (Head_office only, not for Head_office) */}
                                {canDelete && (
                                  <Tooltip title="Delete User">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setUserToDelete(user);
                                        setDeleteDialogOpen(true);
                                      }}
                                      sx={{ color: "error.main" }}
                                    >
                                      <Delete />
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
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          )}
        </Paper>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
        onSave={handleSaveEditedUser}
        currentUserRole={userRole}
      />

      {/* Password View Dialog */}
      <PasswordViewDialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false);
          setUserToViewPassword(null);
        }}
        user={userToViewPassword}
        fetchAPI={safeFetchAPI}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" fontWeight="bold">
            Delete User
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {userToDelete && (
            <Stack spacing={3}>
              <Alert severity="error">
                <Typography fontWeight={600}>
                  Warning: This action cannot be undone
                </Typography>
                <Typography variant="body2">
                  All user data, including their records and activities, will be
                  permanently deleted.
                </Typography>
              </Alert>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor:
                      ROLE_CONFIG[userToDelete.role]?.color || PRIMARY_COLOR,
                    width: 60,
                    height: 60,
                  }}
                >
                  {userToDelete.firstName?.[0]}
                </Avatar>
                <Box>
                  <Typography fontWeight={600} variant="h6">
                    {userToDelete.firstName} {userToDelete.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userToDelete.email} •{" "}
                    {ROLE_CONFIG[userToDelete.role]?.label}
                  </Typography>
                  <Chip
                    label={
                      userToDelete.status === "active" ? "Active" : "Inactive"
                    }
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor:
                        userToDelete.status === "active"
                          ? STATUS_CONFIG.active.bg
                          : STATUS_CONFIG.inactive.bg,
                      color:
                        userToDelete.status === "active"
                          ? STATUS_CONFIG.active.color
                          : STATUS_CONFIG.inactive.color,
                    }}
                  />
                </Box>
              </Stack>
              <Typography variant="body2">
                Are you sure you want to permanently delete this user?
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Manager Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" fontWeight="bold">
            Assign Manager
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {userToAssign && (
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: PRIMARY_COLOR, width: 60, height: 60 }}>
                  {userToAssign.firstName?.[0]}
                </Avatar>
                <Box>
                  <Typography fontWeight={600} variant="h6">
                    {userToAssign.firstName} {userToAssign.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    TEAM Member
                  </Typography>
                </Box>
              </Stack>
              <FormControl fullWidth>
                <InputLabel>Select Manager</InputLabel>
                <Select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  label="Select Manager"
                  disabled={assignLoading}
                >
                  <MenuItem value="" disabled>
                    Choose a manager
                  </MenuItem>
                  {managers.map((manager) => (
                    <MenuItem key={manager._id} value={manager._id}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: ROLE_CONFIG[manager.role]?.color,
                          }}
                        >
                          {manager.firstName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {manager.firstName} {manager.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ROLE_CONFIG[manager.role]?.label}
                          </Typography>
                        </Box>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {userRole === "ASM" && (
                <Alert severity="info">
                  ASM can only assign team members to themselves.
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setAssignDialogOpen(false)}
            variant="outlined"
            disabled={assignLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignManager}
            variant="contained"
            disabled={!selectedManager || assignLoading}
            sx={{ bgcolor: PRIMARY_COLOR }}
          >
            {assignLoading ? <CircularProgress size={20} /> : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", color: "#fff" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}