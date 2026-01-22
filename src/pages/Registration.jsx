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
  SolarPower,
  Speed,
  BuildCircle,
  Power,
  Storage,
  EnergySavingsLeaf,
  VerifiedUser,
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
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for registration documents
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

// Registration Status Configuration
const REGISTRATION_STATUS_OPTIONS = [
  "pending",
  "completed",
  "in_progress",
  "rejected",
  "approved",
];

const REGISTRATION_STATUS_CONFIG = {
  pending: {
    bg: "#fff3e0",
    color: "#ef6c00",
    icon: <PendingActions sx={{ fontSize: 16 }} />,
    label: "Pending",
    description: "Registration is pending review",
  },
  completed: {
    bg: "#e8f5e9",
    color: "#2e7d32",
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
    label: "Completed",
    description: "Registration completed successfully",
  },
};

// Lead Status Configuration for Registration Page
const LEAD_STATUS_OPTIONS = ["Registration", "Bank Loan Apply", "Missed Leads"];

const LEAD_STATUS_CONFIG = {
  Registration: {
    bg: "#e3f2fd",
    color: "#1976d2",
    icon: <HowToReg sx={{ fontSize: 16 }} />,
    description: "Customer registration process",
  },
  "Bank Loan Apply": {
    bg: "#e8f5e9",
    color: "#2e7d32",
    icon: <AccountBalance sx={{ fontSize: 16 }} />,
    description: "Bank loan application stage",
  },
  "Missed Leads": {
    bg: "#ffebee",
    color: "#d32f2f",
    icon: <Cancel sx={{ fontSize: 16 }} />,
    description: "Lead was not converted",
  },
};

// Solar Requirement Types
const SOLAR_REQUIREMENT_TYPES = [
  "Residential (1-5 kW)",
  "Commercial (5-50 kW)",
  "Industrial (50+ kW)",
  "Agricultural",
  "Government/Institutional",
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
  canEdit: true,
  canDelete: userRole === "Head_office",
  canManage: ["Head_office", "ZSM", "ASM"].includes(userRole),
  canSeeAll: ["Head_office", "ZSM", "ASM"].includes(userRole),
  canSeeOwn: userRole === "TEAM",
  canUpdateStatus: ["Head_office", "ZSM", "ASM"].includes(userRole),
  canUploadDocs: ["Head_office", "ZSM", "ASM", "TEAM"].includes(userRole),
});

const getRegistrationStatusColor = (status) => {
  const normalizedStatus = status?.toLowerCase();
  return (
    REGISTRATION_STATUS_CONFIG[normalizedStatus] || {
      bg: "#f5f5f5",
      color: "#757575",
    }
  );
};

const getLeadStatusConfig = (status) => {
  return (
    LEAD_STATUS_CONFIG[status] || {
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

const validateRequiredField = (value, fieldName) => {
  if (!value?.toString().trim()) return `${fieldName} is required`;
  return "";
};

const validatePincode = (pincode) => {
  if (!pincode?.toString().trim()) return "Pincode is required";
  if (!/^\d{6}$/.test(pincode.toString().trim()))
    return "Pincode must be 6 digits";
  return "";
};

const validateFile = (file) => {
  if (!file) return "";
  if (file.size > MAX_FILE_SIZE) return "File size should be less than 10MB";
  if (!ALLOWED_FILE_TYPES.includes(file.type))
    return "Only PDF, DOC, DOCX, JPG, PNG files are allowed";
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

// File Upload Field Component
const FileUploadField = React.memo(
  ({
    label,
    field,
    value,
    onFileChange,
    onRemove,
    validationErrors,
    handleViewDocument,
  }) => {
    const fileInputRef = useRef(null);

    const handleBoxClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleFileSelect = useCallback(
      (event) => {
        onFileChange(field, event);
      },
      [field, onFileChange]
    );

    const handleViewClick = useCallback(() => {
      if (value.url) {
        handleViewDocument(value.url, label);
      }
    }, [value.url, label, handleViewDocument]);

    const handleRemoveClick = useCallback(() => {
      onRemove(field);
    }, [field, onRemove]);

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          {label}
        </Typography>
        {value.preview || value.url ? (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                border: "1px dashed #ccc",
                borderRadius: 2,
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "#f9f9f9",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                {value.preview ? (
                  <ImageIcon sx={{ color: "#1976d2" }} />
                ) : (
                  <DescriptionOutlined sx={{ color: "#1976d2" }} />
                )}
                <Box>
                  <Typography variant="body2" noWrap>
                    {value.file?.name || "Existing Document"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {value.file
                      ? formatFileSize(value.file.size)
                      : "Click to upload new file"}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1}>
                {value.url && (
                  <Tooltip title="View Document">
                    <IconButton size="small" onClick={handleViewClick}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Remove File">
                  <IconButton
                    size="small"
                    onClick={handleRemoveClick}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
            {validationErrors[field] && (
              <FormHelperText error>{validationErrors[field]}</FormHelperText>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              border: "2px dashed #ccc",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              bgcolor: "#f9f9f9",
              cursor: "pointer",
              "&:hover": {
                borderColor: PRIMARY,
                bgcolor: alpha(PRIMARY, 0.05),
              },
            }}
            onClick={handleBoxClick}
          >
            <CloudUpload sx={{ fontSize: 48, color: "#ccc", mb: 1 }} />
            <Typography color="text.secondary">
              Click to upload {label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </Typography>
          </Box>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
      </Box>
    );
  }
);

FileUploadField.displayName = "FileUploadField";

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


// View Registration Modal with Tabs
const ViewRegistrationModal = React.memo(
  ({ open, onClose, registration, userRole, showSnackbar, handleViewDocument }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [activeTab, setActiveTab] = useState(0);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [registrationDetails, setRegistrationDetails] = useState(null);

    const userRoleConfig = useMemo(() => getRoleConfig(userRole), [userRole]);

    useEffect(() => {
      if (open && registration?._id && !registrationDetails) {
        fetchRegistrationDetails();
      }
    }, [open, registration?._id]);

    const fetchRegistrationDetails = async () => {
      if (!registration?._id) return;

      setLoadingDetails(true);
      try {
        setRegistrationDetails(registration);
      } catch (error) {
        console.error("Error fetching registration details:", error);
        showSnackbar("Failed to load registration details", "error");
      } finally {
        setLoadingDetails(false);
      }
    };

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

    if (!registration) return null;

    const displayData = registrationDetails || registration;

    const tabs = [
      {
        label: "Basic Info",
        icon: <Person />,
        content: (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow:"none", height: "100%" , width:"400px" }}>
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
                  <Stack spacing={2.5}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        pb: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
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
                        pb: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
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
                        pb: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {displayData.phone || "Not set"}
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
                        Customer Since
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(displayData.createdAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow:"none", height: "100%" , width:"380px" }}>
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
                    <SolarPower /> Solar Information
                  </Typography>
                  <Stack spacing={2.5}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        pb: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Solar Requirement
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {displayData.solarRequirement || "Not specified"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:"space-between",
                        pb: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Registration Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(displayData.dateOfRegistration)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:"space-between",
                        pb: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Registration Status
                      </Typography>
                      <Chip
                        label={
                          getRegistrationStatusColor(
                            displayData.registrationStatus
                          ).label
                        }
                        icon={
                          getRegistrationStatusColor(
                            displayData.registrationStatus
                          ).icon
                        }
                        size="small"
                        sx={{
                          bgcolor: getRegistrationStatusColor(
                            displayData.registrationStatus
                          ).bg,
                          color: getRegistrationStatusColor(
                            displayData.registrationStatus
                          ).color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:"space-between",
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
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ boxShadow:"none", width:"250px" }}>
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
                    <LocationOn /> Address Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            gutterBottom
                          >
                            Address
                          </Typography>
                          <Typography variant="body1">
                            {displayData.address || "Not provided"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            gutterBottom
                          >
                            City
                          </Typography>
                          <Typography variant="body1">
                            {displayData.city || "Not provided"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            gutterBottom
                          >
                            Pincode
                          </Typography>
                          <Typography variant="body1">
                            {displayData.pincode || "Not provided"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            gutterBottom
                          >
                            State
                          </Typography>
                          <Typography variant="body1">
                            {displayData.state || "Not provided"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ),
      },
      {
        label: "Documents",
        icon: <FolderOpen />,
        content: (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Uploaded Documents
            </Typography>
            <Grid container spacing={2} sx={{boxShadow:"none"}}>
              {displayData.uploadDocument?.url && (
                <Grid item xs={12} sm={6} md={4} sx={{ width :"300px"}}>
                  <DocumentCard
                    title="Registration Document"
                    url={displayData.uploadDocument.url}
                    icon={<Description sx={{ color: PRIMARY }} />}
                    filename="registration-document"
                    onView={handleViewDocument}
                    onDownload={handleDownload}
                  />
                </Grid>
              )}
              {displayData.aadhaar?.url && (
                <Grid item xs={12} sm={6} md={4} sx={{ width :"300px"}}>
                  <DocumentCard
                    title="Aadhaar Card"
                    url={displayData.aadhaar.url}
                    icon={<BadgeIcon sx={{ color: "#f57c00" }} />}
                    filename="aadhaar-card"
                    onView={handleViewDocument}
                    onDownload={handleDownload}
                  />
                </Grid>
              )}
              {displayData.panCard?.url && (
                <Grid item xs={12} sm={6} md={4} sx={{ width :"300px"}}>
                  <DocumentCard
                    title="PAN Card"
                    url={displayData.panCard.url}
                    icon={<CreditCard sx={{ color: "#1976d2" }} />}
                    filename="pan-card"
                    onView={handleViewDocument}
                    onDownload={handleDownload}
                  />
                </Grid>
              )}
              {displayData.passbook?.url && (
                <Grid item xs={12} sm={6} md={4} sx={{ width :"300px"}}>
                  <DocumentCard
                    title="Bank Passbook"
                    url={displayData.passbook.url}
                    icon={<ReceiptLong sx={{ color: "#388e3c" }} />}
                    filename="passbook"
                    onView={handleViewDocument}
                    onDownload={handleDownload}
                  />
                </Grid>
              )}
              {displayData.otherDocuments?.map((doc, index) => (
                <Grid item xs={12} sm={6} md={4} key={index} sx={{ width :"300px"}}>
                  <DocumentCard
                    title={doc.name || `Document ${index + 1}`}
                    url={doc.url}
                    icon={<InsertDriveFile sx={{ color: "#9c27b0" }} />}
                    filename={doc.name}
                    onView={handleViewDocument}
                    onDownload={handleDownload}
                  />
                </Grid>
              ))}
            </Grid>
            {!displayData.uploadDocument?.url &&
              !displayData.aadhaar?.url &&
              !displayData.panCard?.url &&
              !displayData.passbook?.url &&
              (!displayData.otherDocuments ||
                displayData.otherDocuments.length === 0) && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <FolderOpen
                    sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Documents Uploaded
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No documents have been uploaded for this registration yet.
                  </Typography>
                </Box>
              )}
          </Box>
        ),
      },
      {
        label: "Notes",
        icon: <Note />,
        content: (
          <Card sx={{ boxShadow:"none" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Registration Notes
              </Typography>
              {displayData.registrationNotes ? (
                <Paper
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Typography
                    variant="body1"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {displayData.registrationNotes}
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Note sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Notes Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No notes have been added for this registration.
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
                {displayData.firstName?.[0] || "R"}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {displayData.firstName} {displayData.lastName}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Registration Details • Complete Information
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

ViewRegistrationModal.displayName = "ViewRegistrationModal";

// Edit Registration Modal
const EditRegistrationModal = React.memo(
  ({ open, onClose, registration, onSave, userRole, showSnackbar }) => {
    const { fetchAPI } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
      address: "",
      city: "",
      pincode: "",
      solarRequirement: "",
      dateOfRegistration: null,
      registrationStatus: "pending",
      registrationNotes: "",
      status: "Registration",
    });
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
      if (open && registration) {
        setFormData({
          address: registration.address || "",
          city: registration.city || "",
          pincode: registration.pincode || "",
          solarRequirement: registration.solarRequirement || "",
          dateOfRegistration: registration.dateOfRegistration
            ? parseISO(registration.dateOfRegistration)
            : registration.createdAt
            ? parseISO(registration.createdAt)
            : null,
          registrationStatus: registration.registrationStatus || "pending",
          registrationNotes: registration.registrationNotes || "",
          status: registration.status || "Registration",
        });
        setValidationErrors({});
      }
    }, [open, registration]);

    const validateForm = useCallback(() => {
      const errors = {
        address: validateRequiredField(formData.address, "Address"),
        city: validateRequiredField(formData.city, "City"),
        pincode: validatePincode(formData.pincode),
        solarRequirement: validateRequiredField(
          formData.solarRequirement,
          "Solar requirement"
        ),
      };

      setValidationErrors(errors);
      return Object.values(errors).every((error) => error === "");
    }, [formData]);

    const handleSubmit = useCallback(async () => {
      if (!validateForm()) {
        showSnackbar("Please fix the errors in the form", "error");
        return;
      }

      setLoading(true);
      try {
        const payload = {
          address: formData.address.trim(),
          city: formData.city.trim(),
          pincode: formData.pincode.trim(),
          solarRequirement: formData.solarRequirement.trim(),
          registrationStatus: formData.registrationStatus,
          registrationNotes: formData.registrationNotes.trim(),
          status: formData.status,
        };

        if (formData.dateOfRegistration) {
          payload.dateOfRegistration = format(
            formData.dateOfRegistration,
            "yyyy-MM-dd"
          );
        }

        const response = await fetchAPI(
          `/lead/updateLead/${registration._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (response?.success) {
          showSnackbar("Registration updated successfully", "success");
          onSave(response.result);
          onClose();
        } else {
          throw new Error(response?.message || "Failed to update registration");
        }
      } catch (error) {
        console.error("Error updating registration:", error);
        showSnackbar(error.message || "Failed to update registration", "error");
      } finally {
        setLoading(false);
      }
    }, [formData, validateForm, registration, fetchAPI, showSnackbar, onSave, onClose]);

    if (!registration) return null;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
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
                  justifyContent:"center",
                  color: PRIMARY,
                }}
              >
                <Edit sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Edit Registration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {registration.firstName} {registration.lastName}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="medium">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{width:"300px"}}>
                <TextField
                  label="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  error={!!validationErrors.address}
                  helperText={validationErrors.address}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{width:"300px"}}>
                <TextField
                  label="City"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  fullWidth
                  size="small"
                  error={!!validationErrors.city}
                  helperText={validationErrors.city}
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{width:"300px"}}>
                <TextField
                  label="Pincode"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pincode: e.target.value,
                    }))
                  }
                  fullWidth
                  size="small"
                  error={!!validationErrors.pincode}
                  helperText={validationErrors.pincode}
                  required
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{width:"300px"}}>
                <FormControl fullWidth size="small">
                  <InputLabel>Solar Requirement</InputLabel>
                  <Select
                    value={formData.solarRequirement}
                    label="Solar Requirement"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        solarRequirement: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="">
                      <em>Select requirement</em>
                    </MenuItem>
                    {SOLAR_REQUIREMENT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{width:"300px"}}>
                <DatePicker
                  label="Registration Date"
                  value={formData.dateOfRegistration}
                  onChange={(newValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      dateOfRegistration: newValue,
                    }))
                  }
                  slotProps={{
                    textField: { fullWidth: true, size: "small" },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{width:"300px"}}>
                <FormControl fullWidth size="small">
                  <InputLabel>Registration Status</InputLabel>
                  <Select
                    value={formData.registrationStatus}
                    label="Registration Status"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        registrationStatus: e.target.value,
                      }))
                    }
                  >
                    {REGISTRATION_STATUS_OPTIONS.map((status) => {
                      const config = getRegistrationStatusColor(status);
                      return (
                        <MenuItem key={status} value={status}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            {config.icon}
                            <span>{config.label}</span>
                          </Stack>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{width:"300px"}}>
                <FormControl fullWidth size="small">
                  <InputLabel>Lead Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Lead Status"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    {LEAD_STATUS_OPTIONS.map((status) => {
                      const config = getLeadStatusConfig(status);
                      return (
                        <MenuItem key={status} value={status}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            {config.icon}
                            <span>{status}</span>
                          </Stack>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Registration Notes"
              value={formData.registrationNotes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  registrationNotes: e.target.value,
                }))
              }
              fullWidth
              multiline
              rows={4}
              placeholder="Add any comments or notes about this registration..."
              variant="outlined"
            />
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
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{ bgcolor: PRIMARY, px: 4, "&:hover": { bgcolor: "#e65c00" } }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

EditRegistrationModal.displayName = "EditRegistrationModal";

// Document Upload Modal
const DocumentUploadModal = React.memo(
  ({ open, onClose, registration, onUpload, userRole, showSnackbar }) => {
    const { fetchAPI } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [documentFile, setDocumentFile] = useState(null);
    const [documentType, setDocumentType] = useState("registration");
    const [validationErrors, setValidationErrors] = useState({});

    const documentTypes = [
      { value: "registration", label: "Registration Document", icon: <Description /> },
      { value: "aadhaar", label: "Aadhaar Card", icon: <BadgeIcon /> },
      { value: "panCard", label: "PAN Card", icon: <CreditCard /> },
      { value: "passbook", label: "Bank Passbook", icon: <ReceiptLong /> },
      { value: "other", label: "Other Document", icon: <InsertDriveFile /> },
    ];

    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        const error = validateFile(file);
        if (error) {
          showSnackbar(error, "error");
          return;
        }
        setDocumentFile(file);
        setValidationErrors({});
      }
    };

    const handleRemoveFile = () => {
      setDocumentFile(null);
      setUploadProgress(0);
    };

    const handleSubmit = async () => {
      if (!documentFile) {
        setValidationErrors({ document: "Please select a file to upload" });
        return;
      }

      setLoading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append("document", documentFile);
        formData.append("documentType", documentType);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        const response = await fetchAPI(
          `/lead/registration/${registration._id}/document-upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (response?.success) {
          showSnackbar("Document uploaded successfully", "success");
          onUpload(response.result);
          onClose();
        } else {
          throw new Error(response?.message || "Failed to upload document");
        }
      } catch (error) {
        console.error("Error uploading document:", error);
        showSnackbar(error.message || "Failed to upload document", "error");
      } finally {
        setLoading(false);
        setUploadProgress(0);
        setDocumentFile(null);
      }
    };

    const handleClose = () => {
      setDocumentFile(null);
      setUploadProgress(0);
      setDocumentType("registration");
      setValidationErrors({});
      onClose();
    };

    if (!registration) return null;

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
                  justifyContent:"center",
                  color: PRIMARY,
                }}
              >
                <CloudUpload sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Upload Document
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {registration.firstName} {registration.lastName}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleClose} size="medium">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Document Type</InputLabel>
              <Select
                value={documentType}
                label="Document Type"
                onChange={(e) => setDocumentType(e.target.value)}
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {type.icon}
                      <span>{type.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              sx={{
                border: "2px dashed",
                borderColor: documentFile ? "success.main" : "divider",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                bgcolor: documentFile ? alpha("#4caf50", 0.05) : "transparent",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha(PRIMARY, 0.05),
                },
              }}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
              {documentFile ? (
                <Stack spacing={2} alignItems="center">
                  <Description sx={{ fontSize: 48, color: "success.main" }} />
                  <Typography variant="body1" fontWeight={500}>
                    {documentFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(documentFile.size)}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Delete />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    disabled={loading}
                  >
                    Remove File
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={2} alignItems="center">
                  <CloudUpload
                    sx={{ fontSize: 48, color: "text.secondary" }}
                  />
                  <Typography variant="body1">
                    Click to select a document
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </Typography>
                </Stack>
              )}
            </Box>

            {validationErrors.document && (
              <Alert severity="error" sx={{ mt: 1 }}>
                <Typography variant="body2">{validationErrors.document}</Typography>
              </Alert>
            )}

            {loading && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Uploading document... {uploadProgress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
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
            disabled={loading || !documentFile}
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
            sx={{ bgcolor: PRIMARY, px: 4, "&:hover": { bgcolor: "#e65c00" } }}
          >
            {loading ? "Uploading..." : "Upload Document"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

DocumentUploadModal.displayName = "DocumentUploadModal";

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
export default function RegistrationPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { fetchAPI, user, getUserRole } = useAuth();
  const userRole = getUserRole();
  const userPermissions = useMemo(
    () => getUserPermissions(userRole),
    [userRole]
  );

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
  const [registrationsData, setRegistrationsData] = useState({
    registrations: [],
    summary: {
      totalRegistrations: 0,
      pendingRegistrations: 0,
      completedRegistrations: 0,
      inProgressRegistrations: 0,
      approvedRegistrations: 0,
      rejectedRegistrations: 0,
    },
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState("All");
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [documentUploadModalOpen, setDocumentUploadModalOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedActionRegistration, setSelectedActionRegistration] = useState(null);

  // Snackbar Handler
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch Data
  const fetchRegistrationsData = useCallback(async () => {
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
        `/lead/registrationSummary?${params.toString()}`
      );

      if (response?.success) {
        const data = response.result || {};
        const rawRegistrations = data.registrations || [];

        let filteredRegs = rawRegistrations;
        if (userRole === "TEAM" && user?._id) {
          filteredRegs = rawRegistrations.filter(
            (reg) =>
              reg.assignedTo === user._id ||
              reg.assignedManager === user._id ||
              reg.assignedUser === user._id ||
              reg.assignedUser?._id === user._id ||
              reg.createdBy === user._id
          );
        }

        const totalRegistrations = filteredRegs.length;
        const pendingRegistrations = filteredRegs.filter(
          (reg) => reg.registrationStatus?.toLowerCase() === "pending"
        ).length;
        const completedRegistrations = filteredRegs.filter(
          (reg) => reg.registrationStatus?.toLowerCase() === "completed"
        ).length;
        const inProgressRegistrations = filteredRegs.filter(
          (reg) => reg.registrationStatus?.toLowerCase() === "in_progress"
        ).length;
        const approvedRegistrations = filteredRegs.filter(
          (reg) => reg.registrationStatus?.toLowerCase() === "approved"
        ).length;
        const rejectedRegistrations = filteredRegs.filter(
          (reg) => reg.registrationStatus?.toLowerCase() === "rejected"
        ).length;

        setRegistrationsData({
          registrations: filteredRegs,
          summary: {
            totalRegistrations,
            pendingRegistrations,
            completedRegistrations,
            inProgressRegistrations,
            approvedRegistrations,
            rejectedRegistrations,
          },
        });
      } else {
        throw new Error(response?.message || "Failed to fetch registrations data");
      }
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError(err.message || "Network error. Please try again.");
      showSnackbar(err.message || "Failed to fetch registrations data", "error");
    } finally {
      setLoading(false);
    }
  }, [period, fetchAPI, userRole, user, showSnackbar]);

  // Apply Filters
  const applyFilters = useCallback(() => {
    try {
      let filtered = [...registrationsData.registrations];

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (reg) =>
            (reg.firstName?.toLowerCase() || "").includes(query) ||
            (reg.lastName?.toLowerCase() || "").includes(query) ||
            (reg.email?.toLowerCase() || "").includes(query) ||
            (reg.phone || "").includes(query) ||
            (reg.address?.toLowerCase() || "").includes(query) ||
            (reg.city?.toLowerCase() || "").includes(query)
        );
      }

      // Registration Status filter
      if (registrationStatusFilter !== "All") {
        filtered = filtered.filter(
          (reg) => reg.registrationStatus === registrationStatusFilter
        );
      }

      // Lead Status filter
      if (leadStatusFilter !== "All") {
        filtered = filtered.filter((reg) => reg.status === leadStatusFilter);
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

        filtered = filtered.filter((reg) => {
          try {
            const regDate = reg.dateOfRegistration
              ? parseISO(reg.dateOfRegistration)
              : reg.createdAt
              ? parseISO(reg.createdAt)
              : null;
            if (!regDate || !isValid(regDate)) return false;
            return isWithinInterval(regDate, { start, end });
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
            sortConfig.key === "dateOfRegistration" ||
            sortConfig.key === "createdAt"
          ) {
            aVal = aVal ? parseISO(aVal) : new Date(0);
            bVal = bVal ? parseISO(bVal) : new Date(0);
          } else if (sortConfig.key === "firstName") {
            aVal = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
            bVal = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
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
      return registrationsData.registrations;
    }
  }, [
    registrationsData.registrations,
    searchQuery,
    registrationStatusFilter,
    leadStatusFilter,
    dateFilter,
    sortConfig,
    showSnackbar,
  ]);

  // Effects
  useEffect(() => {
    if (hasAccess(userRole)) {
      fetchRegistrationsData();
    }
  }, [fetchRegistrationsData, userRole]);

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
    (registration) => {
      if (!registration?._id) {
        showSnackbar("Invalid registration data", "error");
        return;
      }
      setSelectedRegistration(registration);
      setViewModalOpen(true);
    },
    [showSnackbar]
  );

  const handleEditClick = useCallback(
    (registration) => {
      if (!registration?._id) {
        showSnackbar("Invalid registration data", "error");
        return;
      }
      if (!userPermissions.canEdit) {
        showSnackbar(
          "You don't have permission to edit this registration",
          "error"
        );
        return;
      }
      setSelectedRegistration(registration);
      setEditModalOpen(true);
    },
    [userPermissions, showSnackbar]
  );

  const handleStatusUpdateClick = useCallback(
    (registration) => {
      if (!registration?._id) {
        showSnackbar("Invalid registration data", "error");
        return;
      }
      if (!userPermissions.canUpdateStatus) {
        showSnackbar(
          "You don't have permission to update registration status",
          "error"
        );
        return;
      }
      setSelectedRegistration(registration);
      setStatusUpdateModalOpen(true);
    },
    [userPermissions, showSnackbar]
  );

  const handleDocumentUploadClick = useCallback(
    (registration) => {
      if (!registration?._id) {
        showSnackbar("Invalid registration data", "error");
        return;
      }
      if (!userPermissions.canUploadDocs) {
        showSnackbar(
          "You don't have permission to upload documents",
          "error"
        );
        return;
      }
      setSelectedRegistration(registration);
      setDocumentUploadModalOpen(true);
    },
    [userPermissions, showSnackbar]
  );

  const handleStatusUpdate = useCallback(
    async (updatedRegistration) => {
      try {
        await fetchRegistrationsData();
        showSnackbar("Registration status updated successfully", "success");
      } catch (err) {
        console.error("Error after status update:", err);
        showSnackbar("Failed to refresh data", "error");
      }
    },
    [fetchRegistrationsData, showSnackbar]
  );

  const handleRegistrationUpdate = useCallback(
    async (updatedRegistration) => {
      try {
        await fetchRegistrationsData();
        showSnackbar("Registration updated successfully", "success");
      } catch (err) {
        console.error("Error after registration update:", err);
        showSnackbar("Failed to refresh data", "error");
      }
    },
    [fetchRegistrationsData, showSnackbar]
  );

  const handleDocumentUpload = useCallback(
    async (updatedRegistration) => {
      try {
        await fetchRegistrationsData();
        showSnackbar("Document uploaded successfully", "success");
      } catch (err) {
        console.error("Error after document upload:", err);
        showSnackbar("Failed to refresh data", "error");
      }
    },
    [fetchRegistrationsData, showSnackbar]
  );

  const handleActionMenuOpen = useCallback((event, registration) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedActionRegistration(registration);
  }, []);

  const handleActionMenuClose = useCallback(() => {
    setActionMenuAnchor(null);
    setSelectedActionRegistration(null);
  }, []);

  const handleActionSelect = useCallback(
    (action) => {
      if (!selectedActionRegistration) return;

      switch (action) {
        case "view":
          handleViewClick(selectedActionRegistration);
          break;
        case "edit":
          handleEditClick(selectedActionRegistration);
          break;
        case "update_status":
          handleStatusUpdateClick(selectedActionRegistration);
          break;
        case "upload_document":
          handleDocumentUploadClick(selectedActionRegistration);
          break;
        default:
          break;
      }

      handleActionMenuClose();
    },
    [
      selectedActionRegistration,
      handleViewClick,
      handleEditClick,
      handleStatusUpdateClick,
      handleDocumentUploadClick,
      handleActionMenuClose,
    ]
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
    setRegistrationStatusFilter("All");
    setLeadStatusFilter("All");
    setDateFilter({ startDate: null, endDate: null });
    setDateFilterError("");
    setSortConfig({ key: null, direction: "asc" });
    setPage(0);
    if (showFilterPanel) setShowFilterPanel(false);
  }, [showFilterPanel]);

  // Memoized Computed Values
  const filteredRegistrations = useMemo(() => applyFilters(), [applyFilters]);

  const paginatedRegistrations = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRegistrations.slice(start, start + rowsPerPage);
  }, [filteredRegistrations, page, rowsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredRegistrations.length / rowsPerPage),
    [filteredRegistrations.length, rowsPerPage]
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Registrations",
        value: registrationsData.summary.totalRegistrations,
        color: PRIMARY,
        icon: <HowToReg />,
        subText: "All registrations",
      },
      {
        label: "Pending",
        value: registrationsData.summary.pendingRegistrations,
        color: "#ef6c00",
        icon: <PendingActions />,
        subText: "Pending registrations",
      },
      {
        label: "Completed",
        value: registrationsData.summary.completedRegistrations,
        color: "#2e7d32",
        icon: <CheckCircle />,
        subText: "Completed registrations",
      },
    ],
    [registrationsData.summary]
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

  if (loading && registrationsData.registrations.length === 0) {
    return <LoadingSkeleton />;
  }

  if (error && registrationsData.registrations.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchRegistrationsData}>
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

      <ViewRegistrationModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        registration={selectedRegistration}
        userRole={userRole}
        showSnackbar={showSnackbar}
        handleViewDocument={handleViewDocument}
      />

      <EditRegistrationModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        registration={selectedRegistration}
        onSave={handleRegistrationUpdate}
        userRole={userRole}
        showSnackbar={showSnackbar}
      />

      <DocumentUploadModal
        open={documentUploadModalOpen}
        onClose={() => setDocumentUploadModalOpen(false)}
        registration={selectedRegistration}
        onUpload={handleDocumentUpload}
        userRole={userRole}
        showSnackbar={showSnackbar}
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

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={() => handleActionSelect("view")}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        {userPermissions.canEdit && (
          <MenuItem onClick={() => handleActionSelect("edit")}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            Edit
          </MenuItem>
        )}
        {userPermissions.canUpdateStatus && (
          <MenuItem onClick={() => handleActionSelect("update_status")}>
            <ListItemIcon>
              <TrendingUp fontSize="small" />
            </ListItemIcon>
            Update Status
          </MenuItem>
        )}
        {userPermissions.canUploadDocs && (
          <MenuItem onClick={() => handleActionSelect("upload_document")}>
            <ListItemIcon>
              <CloudUpload fontSize="small" />
            </ListItemIcon>
            Upload Document
          </MenuItem>
        )}
      </Menu>

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
              Registration Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage all customer registrations and solar installations
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchRegistrationsData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "visible",
                  position: "relative",
                  width:"376px",
                  border: `1px solid ${alpha(card.color, 0.1)}`,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
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
                    placeholder="Search by name, email, phone, address..."
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

                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Registration Status</InputLabel>
                    <Select
                      value={registrationStatusFilter}
                      label="Registration Status"
                      onChange={(e) => setRegistrationStatusFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Status</MenuItem>
                      {REGISTRATION_STATUS_OPTIONS.map((status) => {
                        const config = getRegistrationStatusColor(status);
                        return (
                          <MenuItem key={status} value={status}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              {config.icon}
                              <span>{config.label}</span>
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
                    <Grid item xs={12} md={4}>
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
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  {config.icon}
                                  <span>{status}</span>
                                </Stack>
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
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
                    <Grid item xs={12} md={4}>
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
                registrationStatusFilter !== "All" ||
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
                    {registrationStatusFilter !== "All" && (
                      <Chip
                        label={`Reg. Status: ${getRegistrationStatusColor(registrationStatusFilter).label}`}
                        size="small"
                        onDelete={() => setRegistrationStatusFilter("All")}
                      />
                    )}
                    {leadStatusFilter !== "All" && (
                      <Chip
                        label={`Lead Status: ${leadStatusFilter}`}
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
                Customer Registrations ({filteredRegistrations.length})
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
              {loading && registrationsData.registrations.length > 0 && (
                <LinearProgress
                  sx={{ position: "absolute", top: 0, left: 0, right: 0 }}
                />
              )}

              <Table stickyHeader size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Customer Details
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => handleSort("dateOfRegistration")}
                        startIcon={
                          sortConfig.key === "dateOfRegistration" ? (
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
                        Registration Date
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Solar Requirement
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Registration Status
                      </Typography>
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
                  {paginatedRegistrations.length > 0 ? (
                    paginatedRegistrations.map((registration) => {
                      const regStatusConfig = getRegistrationStatusColor(
                        registration.registrationStatus
                      );
                      const leadStatusConfig = getLeadStatusConfig(
                        registration.status
                      );

                      return (
                        <TableRow
                          key={registration._id}
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
                                {registration.firstName} {registration.lastName}
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
                                  {registration.email || "No email"}
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
                                  {registration.phone || "No phone"}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>

                          {/* Registration Date */}
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {formatDate(registration.dateOfRegistration)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(registration.createdAt, "dd MMM yyyy")}
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Solar Requirement */}
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <SolarPower fontSize="small" color="primary" />
                              <Typography variant="body2">
                                {registration.solarRequirement || "Not specified"}
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Registration Status */}
                          <TableCell>
                            <Tooltip
                              title={regStatusConfig.description}
                              arrow
                              placement="top"
                            >
                              <Chip
                                label={regStatusConfig.label}
                                icon={regStatusConfig.icon}
                                size="small"
                                sx={{
                                  bgcolor: regStatusConfig.bg,
                                  color: regStatusConfig.color,
                                  fontWeight: 600,
                                  minWidth: 100,
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>
                          </TableCell>

                          {/* Lead Status */}
                          <TableCell>
                            <Tooltip
                              title={leadStatusConfig.description}
                              arrow
                              placement="top"
                            >
                              <Chip
                                label={registration.status || "Unknown"}
                                icon={leadStatusConfig.icon}
                                size="small"
                                sx={{
                                  bgcolor: leadStatusConfig.bg,
                                  color: leadStatusConfig.color,
                                  fontWeight: 600,
                                  minWidth: 120,
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View Details" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewClick(registration)}
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

                              {userPermissions.canEdit && (
                                <Tooltip title="Edit" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditClick(registration)}
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
                              )}
                              
                              {userPermissions.canUploadDocs && (
                                <Tooltip title="Upload Document" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDocumentUploadClick(registration)
                                    }
                                    sx={{
                                      bgcolor: alpha("#9c27b0", 0.1),
                                      color: "#9c27b0",
                                      "&:hover": {
                                        bgcolor: alpha("#9c27b0", 0.2),
                                      },
                                    }}
                                  >
                                    <CloudUpload fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <HowToReg
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
                            No registrations found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchQuery ||
                            registrationStatusFilter !== "All" ||
                            leadStatusFilter !== "All" ||
                            dateFilter.startDate ||
                            dateFilter.endDate
                              ? "Try adjusting your filters"
                              : "No registrations have been submitted yet"}
                          </Typography>
                          {(searchQuery ||
                            registrationStatusFilter !== "All" ||
                            leadStatusFilter !== "All" ||
                            dateFilter.startDate ||
                            dateFilter.endDate) && (
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
            {filteredRegistrations.length > 0 && (
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
                  {Math.min(page * rowsPerPage + 1, filteredRegistrations.length)}{" "}
                  to{" "}
                  {Math.min((page + 1) * rowsPerPage, filteredRegistrations.length)}{" "}
                  of {filteredRegistrations.length} entries
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
          {registrationsData.summary.totalRegistrations} total registrations
        </Typography>
      </Box>
    </LocalizationProvider>
  );
}