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
  CurrencyRupee,
  AccountBalanceWallet,
  Send,
  HourglassEmpty,
  Block,
  AttachMoney,
  TrendingFlat,
  VerifiedUser,
  ThumbDown,
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

// Loan Status Configuration
const LOAN_STATUS_OPTIONS = ["pending", "submitted"];

const LOAN_STATUS_CONFIG = {
  pending: {
    bg: "#fff3e0",
    color: "#ef6c00",
    icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
    label: "Pending",
    description: "Loan application is pending submission",
  },
  submitted: {
    bg: "#e3f2fd",
    color: "#1976d2",
    icon: <Send sx={{ fontSize: 16 }} />,
    label: "Submitted",
    description: "Loan application submitted to bank",
  },
};

// Lead Status Configuration
const LEAD_STATUS_OPTIONS = ["Bank Loan Apply", "Document Submission", "Missed Leads"];

const LEAD_STATUS_CONFIG = {
  "Bank Loan Apply": {
    bg: "#e3f2fd",
    color: "#1976d2",
    icon: <AccountBalanceWallet sx={{ fontSize: 16 }} />,
    description: "Bank loan application in progress",
  },
  "Document Submission": {
    bg: "#fff3e0",
    color: "#f57c00",
    icon: <Description sx={{ fontSize: 16 }} />,
    description: "Documents submitted for verification",
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
});

const getLoanStatusColor = (status) => {
  const normalizedStatus = status?.toLowerCase();
  return (
    LOAN_STATUS_CONFIG[normalizedStatus] || {
      bg: "#f5f5f5",
      color: "#757575",
      label: "Unknown",
      icon: <Warning sx={{ fontSize: 16 }} />,
      description: "Status unknown",
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
  return `₹${numAmount.toLocaleString("en-IN")}`;
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
              Supports JPG, PNG, PDF (Max 5MB)
            </Typography>
          </Box>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
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
          width:"400px",
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


// View Loan Modal with Tabs
const ViewLoanModal = React.memo(
  ({ open, onClose, loan, userRole, showSnackbar, handleViewDocument }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [activeTab, setActiveTab] = useState(0);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loanDetails, setLoanDetails] = useState(null);

    const userRoleConfig = useMemo(() => getRoleConfig(userRole), [userRole]);

    useEffect(() => {
      if (open && loan?._id && !loanDetails) {
        fetchLoanDetails();
      }
    }, [open, loan?._id]);

    const fetchLoanDetails = async () => {
      if (!loan?._id) return;

      setLoadingDetails(true);
      try {
        setLoanDetails(loan);
      } catch (error) {
        console.error("Error fetching loan details:", error);
        showSnackbar("Failed to load loan details", "error");
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

    if (!loan) return null;

    const displayData = loanDetails || loan;

    const tabs = [
      {
        label: "Loan Info",
        icon: <AccountBalanceWallet />,
        content: (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow:"none", height: "100%", width:"450px"}}>
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
                    <AccountBalanceWallet /> Loan Information
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
                        Loan Amount
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatCurrency(displayData.loanAmount)}
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
                        Bank
                      </Typography>
                      <Typography variant="body1">
                        {displayData.bank || "Not specified"}
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
                        Branch Name
                      </Typography>
                      <Typography variant="body1">
                        {displayData.branchName || "Not specified"}
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
                        Loan Approval Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(displayData.loanApprovalDate)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow:"none", height: "100%", width:"450px" }}>
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
                        Solar Requirement
                      </Typography>
                      <Typography variant="body1">
                        {displayData.solarRequirement || "Not specified"}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ boxShadow:"none", height: "100%", width:"450px" }}>
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
                    <Description /> Status Information
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
                            Loan Status
                          </Typography>
                          <Chip
                            label={getLoanStatusColor(displayData.loanStatus).label}
                            icon={getLoanStatusColor(displayData.loanStatus).icon}
                            size="small"
                            sx={{
                              bgcolor: getLoanStatusColor(displayData.loanStatus).bg,
                              color: getLoanStatusColor(displayData.loanStatus).color,
                              fontWeight: 600,
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 1, display: "block" }}
                          >
                            {getLoanStatusColor(displayData.loanStatus).description}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            gutterBottom
                          >
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
                            Created Date
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(displayData.createdAt)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            gutterBottom
                          >
                            Last Updated
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(displayData.updatedAt)}
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
              Loan Documents
            </Typography>
            <Grid container spacing={2}>
              {displayData.loanDocument?.url && (
                <Grid item xs={12} sm={6} md={4}>
                  <DocumentCard
                    title="Loan Application"
                    url={displayData.loanDocument.url}
                    icon={<Description sx={{ color: PRIMARY }} />}
                    filename="loan-application"
                    onView={handleViewDocument}
                    onDownload={handleDownload}
                  />
                </Grid>
              )}
              {displayData.aadhaar?.url && (
                <Grid item xs={12} sm={6} md={4}>
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
                <Grid item xs={12} sm={6} md={4}>
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
                <Grid item xs={12} sm={6} md={4}>
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
                <Grid item xs={12} sm={6} md={4} key={index}>
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
            {!displayData.loanDocument?.url &&
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
                    No documents have been uploaded for this loan yet.
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
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Loan Notes
              </Typography>
              {displayData.loanNotes ? (
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
                    {displayData.loanNotes}
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Note sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Notes Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No notes have been added for this loan.
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
                {displayData.firstName?.[0] || "L"}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {displayData.firstName} {displayData.lastName}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Loan Application Details • {formatCurrency(displayData.loanAmount)}
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

ViewLoanModal.displayName = "ViewLoanModal";

// Edit Loan Modal
const EditLoanModal = React.memo(
  ({ open, onClose, loan, onSave, userRole, showSnackbar }) => {
    const { fetchAPI } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
      loanAmount: "",
      bank: "",
      branchName: "",
      loanStatus: "pending",
      loanApprovalDate: null,
      loanNotes: "",
      status: "Bank Loan Apply",
    });
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
      if (open && loan) {
        setFormData({
          loanAmount: loan.loanAmount ? loan.loanAmount.toString() : "",
          bank: loan.bank || "",
          branchName: loan.branchName || "",
          loanStatus: loan.loanStatus || "pending",
          loanApprovalDate: loan.loanApprovalDate
            ? parseISO(loan.loanApprovalDate)
            : null,
          loanNotes: loan.loanNotes || "",
          status: loan.status || "Bank Loan Apply",
        });
        setValidationErrors({});
      }
    }, [open, loan]);

    const validateForm = useCallback(() => {
      const errors = {
        loanAmount: validateNumericField(formData.loanAmount, "Loan amount"),
        bank: validateRequiredField(formData.bank, "Bank name"),
        branchName: validateRequiredField(formData.branchName, "Branch name"),
        loanStatus: validateRequiredField(formData.loanStatus, "Loan status"),
        status: validateRequiredField(formData.status, "Lead status"),
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
          loanAmount: parseFloat(formData.loanAmount),
          bank: formData.bank.trim(),
          branchName: formData.branchName.trim(),
          loanStatus: formData.loanStatus,
          loanNotes: formData.loanNotes.trim(),
          status: formData.status,
        };

        if (formData.loanApprovalDate) {
          payload.loanApprovalDate = format(
            formData.loanApprovalDate,
            "yyyy-MM-dd"
          );
        }

        const response = await fetchAPI(`/lead/updateLead/${loan._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response?.success) {
          showSnackbar("Loan application updated successfully", "success");
          onSave(response.result);
          onClose();
        } else {
          throw new Error(response?.message || "Failed to update loan application");
        }
      } catch (error) {
        console.error("Error updating loan application:", error);
        showSnackbar(error.message || "Failed to update loan application", "error");
      } finally {
        setLoading(false);
      }
    }, [formData, validateForm, loan, fetchAPI, showSnackbar, onSave, onClose]);

    if (!loan) return null;

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
                  justifyContent: "center",
                  color: PRIMARY,
                }}
              >
                <Edit sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Edit Loan Application
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {loan.firstName} {loan.lastName}
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
            <TextField
              label="Loan Amount"
              value={formData.loanAmount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, loanAmount: e.target.value }))
              }
              fullWidth
              size="small"
              error={!!validationErrors.loanAmount}
              helperText={validationErrors.loanAmount}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupee fontSize="small" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ type: "number" }}
            />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{width:"350px"}}>
                <FormControl fullWidth size="small" error={!!validationErrors.bank}>
                  <InputLabel>Bank</InputLabel>
                  <Select
                    value={formData.bank}
                    label="Bank"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bank: e.target.value }))
                    }
                  >
                    <MenuItem value="">
                      <em>Select Bank</em>
                    </MenuItem>
                    {BANK_LIST.map((bank) => (
                      <MenuItem key={bank} value={bank}>
                        {bank}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.bank && (
                    <FormHelperText>{validationErrors.bank}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6} sx={{width:"350px"}}>
                <TextField
                  label="Branch Name"
                  value={formData.branchName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      branchName: e.target.value,
                    }))
                  }
                  fullWidth
                  size="small"
                  error={!!validationErrors.branchName}
                  helperText={validationErrors.branchName}
                  required
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{width:"350px"}}>
                <FormControl fullWidth size="small" error={!!validationErrors.loanStatus}>
                  <InputLabel>Loan Status</InputLabel>
                  <Select
                    value={formData.loanStatus}
                    label="Loan Status"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        loanStatus: e.target.value,
                      }))
                    }
                  >
                    {LOAN_STATUS_OPTIONS.map((status) => {
                      const config = getLoanStatusColor(status);
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
                  {validationErrors.loanStatus && (
                    <FormHelperText>{validationErrors.loanStatus}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6} sx={{width:"350px"}}>
                <FormControl fullWidth size="small" error={!!validationErrors.status}>
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
                  {validationErrors.status && (
                    <FormHelperText>{validationErrors.status}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            <DatePicker
              label="Loan Approval Date"
              value={formData.loanApprovalDate}
              onChange={(newValue) =>
                setFormData((prev) => ({
                  ...prev,
                  loanApprovalDate: newValue,
                }))
              }
              slotProps={{
                textField: { fullWidth: true, size: "small" },
              }}
            />

            <TextField
              label="Loan Notes"
              value={formData.loanNotes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, loanNotes: e.target.value }))
              }
              fullWidth
              multiline
              rows={4}
              placeholder="Add any comments or notes about this loan application..."
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

EditLoanModal.displayName = "EditLoanModal";

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
export default function BankLoanApply() {
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
  const [loansData, setLoansData] = useState({
    loans: [],
    summary: {
      totalLoans: 0,
      pendingLoans: 0,
      submittedLoans: 0,
      approvedLoans: 0,
      rejectedLoans: 0,
      totalLoanAmount: 0,
      avgLoanAmount: 0,
    },
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [loanStatusFilter, setLoanStatusFilter] = useState("All");
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
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedActionLoan, setSelectedActionLoan] = useState(null);

  // Snackbar Handler
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch Data
  const fetchLoansData = useCallback(async () => {
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
        `/lead/bankLoanSummary?${params.toString()}`
      );

      if (response?.success) {
        const data = response.result || {};
        const rawLoans = data.bankLoans || [];

        let filteredLoans = rawLoans;
        if (userRole === "TEAM" && user?._id) {
          filteredLoans = rawLoans.filter(
            (loan) =>
              loan.assignedTo === user._id ||
              loan.assignedManager === user._id ||
              loan.assignedUser === user._id ||
              loan.assignedUser?._id === user._id ||
              loan.createdBy === user._id
          );
        }

        const totalLoans = filteredLoans.length;
        const pendingLoans = filteredLoans.filter(
          (loan) => loan.loanStatus?.toLowerCase() === "pending"
        ).length;
        const submittedLoans = filteredLoans.filter(
          (loan) => loan.loanStatus?.toLowerCase() === "submitted"
        ).length;
        const approvedLoans = filteredLoans.filter(
          (loan) => loan.loanStatus?.toLowerCase() === "approved"
        ).length;
        const rejectedLoans = filteredLoans.filter(
          (loan) => loan.loanStatus?.toLowerCase() === "rejected"
        ).length;
        const totalLoanAmount = filteredLoans.reduce(
          (sum, loan) => sum + (parseFloat(loan.loanAmount) || 0),
          0
        );
        const avgLoanAmount = totalLoans > 0 ? totalLoanAmount / totalLoans : 0;

        setLoansData({
          loans: filteredLoans,
          summary: {
            totalLoans,
            pendingLoans,
            submittedLoans,
            approvedLoans,
            rejectedLoans,
            totalLoanAmount,
            avgLoanAmount,
          },
        });
      } else {
        throw new Error(response?.message || "Failed to fetch loan data");
      }
    } catch (err) {
      console.error("Error fetching loans:", err);
      setError(err.message || "Network error. Please try again.");
      showSnackbar(err.message || "Failed to fetch loan data", "error");
    } finally {
      setLoading(false);
    }
  }, [period, fetchAPI, userRole, user, showSnackbar]);

  // Apply Filters
  const applyFilters = useCallback(() => {
    try {
      let filtered = [...loansData.loans];

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (loan) =>
            (loan.firstName?.toLowerCase() || "").includes(query) ||
            (loan.lastName?.toLowerCase() || "").includes(query) ||
            (loan.email?.toLowerCase() || "").includes(query) ||
            (loan.phone || "").includes(query) ||
            (loan.bank?.toLowerCase() || "").includes(query) ||
            (loan.branchName?.toLowerCase() || "").includes(query)
        );
      }

      // Loan Status filter
      if (loanStatusFilter !== "All") {
        filtered = filtered.filter(
          (loan) => loan.loanStatus === loanStatusFilter
        );
      }

      // Lead Status filter
      if (leadStatusFilter !== "All") {
        filtered = filtered.filter((loan) => loan.status === leadStatusFilter);
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

        filtered = filtered.filter((loan) => {
          try {
            const loanDate = loan.loanApprovalDate
              ? parseISO(loan.loanApprovalDate)
              : loan.createdAt
              ? parseISO(loan.createdAt)
              : null;
            if (!loanDate || !isValid(loanDate)) return false;
            return isWithinInterval(loanDate, { start, end });
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
            sortConfig.key === "loanApprovalDate" ||
            sortConfig.key === "createdAt"
          ) {
            aVal = aVal ? parseISO(aVal) : new Date(0);
            bVal = bVal ? parseISO(bVal) : new Date(0);
          } else if (sortConfig.key === "firstName") {
            aVal = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
            bVal = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
          } else if (sortConfig.key === "loanAmount") {
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
      return loansData.loans;
    }
  }, [
    loansData.loans,
    searchQuery,
    loanStatusFilter,
    leadStatusFilter,
    dateFilter,
    sortConfig,
    showSnackbar,
  ]);

  // Effects
  useEffect(() => {
    if (hasAccess(userRole)) {
      fetchLoansData();
    }
  }, [fetchLoansData, userRole]);

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
    (loan) => {
      if (!loan?._id) {
        showSnackbar("Invalid loan data", "error");
        return;
      }
      setSelectedLoan(loan);
      setViewModalOpen(true);
    },
    [showSnackbar]
  );

  const handleEditClick = useCallback(
    (loan) => {
      if (!loan?._id) {
        showSnackbar("Invalid loan data", "error");
        return;
      }
      if (!userPermissions.canEdit) {
        showSnackbar(
          "You don't have permission to edit this loan",
          "error"
        );
        return;
      }
      setSelectedLoan(loan);
      setEditModalOpen(true);
    },
    [userPermissions, showSnackbar]
  );

  const handleStatusUpdateClick = useCallback(
    (loan) => {
      if (!loan?._id) {
        showSnackbar("Invalid loan data", "error");
        return;
      }
      if (!userPermissions.canUpdateStatus) {
        showSnackbar(
          "You don't have permission to update loan status",
          "error"
        );
        return;
      }
      setSelectedLoan(loan);
      setStatusUpdateModalOpen(true);
    },
    [userPermissions, showSnackbar]
  );

  const handleStatusUpdate = useCallback(
    async (updatedLoan) => {
      try {
        await fetchLoansData();
        showSnackbar("Loan status updated successfully", "success");
      } catch (err) {
        console.error("Error after status update:", err);
        showSnackbar("Failed to refresh data", "error");
      }
    },
    [fetchLoansData, showSnackbar]
  );

  const handleLoanUpdate = useCallback(
    async (updatedLoan) => {
      try {
        await fetchLoansData();
        showSnackbar("Loan updated successfully", "success");
      } catch (err) {
        console.error("Error after loan update:", err);
        showSnackbar("Failed to refresh data", "error");
      }
    },
    [fetchLoansData, showSnackbar]
  );

  const handleActionMenuOpen = useCallback((event, loan) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedActionLoan(loan);
  }, []);

  const handleActionMenuClose = useCallback(() => {
    setActionMenuAnchor(null);
    setSelectedActionLoan(null);
  }, []);

  const handleActionSelect = useCallback(
    (action) => {
      if (!selectedActionLoan) return;

      switch (action) {
        case "view":
          handleViewClick(selectedActionLoan);
          break;
        case "edit":
          handleEditClick(selectedActionLoan);
          break;
        case "update_status":
          handleStatusUpdateClick(selectedActionLoan);
          break;
        default:
          break;
      }

      handleActionMenuClose();
    },
    [
      selectedActionLoan,
      handleViewClick,
      handleEditClick,
      handleStatusUpdateClick,
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
    setLoanStatusFilter("All");
    setLeadStatusFilter("All");
    setDateFilter({ startDate: null, endDate: null });
    setDateFilterError("");
    setSortConfig({ key: null, direction: "asc" });
    setPage(0);
    if (showFilterPanel) setShowFilterPanel(false);
  }, [showFilterPanel]);

  // Memoized Computed Values
  const filteredLoans = useMemo(() => applyFilters(), [applyFilters]);

  const paginatedLoans = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredLoans.slice(start, start + rowsPerPage);
  }, [filteredLoans, page, rowsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredLoans.length / rowsPerPage),
    [filteredLoans.length, rowsPerPage]
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Loans",
        value: loansData.summary.totalLoans,
        color: PRIMARY,
        icon: <AccountBalanceWallet />,
        subText: "All loan applications",
      },
      {
        label: "Pending",
        value: loansData.summary.pendingLoans,
        color: "#ef6c00",
        icon: <HourglassEmpty />,
        subText: "Pending applications",
      },
      {
        label: "Submitted",
        value: loansData.summary.submittedLoans,
        color: "#1976d2",
        icon: <Send />,
        subText: "Submitted to bank",
      },
      {
        label: "Rejected",
        value: loansData.summary.rejectedLoans,
        color: "#d32f2f",
        icon: <Cancel />,
        subText: "Rejected loans",
      },
    ],
    [loansData.summary]
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

  if (loading && loansData.loans.length === 0) {
    return <LoadingSkeleton />;
  }

  if (error && loansData.loans.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchLoansData}>
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

      <ViewLoanModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        loan={selectedLoan}
        userRole={userRole}
        showSnackbar={showSnackbar}
        handleViewDocument={handleViewDocument}
      />

      <EditLoanModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        loan={selectedLoan}
        onSave={handleLoanUpdate}
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
              Bank Loan Applications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage all bank loan applications and their status
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchLoansData}
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
                    placeholder="Search by name, email, phone, bank..."
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
                    <InputLabel>Loan Status</InputLabel>
                    <Select
                      value={loanStatusFilter}
                      label="Loan Status"
                      onChange={(e) => setLoanStatusFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Status</MenuItem>
                      {LOAN_STATUS_OPTIONS.map((status) => {
                        const config = getLoanStatusColor(status);
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
                loanStatusFilter !== "All" ||
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
                    {loanStatusFilter !== "All" && (
                      <Chip
                        label={`Loan Status: ${getLoanStatusColor(loanStatusFilter).label}`}
                        size="small"
                        onDelete={() => setLoanStatusFilter("All")}
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
                Loan Applications ({filteredLoans.length})
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
              {loading && loansData.loans.length > 0 && (
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
                      <Typography variant="subtitle2" fontWeight={600}>
                        Bank Details
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => handleSort("loanAmount")}
                        startIcon={
                          sortConfig.key === "loanAmount" ? (
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
                        Loan Amount
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => handleSort("loanApprovalDate")}
                        startIcon={
                          sortConfig.key === "loanApprovalDate" ? (
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
                        Approval Date
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Loan Status
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
                  {paginatedLoans.length > 0 ? (
                    paginatedLoans.map((loan) => {
                      const loanStatusConfig = getLoanStatusColor(
                        loan.loanStatus
                      );
                      const leadStatusConfig = getLeadStatusConfig(
                        loan.status
                      );

                      return (
                        <TableRow
                          key={loan._id}
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
                                {loan.firstName} {loan.lastName}
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
                                  {loan.email || "No email"}
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
                                  {loan.phone || "No phone"}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>

                          {/* Bank Details */}
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" fontWeight={600}>
                                {loan.bank || "Not specified"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {loan.branchName || "Branch not specified"}
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Loan Amount */}
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <CurrencyRupee fontSize="small" color="primary" />
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(loan.loanAmount)}
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Approval Date */}
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {formatDate(loan.loanApprovalDate)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(loan.createdAt, "dd MMM yyyy")}
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Loan Status */}
                          <TableCell>
                            <Tooltip
                              title={loanStatusConfig.description}
                              arrow
                              placement="top"
                            >
                              <Chip
                                label={loanStatusConfig.label}
                                icon={loanStatusConfig.icon}
                                size="small"
                                sx={{
                                  bgcolor: loanStatusConfig.bg,
                                  color: loanStatusConfig.color,
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
                                label={loan.status || "Unknown"}
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
                                  onClick={() => handleViewClick(loan)}
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
                                    onClick={() => handleEditClick(loan)}
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
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <AccountBalanceWallet
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
                            No loan applications found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchQuery ||
                            loanStatusFilter !== "All" ||
                            leadStatusFilter !== "All" ||
                            dateFilter.startDate ||
                            dateFilter.endDate
                              ? "Try adjusting your filters"
                              : "No loan applications have been submitted yet"}
                          </Typography>
                          {(searchQuery ||
                            loanStatusFilter !== "All" ||
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
            {filteredLoans.length > 0 && (
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
                  {Math.min(page * rowsPerPage + 1, filteredLoans.length)} to{" "}
                  {Math.min((page + 1) * rowsPerPage, filteredLoans.length)} of{" "}
                  {filteredLoans.length} entries
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
          {loansData.summary.totalLoans} total loan applications • Average loan amount:{" "}
          {formatCurrency(loansData.summary.avgLoanAmount)}
        </Typography>
      </Box>
    </LocalizationProvider>
  );
}