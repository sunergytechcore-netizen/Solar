import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  AlertTitle,
  CircularProgress,
  Button,
  Tooltip,
  InputAdornment,
  Pagination,
  FormControlLabel,
  Checkbox,
  useTheme,
  useMediaQuery,
  alpha,
  Avatar,
  Divider,
  Paper,
  TablePagination,
  LinearProgress,
  CardContent,
  Tab,
  Tabs,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormHelperText,
} from "@mui/material";
import {
  Edit,
  Visibility,
  Close,
  CheckCircle,
  Search,
  FilterList,
  Clear,
  ArrowUpward,
  ArrowDownward,
  Phone,
  Email,
  Schedule,
  CheckCircleOutline,
  PendingActions,
  Cancel,
  Refresh,
  Tune,
  Download,
  People,
  TrendingUp,
  Warning,
  Info,
  FirstPage,
  LastPage,
  LocationOn,
  Notes,
  CalendarToday,
  AccessTime,
  Person,
  Business,
  HowToReg,
  Assignment,
  SupervisorAccount,
  AdminPanelSettings,
  WorkspacePremium,
  Groups,
  ArrowForward,
  ArrowBack,
  MoreVert,
  Add,
  Delete,
  Save,
  GetApp,
  DateRange,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  PictureAsPdf,
  DescriptionOutlined,
  AttachFile,
  PictureAsPdfOutlined,
  ReceiptLong,
  CreditCard,
  InsertDriveFile,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  format,
  isValid,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useNavigate } from "react-router-dom";

// ========== CONSTANTS & CONFIGURATION ==========
const PRIMARY = "#ff6d00";
const SECONDARY = "#1a237e";
const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_ITEMS_PER_PAGE = 20;

// All roles have access
const ALLOWED_ROLES = ["Head_office", "ZSM", "ASM", "TEAM"];
const hasAccess = (userRole) => ALLOWED_ROLES.includes(userRole);

// Enhanced Status Configuration
const STATUS_CONFIG = {
  "Not Assigned": {
    bg: "#f5f5f5",
    color: "#616161",
    icon: <PendingActions sx={{ fontSize: 16 }} />,
    description: "Visit not yet assigned or scheduled",
    order: 1,
  },
  Scheduled: {
    bg: "#e3f2fd",
    color: "#1565c0",
    icon: <Schedule sx={{ fontSize: 16 }} />,
    description: "Visit scheduled for future date",
    order: 2,
  },
  Completed: {
    bg: "#e8f5e9",
    color: "#2e7d32",
    icon: <CheckCircleOutline sx={{ fontSize: 16 }} />,
    description: "Visit successfully completed",
    order: 3,
  },
  Cancelled: {
    bg: "#ffebee",
    color: "#c62828",
    icon: <Cancel sx={{ fontSize: 16 }} />,
    description: "Visit cancelled or postponed",
    order: 4,
  },
};

// Lead Status Configuration
const LEAD_STATUS_CONFIG = {
  Visit: {
    bg: "#fff3cd",
    color: "#856404",
    icon: <Person sx={{ fontSize: 16 }} />,
    description: "Visit scheduled or completed",
  },
  Registration: {
    bg: "#d1ecf1",
    color: "#0c5460",
    icon: <HowToReg sx={{ fontSize: 16 }} />,
    description: "Lead registered after visit",
  },
  "Missed Leads": {
    bg: "#d6d8d9",
    color: "#383d41",
    icon: <Warning sx={{ fontSize: 16 }} />,
    description: "Lead missed or lost",
  },
};

// Role Configuration
const ROLE_CONFIG = {
  Head_office: {
    label: "Head Office",
    color: "#ff6d00",
    icon: <AdminPanelSettings sx={{ fontSize: 16 }} />,
  },
  ZSM: {
    label: "Zone Sales Manager",
    color: "#9c27b0",
    icon: <WorkspacePremium sx={{ fontSize: 16 }} />,
  },
  ASM: {
    label: "Area Sales Manager",
    color: "#00bcd4",
    icon: <SupervisorAccount sx={{ fontSize: 16 }} />,
  },
  TEAM: {
    label: "Team Member",
    color: "#4caf50",
    icon: <Groups sx={{ fontSize: 16 }} />,
  },
};

// ========== HELPER FUNCTIONS ==========
const getStatusConfig = (status) => {
  return (
    STATUS_CONFIG[status] || {
      bg: "#f5f5f5",
      color: "#616161",
      icon: <PendingActions sx={{ fontSize: 16 }} />,
      description: "Unknown status",
    }
  );
};

const getLeadStatusConfig = (status) => {
  return (
    LEAD_STATUS_CONFIG[status] || {
      bg: "#f5f5f5",
      color: "#616161",
      icon: <Info sx={{ fontSize: 16 }} />,
      description: "Unknown lead status",
    }
  );
};

const getRoleConfig = (role) => {
  return (
    ROLE_CONFIG[role] || {
      label: "Unknown",
      color: "#757575",
      icon: <Person sx={{ fontSize: 16 }} />,
    }
  );
};

const formatDate = (dateString, formatStr = "dd MMM yyyy, hh:mm a") => {
  if (!dateString) return "Not set";
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatStr) : "Invalid Date";
  } catch {
    return "Invalid Date";
  }
};

const formatTime = (timeString) => {
  if (!timeString) return "Not set";
  return timeString;
};

// ========== REUSABLE COMPONENTS ==========

// Enhanced View Details Modal with Tabs
const ViewVisitModal = React.memo(
  ({ open, onClose, visit, userRole, showSnackbar }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [activeTab, setActiveTab] = useState(0);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const userRoleConfig = useMemo(() => getRoleConfig(userRole), [userRole]);
    const visitStatusConfig = useMemo(
      () => getStatusConfig(visit?.visitStatus),
      [visit?.visitStatus]
    );
    const leadStatusConfig = useMemo(
      () => getLeadStatusConfig(visit?.status),
      [visit?.status]
    );

    const handleTabChange = (event, newValue) => {
      setActiveTab(newValue);
    };

    if (!visit) return null;

    const tabs = [
      {
        label: "Basic Info",
        icon: <Person />,
        content: (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: "none", height: "100%", width: "450px" }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 3,
                      color: PRIMARY,
                    }}
                  >
                    <Person /> Personal Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {visit.firstName} {visit.lastName}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {visit.email || "Not set"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {visit.phone || "Not set"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {visit.address || "Not set"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        City
                      </Typography>
                      <Typography variant="body1">
                        {visit.city || "Not set"}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: "none", height: "100%", width: "350px" }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 3,
                      color: PRIMARY,
                    }}
                  >
                    <CalendarToday /> Visit Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Visit Status
                      </Typography>
                      <Chip
                        label={visit.visitStatus || "Not Assigned"}
                        icon={visitStatusConfig.icon}
                        size="small"
                        sx={{
                          bgcolor: visitStatusConfig.bg,
                          color: visitStatusConfig.color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Lead Status
                      </Typography>
                      <Chip
                        label={visit.status || "Unknown"}
                        icon={leadStatusConfig.icon}
                        size="small"
                        sx={{
                          bgcolor: leadStatusConfig.bg,
                          color: leadStatusConfig.color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Visit Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(visit.visitDate, "dd MMM yyyy")}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Visit Time
                      </Typography>
                      <Typography variant="body1">
                        {formatTime(visit.visitTime)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Visit Location
                      </Typography>
                      <Typography variant="body1">
                        {visit.visitLocation || "Not set"}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ),
      },
      {
        label: "Visit Details",
        icon: <LocationOn />,
        content: (
          <Card sx={{ boxShadow: "none" }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                  color: PRIMARY,
                }}
              >
                <LocationOn /> Location & Notes
              </Typography>
              <Stack spacing={3}>
                {visit.visitLocation && (
                  <Paper sx={{ p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Visit Location
                    </Typography>
                    <Typography variant="body1">
                      {visit.visitLocation}
                    </Typography>
                  </Paper>
                )}
                {visit.visitNotes && (
                  <Paper sx={{ p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Notes />
                        Visit Notes
                      </Stack>
                    </Typography>
                    <Typography
                      variant="body1"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {visit.visitNotes}
                    </Typography>
                  </Paper>
                )}
                {visit.notes && visit.notes !== visit.visitNotes && (
                  <Paper sx={{ p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Additional Notes
                    </Typography>
                    <Typography
                      variant="body1"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {visit.notes}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>
        ),
      },
    ];

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: 3, maxHeight: "90vh" } }}
      >
        <DialogTitle sx={{ bgcolor: PRIMARY, color: "white", pb: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: "white", color: PRIMARY }}>
                {visit.firstName?.[0] || "V"}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {visit.firstName} {visit.lastName}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Visit Details • Complete Information
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": {
                  minHeight: 64,
                  py: 1.5,
                },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  label={tab.label}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ p: 3, maxHeight: "60vh", overflow: "auto" }}>
            {loadingDetails ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={200}
              >
                <CircularProgress sx={{ color: PRIMARY }} />
              </Box>
            ) : (
              tabs[activeTab].content
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ p: 3, pt: 0, borderTop: 1, borderColor: "divider" }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Chip
              label={userRoleConfig.label}
              icon={userRoleConfig.icon}
              size="small"
              sx={{
                bgcolor: `${userRoleConfig.color}15`,
                color: userRoleConfig.color,
                fontWeight: 600,
              }}
            />
            <Button
              onClick={onClose}
              variant="contained"
              sx={{ borderRadius: 2, mt: 2 }}
            >
              Close
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    );
  }
);

ViewVisitModal.displayName = "ViewVisitModal";

// Enhanced Edit Modal
const EditVisitModal = React.memo(
  ({ open, onClose, visit, onSave, userRole, showSnackbar, updating }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { fetchAPI } = useAuth();

    const [editForm, setEditForm] = useState({
      visitStatus: "Not Assigned",
      visitDate: null,
      visitTime: "",
      visitLocation: "",
      status: "Visit",
      visitNotes: "",
    });
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
      if (open && visit) {
        setEditForm({
          visitStatus: visit.visitStatus || "Not Assigned",
          visitDate:
            visit.visitDate && isValid(parseISO(visit.visitDate))
              ? parseISO(visit.visitDate)
              : null,
          visitTime: visit.visitTime || "",
          visitLocation: visit.visitLocation || "",
          status: visit.status || "Visit",
          visitNotes: visit.visitNotes || "",
        });
        setValidationErrors({});
      }
    }, [open, visit]);

    const validateForm = useCallback(() => {
      const errors = {};

      if (!editForm.visitStatus) {
        errors.visitStatus = "Visit status is required";
      }

      if (editForm.visitStatus === "Scheduled" && !editForm.visitDate) {
        errors.visitDate = "Visit date is required for scheduled visits";
      }

      if (editForm.visitStatus === "Scheduled" && !editForm.visitTime) {
        errors.visitTime = "Visit time is required for scheduled visits";
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    }, [editForm]);

    const handleSubmit = useCallback(async () => {
      if (!validateForm()) {
        showSnackbar("Please fix the errors in the form", "error");
        return;
      }

      try {
        const payload = {
          visitStatus: editForm.visitStatus,
          ...(editForm.visitDate && {
            visitDate: format(editForm.visitDate, "yyyy-MM-dd"),
          }),
          ...(editForm.visitTime && { visitTime: editForm.visitTime.trim() }),
          ...(editForm.visitLocation && {
            visitLocation: editForm.visitLocation.trim(),
          }),
          status: editForm.status,
          ...(editForm.visitNotes && {
            visitNotes: editForm.visitNotes.trim(),
          }),
        };

        const response = await fetchAPI(`/lead/updateLead/${visit._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response?.success) {
          showSnackbar("Visit updated successfully", "success");
          onSave(response.result);
          onClose();
        } else {
          throw new Error(response?.message || "Update failed");
        }
      } catch (error) {
        console.error("Update error:", error);
        showSnackbar(error.message || "Update failed", "error");
      }
    }, [
      editForm,
      validateForm,
      visit,
      fetchAPI,
      showSnackbar,
      onSave,
      onClose,
    ]);

    const handleChange = useCallback(
      (field) => (event) => {
        const value = event.target.value;
        setEditForm((prev) => ({ ...prev, [field]: value }));
        if (validationErrors[field]) {
          setValidationErrors((prev) => ({ ...prev, [field]: "" }));
        }
      },
      [validationErrors]
    );

    if (!visit) return null;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: alpha(PRIMARY, 0.05), pb: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: `${PRIMARY}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PRIMARY,
                }}
              >
                <Edit sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Edit Visit
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {visit.firstName} {visit.lastName}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="medium">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={3} sx={{ mt: 3 }}>
            <FormControl
              fullWidth
              size="small"
              error={!!validationErrors.visitStatus}
            >
              <InputLabel>Visit Status</InputLabel>
              <Select
                value={editForm.visitStatus}
                label="Visit Status"
                onChange={handleChange("visitStatus")}
              >
                {Object.keys(STATUS_CONFIG).map((status) => (
                  <MenuItem key={status} value={status}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {getStatusConfig(status).icon}
                      <span>{status}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.visitStatus && (
                <FormHelperText>{validationErrors.visitStatus}</FormHelperText>
              )}
            </FormControl>

            <DatePicker
              label="Visit Date"
              value={editForm.visitDate}
              onChange={(newValue) =>
                setEditForm((prev) => ({ ...prev, visitDate: newValue }))
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  error: !!validationErrors.visitDate,
                  helperText: validationErrors.visitDate,
                },
              }}
            />

            <TextField
              label="Visit Time"
              value={editForm.visitTime}
              onChange={handleChange("visitTime")}
              placeholder="HH:MM (e.g., 14:30)"
              fullWidth
              size="small"
              error={!!validationErrors.visitTime}
              helperText={validationErrors.visitTime}
            />

            <TextField
              label="Visit Location"
              value={editForm.visitLocation}
              onChange={handleChange("visitLocation")}
              multiline
              rows={2}
              fullWidth
              size="small"
            />

            <TextField
              label="Visit Notes"
              value={editForm.visitNotes}
              onChange={handleChange("visitNotes")}
              multiline
              rows={3}
              fullWidth
              size="small"
              helperText="Add any notes related to this visit"
            />

            <FormControl fullWidth size="small">
              <InputLabel>Lead Status</InputLabel>
              <Select
                value={editForm.status}
                label="Lead Status"
                onChange={handleChange("status")}
              >
                {Object.keys(LEAD_STATUS_CONFIG).map((status) => (
                  <MenuItem key={status} value={status}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {getLeadStatusConfig(status).icon}
                      <span>{status}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{ p: 3, pt: 2, borderTop: 1, borderColor: "divider", gap: 2 }}
        >
          <Button onClick={onClose} variant="outlined" size="large">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={updating}
            startIcon={updating ? <CircularProgress size={20} /> : <Save />}
            sx={{ bgcolor: PRIMARY, px: 4, "&:hover": { bgcolor: "#e65c00" } }}
          >
            {updating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

EditVisitModal.displayName = "EditVisitModal";

// Loading Skeleton
const LoadingSkeleton = () => (
  <Box sx={{ p: 3 }}>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={6} sm={3} key={item}>
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
      ))}
    </Grid>
    <Skeleton
      variant="rectangular"
      height={400}
      sx={{ borderRadius: 2, mb: 2 }}
    />
    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
  </Box>
);

// ========== MAIN COMPONENT ==========
export default function TotalVisitsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { fetchAPI, getUserRole } = useAuth();
  const userRole = getUserRole();

  // Media queries
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmall = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // State Management
  const [period, setPeriod] = useState("Today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Data State
  const [allVisits, setAllVisits] = useState([]);
  const [summary, setSummary] = useState({
    totalVisits: 0,
    completedVisits: 0,
    scheduledVisits: 0,
    thisWeekVisits: 0,
    conversionRate: 0,
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  });
  const [dateFilterError, setDateFilterError] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState(
    Object.keys(STATUS_CONFIG).reduce((acc, status) => {
      acc[status] = true;
      return acc;
    }, {})
  );

  // Sorting & Pagination
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  // Modal States
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Snackbar Handler
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch Data
  const fetchVisitsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const today = new Date();

      if (period === "Today") {
        params.append("startDate", format(today, "yyyy-MM-dd"));
        params.append("endDate", format(today, "yyyy-MM-dd"));
      } else if (period === "This Week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.append("startDate", format(weekAgo, "yyyy-MM-dd"));
        params.append("endDate", format(today, "yyyy-MM-dd"));
      } else if (period === "This Month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        params.append("startDate", format(monthAgo, "yyyy-MM-dd"));
        params.append("endDate", format(today, "yyyy-MM-dd"));
      }

      const response = await fetchAPI(
        `/lead/visitSummary?${params.toString()}`
      );

      if (response?.success) {
        const visits = response.result?.visits || response.result || [];

        // Calculate summary
        const totalVisits = visits.length;
        const completedVisits = visits.filter(
          (v) => v.visitStatus === "Completed"
        ).length;
        const scheduledVisits = visits.filter(
          (v) => v.visitStatus === "Scheduled"
        ).length;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const thisWeekVisits = visits.filter((v) => {
          if (!v.visitDate) return false;
          try {
            const visitDate = parseISO(v.visitDate);
            return isValid(visitDate) && visitDate >= weekAgo;
          } catch {
            return false;
          }
        }).length;

        const conversionRate =
          totalVisits > 0
            ? Math.round((completedVisits / totalVisits) * 100)
            : 0;

        setAllVisits(visits);
        setSummary({
          totalVisits,
          completedVisits,
          scheduledVisits,
          thisWeekVisits,
          conversionRate,
        });
      } else {
        throw new Error(response?.message || "Failed to fetch visits");
      }
    } catch (err) {
      console.error("Error fetching visits:", err);
      setError(err.message || "Network error. Please try again.");
      showSnackbar(err.message || "Failed to fetch visits data", "error");
      setAllVisits([]);
      setSummary({
        totalVisits: 0,
        completedVisits: 0,
        scheduledVisits: 0,
        thisWeekVisits: 0,
        conversionRate: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [period, fetchAPI, showSnackbar]);

  // Apply Filters
  const applyFilters = useCallback(() => {
    try {
      let filtered = [...allVisits];

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (visit) =>
            (visit.firstName?.toLowerCase() || "").includes(query) ||
            (visit.lastName?.toLowerCase() || "").includes(query) ||
            (visit.email?.toLowerCase() || "").includes(query) ||
            (visit.phone || "").includes(query) ||
            (visit.visitLocation?.toLowerCase() || "").includes(query)
        );
      }

      // Status filter
      if (statusFilter !== "All") {
        filtered = filtered.filter(
          (visit) => visit.visitStatus === statusFilter
        );
      }

      // Date filter
      if (dateFilter.startDate && isValid(dateFilter.startDate)) {
        const start = startOfDay(new Date(dateFilter.startDate));
        filtered = filtered.filter((visit) => {
          if (!visit.visitDate) return false;
          try {
            const visitDate = parseISO(visit.visitDate);
            return isValid(visitDate) && visitDate >= start;
          } catch {
            return false;
          }
        });
      }

      if (dateFilter.endDate && isValid(dateFilter.endDate)) {
        const end = endOfDay(new Date(dateFilter.endDate));
        filtered = filtered.filter((visit) => {
          if (!visit.visitDate) return false;
          try {
            const visitDate = parseISO(visit.visitDate);
            return isValid(visitDate) && visitDate <= end;
          } catch {
            return false;
          }
        });
      }

      // Status checkboxes
      const activeStatuses = Object.keys(selectedStatuses).filter(
        (status) => selectedStatuses[status]
      );
      if (activeStatuses.length < Object.keys(STATUS_CONFIG).length) {
        filtered = filtered.filter((visit) =>
          activeStatuses.includes(visit.visitStatus || "Not Assigned")
        );
      }

      // Sorting
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          let aVal = a[sortConfig.key];
          let bVal = b[sortConfig.key];

          if (sortConfig.key === "visitDate") {
            aVal = aVal ? parseISO(aVal) : new Date(0);
            bVal = bVal ? parseISO(bVal) : new Date(0);
          } else if (sortConfig.key === "firstName") {
            aVal = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
            bVal = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
          } else if (sortConfig.key === "visitStatus") {
            aVal = STATUS_CONFIG[aVal]?.order || 0;
            bVal = STATUS_CONFIG[bVal]?.order || 0;
          }

          if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }

      return filtered;
    } catch (err) {
      console.error("Filter error:", err);
      showSnackbar("Error applying filters", "error");
      return [];
    }
  }, [
    allVisits,
    searchQuery,
    statusFilter,
    dateFilter,
    selectedStatuses,
    sortConfig,
    showSnackbar,
  ]);

  // Memoized filtered visits
  const filteredVisits = useMemo(() => applyFilters(), [applyFilters]);

  // Paginated visits
  const paginatedVisits = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredVisits.slice(start, start + rowsPerPage);
  }, [filteredVisits, page, rowsPerPage]);

  // Effects
  useEffect(() => {
    if (hasAccess(userRole)) {
      fetchVisitsData();
    }
  }, [fetchVisitsData, userRole]);

  useEffect(() => {
    if (dateFilter.startDate && dateFilter.endDate) {
      const from = new Date(dateFilter.startDate);
      const to = new Date(dateFilter.endDate);
      const error = from > to ? "Start date cannot be after end date" : "";
      setDateFilterError(error);
    } else {
      setDateFilterError("");
    }
  }, [dateFilter.startDate, dateFilter.endDate]);

  // Handlers
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleViewClick = useCallback(
    (visit) => {
      if (!visit?._id) {
        showSnackbar("Invalid visit data", "error");
        return;
      }
      setSelectedVisit(visit);
      setViewModalOpen(true);
    },
    [showSnackbar]
  );

  const handleEditClick = useCallback(
    (visit) => {
      if (!visit?._id) {
        showSnackbar("Invalid visit data", "error");
        return;
      }
      setSelectedVisit(visit);
      setEditModalOpen(true);
    },
    [showSnackbar]
  );

  const handleVisitUpdate = useCallback(
    async (updatedVisit) => {
      try {
        await fetchVisitsData();
        showSnackbar("Visit updated successfully", "success");
      } catch (err) {
        console.error("Error after visit update:", err);
        showSnackbar("Failed to refresh data", "error");
      }
    },
    [fetchVisitsData, showSnackbar]
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const handleStatusCheckboxChange = useCallback((status) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("All");
    setDateFilter({ startDate: null, endDate: null });
    setDateFilterError("");
    setSelectedStatuses(
      Object.keys(STATUS_CONFIG).reduce((acc, status) => {
        acc[status] = true;
        return acc;
      }, {})
    );
    setSortConfig({ key: null, direction: "asc" });
    setPage(0);
  }, []);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Summary Cards
  const summaryCards = useMemo(
    () => [
      {
        label: "Total Visits",
        value: summary.totalVisits,
        color: PRIMARY,
        icon: <People />,
        subText: "All visits",
      },
      {
        label: "Completed",
        value: summary.completedVisits,
        color: "#4caf50",
        icon: <CheckCircle />,
        subText: "Completed visits",
      },
      {
        label: "Scheduled",
        value: summary.scheduledVisits,
        color: "#2196f3",
        icon: <Schedule />,
        subText: "Scheduled visits",
      },
      {
        label: "This Week",
        value: summary.thisWeekVisits,
        color: "#9c27b0",
        icon: <TrendingUp />,
        subText: "Visits this week",
      },
    ],
    [summary]
  );

  // Access Check
  if (!hasAccess(userRole)) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          <AlertTitle>Access Denied</AlertTitle>
          You don't have permission to access this page.
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </Alert>
      </Box>
    );
  }

  if (loading && allVisits.length === 0) {
    return <LoadingSkeleton />;
  }

  if (error && allVisits.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchVisitsData}>
              Retry
            </Button>
          }
        >
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Modals */}
      <ViewVisitModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        visit={selectedVisit}
        userRole={userRole}
        showSnackbar={showSnackbar}
      />

      <EditVisitModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        visit={selectedVisit}
        onSave={handleVisitUpdate}
        userRole={userRole}
        showSnackbar={showSnackbar}
        updating={updating}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", color: "#fff" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Main Content */}
      <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: "100vh" }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 4 }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Visit Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage all visit activities and schedules
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchVisitsData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "visible",
                  position: "relative",
                  width: "277px",
                  border: `1px solid ${alpha(card.color, 0.1)}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: `${card.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: card.color,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{ color: card.color }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {card.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {card.subText}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters Card */}
        <Card sx={{ borderRadius: 3, mb: 4, overflow: "visible" }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Top Filters Row */}
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <Box sx={{ width: { xs: "100%", md: 300 } }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name, email, phone or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setSearchQuery("")}
                          >
                            <Close />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={period}
                      label="Period"
                      onChange={(e) => setPeriod(e.target.value)}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="This Week">This Week</MenuItem>
                      <MenuItem value="This Month">This Month</MenuItem>
                      <MenuItem value="All">All Time</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Visit Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Visit Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Statuses</MenuItem>
                      {Object.keys(STATUS_CONFIG).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    startIcon={<Tune />}
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    sx={{ display: { xs: "none", sm: "flex" } }}
                  >
                    {showFilterPanel ? "Hide Filters" : "More Filters"}
                  </Button>
                </Stack>
              </Stack>

              {/* Advanced Filter Panel */}
              {showFilterPanel && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    borderColor: "divider",
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Advanced Filters
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Start Date"
                        value={dateFilter.startDate}
                        onChange={(newValue) =>
                          setDateFilter((prev) => ({
                            ...prev,
                            startDate: newValue,
                          }))
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: !!dateFilterError,
                            helperText: dateFilterError,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="End Date"
                        value={dateFilter.endDate}
                        onChange={(newValue) =>
                          setDateFilter((prev) => ({
                            ...prev,
                            endDate: newValue,
                          }))
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: !!dateFilterError,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        gutterBottom
                      >
                        Visit Status
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {Object.keys(STATUS_CONFIG).map((status) => (
                          <FormControlLabel
                            key={status}
                            control={
                              <Checkbox
                                checked={selectedStatuses[status]}
                                onChange={() =>
                                  handleStatusCheckboxChange(status)
                                }
                                size="small"
                              />
                            }
                            label={
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                              >
                                {getStatusConfig(status).icon}
                                <span>{status}</span>
                              </Stack>
                            }
                          />
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                    sx={{ mt: 3 }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleClearFilters}
                      startIcon={<Clear />}
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setShowFilterPanel(false)}
                      sx={{ bgcolor: PRIMARY }}
                    >
                      Apply Filters
                    </Button>
                  </Stack>
                </Paper>
              )}

              {/* Active Filters */}
              {(searchQuery ||
                statusFilter !== "All" ||
                dateFilter.startDate ||
                dateFilter.endDate ||
                Object.values(selectedStatuses).some((v) => !v)) && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Active Filters:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {searchQuery && (
                      <Chip
                        label={`Search: ${searchQuery}`}
                        size="small"
                        onDelete={() => setSearchQuery("")}
                      />
                    )}
                    {statusFilter !== "All" && (
                      <Chip
                        label={`Status: ${statusFilter}`}
                        size="small"
                        onDelete={() => setStatusFilter("All")}
                      />
                    )}
                    {dateFilter.startDate && (
                      <Chip
                        label={`From: ${format(
                          dateFilter.startDate,
                          "dd MMM yyyy"
                        )}`}
                        size="small"
                        onDelete={() =>
                          setDateFilter((prev) => ({
                            ...prev,
                            startDate: null,
                          }))
                        }
                      />
                    )}
                    {dateFilter.endDate && (
                      <Chip
                        label={`To: ${format(
                          dateFilter.endDate,
                          "dd MMM yyyy"
                        )}`}
                        size="small"
                        onDelete={() =>
                          setDateFilter((prev) => ({
                            ...prev,
                            endDate: null,
                          }))
                        }
                      />
                    )}
                    {Object.keys(selectedStatuses).some(
                      (status) => !selectedStatuses[status]
                    ) && (
                      <Chip
                        label="Custom Status Filter"
                        size="small"
                        onDelete={() =>
                          setSelectedStatuses(
                            Object.keys(STATUS_CONFIG).reduce((acc, status) => {
                              acc[status] = true;
                              return acc;
                            }, {})
                          )
                        }
                      />
                    )}
                    <Chip
                      label="Clear All"
                      size="small"
                      variant="outlined"
                      onClick={handleClearFilters}
                      deleteIcon={<Close />}
                      onDelete={handleClearFilters}
                    />
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box
              sx={{
                p: 3,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Total Visits ({filteredVisits.length})
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Show:
                </Typography>
                <Select
                  size="small"
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  sx={{ minWidth: 100 }}
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Box>

            {/* Table Container */}
            <TableContainer
              sx={{
                maxHeight: { xs: "60vh", md: "70vh" },
                position: "relative",
              }}
            >
              {loading && allVisits.length > 0 && (
                <LinearProgress
                  sx={{ position: "absolute", top: 0, left: 0, right: 0 }}
                />
              )}

              <Table stickyHeader size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => handleSort("firstName")}
                        startIcon={
                          sortConfig.key === "firstName" ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUpward fontSize="small" />
                            ) : (
                              <ArrowDownward fontSize="small" />
                            )
                          ) : null
                        }
                        sx={{
                          justifyContent: "flex-start",
                          fontWeight: 600,
                          color: "text.primary",
                        }}
                      >
                        Customer Details
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => handleSort("visitDate")}
                        startIcon={
                          sortConfig.key === "visitDate" ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUpward fontSize="small" />
                            ) : (
                              <ArrowDownward fontSize="small" />
                            )
                          ) : null
                        }
                        sx={{
                          justifyContent: "flex-start",
                          fontWeight: 600,
                          color: "text.primary",
                        }}
                      >
                        Visit Date & Time
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Location
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => handleSort("visitStatus")}
                        startIcon={
                          sortConfig.key === "visitStatus" ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUpward fontSize="small" />
                            ) : (
                              <ArrowDownward fontSize="small" />
                            )
                          ) : null
                        }
                        sx={{
                          justifyContent: "flex-start",
                          fontWeight: 600,
                          color: "text.primary",
                        }}
                      >
                        Visit Status
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Lead Status
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedVisits.length > 0 ? (
                    paginatedVisits.map((visit) => {
                      const visitStatusConfig = getStatusConfig(
                        visit.visitStatus
                      );
                      const leadStatusConfig = getLeadStatusConfig(
                        visit.status
                      );

                      return (
                        <TableRow
                          key={visit._id}
                          hover
                          sx={{
                            "&:hover": {
                              bgcolor: alpha(PRIMARY, 0.02),
                            },
                          }}
                        >
                          {/* Customer Details */}
                          <TableCell>
                            <Stack spacing={1}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {visit.firstName} {visit.lastName}
                              </Typography>
                              <Stack spacing={0.5}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    color: "text.secondary",
                                  }}
                                >
                                  <Email fontSize="inherit" />
                                  {visit.email || "No email"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    color: "text.secondary",
                                  }}
                                >
                                  <Phone fontSize="inherit" />
                                  {visit.phone || "No phone"}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>

                          {/* Visit Date & Time */}
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {formatDate(visit.visitDate, "dd MMM yyyy")}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatTime(visit.visitTime)}
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Location */}
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 150,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {visit.visitLocation || "Not set"}
                            </Typography>
                          </TableCell>

                          {/* Visit Status */}
                          <TableCell>
                            <Chip
                              label={visit.visitStatus || "Not Assigned"}
                              icon={visitStatusConfig.icon}
                              size="small"
                              sx={{
                                bgcolor: visitStatusConfig.bg,
                                color: visitStatusConfig.color,
                                fontWeight: 600,
                                minWidth: 120,
                              }}
                            />
                          </TableCell>

                          {/* Lead Status */}
                          <TableCell>
                            <Chip
                              label={visit.status || "Unknown"}
                              icon={leadStatusConfig.icon}
                              size="small"
                              sx={{
                                bgcolor: leadStatusConfig.bg,
                                color: leadStatusConfig.color,
                                fontWeight: 600,
                                minWidth: 120,
                              }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View Details" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewClick(visit)}
                                  sx={{
                                    bgcolor: alpha("#1976d2", 0.1),
                                    color: "#1976d2",
                                    "&:hover": {
                                      bgcolor: alpha("#1976d2", 0.2),
                                    },
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Edit" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditClick(visit)}
                                  sx={{
                                    bgcolor: alpha(PRIMARY, 0.1),
                                    color: PRIMARY,
                                    "&:hover": {
                                      bgcolor: alpha(PRIMARY, 0.2),
                                    },
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <Search
                            sx={{
                              fontSize: 64,
                              color: "text.disabled",
                              mb: 2,
                            }}
                          />
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            gutterBottom
                          >
                            No visits found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchQuery ||
                            statusFilter !== "All" ||
                            dateFilter.startDate ||
                            dateFilter.endDate ||
                            Object.values(selectedStatuses).some((v) => !v)
                              ? "Try adjusting your filters"
                              : "No visits have been scheduled yet"}
                          </Typography>
                          {(searchQuery ||
                            statusFilter !== "All" ||
                            dateFilter.startDate ||
                            dateFilter.endDate ||
                            Object.values(selectedStatuses).some(
                              (v) => !v
                            )) && (
                            <Button
                              variant="outlined"
                              onClick={handleClearFilters}
                              sx={{ mt: 2 }}
                            >
                              Clear All Filters
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredVisits.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing{" "}
                  {Math.min(page * rowsPerPage + 1, filteredVisits.length)} to{" "}
                  {Math.min((page + 1) * rowsPerPage, filteredVisits.length)} of{" "}
                  {filteredVisits.length} entries
                </Typography>
                <Pagination
                  count={Math.ceil(filteredVisits.length / rowsPerPage)}
                  page={page + 1}
                  onChange={(event, value) => setPage(value - 1)}
                  color="primary"
                  showFirstButton
                  showLastButton
                  siblingCount={1}
                  boundaryCount={1}
                  size={isSmall ? "small" : "medium"}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 3, display: "block", textAlign: "center" }}
        >
          Last updated: {formatDate(new Date().toISOString())} •{" "}
          {summary.totalVisits} total visits
        </Typography>
      </Box>
    </LocalizationProvider>
  );
}
