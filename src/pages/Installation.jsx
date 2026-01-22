import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
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
  Button,
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
  CircularProgress,
  CardContent,
  Tooltip,
  InputAdornment,
  Pagination,
  Avatar,
  alpha,
  useTheme,
  useMediaQuery,
  Paper,
  LinearProgress,
  FormHelperText,
  Skeleton,
} from "@mui/material";
import {
  Search,
  Download,
  Edit,
  Visibility,
  Close,
  CheckCircle,
  Clear,
  Refresh,
  Cancel,
  PendingActions,
  FileCopy,
  FolderOpen,
  PictureAsPdf,
  Image as ImageIcon,
  InsertDriveFile,
  Launch,
  PictureAsPdfOutlined,
  DescriptionOutlined,
  GetApp,
  Badge as BadgeIcon,
  CloudUpload,
  Delete,
  CreditCard,
  CloudDownload,
  Add,
  Person,
  Email,
  Phone,
  LocationOn,
  Note,
  Warning,
  FilterList,
  Tune,
  ArrowUpward,
  ArrowDownward,
  Description,
  Save,
  MoreVert,
  TrendingUp,
  Assignment,
  LocalAtm,
  Build,
  Error as ErrorIcon,
  Check,
  Home,
  ReceiptLong,
  AttachFile,
  Security,
  SupervisorAccount,
  Groups,
  AdminPanelSettings,
  WorkspacePremium,
  AddPhotoAlternate,
  GppMaybe,
  Schedule,
  AccessTime,
  CalendarToday,
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
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const DEFAULT_ITEMS_PER_PAGE = 10;
const ALLOWED_ROLES = ["Head_office", "ZSM", "ASM", "TEAM"];

// Installation Status Configuration
const INSTALLATION_STATUS_OPTIONS = ["pending", "meter-charge", "final-payment"];

const INSTALLATION_STATUS_CONFIG = {
  pending: {
    label: "Scheduled",
    bg: "#e3f2fd",
    color: "#1976d2",
    icon: <Schedule sx={{ fontSize: 16 }} />,
    description: "Installation is scheduled",
    progress: 33,
  },
  "meter-charge": {
    label: "Meter Charge",
    bg: "#fff3e0",
    color: "#ef6c00",
    icon: <LocalAtm sx={{ fontSize: 16 }} />,
    description: "Meter charging in progress",
    progress: 66,
  },
  "final-payment": {
    label: "Final Payment",
    bg: "#e8f5e9",
    color: "#2e7d32",
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
    description: "Final payment completed",
    progress: 100,
  },
};

// Lead Status Configuration for Installation Page
const LEAD_STATUS_OPTIONS = [
  "Installation Completion",
  "Missed Leads",
];

const LEAD_STATUS_CONFIG = {
  "Installation Completion": {
    bg: "#e8f5e9",
    color: "#2e7d32",
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
    description: "Installation completed successfully",
  },
  "Missed Leads": {
    bg: "#ffebee",
    color: "#c62828",
    icon: <Cancel sx={{ fontSize: 16 }} />,
    description: "Lead lost or not converted",
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
const hasAccess = (userRole) => ALLOWED_ROLES.includes(userRole);

const getUserPermissions = (userRole) => ({
  canView: true,
  canEdit: ["Head_office", "ZSM", "ASM", "TEAM"].includes(userRole),
  canDelete: userRole === "Head_office",
  canManage: ["Head_office", "ZSM", "ASM"].includes(userRole),
  canSeeAll: ["Head_office", "ZSM", "ASM"].includes(userRole),
  canSeeOwn: userRole === "TEAM",
  canUpdateStatus: ["Head_office", "ZSM", "ASM", "TEAM"].includes(userRole),
});

const getInstallationStatusColor = (status) => {
  if (!status) return INSTALLATION_STATUS_CONFIG.pending;
  const normalizedStatus = status.toLowerCase();
  return (
    INSTALLATION_STATUS_CONFIG[normalizedStatus] || {
      label: status || "Unknown",
      bg: "#f5f5f5",
      color: "#757575",
      icon: <Warning sx={{ fontSize: 16 }} />,
      description: "Status unknown",
      progress: 0,
    }
  );
};

const getLeadStatusConfig = (status) => {
  return (
    LEAD_STATUS_CONFIG[status] || {
      label: status || "Unknown",
      bg: "#f5f5f5",
      color: "#616161",
      icon: <Warning sx={{ fontSize: 16 }} />,
      description: "Unknown status",
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

// ========== REUSABLE COMPONENTS ==========

// Installation Status Update Modal
const InstallationStatusUpdateModal = React.memo(
  ({ open, onClose, lead, onStatusUpdate, showSnackbar, userRole }) => {
    const { fetchAPI, user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [loading, setLoading] = useState(false);
    const [selectedInstallationStatus, setSelectedInstallationStatus] = useState("");
    const [selectedLeadStatus, setSelectedLeadStatus] = useState("");
    const [installationDate, setInstallationDate] = useState(null);
    const [installationNotes, setInstallationNotes] = useState("");
    const [errors, setErrors] = useState({});

    const installationStatusConfig = useMemo(
      () => getInstallationStatusColor(lead?.installationStatus),
      [lead?.installationStatus]
    );

    const leadStatusConfig = useMemo(
      () => getLeadStatusConfig(lead?.status),
      [lead?.status]
    );

    useEffect(() => {
      if (open && lead) {
        setSelectedInstallationStatus(lead.installationStatus || "");
        setSelectedLeadStatus(lead.status || "Installation Completion");
        setInstallationDate(
          lead.installationDate ? parseISO(lead.installationDate) : null
        );
        setInstallationNotes(lead.installationNotes || "");
        setErrors({});
      }
    }, [open, lead]);

    const handleSubmit = useCallback(async () => {
      const errors = {};

      if (!selectedInstallationStatus) {
        errors.installationStatus = "Please select installation status";
      }

      if (!selectedLeadStatus) {
        errors.leadStatus = "Please select lead status";
      }

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }

      if (
        selectedInstallationStatus === lead?.installationStatus &&
        selectedLeadStatus === lead?.status &&
        installationDate === (lead.installationDate ? parseISO(lead.installationDate) : null) &&
        installationNotes === (lead.installationNotes || "")
      ) {
        onClose();
        return;
      }

      setLoading(true);
      try {
        const updateData = {
          installationStatus: selectedInstallationStatus,
          status: selectedLeadStatus,
          installationNotes: installationNotes,
          installationDate:installationDate,
          updatedBy: user?._id,
          updatedByRole: user?.role,
          updatedAt: new Date().toISOString(),
        };

        const response = await fetchAPI(`/lead/updateLead/${lead._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (response.success) {
          showSnackbar("Installation status updated successfully", "success");
          onStatusUpdate(response.result);
          onClose();
        } else {
          throw new Error(response.message || "Failed to update status");
        }
      } catch (error) {
        console.error("Error updating installation status:", error);
        setErrors({ submit: error.message });
        showSnackbar(error.message || "Failed to update status", "error");
      } finally {
        setLoading(false);
      }
    }, [
      selectedInstallationStatus,
      selectedLeadStatus,
      installationNotes,
      installationDate,
      lead,
      user,
      fetchAPI,
      showSnackbar,
      onStatusUpdate,
      onClose,
    ]);

    const handleClose = useCallback(() => {
      setSelectedInstallationStatus("");
      setSelectedLeadStatus("");
      setInstallationDate(null);
      setInstallationNotes("");
      setErrors({});
      onClose();
    }, [onClose]);

    const getLeadStatusOptions = useMemo(() => {
      switch (selectedInstallationStatus) {
        case "final-payment":
          return ["Installation Completion"];
        default:
          return LEAD_STATUS_OPTIONS;
      }
    }, [selectedInstallationStatus]);

    if (!lead) return null;

    return (
      <Dialog
        open={open}
        onClose={handleClose}
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
                <Build sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Update Installation Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {lead?.firstName} {lead?.lastName}
                </Typography>
                <Chip
                  label={getRoleConfig(userRole).label}
                  icon={getRoleConfig(userRole).icon}
                  size="small"
                  sx={{
                    bgcolor: `${getRoleConfig(userRole).color}15`,
                    color: getRoleConfig(userRole).color,
                    fontWeight: 600,
                    mt: 1,
                  }}
                />
              </Box>
            </Box>
            <IconButton onClick={handleClose} size="medium">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={3}>
            {errors.submit && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {errors.submit}
              </Alert>
            )}

            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 2 }}
              >
                Current Installation Status
              </Typography>
              <Chip
                label={installationStatusConfig.label}
                icon={installationStatusConfig.icon}
                sx={{
                  bgcolor: installationStatusConfig.bg,
                  color: installationStatusConfig.color,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  px: 1,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {installationStatusConfig.description}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Current Lead Status
              </Typography>
              <Chip
                label={lead.status}
                icon={leadStatusConfig.icon}
                sx={{
                  bgcolor: leadStatusConfig.bg,
                  color: leadStatusConfig.color,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  px: 1,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {leadStatusConfig.description}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                New Installation Status *
              </Typography>
              <FormControl fullWidth size="small" error={!!errors.installationStatus}>
                <Select
                  value={selectedInstallationStatus}
                  onChange={(e) => {
                    setSelectedInstallationStatus(e.target.value);
                    if (e.target.value === "final-payment") {
                      setSelectedLeadStatus("Installation Completion");
                    }
                  }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select installation status
                  </MenuItem>
                  {INSTALLATION_STATUS_OPTIONS.filter((status) => status !== lead?.installationStatus).map((status) => {
                    const config = getInstallationStatusColor(status);
                    return (
                      <MenuItem key={status} value={status}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          {config.icon}
                          <Box>
                            <Typography variant="body2">
                              {config.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {config.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                    );
                  })}
                </Select>
                {errors.installationStatus && (
                  <FormHelperText>{errors.installationStatus}</FormHelperText>
                )}
              </FormControl>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Lead Status *
              </Typography>
              <FormControl fullWidth size="small" error={!!errors.leadStatus}>
                <Select
                  value={selectedLeadStatus}
                  onChange={(e) => setSelectedLeadStatus(e.target.value)}
                  displayEmpty
                  disabled={selectedInstallationStatus === "final-payment"}
                >
                  <MenuItem value="" disabled>
                    Select lead status
                  </MenuItem>
                  {getLeadStatusOptions.map((status) => {
                    const config = getLeadStatusConfig(status);
                    return (
                      <MenuItem key={status} value={status}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          {config.icon}
                          <Box>
                            <Typography variant="body2">{status}</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {config.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                    );
                  })}
                </Select>
                {errors.leadStatus && (
                  <FormHelperText>{errors.leadStatus}</FormHelperText>
                )}
              </FormControl>
            </Box>

            <DatePicker
              label="Installation Date"
              value={installationDate}
              onChange={(newValue) => setInstallationDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                },
              }}
            />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Installation Notes
              </Typography>
              <TextField
                value={installationNotes}
                onChange={(e) => setInstallationNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Add notes about this installation..."
                size="small"
              />
            </Box>

            {selectedInstallationStatus && (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  {selectedInstallationStatus === "final-payment"
                    ? "When marked as final payment, installation will be considered completed."
                    : selectedInstallationStatus === "meter-charge"
                    ? "Meter charge phase indicates installation is in progress."
                    : "When scheduled, installation is planned but not yet started."}
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{ p: 3, pt: 2, borderTop: 1, borderColor: "divider", gap: 2 }}
        >
          <Button onClick={handleClose} variant="outlined" size="large">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={
              loading ||
              !selectedInstallationStatus ||
              !selectedLeadStatus ||
              (selectedInstallationStatus === lead?.installationStatus &&
                selectedLeadStatus === lead?.status &&
                installationDate === (lead.installationDate ? parseISO(lead.installationDate) : null) &&
                installationNotes === (lead.installationNotes || ""))
            }
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{ bgcolor: PRIMARY, px: 4, "&:hover": { bgcolor: "#e65c00" } }}
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

InstallationStatusUpdateModal.displayName = "InstallationStatusUpdateModal";

// View Lead Modal
const ViewLeadModal = React.memo(
  ({ open, onClose, lead, userRole, showSnackbar }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [activeTab, setActiveTab] = useState(0);

    const userRoleConfig = useMemo(() => getRoleConfig(userRole), [userRole]);

    const handleTabChange = (event, newValue) => {
      setActiveTab(newValue);
    };

    if (!lead) return null;

    const tabs = [
      {
        label: "Installation",
        icon: <Build />,
        content: (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: "none", width: "100%" }}>
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
                    <Build /> Installation Details
                  </Typography>
                  <Stack spacing={2.5}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Installation Date
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatDate(lead.installationDate)}
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
                        Installation Status
                      </Typography>
                      <Chip
                        label={getInstallationStatusColor(lead.installationStatus).label}
                        icon={getInstallationStatusColor(lead.installationStatus).icon}
                        size="small"
                        sx={{
                          bgcolor: getInstallationStatusColor(lead.installationStatus).bg,
                          color: getInstallationStatusColor(lead.installationStatus).color,
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
                        Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(lead.updatedAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: "none", width: "100%" }}>
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
                    <GppMaybe /> Status Information
                  </Typography>
                  <Stack spacing={2.5}>
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
                        label={lead.status || "Unknown"}
                        icon={getLeadStatusConfig(lead.status).icon}
                        size="small"
                        sx={{
                          bgcolor: getLeadStatusConfig(lead.status).bg,
                          color: getLeadStatusConfig(lead.status).color,
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
                        Created Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(lead.createdAt)}
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
                        Updated By Role
                      </Typography>
                      <Typography variant="body1">
                        {lead.updatedByRole ? getRoleConfig(lead.updatedByRole).label : "Not set"}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            {lead.installationNotes && (
              <Grid item xs={12}>
                <Card sx={{ boxShadow: "none" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                        color: PRIMARY,
                      }}
                    >
                      <Note /> Installation Notes
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "grey.300",
                      }}
                    >
                      <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                        {lead.installationNotes}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        ),
      },
      {
        label: "Customer",
        icon: <Person />,
        content: (
          <Card sx={{ boxShadow: "none", width: "100%" }}>
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
                <Person /> Customer Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {lead.firstName} {lead.lastName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {lead.email || "Not set"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {lead.phoneNumber || lead.phone || "Not set"}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {lead.address || "Not set"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        City
                      </Typography>
                      <Typography variant="body1">
                        {lead.city || "Not set"}
                      </Typography>
                    </Box>
                    {lead.state && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          State
                        </Typography>
                        <Typography variant="body1">
                          {lead.state}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ),
      },
    ];

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: 3, maxHeight: "90vh" } }}
      >
        <DialogTitle
          sx={{
            bgcolor: PRIMARY,
            color: "white",
            pb: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: "white", color: PRIMARY }}>
                {lead.firstName?.[0] || "I"}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {lead.firstName} {lead.lastName}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Installation Details • {getInstallationStatusColor(lead.installationStatus).label}
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
            <Stack 
              direction="row" 
              sx={{ 
                px: 2, 
                overflowX: 'auto',
                '& .MuiButtonBase-root': {
                  minWidth: 'auto',
                  px: 2,
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Button
                  key={index}
                  startIcon={tab.icon}
                  onClick={() => setActiveTab(index)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: activeTab === index ? PRIMARY : "text.secondary",
                    borderBottom: activeTab === index ? `2px solid ${PRIMARY}` : "none",
                    borderRadius: 0,
                    py: 2,
                    minHeight: 'auto',
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: PRIMARY,
                    }
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 3, maxHeight: "60vh", overflow: "auto" }}>
            {tabs[activeTab].content}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ p: 3, pt: 2, borderTop: 1, borderColor: "divider", gap: 2 }}
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
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

ViewLeadModal.displayName = "ViewLeadModal";

// Loading Skeletons
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
export default function InstallationPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { fetchAPI, user } = useAuth();
  const userRole = user?.role;
  const userPermissions = useMemo(
    () => getUserPermissions(userRole),
    [userRole]
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
  const [installationData, setInstallationData] = useState({
    installations: [],
    summary: {
      totalInstallations: 0,
      pendingInstallations: 0,
      meterChargeInstallations: 0,
      finalPaymentInstallations: 0,
    },
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [installationStatusFilter, setInstallationStatusFilter] = useState("All");
  const [leadStatusFilter, setLeadStatusFilter] = useState("All");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  });
  const [dateFilterError, setDateFilterError] = useState("");

  // Sorting & Pagination
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  // Modal States
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Snackbar Handler
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch Data
  const fetchInstallationData = useCallback(async () => {
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
        `/lead/installationSummary?${params.toString()}`
      );
  
      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch data");
      }
  
      const allLeads = response.result?.installations || [];
  
      let filteredLeads = allLeads;
      if (userRole === "TEAM" && user?._id) {
        filteredLeads = allLeads.filter(lead =>
          lead.assignedTo === user._id ||
          lead.assignedManager === user._id ||
          lead.assignedUser === user._id ||
          lead.createdBy === user._id
        );
      }
  
      const summary = {
        totalInstallations: filteredLeads.length,
        pendingInstallations: filteredLeads.filter(
          l => l.installationStatus === "pending"
        ).length,
        inProgressInstallations: filteredLeads.filter(
          l => l.installationStatus === "meter-charge"
        ).length,
        completedInstallations: filteredLeads.filter(
          l => l.installationStatus === "final-payment"
        ).length,
      };
  
      setInstallationData({
        installations: filteredLeads,
        summary,
      });
  
    } catch (err) {
      console.error(err);
      setError(err.message);
      showSnackbar(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [period, fetchAPI, userRole, user, showSnackbar]);
  

  // Initial fetch
  useEffect(() => {
    if (hasAccess(userRole)) {
      fetchInstallationData();
    } else {
      setError("You don't have permission to access this page");
      setLoading(false);
    }
  }, [fetchInstallationData, userRole]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...installationData.installations];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.firstName?.toLowerCase().includes(query) ||
        lead.lastName?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phoneNumber?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query)
      );
    }

    // Apply installation status filter
    if (installationStatusFilter !== 'All') {
      filtered = filtered.filter(lead => lead.installationStatus === installationStatusFilter);
    }

    // Apply lead status filter
    if (leadStatusFilter !== 'All') {
      filtered = filtered.filter(lead => lead.status === leadStatusFilter);
    }

    // Apply date filter
    if (dateFilter.startDate && dateFilter.endDate) {
      filtered = filtered.filter(lead => {
        if (!lead.installationDate) return false;
        const leadDate = parseISO(lead.installationDate);
        return isWithinInterval(leadDate, {
          start: startOfDay(dateFilter.startDate),
          end: endOfDay(dateFilter.endDate),
        });
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === 'installationDate' || sortConfig.key === 'updatedAt' || sortConfig.key === 'createdAt') {
          const aDate = aValue ? parseISO(aValue) : new Date(0);
          const bDate = bValue ? parseISO(bValue) : new Date(0);
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [installationData.installations, searchQuery, installationStatusFilter, leadStatusFilter, dateFilter, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Handlers
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleStatusUpdate = (updatedLead) => {
    setInstallationData(prev => ({
      ...prev,
      installations: prev.installations.map(lead =>
        lead._id === updatedLead._id ? updatedLead : lead
      ),
      summary: {
        ...prev.summary,
        pendingInstallations: prev.installations.filter(l => 
          l._id === updatedLead._id ? updatedLead.installationStatus === 'pending' : l.installationStatus === 'pending'
        ).length,
        meterChargeInstallations: prev.installations.filter(l =>
          l._id === updatedLead._id ? updatedLead.installationStatus === 'meter-charge' : l.installationStatus === 'meter-charge'
        ).length,
        finalPaymentInstallations: prev.installations.filter(l =>
          l._id === updatedLead._id ? updatedLead.installationStatus === 'final-payment' : l.installationStatus === 'final-payment'
        ).length,
      },
    }));
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setViewModalOpen(true);
  };

  const handleUpdateStatus = (lead) => {
    setSelectedLead(lead);
    setStatusUpdateModalOpen(true);
  };

  const handleDateFilterChange = (type, date) => {
    setDateFilter(prev => {
      const newFilter = { ...prev, [type]: date };
      
      if (newFilter.startDate && newFilter.endDate) {
        if (newFilter.startDate > newFilter.endDate) {
          setDateFilterError('Start date cannot be after end date');
        } else {
          setDateFilterError('');
        }
      }
      
      return newFilter;
    });
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setDateFilter({ startDate: null, endDate: null });
    setDateFilterError('');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setInstallationStatusFilter('All');
    setLeadStatusFilter('All');
    setDateFilter({ startDate: null, endDate: null });
    setDateFilterError('');
    setSortConfig({ key: null, direction: 'asc' });
    setPage(0);
  };

  const handleRefresh = () => {
    fetchInstallationData();
    showSnackbar('Data refreshed successfully', 'success');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Access control
  if (!hasAccess(userRole)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          p: 3,
        }}
      >
        <Security sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
          You do not have permission to access the installation management page.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 3, bgcolor: PRIMARY }}
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  // Loading state
  if (loading && installationData.installations.length === 0) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error && !loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          p: 3,
        }}
      >
        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Data
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 400, mb: 3 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          sx={{ bgcolor: PRIMARY }}
          onClick={fetchInstallationData}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  // Summary cards data
  const summaryCards = [
    {
      title: 'Total Installations',
      value: installationData.summary.totalInstallations,
      icon: <Build sx={{ fontSize: 32, color: PRIMARY }} />,
      bgcolor: `${PRIMARY}15`,
      color: PRIMARY,
      subText: 'All installation leads',
    },
    {
      title: 'Scheduled',
      value: installationData.summary.pendingInstallations,
      icon: <Schedule sx={{ fontSize: 32, color: '#1976d2' }} />,
      bgcolor: '#e3f2fd',
      color: '#1976d2',
      subText: 'Pending installation',
    },
    {
      title: 'Meter Charge',
      value: installationData.summary.meterChargeInstallations,
      icon: <LocalAtm sx={{ fontSize: 32, color: '#ef6c00' }} />,
      bgcolor: '#fff3e0',
      color: '#ef6c00',
      subText: 'Meter charging phase',
    },
    {
      title: 'Final Payment',
      value: installationData.summary.finalPaymentInstallations,
      icon: <CheckCircle sx={{ fontSize: 32, color: '#2e7d32' }} />,
      bgcolor: '#e8f5e9',
      color: '#2e7d32',
      subText: 'Installation completed',
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: "black" }}>
                Installation Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track and manage solar panel installation progress
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </Button>
              <Chip
                label={getRoleConfig(userRole).label}
                icon={getRoleConfig(userRole).icon}
                sx={{
                  bgcolor: `${getRoleConfig(userRole).color}15`,
                  color: getRoleConfig(userRole).color,
                  fontWeight: 600,
                }}
              />
            </Stack>
          </Stack>

          {/* Stats Cards - Matching Document Submission Page Design */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {summaryCards.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: "visible",
                    position: "relative",
                    width: "277px",
                    border: `1px solid ${alpha(stat.color, 0.1)}`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
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
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: stat.bgcolor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: stat.color,
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{ color: stat.color }}
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {stat.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.subText}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

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
                    placeholder="Search by name, email or phone..."
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
                      onChange={(e) => handlePeriodChange(e.target.value)}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="This Week">This Week</MenuItem>
                      <MenuItem value="This Month">This Month</MenuItem>
                      <MenuItem value="All">All Time</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Installation Status</InputLabel>
                    <Select
                      value={installationStatusFilter}
                      label="Installation Status"
                      onChange={(e) => setInstallationStatusFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Status</MenuItem>
                      {INSTALLATION_STATUS_OPTIONS.map(status => (
                        <MenuItem key={status} value={status}>
                          {getInstallationStatusColor(status).label}
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
                      <FormControl fullWidth size="small">
                        <InputLabel>Lead Status</InputLabel>
                        <Select
                          value={leadStatusFilter}
                          label="Lead Status"
                          onChange={(e) => setLeadStatusFilter(e.target.value)}
                        >
                          <MenuItem value="All">All Status</MenuItem>
                          {LEAD_STATUS_OPTIONS.map(status => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={2}>
                        <DatePicker
                          label="Start Date"
                          value={dateFilter.startDate}
                          onChange={(date) => handleDateFilterChange('startDate', date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error: !!dateFilterError,
                              helperText: dateFilterError || ' ',
                            },
                          }}
                        />
                        <DatePicker
                          label="End Date"
                          value={dateFilter.endDate}
                          onChange={(date) => handleDateFilterChange('endDate', date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error: !!dateFilterError,
                            },
                          }}
                        />
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
                installationStatusFilter !== "All" ||
                leadStatusFilter !== "All" ||
                dateFilter.startDate ||
                dateFilter.endDate) && (
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
                    {installationStatusFilter !== "All" && (
                      <Chip
                        label={`Installation: ${installationStatusFilter}`}
                        size="small"
                        onDelete={() => setInstallationStatusFilter("All")}
                      />
                    )}
                    {leadStatusFilter !== "All" && (
                      <Chip
                        label={`Lead: ${leadStatusFilter}`}
                        size="small"
                        onDelete={() => setLeadStatusFilter("All")}
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

        {/* Main Table */}
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
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
                Installation Leads ({filteredData.length})
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Show:
                </Typography>
                <Select
                  size="small"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(0);
                  }}
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
              {loading && installationData.installations.length > 0 && (
                <LinearProgress
                  sx={{ position: "absolute", top: 0, left: 0, right: 0 }}
                />
              )}

              <Table stickyHeader size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(PRIMARY, 0.05) }}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Customer
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => handleSort('installationDate')}
                        startIcon={
                          sortConfig.key === 'installationDate' ? (
                            sortConfig.direction === 'asc' ? (
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
                          textTransform: "none",
                        }}
                      >
                        Installation Date
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => handleSort('installationStatus')}
                        startIcon={
                          sortConfig.key === 'installationStatus' ? (
                            sortConfig.direction === 'asc' ? (
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
                          textTransform: "none",
                        }}
                      >
                        Installation Status
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Lead Status
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Progress
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight={600}>
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Build sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Installation Leads Found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                            {filteredData.length === 0 && installationData.installations.length > 0
                              ? 'Try adjusting your filters to see more results.'
                              : 'No installation data available for the selected period.'}
                          </Typography>
                          {filteredData.length === 0 && installationData.installations.length > 0 && (
                            <Button
                              variant="outlined"
                              startIcon={<FilterList />}
                              onClick={handleClearFilters}
                            >
                              Clear All Filters
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((lead) => {
                      const installationStatus = getInstallationStatusColor(lead.installationStatus);
                      const leadStatus = getLeadStatusConfig(lead.status);

                      return (
                        <TableRow
                          key={lead._id}
                          hover
                          sx={{
                            '&:hover': { bgcolor: alpha(PRIMARY, 0.02) },
                          }}
                        >
                          <TableCell>
                            <Stack spacing={1}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {lead.firstName} {lead.lastName}
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
                                  {lead.email || "No email"}
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
                                  {lead.phoneNumber || lead.phone || "No phone"}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {formatDate(lead.installationDate, 'dd MMM yyyy')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Created: {formatDate(lead.createdAt, 'dd MMM yyyy')}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={installationStatus.label}
                              icon={installationStatus.icon}
                              size="small"
                              sx={{
                                bgcolor: installationStatus.bg,
                                color: installationStatus.color,
                                fontWeight: 600,
                                minWidth: 120,
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={leadStatus.label}
                              icon={leadStatus.icon}
                              size="small"
                              sx={{
                                bgcolor: leadStatus.bg,
                                color: leadStatus.color,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Box sx={{ minWidth: 120 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={installationStatus.progress}
                                  sx={{
                                    flex: 1,
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: alpha(installationStatus.color, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: installationStatus.color,
                                      borderRadius: 4,
                                    },
                                  }}
                                />
                                <Typography variant="caption" fontWeight={600}>
                                  {installationStatus.progress}%
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {installationStatus.description}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewLead(lead)}
                                  sx={{
                                    bgcolor: alpha('#1976d2', 0.1),
                                    color: '#1976d2',
                                    '&:hover': {
                                      bgcolor: alpha('#1976d2', 0.2),
                                    },
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {userPermissions.canUpdateStatus && (
                                <Tooltip title="Update Status">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleUpdateStatus(lead)}
                                    sx={{
                                      bgcolor: alpha(PRIMARY, 0.1),
                                      color: PRIMARY,
                                      '&:hover': {
                                        bgcolor: alpha(PRIMARY, 0.2),
                                      },
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {paginatedData.length > 0 && (
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
                  Showing {Math.min(page * rowsPerPage + 1, filteredData.length)} to{" "}
                  {Math.min((page + 1) * rowsPerPage, filteredData.length)} of{" "}
                  {filteredData.length} entries
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(event, value) => setPage(value - 1)}
                  color="primary"
                  showFirstButton
                  showLastButton
                  siblingCount={1}
                  boundaryCount={1}
                  size={isMobile ? "small" : "medium"}
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
          {installationData.summary.totalInstallations} total installations
        </Typography>

        {/* Modals */}
        {selectedLead && (
          <>
            <ViewLeadModal
              open={viewModalOpen}
              onClose={() => {
                setViewModalOpen(false);
                setSelectedLead(null);
              }}
              lead={selectedLead}
              userRole={userRole}
              showSnackbar={showSnackbar}
            />

            <InstallationStatusUpdateModal
              open={statusUpdateModalOpen}
              onClose={() => {
                setStatusUpdateModalOpen(false);
                setSelectedLead(null);
              }}
              lead={selectedLead}
              onStatusUpdate={handleStatusUpdate}
              showSnackbar={showSnackbar}
              userRole={userRole}
            />
          </>
        )}

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
      </Box>
    </LocalizationProvider>
  );
}