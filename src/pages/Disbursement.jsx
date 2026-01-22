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
  Divider,
  LinearProgress,
  FormHelperText,
  Menu,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
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
  Verified,
  FileCopy,
  FolderOpen,
  PictureAsPdf,
  Image as ImageIcon,
  InsertDriveFile,
  Launch,
  PictureAsPdfOutlined,
  DescriptionOutlined,
  GetApp,
  AccountBalance,
  Badge as BadgeIcon,
  CloudUpload,
  Delete,
  CreditCard,
  CloudDownload,
  Add,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  Fullscreen,
  FullscreenExit,
  Person,
  CalendarToday,
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
  ArrowForward,
  ArrowBack,
  MoreVert,
  TrendingUp,
  Assignment,
  Business,
  HowToReg,
  LocalAtm,
  Build,
  Error as ErrorIcon,
  Check,
  Home,
  ReceiptLong,
  AttachFile,
  AccessTime,
  Security,
  SupervisorAccount,
  Groups,
  AdminPanelSettings,
  WorkspacePremium,
  AddPhotoAlternate,
  GppMaybe,
  Schedule,
  ThumbUp,
  ThumbDown,
  Money,
  AccountBalanceWallet,
  AttachMoney,
  CreditScore,
  TrendingFlat,
  Payment,
  CurrencyRupee,
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
import AlertTitle from "@mui/material/AlertTitle";

// ========== CONSTANTS & CONFIGURATION ==========
const PRIMARY = "#ff6d00";
const SECONDARY = "#1a237e";
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const DEFAULT_ITEMS_PER_PAGE = 10;
const ALLOWED_ROLES = ["Head_office", "ZSM", "ASM", "TEAM"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
];

// Disbursement Status Configuration
const DISBURSEMENT_STATUS_OPTIONS = ["pending", "completed", "cancelled"];

const DISBURSEMENT_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bg: "#fff3e0",
    color: "#f57c00",
    icon: <PendingActions sx={{ fontSize: 16 }} />,
    description: "Disbursement is pending",
  },
  completed: {
    label: "Completed",
    bg: "#e8f5e9",
    color: "#2e7d32",
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
    description: "Disbursement completed successfully",
  },
  cancelled: {
    label: "Cancelled",
    bg: "#ffebee",
    color: "#d32f2f",
    icon: <Cancel sx={{ fontSize: 16 }} />,
    description: "Disbursement cancelled",
  },
};

// Lead Status Configuration for Disbursement Page
const LEAD_STATUS_OPTIONS = [
  "Disbursement",
  "Installation Completion",
  "Missed Leads",
];

const LEAD_STATUS_CONFIG = {
  Disbursement: {
    bg: "#fff3e0",
    color: "#f57c00",
    icon: <Payment sx={{ fontSize: 16 }} />,
    description: "Loan disbursement in progress",
  },
  "Installation Completion": {
    bg: "#e8f5e9",
    color: "#2e7d32",
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
    description: "Installation completed",
  },
  "Missed Leads": {
    bg: "#ffebee",
    color: "#c62828",
    icon: <Cancel sx={{ fontSize: 16 }} />,
    description: "Lead lost or not converted",
  },
};

// Bank List
const BANK_LIST = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Bank of India",
  "IndusInd Bank",
  "Kotak Mahindra Bank",
  "Yes Bank",
  "IDFC First Bank",
  "Federal Bank",
  "Other",
];

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
  canEdit: ["Head_office", "ZSM", "ASM"].includes(userRole),
  canDelete: userRole === "Head_office",
  canManage: ["Head_office", "ZSM", "ASM"].includes(userRole),
  canSeeAll: ["Head_office", "ZSM", "ASM"].includes(userRole),
  canSeeOwn: userRole === "TEAM",
  canUpdateStatus: ["Head_office", "ZSM", "ASM"].includes(userRole),
});

const getDisbursementStatusColor = (status) => {
  if (!status) return DISBURSEMENT_STATUS_CONFIG.pending;
  const normalizedStatus = status.toLowerCase();
  return (
    DISBURSEMENT_STATUS_CONFIG[normalizedStatus] || {
      label: status || "Unknown",
      bg: "#f5f5f5",
      color: "#757575",
      icon: <Warning sx={{ fontSize: 16 }} />,
      description: "Status unknown",
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

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "₹0";
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return "₹0";

  if (numAmount >= 10000000) {
    return `₹${(numAmount / 10000000).toFixed(1)}Cr`;
  }
  if (numAmount >= 100000) {
    return `₹${(numAmount / 100000).toFixed(1)}L`;
  }
  if (numAmount >= 1000) {
    return `₹${(numAmount / 1000).toFixed(1)}K`;
  }
  return `₹${Math.round(numAmount).toLocaleString("en-IN")}`;
};

const validateRequiredField = (value, fieldName) => {
  if (!value?.toString().trim()) return `${fieldName} is required`;
  return "";
};

const validateNumericField = (value, fieldName) => {
  if (!value?.toString().trim()) return `${fieldName} is required`;
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return `${fieldName} must be a valid number`;
  if (numValue <= 0) return `${fieldName} must be greater than 0`;
  return "";
};

const validateFile = (file) => {
  if (!file) return "";
  if (file.size > MAX_FILE_SIZE) return "File size should be less than 5MB";
  if (!ALLOWED_FILE_TYPES.includes(file.type))
    return "Only JPG, PNG and PDF files are allowed";
  return "";
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

// Image Viewer Modal Component
const ImageViewerModal = React.memo(({ open, onClose, imageUrl, title }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const handleZoomIn = useCallback(
    () => setZoom((prev) => Math.min(prev + 0.25, 3)),
    []
  );
  const handleZoomOut = useCallback(
    () => setZoom((prev) => Math.max(prev - 0.25, 0.5)),
    []
  );
  const handleRotateRight = useCallback(
    () => setRotation((prev) => (prev + 90) % 360),
    []
  );
  const handleRotateLeft = useCallback(
    () => setRotation((prev) => (prev - 90) % 360),
    []
  );
  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const isImage = useMemo(
    () => imageUrl && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(imageUrl),
    [imageUrl]
  );

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `document_${Date.now()}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={fullscreen ? false : "lg"}
      fullWidth
      fullScreen={fullscreen}
      PaperProps={fullscreen ? { style: { margin: 0, height: "100vh" } } : {}}
    >
      <DialogTitle
        sx={{
          bgcolor: alpha(PRIMARY, 0.05),
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pr: 2,
          py: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {title || "Document Viewer"}
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton onClick={() => setFullscreen(!fullscreen)} size="small">
              {fullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton onClick={handleDownload} size="small">
              <GetApp />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: fullscreen ? "#000" : "transparent",
          minHeight: fullscreen ? "calc(100vh - 64px)" : 400,
        }}
      >
        {isImage ? (
          <Box
            sx={{
              position: "relative",
              overflow: "auto",
              maxWidth: "100%",
              maxHeight: fullscreen ? "100vh" : "70vh",
              p: fullscreen ? 0 : 2,
            }}
          >
            <img
              src={imageUrl}
              alt="Document"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: "transform 0.3s ease",
                maxWidth: "100%",
                maxHeight: fullscreen ? "100vh" : "70vh",
                display: "block",
                margin: "0 auto",
              }}
            />
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <DescriptionOutlined
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Document Preview Not Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This file type cannot be previewed. Please download to view.
            </Typography>
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={handleDownload}
              sx={{ mt: 2 }}
            >
              Download Document
            </Button>
          </Box>
        )}
      </DialogContent>
      {isImage && (
        <DialogActions
          sx={{
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
            justifyContent: "center",
            gap: 1,
            py: 1.5,
          }}
        >
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotate Right">
            <IconButton onClick={handleRotateRight} size="small">
              <RotateRight />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotate Left">
            <IconButton onClick={handleRotateLeft} size="small">
              <RotateLeft />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset">
            <IconButton onClick={handleReset} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ ml: 2, color: "text.secondary" }}>
            {Math.round(zoom * 100)}% • {rotation}°
          </Typography>
        </DialogActions>
      )}
    </Dialog>
  );
});

ImageViewerModal.displayName = "ImageViewerModal";

// Document Card Component
const DocumentCard = React.memo(
  ({ title, url, icon, filename, onView, onDownload }) => {
    const handleView = useCallback(() => {
      if (onView) onView(url, title);
    }, [onView, url, title]);

    const handleDownload = useCallback(() => {
      if (onDownload) onDownload(url, filename);
    }, [onDownload, url, filename]);

    return (
      <Card
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          height: "100%",
          width: "350px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          {icon}
          <Typography variant="body2" fontWeight={600} noWrap>
            {title}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: "auto" }}>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<Visibility />}
            onClick={handleView}
          >
            View
          </Button>
          <Button
            fullWidth
            size="small"
            variant="contained"
            startIcon={<GetApp />}
            onClick={handleDownload}
            sx={{ bgcolor: PRIMARY }}
          >
            Download
          </Button>
        </Stack>
      </Card>
    );
  }
);

DocumentCard.displayName = "DocumentCard";

// Disbursement Status Update Modal - ONLY FOR Head_office, ZSM, ASM
const DisbursementStatusUpdateModal = React.memo(
  ({ open, onClose, lead, onStatusUpdate, showSnackbar, userRole }) => {
    const { fetchAPI, user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [loading, setLoading] = useState(false);
    const [selectedDisbursementStatus, setSelectedDisbursementStatus] = useState("");
    const [selectedLeadStatus, setSelectedLeadStatus] = useState("");
    const [disbursementAmount, setDisbursementAmount] = useState("");
    const [disbursementDate, setDisbursementDate] = useState(null);
    const [transactionId, setTransactionId] = useState("");
    const [notes, setNotes] = useState("");
    const [errors, setErrors] = useState({});

    const disbursementStatusConfig = useMemo(
      () => getDisbursementStatusColor(lead?.disbursementStatus),
      [lead?.disbursementStatus]
    );

    const leadStatusConfig = useMemo(
      () => getLeadStatusConfig(lead?.status),
      [lead?.status]
    );

    useEffect(() => {
      if (open && lead) {
        setSelectedDisbursementStatus(lead.disbursementStatus || "");
        setSelectedLeadStatus(lead.status || "Disbursement");
        setDisbursementAmount(lead.disbursementAmount?.toString() || "");
        setDisbursementDate(
          lead.disbursementDate ? parseISO(lead.disbursementDate) : null
        );
        setTransactionId(lead.disbursementTransactionId || "");
        setNotes(lead.disbursementNotes || "");
        setErrors({});
      }
    }, [open, lead]);

    const handleSubmit = useCallback(async () => {
      const errors = {};

      if (!selectedDisbursementStatus) {
        errors.disbursementStatus = "Please select disbursement status";
      }

      if (!selectedLeadStatus) {
        errors.leadStatus = "Please select lead status";
      }

      if (selectedDisbursementStatus === "completed") {
        if (!disbursementAmount.trim()) {
          errors.disbursementAmount = "Disbursement amount is required";
        } else {
          const numAmount = parseFloat(disbursementAmount);
          if (isNaN(numAmount)) {
            errors.disbursementAmount = "Please enter a valid amount";
          } else if (numAmount <= 0) {
            errors.disbursementAmount = "Amount must be greater than 0";
          }
        }

        if (!disbursementDate) {
          errors.disbursementDate = "Disbursement date is required";
        }
      }

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }

      if (
        selectedDisbursementStatus === lead?.disbursementStatus &&
        selectedLeadStatus === lead?.status
      ) {
        onClose();
        return;
      }

      setLoading(true);
      try {
        const updateData = {
          disbursementStatus: selectedDisbursementStatus,
          status: selectedLeadStatus,
          disbursementNotes: notes,
          updatedBy: user?._id,
          updatedByRole: user?.role,
          updatedAt: new Date().toISOString(),
        };

        if (selectedDisbursementStatus === "completed") {
          updateData.disbursementAmount = parseFloat(disbursementAmount);
          updateData.disbursementDate = format(disbursementDate, "yyyy-MM-dd");
        }

        const response = await fetchAPI(`/lead/updateLead/${lead._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (response.success) {
          showSnackbar("Disbursement status updated successfully", "success");
          onStatusUpdate(response.result);
          onClose();
        } else {
          throw new Error(response.message || "Failed to update status");
        }
      } catch (error) {
        console.error("Error updating disbursement status:", error);
        setErrors({ submit: error.message });
        showSnackbar(error.message || "Failed to update status", "error");
      } finally {
        setLoading(false);
      }
    }, [
      selectedDisbursementStatus,
      selectedLeadStatus,
      disbursementAmount,
      disbursementDate,
      transactionId,
      notes,
      lead,
      user,
      fetchAPI,
      showSnackbar,
      onStatusUpdate,
      onClose,
    ]);

    const handleClose = useCallback(() => {
      setSelectedDisbursementStatus("");
      setSelectedLeadStatus("");
      setDisbursementAmount("");
      setDisbursementDate(null);
      setTransactionId("");
      setNotes("");
      setErrors({});
      onClose();
    }, [onClose]);

    const availableDisbursementStatuses = useMemo(() => {
      return DISBURSEMENT_STATUS_OPTIONS;
    }, []);

    const getLeadStatusOptions = useMemo(() => {
      switch (selectedDisbursementStatus) {
        case "completed":
          return ["Installation Completion"];
        case "cancelled":
          return ["Missed Leads"];
        case "pending":
          return ["Disbursement"];
        default:
          return LEAD_STATUS_OPTIONS;
      }
    }, [selectedDisbursementStatus]);

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
                <Payment sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Update Disbursement Status
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
                Current Disbursement Status
              </Typography>
              <Chip
                label={disbursementStatusConfig.label}
                icon={disbursementStatusConfig.icon}
                sx={{
                  bgcolor: disbursementStatusConfig.bg,
                  color: disbursementStatusConfig.color,
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
                {disbursementStatusConfig.description}
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
                New Disbursement Status *
              </Typography>
              <FormControl fullWidth size="small" error={!!errors.disbursementStatus}>
                <Select
                  value={selectedDisbursementStatus}
                  onChange={(e) => {
                    setSelectedDisbursementStatus(e.target.value);
                    // Auto-set lead status based on disbursement status
                    switch (e.target.value) {
                      case "completed":
                        setSelectedLeadStatus("Installation Completion");
                        break;
                      case "cancelled":
                        setSelectedLeadStatus("Missed Leads");
                        break;
                      case "pending":
                        setSelectedLeadStatus("Disbursement");
                        break;
                      default:
                        setSelectedLeadStatus("Disbursement");
                    }
                  }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select disbursement status
                  </MenuItem>
                  {availableDisbursementStatuses.map((status) => {
                    const config = getDisbursementStatusColor(status);
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
                {errors.disbursementStatus && (
                  <FormHelperText>{errors.disbursementStatus}</FormHelperText>
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
                  disabled={!selectedDisbursementStatus}
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

            {selectedDisbursementStatus === "completed" && (
              <>
                <TextField
                  label="Disbursement Amount *"
                  value={disbursementAmount}
                  onChange={(e) => setDisbursementAmount(e.target.value)}
                  fullWidth
                  size="small"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupee />
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.disbursementAmount}
                  helperText={errors.disbursementAmount}
                  placeholder="Enter disbursement amount"
                />

                <DatePicker
                  label="Disbursement Date *"
                  value={disbursementDate}
                  onChange={(newValue) => setDisbursementDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!errors.disbursementDate,
                      helperText: errors.disbursementDate,
                    },
                  }}
                />
              </>
            )}

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Disbursement Notes
              </Typography>
              <TextField
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Add notes about this disbursement..."
                size="small"
              />
            </Box>

            {selectedDisbursementStatus && (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  {selectedDisbursementStatus === "completed"
                    ? "When completed, lead will move to Installation Completion stage."
                    : selectedDisbursementStatus === "cancelled"
                    ? "When cancelled, lead will move to Missed Leads stage."
                    : "When pending, lead will stay in Disbursement stage."}
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
              !selectedDisbursementStatus ||
              !selectedLeadStatus ||
              (selectedDisbursementStatus === lead?.disbursementStatus &&
                selectedLeadStatus === lead?.status)
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

DisbursementStatusUpdateModal.displayName = "DisbursementStatusUpdateModal";

// View Lead Modal with Tabs
const ViewLeadModal = React.memo(
  ({ open, onClose, lead, userRole, showSnackbar, handleViewDocument }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [activeTab, setActiveTab] = useState(0);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [leadDetails, setLeadDetails] = useState(null);

    const userRoleConfig = useMemo(() => getRoleConfig(userRole), [userRole]);

    useEffect(() => {
      if (open && lead?._id && !leadDetails) {
        setLoadingDetails(true);
        setTimeout(() => {
          setLeadDetails(lead);
          setLoadingDetails(false);
        }, 100);
      }
    }, [open, lead?._id]);

    const handleTabChange = (event, newValue) => {
      setActiveTab(newValue);
    };

    const handleDownload = (url, filename) => {
      if (!url) {
        showSnackbar("No document available to download", "error");
        return;
      }
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "document";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (!lead) return null;

    const displayData = leadDetails || lead;

    const tabs = [
      {
        label: "Disbursement",
        icon: <Payment />,
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
                      marginBottom: "20px",
                      color: PRIMARY,
                    }}
                  >
                    <Payment /> Disbursement Information
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
                        Disbursement Amount
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatCurrency(displayData.disbursementAmount)}
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
                        Disbursement Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(displayData.disbursementDate)}
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
                        Transaction ID
                      </Typography>
                      <Typography variant="body1">
                        {displayData.disbursementTransactionId || "Not specified"}
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
                        Bank
                      </Typography>
                      <Typography variant="body1">
                        {displayData.bank || "Not specified"}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: "none" }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      marginBottom: "20px",
                      color: PRIMARY,
                    }}
                  >
                    <GppMaybe /> Status Information
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
                        Disbursement Status
                      </Typography>
                      <Chip
                        label={getDisbursementStatusColor(displayData.disbursementStatus).label}
                        icon={getDisbursementStatusColor(displayData.disbursementStatus).icon}
                        size="small"
                        sx={{
                          bgcolor: getDisbursementStatusColor(displayData.disbursementStatus).bg,
                          color: getDisbursementStatusColor(displayData.disbursementStatus).color,
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
                        label={displayData.status || "Unknown"}
                        icon={getLeadStatusConfig(displayData.status).icon}
                        size="small"
                        sx={{
                          bgcolor: getLeadStatusConfig(displayData.status).bg,
                          color: getLeadStatusConfig(displayData.status).color,
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
                        {formatDate(displayData.updatedAt)}
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
                  marginBottom: "20px",
                  color: PRIMARY,
                }}
              >
                <Person /> Customer Information
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
                    {displayData.firstName} {displayData.lastName}
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
                    {displayData.email || "Not set"}
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
                    {displayData.phoneNumber || displayData.phone || "Not set"}
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
                    {displayData.address || "Not set"}
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
                    {displayData.city || "Not set"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ),
      },
      {
        label: "Notes",
        icon: <Note />,
        content: (
          <Card sx={{ boxShadow: "none", width: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Disbursement Notes
              </Typography>
              {displayData.disbursementNotes ? (
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Typography
                    variant="body1"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {displayData.disbursementNotes}
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Note sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Notes Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No notes have been added for this disbursement.
                  </Typography>
                </Box>
              )}
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
                {displayData.firstName?.[0] || "D"}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {displayData.firstName} {displayData.lastName}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Disbursement Details • {formatCurrency(displayData.disbursementAmount)}
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
export default function DisbursementPage() {
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
  const [disbursementData, setDisbursementData] = useState({
    leads: [],
    summary: {
      totalLeads: 0,
      pendingLeads: 0,
      completedLeads: 0,
      cancelledLeads: 0,
      totalDisbursementAmount: 0,
      avgDisbursementAmount: 0,
    },
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [disbursementStatusFilter, setDisbursementStatusFilter] = useState("All");
  const [leadStatusFilter, setLeadStatusFilter] = useState("All");
  const [bankFilter, setBankFilter] = useState("All");
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
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);

  // Snackbar Handler
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch Data
  const fetchDisbursementData = useCallback(async () => {
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

      // Add status filter to only get disbursement leads
      params.append("status", "Disbursement");

      // Try the specific endpoint first
      let response;
      try {
        response = await fetchAPI(
          `/lead/disbursementSummary?${params.toString()}`
        );

        if (response?.success) {
          const data = response.result || {};
          processLeadsData(data.disbursements || data || []);
          return;
        }
      } catch (endpointError) {
        console.log('Specific endpoint failed, trying alternative...');
      }

      // Fallback to generic endpoint
      response = await fetchAPI(`/lead/getLeads?${params.toString()}`);

      if (response?.success) {
        const allLeads = response.result || [];
        // Filter leads with status "Disbursement"
        const disbursementLeads = allLeads.filter(
          lead => lead.status === "Disbursement"
        );
        processLeadsData(disbursementLeads);
      } else {
        throw new Error(response?.message || "Failed to fetch disbursement data");
      }
    } catch (err) {
      console.error("Error fetching disbursement data:", err);
      setError(err.message || "Network error. Please try again.");
      showSnackbar(err.message || "Failed to fetch disbursement data", "error");
    } finally {
      setLoading(false);
    }
  }, [period, fetchAPI, showSnackbar]);

  // Helper function to process leads data
  const processLeadsData = useCallback((rawLeads) => {
    if (!Array.isArray(rawLeads)) {
      rawLeads = [];
    }
    
    // Filter by user role if TEAM - FIXED LOGIC
    let filteredLeads = [...rawLeads];
    
    if (userRole === "TEAM" && user?._id) {
      filteredLeads = rawLeads.filter(lead => {
        // Check if lead is assigned to this user or created by this user
        const isAssigned = 
          lead.assignedTo === user._id ||
          lead.assignedManager === user._id ||
          lead.assignedUser === user._id ||
          lead.assignedUser?._id === user._id ||
          lead.createdBy === user._id;
        
        return isAssigned;
      });
    }

    const totalLeads = filteredLeads.length;
    const pendingLeads = filteredLeads.filter(
      (lead) => lead.disbursementStatus?.toLowerCase() === "pending"
    ).length;
    const completedLeads = filteredLeads.filter(
      (lead) => lead.disbursementStatus?.toLowerCase() === "completed"
    ).length;
    const cancelledLeads = filteredLeads.filter(
      (lead) => lead.disbursementStatus?.toLowerCase() === "cancelled"
    ).length;
    const totalDisbursementAmount = filteredLeads.reduce(
      (sum, lead) => sum + (parseFloat(lead.disbursementAmount) || 0),
      0
    );
    const avgDisbursementAmount = totalLeads > 0 ? totalDisbursementAmount / totalLeads : 0;

    setDisbursementData({
      leads: filteredLeads,
      summary: {
        totalLeads,
        pendingLeads,
        completedLeads,
        cancelledLeads,
        totalDisbursementAmount,
        avgDisbursementAmount,
      },
    });
  }, [userRole, user?._id]);

  // Apply Filters
  const applyFilters = useCallback(() => {
    try {
      let filtered = [...disbursementData.leads];

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (lead) =>
            (lead.firstName?.toLowerCase() || "").includes(query) ||
            (lead.lastName?.toLowerCase() || "").includes(query) ||
            (lead.email?.toLowerCase() || "").includes(query) ||
            (lead.phoneNumber || lead.phone || "").includes(query) ||
            (lead.bank?.toLowerCase() || "").includes(query) ||
            (lead.disbursementTransactionId?.toLowerCase() || "").includes(query)
        );
      }

      // Disbursement Status filter
      if (disbursementStatusFilter !== "All") {
        filtered = filtered.filter(
          (lead) => lead.disbursementStatus === disbursementStatusFilter
        );
      }

      // Lead Status filter
      if (leadStatusFilter !== "All") {
        filtered = filtered.filter((lead) => lead.status === leadStatusFilter);
      }

      // Bank filter
      if (bankFilter !== "All") {
        filtered = filtered.filter((lead) => lead.bank === bankFilter);
      }

      // Date filter
      if (
        dateFilter.startDate &&
        isValid(dateFilter.startDate) &&
        dateFilter.endDate &&
        isValid(dateFilter.endDate)
      ) {
        const start = startOfDay(new Date(dateFilter.startDate));
        const end = endOfDay(new Date(dateFilter.endDate));

        filtered = filtered.filter((lead) => {
          try {
            const leadDate = lead.disbursementDate
              ? parseISO(lead.disbursementDate)
              : lead.createdAt
              ? parseISO(lead.createdAt)
              : null;
            if (!leadDate || !isValid(leadDate)) return false;
            return isWithinInterval(leadDate, { start, end });
          } catch {
            return false;
          }
        });
      }

      // Sorting
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          let aVal = a[sortConfig.key];
          let bVal = b[sortConfig.key];

          if (
            sortConfig.key === "disbursementDate" ||
            sortConfig.key === "createdAt"
          ) {
            aVal = aVal ? parseISO(aVal) : new Date(0);
            bVal = bVal ? parseISO(bVal) : new Date(0);
          } else if (sortConfig.key === "firstName") {
            aVal = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
            bVal = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
          } else if (sortConfig.key === "disbursementAmount") {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
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
      return disbursementData.leads;
    }
  }, [
    disbursementData.leads,
    searchQuery,
    disbursementStatusFilter,
    leadStatusFilter,
    bankFilter,
    dateFilter,
    sortConfig,
    showSnackbar,
  ]);

  // Effects
  useEffect(() => {
    if (hasAccess(userRole)) {
      fetchDisbursementData();
    }
  }, [fetchDisbursementData, userRole]);

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
    (lead) => {
      if (!lead?._id) {
        showSnackbar("Invalid lead data", "error");
        return;
      }
      setSelectedLead(lead);
      setViewModalOpen(true);
    },
    [showSnackbar]
  );

  const handleStatusUpdateClick = useCallback(
    (lead) => {
      if (!lead?._id) {
        showSnackbar("Invalid lead data", "error");
        return;
      }
      if (!userPermissions.canUpdateStatus) {
        showSnackbar(
          "You don't have permission to update disbursement status",
          "error"
        );
        return;
      }
      setSelectedLead(lead);
      setStatusUpdateModalOpen(true);
    },
    [userPermissions, showSnackbar]
  );

  const handleStatusUpdate = useCallback(
    async (updatedLead) => {
      try {
        await fetchDisbursementData();
        showSnackbar("Disbursement status updated successfully", "success");
      } catch (err) {
        console.error("Error after status update:", err);
        showSnackbar("Failed to refresh data", "error");
      }
    },
    [fetchDisbursementData, showSnackbar]
  );

  const handleViewDocument = useCallback(
    (documentUrl, documentName = "Document") => {
      if (!documentUrl) {
        showSnackbar("No document available to view", "error");
        return;
      }
      setCurrentImageUrl(documentUrl);
      setImageViewerOpen(true);
    },
    [showSnackbar]
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setDisbursementStatusFilter("All");
    setLeadStatusFilter("All");
    setBankFilter("All");
    setDateFilter({ startDate: null, endDate: null });
    setDateFilterError("");
    setSortConfig({ key: null, direction: "asc" });
    setPage(0);
    if (showFilterPanel) setShowFilterPanel(false);
  }, [showFilterPanel]);

  // Memoized Computed Values
  const filteredLeads = useMemo(() => applyFilters(), [applyFilters]);

  const paginatedLeads = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, page, rowsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredLeads.length / rowsPerPage),
    [filteredLeads.length, rowsPerPage]
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Disbursements",
        value: disbursementData.summary.totalLeads,
        color: PRIMARY,
        icon: <Payment />,
        subText: "All disbursement leads",
      },
      {
        label: "Pending",
        value: disbursementData.summary.pendingLeads,
        color: "#ef6c00",
        icon: <PendingActions />,
        subText: "Pending disbursement",
      },
      {
        label: "Completed",
        value: disbursementData.summary.completedLeads,
        color: "#2e7d32",
        icon: <CheckCircle />,
        subText: "Disbursement completed",
      },
      {
        label: "Cancelled",
        value: disbursementData.summary.cancelledLeads,
        color: "#d32f2f",
        icon: <Cancel />,
        subText: "Disbursement cancelled",
      },
    ],
    [disbursementData.summary]
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

  if (loading && disbursementData.leads.length === 0) {
    return <LoadingSkeleton />;
  }

  if (error && disbursementData.leads.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchDisbursementData}>
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
      <ImageViewerModal
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        imageUrl={currentImageUrl}
        title="Document Preview"
      />

      <ViewLeadModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        lead={selectedLead}
        userRole={userRole}
        showSnackbar={showSnackbar}
        handleViewDocument={handleViewDocument}
      />

      <DisbursementStatusUpdateModal
        open={statusUpdateModalOpen}
        onClose={() => setStatusUpdateModalOpen(false)}
        lead={selectedLead}
        onStatusUpdate={handleStatusUpdate}
        showSnackbar={showSnackbar}
        userRole={userRole}
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
              Disbursement Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage all loan disbursements and their status
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchDisbursementData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Chip
              label={getRoleConfig(userRole).label}
              icon={getRoleConfig(userRole).icon}
              size="medium"
              sx={{
                bgcolor: `${getRoleConfig(userRole).color}15`,
                color: getRoleConfig(userRole).color,
                fontWeight: 600,
              }}
            />
          </Box>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "visible",
                  position: "relative",
                  width:"277px",
                  border: `1px solid ${alpha(card.color, 0.1)}`,
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
                        variant="h6"
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
                    placeholder="Search by name, email, phone, transaction ID..."
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
                    <InputLabel>Disbursement Status</InputLabel>
                    <Select
                      value={disbursementStatusFilter}
                      label="Disbursement Status"
                      onChange={(e) => setDisbursementStatusFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Status</MenuItem>
                      {DISBURSEMENT_STATUS_OPTIONS.map((status) => {
                        const config = getDisbursementStatusColor(status);
                        return (
                          <MenuItem key={status} value={status}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              {config.icon}
                              <Typography variant="body2">{config.label}</Typography>
                            </Stack>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    startIcon={<Tune />}
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    size="small"
                  >
                    {showFilterPanel ? 'Hide Filters' : 'More Filters'}
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Clear />}
                    onClick={handleClearFilters}
                    size="small"
                    disabled={
                      !searchQuery &&
                      disbursementStatusFilter === 'All' &&
                      leadStatusFilter === 'All' &&
                      bankFilter === 'All' &&
                      !dateFilter.startDate &&
                      !dateFilter.endDate
                    }
                  >
                    Clear
                  </Button>
                </Stack>
              </Stack>

              {/* Expanded Filter Panel */}
              {showFilterPanel && (
                <Box
                  sx={{
                    p: 3,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Advanced Filters
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Lead Status</InputLabel>
                        <Select
                          value={leadStatusFilter}
                          label="Lead Status"
                          onChange={(e) => setLeadStatusFilter(e.target.value)}
                        >
                          <MenuItem value="All">All Status</MenuItem>
                          {LEAD_STATUS_OPTIONS.map((status) => {
                            const config = getLeadStatusConfig(status);
                            return (
                              <MenuItem key={status} value={status}>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  {config.icon}
                                  <Typography variant="body2">{status}</Typography>
                                </Stack>
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Bank</InputLabel>
                        <Select
                          value={bankFilter}
                          label="Bank"
                          onChange={(e) => setBankFilter(e.target.value)}
                        >
                          <MenuItem value="All">All Banks</MenuItem>
                          {BANK_LIST.map((bank) => (
                            <MenuItem key={bank} value={bank}>
                              {bank}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <DatePicker
                        label="From Date"
                        value={dateFilter.startDate}
                        onChange={(date) => setDateFilter(prev => ({ ...prev, startDate: date }))}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            error: !!dateFilterError,
                            helperText: dateFilterError || ' ',
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <DatePicker
                        label="To Date"
                        value={dateFilter.endDate}
                        onChange={(date) => setDateFilter(prev => ({ ...prev, endDate: date }))}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            error: !!dateFilterError,
                            helperText: dateFilterError || ' ',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <TableContainer>
              <Table>
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
                        onClick={() => handleSort('disbursementAmount')}
                        startIcon={
                          sortConfig.key === 'disbursementAmount' ? (
                            sortConfig.direction === 'asc' ? <ArrowUpward /> : <ArrowDownward />
                          ) : null
                        }
                        sx={{
                          justifyContent: 'flex-start',
                          fontWeight: 600,
                          textTransform: 'none',
                          color: 'text.primary',
                        }}
                      >
                        Amount
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Disbursement Status
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Lead Status
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => handleSort('disbursementDate')}
                        startIcon={
                          sortConfig.key === 'disbursementDate' ? (
                            sortConfig.direction === 'asc' ? <ArrowUpward /> : <ArrowDownward />
                          ) : null
                        }
                        sx={{
                          justifyContent: 'flex-start',
                          fontWeight: 600,
                          textTransform: 'none',
                          color: 'text.primary',
                        }}
                      >
                        Disbursement Date
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight={600}>
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 7 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton variant="text" height={40} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : paginatedLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Payment
                            sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
                          />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Disbursement Leads Found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {filteredLeads.length === 0
                              ? 'No disbursement leads in the system'
                              : 'No leads match the current filters'}
                          </Typography>
                          {filteredLeads.length === 0 && userPermissions.canManage && (
                            <Button
                              variant="contained"
                              sx={{ mt: 2 }}
                              onClick={() => navigate('/leads/create')}
                            >
                              Create New Lead
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedLeads.map((lead) => {
                      const disbursementStatusConfig = getDisbursementStatusColor(lead.disbursementStatus);
                      const leadStatusConfig = getLeadStatusConfig(lead.status);

                      return (
                        <TableRow
                          key={lead._id}
                          hover
                          sx={{
                            '&:hover': { bgcolor: alpha(PRIMARY, 0.02) },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  bgcolor: alpha(PRIMARY, 0.1),
                                  color: PRIMARY,
                                  fontWeight: 600,
                                }}
                              >
                                {lead.firstName?.[0] || 'C'}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight={600}>
                                  {lead.firstName} {lead.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {lead.phoneNumber || lead.phone || 'No phone'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body1" fontWeight={600} color="#2e7d32">
                              {formatCurrency(lead.disbursementAmount)}
                            </Typography>
                            {lead.disbursementTransactionId && (
                              <Typography variant="caption" color="text.secondary">
                                Txn: {lead.disbursementTransactionId}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={disbursementStatusConfig.label}
                              icon={disbursementStatusConfig.icon}
                              size="small"
                              sx={{
                                bgcolor: disbursementStatusConfig.bg,
                                color: disbursementStatusConfig.color,
                                fontWeight: 600,
                                minWidth: 100,
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={lead.status}
                              icon={leadStatusConfig.icon}
                              size="small"
                              sx={{
                                bgcolor: leadStatusConfig.bg,
                                color: leadStatusConfig.color,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {formatDate(lead.disbursementDate, 'dd MMM yyyy')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(lead.disbursementDate, 'hh:mm a')}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewClick(lead)}
                                  sx={{ color: PRIMARY }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {userPermissions.canUpdateStatus && (
                                <Tooltip title="Update Disbursement Status">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStatusUpdateClick(lead)}
                                    sx={{ color: '#1976d2' }}
                                  >
                                    <TrendingUp fontSize="small" />
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
          </Box>

          {/* Pagination */}
          {paginatedLeads.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {page * rowsPerPage + 1} to{' '}
                  {Math.min((page + 1) * rowsPerPage, filteredLeads.length)} of{' '}
                  {filteredLeads.length} leads
                </Typography>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  >
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option} per page
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(e, newPage) => setPage(newPage - 1)}
                color="primary"
                showFirstButton
                showLastButton
                siblingCount={1}
                boundaryCount={1}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </Card>

        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <CircularProgress sx={{ color: PRIMARY }} />
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}