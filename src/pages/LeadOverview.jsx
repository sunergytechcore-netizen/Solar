// pages/LeadOverview.jsx
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
  Checkbox,
  Divider,
  Stack,
  FormHelperText,
  Card,
  CardContent,
  Skeleton,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Person,
  Search,
  Visibility,
  Refresh,
  Clear,
  Close,
  Assignment,
  AssignmentInd,
  SupervisorAccount,
  Groups,
  Description,
  Save,
  DeleteForever,
  ArrowDropDown,
  ArrowDropUp,
  Email,
  Phone,
  CalendarToday,
  AccessTime,
  Business,
  AccountCircle,
  Security,
  AdminPanelSettings,
  WorkspacePremium,
  HowToReg,
  CheckCircle,
  Cancel,
  Pending,
  TableChart,
  GridView,
  ViewList,
  DateRange,
  Timeline,
  Send,
  SortByAlpha,
  Sort,
  ExpandMore,
  Home,
  LocationOn,
  FolderOpen,
  AccountBalance,
  ReceiptLong,
  Build,
  OpenInNew,
  CreditCard,
  PictureAsPdf,
  Money,
  Event,
  AttachFile,
  Note,
  LocalAtm,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { format, parseISO, isValid } from "date-fns";
import { useNavigate } from 'react-router-dom'


// ========== CONSTANTS & UTILITIES ==========

// Colors
const PRIMARY_COLOR = "#1976d2";

// Lead Status Options
const LEAD_STATUS_OPTIONS = [
  "Visit",
  "Registration",
  "Bank Loan Apply",
  "Document Submission",
  "Bank at pending",
  "Disbursement",
  "Installation Completion",
  "Missed Leads",
  "New",
];

// Enhanced Role Permissions
const ROLE_PERMISSIONS = {
  Head_office: {
    view: true,
    edit: true,
    assign: true,
    delete: true,
    bulkActions: true,
    export: true,
    settings: true,
    color: "#ff6d00",
    icon: <AdminPanelSettings />,
    label: "Head Office",
    level: 1,
    canAssignTo: ["ASM", "TEAM"],
  },
  ZSM: {
    view: true,
    edit: true,
    assign: true,
    delete: false,
    bulkActions: true,
    export: true,
    settings: false,
    color: "#9c27b0",
    icon: <WorkspacePremium />,
    label: "Zone Sales Manager",
    level: 2,
    canAssignTo: ["ASM", "TEAM"],
  },
  ASM: {
    view: true,
    edit: true,
    assign: true,
    delete: false,
    bulkActions: true,
    export: false,
    settings: false,
    color: "#00bcd4",
    icon: <SupervisorAccount />,
    label: "Area Sales Manager",
    level: 3,
    canAssignTo: ["TEAM"],
  },
  TEAM: {
    view: true,
    edit: false,
    assign: false,
    delete: false,
    bulkActions: false,
    export: false,
    settings: false,
    color: "#4caf50",
    icon: <Groups />,
    label: "Team Member",
    level: 4,
    canAssignTo: [],
  },
};

// Utility Functions
const getStatusColor = (status) => {
  const colorMap = {
    Visit: { bg: "#e3f2fd", color: "#1976d2", icon: <Person /> },
    Registration: { bg: "#e8f5e9", color: "#2e7d32", icon: <HowToReg /> },
    "Bank Loan Apply": { bg: "#fff3e0", color: "#f57c00", icon: <Business /> },
    "Document Submission": {
      bg: "#f3e5f5",
      color: "#7b1fa2",
      icon: <Description />,
    },
    "Bank at pending": { bg: "#fff3e0", color: "#f57c00", icon: <Pending /> },
    Disbursement: { bg: "#fff8e1", color: "#ff8f00", icon: <Assignment /> },
    "Installation Completion": {
      bg: "#e8f5e9",
      color: "#1b5e20",
      icon: <CheckCircle />,
    },
    "Missed Leads": { bg: "#ffebee", color: "#c62828", icon: <Cancel /> },
    New: { bg: "#e3f2fd", color: "#1976d2", icon: <Add /> },
  };
  return (
    colorMap[status] || { bg: "#f5f5f5", color: "#616161", icon: <Pending /> }
  );
};

const getRoleColor = (role) => {
  const config = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.TEAM;
  return { bg: `${config.color}15`, color: config.color, icon: config.icon };
};

const formatDate = (dateString, formatStr = "MMM dd, yyyy hh:mm a") => {
  if (!dateString) return "Not set";
  try {
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate)
      ? format(parsedDate, formatStr)
      : "Invalid date";
  } catch {
    return "Invalid date";
  }
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone) => {
  return /^[0-9]{10}$/.test(phone.replace(/\D/g, ""));
};

// Download document function
const handleDownload = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.download = filename || 'document';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ========== CUSTOM HOOKS ==========

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// ========== REUSABLE COMPONENTS ==========

const LoadingSkeleton = ({ count = 5, isMobile = false }) => (
  <Box>
    {Array.from({ length: count }).map((_, index) => (
      <Skeleton
        key={index}
        variant="rectangular"
        height={isMobile ? 80 : 70}
        sx={{ mb: 2, borderRadius: 2 }}
      />
    ))}
  </Box>
);

const EmptyState = ({ title, description, icon: Icon = Person, action }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    py={8}
    px={2}
  >
    <Box
      sx={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        bgcolor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 3,
      }}
    >
      <Icon sx={{ fontSize: 60, color: "#bdbdbd" }} />
    </Box>
    <Typography variant="h6" color="text.secondary" gutterBottom align="center">
      {title}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      sx={{ mb: 3, maxWidth: 400 }}
    >
      {description}
    </Typography>
    {action}
  </Box>
);

const RoleBadge = ({ role }) => {
  const config = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.TEAM;
  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      sx={{
        bgcolor: `${config.color}15`,
        color: config.color,
        fontWeight: 600,
        "& .MuiChip-icon": { color: config.color },
      }}
    />
  );
};

const PermissionIndicator = ({ permission, label }) => (
  <Box display="flex" alignItems="center" gap={1}>
    {permission ? (
      <CheckCircle sx={{ color: "#4caf50", fontSize: 16 }} />
    ) : (
      <Cancel sx={{ color: "#f44336", fontSize: 16 }} />
    )}
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

const InfoRow = ({ label, value, icon, subValue, action, chip, chipColor }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    gap={2}
  >
    <Box display="flex" alignItems="center" gap={2} flex={1}>
      <Box sx={{ color: "primary.main", minWidth: 24 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        {chip ? (
          <Chip
            label={value}
            size="small"
            sx={{
              bgcolor: chipColor?.bg,
              color: chipColor?.color,
              fontWeight: 600,
              mt: 0.5,
            }}
          />
        ) : (
          <Typography variant="body1" fontWeight={500}>
            {value}
          </Typography>
        )}
        {subValue && <Box sx={{ mt: 0.5 }}>{subValue}</Box>}
      </Box>
    </Box>
    {action && <Box>{action}</Box>}
  </Box>
);

// Document Card Component
const DocumentCard = ({ title, url, icon, filename }) => (
  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
      {icon}
      <Typography variant="body2" fontWeight={600} noWrap>
        {title}
      </Typography>
    </Box>
    <Button
      fullWidth
      size="small"
      variant="outlined"
      startIcon={<OpenInNew />}
      onClick={() => handleDownload(url, filename || title)}
    >
      View Document
    </Button>
  </Card>
);

// ========== MODAL COMPONENTS ==========

const ViewLeadModal = React.memo(({ open, onClose, lead, userRole }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { fetchAPI } = useAuth(); // Assuming useAuth is a custom hook

  const [loading, setLoading] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.TEAM;

  useEffect(() => {
    if (open && lead) {
      fetchLeadDetails();
    } else {
      setLeadDetails(null);
      setError(null);
      setActiveTab("basic");
    }
  }, [open, lead]);

  const fetchLeadDetails = async () => {
    if (!lead?._id) {
      setError("No lead selected");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetchAPI(`/lead/getLeadById/${lead._id}`);

      if (response.success) {
        setLeadDetails(response.result);
      } else {
        throw new Error(response.message || "Failed to fetch lead details");
      }
    } catch (error) {
      console.error("Error fetching lead details:", error);
      setError(error.message || "Failed to load lead details");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Permission-based tab filtering (example improvement)
  const availableTabs = [
    { value: "basic", label: "Basic Info", icon: <Person /> },
    { value: "visit", label: "Visit Info", icon: <CalendarToday /> },
    { value: "registration", label: "Registration", icon: <HowToReg /> },
    { value: "loan", label: "Loan Info", icon: <AccountBalance /> },
    { value: "documents", label: "Documents", icon: <FolderOpen /> },
    { value: "bank", label: "Bank", icon: <LocalAtm /> },
    { value: "disbursement", label: "Disbursement", icon: <AccountBalance /> },
    { value: "installation", label: "Installation", icon: <Build /> },
    { value: "timeline", label: "Timeline", icon: <Timeline /> },
  ].filter(tab => {
    // Example: Restrict sensitive tabs based on role
    if (userRole === 'TEAM' && (tab.value === 'bank' || tab.value === 'loan')) return false;
    return true;
  });

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={400}
          >
            <CircularProgress sx={{ color: PRIMARY_COLOR }} />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={fetchLeadDetails} variant="outlined" fullWidth>
            Retry
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClose={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!leadDetails) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { 
          borderRadius: isMobile ? 0 : 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          pb: 2,
          bgcolor: PRIMARY_COLOR,
          color: "white",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "white", color: PRIMARY_COLOR }}>
              {leadDetails.firstName?.[0] || "L"}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {leadDetails.firstName} {leadDetails.lastName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Lead Details • Complete Information
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', overflow: 'auto', py: 1 }}>
            {availableTabs.map((tab) => (
              <Button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                startIcon={tab.icon}
                sx={{
                  minWidth: 'auto',
                  mx: 0.5,
                  borderRadius: 2,
                  width: "120px",
                  bgcolor: activeTab === tab.value ? PRIMARY_COLOR : 'transparent',
                  color: activeTab === tab.value ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: activeTab === tab.value ? '#1565c0' : 'grey.100',
                  }
                }}
                size="small"
              >
                {tab.label}
              </Button>
            ))}
          </Box>
        </Box>

        <Box sx={{ pt: 3, maxHeight: '60vh', overflow: 'auto' }}>
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{height: "100%" , boxShadow:"none" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: PRIMARY_COLOR }}>
                      <Person /> Personal Information
                    </Typography>
                    <Stack spacing={2}>
                      <InfoRow label="Full Name" value={`${leadDetails.firstName} ${leadDetails.lastName}`} icon={<AccountCircle />} />
                      <InfoRow label="Email" value={leadDetails.email || "Not set"} icon={<Email />} />
                      <InfoRow label="Phone" value={leadDetails.phone || "Not set"} icon={<Phone />} />
                      <InfoRow label="Address" value={leadDetails.address || "Not set"} icon={<Home />} />
                      <InfoRow label="Pincode" value={leadDetails.pincode || "Not set"} icon={<LocationOn />} />
                      <InfoRow label="Solar Requirement" value={leadDetails.solarRequirement || "Not set"} icon={<Build />} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ boxShadow:"none", height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: PRIMARY_COLOR }}>
                      <Timeline /> Lead Status & Assignment
                    </Typography>
                    <Stack spacing={2}>
                      <InfoRow label="Status" value={leadDetails.status} icon={getStatusColor(leadDetails.status).icon} chip chipColor={getStatusColor(leadDetails.status)} />
                      <InfoRow label="Installation Status" value={leadDetails.installationStatus || "Not set"} icon={<Build />} />
                      {leadDetails.assignedManager && (
                        <InfoRow
                          label="Assigned Manager"
                          value={`${leadDetails.assignedManager.firstName} ${leadDetails.assignedManager.lastName}`}
                          icon={<SupervisorAccount />}
                          subValue={<RoleBadge role={leadDetails.assignedManager.role} />}
                        />
                      )}
                      {leadDetails.assignedUser && (
                        <InfoRow
                          label="Assigned To"
                          value={`${leadDetails.assignedUser.firstName} ${leadDetails.assignedUser.lastName}`}
                          icon={<AssignmentInd />}
                          subValue={<RoleBadge role={leadDetails.assignedUser.role} />}
                        />
                      )}
                      {leadDetails.createdBy && (
                        <InfoRow
                          label="Created By"
                          value={`${leadDetails.createdBy.firstName} ${leadDetails.createdBy.lastName}`}
                          icon={<HowToReg />}
                          subValue={<RoleBadge role={leadDetails.createdBy.role} />}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ boxShadow:"none" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: PRIMARY_COLOR }}>
                      <Description /> Notes
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: "#f9f9f9", borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                        {leadDetails.notes || "No notes available"}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Visit Information Tab */}
          {activeTab === "visit" && (
            <Card sx={{boxShadow:"none"}}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: PRIMARY_COLOR }}>
                  <CalendarToday /> Visit Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <InfoRow label="Visit Status" value={leadDetails.visitStatus || "Not Scheduled"} icon={<CheckCircle />} />
                      <InfoRow label="Visit Date" value={formatDate(leadDetails.visitDate)} icon={<Event />} />
                      <InfoRow label="Visit Time" value={leadDetails.visitTime || "Not set"} icon={<AccessTime />} />
                      <InfoRow label="Visit Location" value={leadDetails.visitLocation || "Not set"} icon={<LocationOn />} />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Visit Notes" value={leadDetails.visitNotes || "No notes available"} icon={<Note />} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Registration Information Tab */}
          {activeTab === "registration" && (
            <Card sx={{boxShadow:"none" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: PRIMARY_COLOR }}>
                  <HowToReg /> Registration Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <InfoRow label="Registration Date" value={formatDate(leadDetails.dateOfRegistration)} icon={<Event />} />
                      <InfoRow 
                        label="Registration Status" 
                        value={leadDetails.registrationStatus || "Pending"} 
                        icon={<CheckCircle />}
                        chip
                        chipColor={{
                          bg: leadDetails.registrationStatus === 'completed' ? '#e8f5e9' : '#fff3e0',
                          color: leadDetails.registrationStatus === 'completed' ? '#388e3c' : '#f57c00'
                        }}
                      />
                      {leadDetails.uploadDocument?.url && (
                        <InfoRow
                          label="Registration Document"
                          value="View Document"
                          icon={<AttachFile />}
                          action={
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<OpenInNew />}
                              onClick={() => handleDownload(leadDetails.uploadDocument.url, 'registration-document')}
                            >
                              View
                            </Button>
                          }
                        />
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Registration Notes" value={leadDetails.registrationNotes || "No notes available"} icon={<Note />} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Loan Information Tab */}
          {activeTab === "loan" && (
            <Card sx={{ boxShadow:"none" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: PRIMARY_COLOR }}>
                  <AccountBalance /> Loan Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <InfoRow label="Loan Amount" value={leadDetails.loanAmount ? `₹${leadDetails.loanAmount.toLocaleString()}` : "Not set"} icon={<Money />} />
                      <InfoRow label="Bank" value={leadDetails.bank || "Not set"} icon={<AccountBalance />} />
                      <InfoRow label="Branch Name" value={leadDetails.branchName || "Not set"} icon={<AccountBalance />} />
                      <InfoRow 
                        label="Loan Status" 
                        value={leadDetails.loanStatus || "Not Applied"} 
                        icon={<CheckCircle />}
                        chip
                        chipColor={{
                          bg: leadDetails.loanStatus === 'submitted' ? '#e3f2fd' : '#fff3e0',
                          color: leadDetails.loanStatus === 'submitted' ? '#1976d2' : '#f57c00'
                        }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <InfoRow label="Loan Approval Date" value={formatDate(leadDetails.loanApprovalDate)} icon={<Event />} />
                      <InfoRow label="Loan Notes" value={leadDetails.loanNotes || "No notes available"} icon={<Note />} />
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <Card sx={{ boxShadow:"none" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: PRIMARY_COLOR }}>
                  <FolderOpen /> Documents
                </Typography>
                <Grid container spacing={2}>
                  {leadDetails.aadhaar?.url && (
                    <Grid item xs={12} sm={6} md={4} sx={{width:"250px"}}>
                      <DocumentCard
                        title="Aadhaar Card"
                        url={leadDetails.aadhaar.url}
                        icon={<PictureAsPdf sx={{ color: '#f57c00' }} />}
                        filename="aadhaar-card"
                      />
                    </Grid>
                  )}
                  {leadDetails.panCard?.url && (
                    <Grid item xs={12} sm={6} md={4} sx={{width:"250px"}}>
                      <DocumentCard
                        title="PAN Card"
                        url={leadDetails.panCard.url}
                        icon={<CreditCard sx={{ color: '#1976d2' }} />}
                        filename="pan-card"
                      />
                    </Grid>
                  )}
                  {leadDetails.passbook?.url && (
                    <Grid item xs={12} sm={6} md={4} sx={{width:"250px"}}>
                      <DocumentCard
                        title="Bank Passbook"
                        url={leadDetails.passbook.url}
                        icon={<ReceiptLong sx={{ color: '#388e3c' }} />}
                        filename="passbook"
                      />
                    </Grid>
                  )}
                  {leadDetails.otherDocuments && leadDetails.otherDocuments.map((doc, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index} sx={{width:"250px"}}>
                      <DocumentCard
                        title={doc.name || `Document ${index + 1}`}
                        url={doc.url}
                        icon={<PictureAsPdf sx={{ color: '#d32f2f' }} />}
                        filename={doc.name}
                      />
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <InfoRow label="Document Status" 
                    value={leadDetails.documentStatus || "Pending"} 
                    icon={<CheckCircle />}
                    chip
                    chipColor={{
                      bg: leadDetails.documentStatus === 'submitted' ? '#e3f2fd' : '#fff3e0',
                      color: leadDetails.documentStatus === 'submitted' ? '#1976d2' : '#f57c00'
                    }}
                  />
                  <InfoRow label="Document Submission Date" value={formatDate(leadDetails.documentSubmissionDate, "dd MMM yyyy, HH:mm:ss")} icon={<Event />} />
                  <InfoRow label="Document Notes" value={leadDetails.documentNotes || "No notes available"} icon={<Note />} />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Bank & Disbursement Tab */}
          {activeTab === "bank" && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ boxShadow:"none", height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: PRIMARY_COLOR }}>
                      <Pending /> Bank at Pending
                    </Typography>
                    <Stack spacing={2}>
                      <InfoRow 
                        label="Status" 
                        value={leadDetails.bankAtPendingStatus || "Pending"} 
                        icon={<CheckCircle />}
                        chip
                        chipColor={{
                          bg: leadDetails.bankAtPendingStatus === 'approved' ? '#e8f5e9' : '#fff3e0',
                          color: leadDetails.bankAtPendingStatus === 'approved' ? '#388e3c' : '#f57c00'
                        }}
                      />
                      <InfoRow label="Date" value={formatDate(leadDetails.bankAtPendingDate)} icon={<Event />} />
                      <InfoRow label="Reason" value={leadDetails.reason || "No reason provided"} icon={<Note />} />
                      <InfoRow label="Notes" value={leadDetails.bankAtPendingNotes || "No notes available"} icon={<Note />} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

            {/* Bank & Disbursement Tab */}
            {activeTab === "disbursement" && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ boxShadow:"none", height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: PRIMARY_COLOR }}>
                      <LocalAtm /> Disbursement Information
                    </Typography>
                    <Stack spacing={2}>
                      <InfoRow label="Disbursement Amount" value={leadDetails.disbursementAmount ? `₹${leadDetails.disbursementAmount.toLocaleString()}` : "Not set"} icon={<Money />} />
                      <InfoRow label="Disbursement Date" value={formatDate(leadDetails.disbursementDate)} icon={<Event />} />
                      <InfoRow 
                        label="Disbursement Status" 
                        value={leadDetails.disbursementStatus || "Pending"} 
                        icon={<CheckCircle />}
                        chip
                        chipColor={{
                          bg: leadDetails.disbursementStatus === 'completed' ? '#e8f5e9' : '#fff3e0',
                          color: leadDetails.disbursementStatus === 'completed' ? '#388e3c' : '#f57c00'
                        }}
                      />
                      {leadDetails.disbursementBankDetails && (
                        <>
                          <InfoRow label="Disbursement Bank" value={leadDetails.disbursementBankDetails.bank || "Not set"} icon={<AccountBalance />} />
                          <InfoRow label="Disbursement Branch" value={leadDetails.disbursementBankDetails.branchName || "Not set"} icon={<AccountBalance />} />
                        </>
                      )}
                      <InfoRow label="Disbursement Notes" value={leadDetails.disbursementNotes || "No notes available"} icon={<Note />} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Installation Tab */}
          {activeTab === "installation" && (
            <Card sx={{ boxShadow:"none" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: PRIMARY_COLOR }}>
                  <Build /> Installation Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <InfoRow label="Installation Date" value={formatDate(leadDetails.installationDate)} icon={<Event />} />
                      <InfoRow 
                        label="Installation Status" 
                        value={leadDetails.installationStatus || "pending"} 
                        icon={<CheckCircle />}
                        chip
                        chipColor={{
                          bg: leadDetails.installationStatus === 'final-payment' ? '#e8f5e9' : 
                               leadDetails.installationStatus === 'meter-charge' ? '#fff3e0' : '#e3f2fd',
                          color: leadDetails.installationStatus === 'final-payment' ? '#388e3c' :
                                leadDetails.installationStatus === 'meter-charge' ? '#f57c00' : '#1976d2'
                        }}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoRow label="Installation Notes" value={leadDetails.installationNotes || "No notes available"} icon={<Note />} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <Card sx={{ boxShadow:"none" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, color: PRIMARY_COLOR }}>
                  <Timeline /> Lead Timeline ({leadDetails.stageTimeline?.length || 0} updates)
                </Typography>
                {leadDetails.stageTimeline && leadDetails.stageTimeline.length > 0 ? (
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {[...leadDetails.stageTimeline].reverse().map((timeline, index) => (
                      <ListItem key={index} sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getStatusColor(timeline.stage).color }}>
                            {getStatusColor(timeline.stage).icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight={600}>
                                {timeline.stage}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(timeline.updatedAt, "dd MMM, HH:mm")}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {timeline.notes}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                Updated by: {timeline.updatedRole} • {timeline.updatedBy?.firstName || 'System'}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No timeline data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, borderTop: 1, borderColor: "divider", bgcolor: 'grey.50'}}>
        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center" sx={{mt:1}}>
          <Typography variant="caption" color="text.secondary">
            Viewing as: <RoleBadge role={userRole} />
          </Typography>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
});

ViewLeadModal.displayName = 'ViewLeadModal';

// Updated EditLeadModal with better design
const EditLeadModal = React.memo(
  ({ open, onClose, lead, onSave, userRole }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { fetchAPI } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      status: "Visit",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
      if (lead) {
        setFormData({
          firstName: lead.firstName || "",
          lastName: lead.lastName || "",
          email: lead.email || "",
          phone: lead.phone || "",
          status: lead.status || "Visit",
        });
        setErrors({});
      }
    }, [lead]);

    const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.TEAM;
    const canEdit = permissions.edit;

    const validateForm = () => {
      const newErrors = {};
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone is required";
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = "Phone must be 10 digits";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;
      setLoading(true);
      try {
        const response = await fetchAPI(`/lead/updateLead/${lead._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (response.success) {
          onSave(response.result);
          onClose();
        } else {
          throw new Error(response.message || "Failed to update lead");
        }
      } catch (error) {
        setErrors({ submit: error.message });
      } finally {
        setLoading(false);
      }
    };

    const handleChange = (field) => (event) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
      if (field === "phone" && value) {
        const phoneDigits = value.replace(/\D/g, "");
        if (phoneDigits.length > 10) {
          setFormData((prev) => ({ ...prev, phone: phoneDigits.slice(0, 10) }));
        }
      }
    };

    if (!canEdit) {
      return (
        <Dialog open={open} onClose={onClose}>
          <DialogTitle>Access Denied</DialogTitle>
          <DialogContent>
            <Alert severity="error" icon={<Security />}>
              <Typography variant="body1" fontWeight={600}>
                You do not have permission to edit leads
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Your role ({ROLE_PERMISSIONS[userRole]?.label}) only allows
                viewing leads.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Close</Button>
          </DialogActions>
        </Dialog>
      );
    }

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            pb: 2,
            bgcolor: PRIMARY_COLOR,
            color: "white",
            position: 'relative',
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ 
                bgcolor: "white", 
                color: PRIMARY_COLOR,
                width: 48,
                height: 48
              }}>
                <Edit sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  Edit Lead
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  {lead?.firstName} {lead?.lastName}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, color: "white", mt: 1 }}>
            Editing as: <RoleBadge role={userRole} />
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3}}>
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errors.submit}
            </Alert>
          )}
          <Card sx={{ 
            boxShadow: 'none',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} sx={{width:"250px"}}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    color="primary"
                    sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <AccountCircle sx={{ fontSize: 24 }} />
                    Personal Information
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="First Name *"
                      value={formData.firstName}
                      onChange={handleChange("firstName")}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      size="medium"
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: errors.firstName ? 'error.main' : 'grey.300' },
                            '&:hover fieldset': { borderColor: errors.firstName ? 'error.main' : PRIMARY_COLOR },
                            '&.Mui-focused fieldset': { borderColor: PRIMARY_COLOR }
                          }
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Last Name *"
                      value={formData.lastName}
                      onChange={handleChange("lastName")}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      size="medium"
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: errors.lastName ? 'error.main' : 'grey.300' },
                            '&:hover fieldset': { borderColor: errors.lastName ? 'error.main' : PRIMARY_COLOR },
                            '&.Mui-focused fieldset': { borderColor: PRIMARY_COLOR }
                          }
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Phone *"
                      value={formData.phone}
                      onChange={handleChange("phone")}
                      error={!!errors.phone}
                      helperText={errors.phone || "Include country code if needed"}
                      size="medium"
                      inputProps={{ maxLength: 15 }}
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: errors.phone ? 'error.main' : 'grey.300' },
                            '&:hover fieldset': { borderColor: errors.phone ? 'error.main' : PRIMARY_COLOR },
                            '&.Mui-focused fieldset': { borderColor: PRIMARY_COLOR }
                          }
                        }
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6} sx={{width:"250px"}}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    color="primary"
                    sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Assignment sx={{ fontSize: 24 }} />
                    Lead Details
                  </Typography>
                  <Stack spacing={3}>
                  <TextField
                      fullWidth
                      label="Email *"
                      type="email"
                      value={formData.email}
                      onChange={handleChange("email")}
                      error={!!errors.email}
                      helperText={errors.email}
                      size="medium"
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: errors.email ? 'error.main' : 'grey.300' },
                            '&:hover fieldset': { borderColor: errors.email ? 'error.main' : PRIMARY_COLOR },
                            '&.Mui-focused fieldset': { borderColor: PRIMARY_COLOR }
                          }
                        }
                      }}
                    />
                    <FormControl fullWidth size="medium" error={!!errors.status}>
                      <InputLabel>Status *</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={handleChange("status")}
                        label="Status *"
                        sx={{
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: errors.status ? 'error.main' : 'grey.300'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: errors.status ? 'error.main' : PRIMARY_COLOR
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: PRIMARY_COLOR
                          }
                        }}
                      >
                        {LEAD_STATUS_OPTIONS.map((status) => (
                          <MenuItem key={status} value={status}>
                            <Box display="flex" alignItems="center" gap={2} sx={{ width: '100%' }}>
                              {getStatusColor(status).icon}
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" fontWeight={500}>{status}</Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status && <FormHelperText error>{errors.status}</FormHelperText>}
                    </FormControl>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions
          sx={{ 
            p: 3, 
            pt: 0, 
            borderTop: 1, 
            borderColor: "divider",
            bgcolor: 'white',
            boxShadow: '0 -1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              mt:1,
              fontWeight: 600,
              borderColor: 'grey.300'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            sx={{
              bgcolor: PRIMARY_COLOR,
              color: "white",
              borderRadius: 2,
              px: 4,
              py: 1.5,
              mt:1,
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(25,118,210,0.3)',
              '&:hover': { 
                bgcolor: "#1565c0",
                boxShadow: '0 4px 8px rgba(25,118,210,0.4)'
              },
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

EditLeadModal.displayName = 'EditLeadModal';

const AssignLeadModal = React.memo(
  ({
    open,
    onClose,
    lead,
    onAssign,
    userRole,
    isBulkAssign = false,
    bulkLeads = [],
    showSnackbar
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { fetchAPI, user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [asmUsers, setAsmUsers] = useState([]);
    const [teamUsers, setTeamUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [fetchingUsers, setFetchingUsers] = useState(false);
    const [error, setError] = useState(null);
    const [assignToRole, setAssignToRole] = useState("");
    const [showRoleSelection, setShowRoleSelection] = useState(false);
    const [availableRoles, setAvailableRoles] = useState([]);

    const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.TEAM;
    const canAssign = permissions.assign;

    useEffect(() => {
      if (open && canAssign) {
        resetModal();
        // Set available roles based on user role
        const roles = permissions.canAssignTo;
        setAvailableRoles(roles);
        
        // Show role selection for roles that can assign to multiple types
        if (roles.length > 1) {
          setShowRoleSelection(true);
          setAssignToRole(""); // Clear initially to force selection
        } else if (roles.length === 1) {
          setAssignToRole(roles[0]);
          setShowRoleSelection(false);
          // Fetch users immediately if only one role option
          fetchUsers(roles[0]);
        }
      } else {
        resetModal();
      }
    }, [open, canAssign, permissions]);

    const resetModal = () => {
      setAsmUsers([]);
      setTeamUsers([]);
      setSelectedUserId("");
      setError(null);
      setAssignToRole("");
      setShowRoleSelection(false);
      setAvailableRoles([]);
    };

    const fetchUsers = async (roleToFetch = assignToRole) => {
      if (!canAssign || !roleToFetch) return;
    
      try {
        setFetchingUsers(true);
        setError(null);
    
        console.log(`Fetching ${roleToFetch} users for ${userRole} role`);
    
        let endpoint = "";
        let queryParams = "?page=1&limit=100";
    
        // Determine endpoint based on user role and target role
        if (userRole === "Head_office") {
          if (roleToFetch === "ASM") {
            endpoint = "/user/managerList";
          } else if (roleToFetch === "TEAM") {
            endpoint = "/user/getManagerUnderUserList";
          }
        } else if (userRole === "ZSM") {
          if (roleToFetch === "ASM") {
            endpoint = "/user/managerList";
          } else if (roleToFetch === "TEAM") {
            endpoint = "/user/getManagerUnderUserList";
          }
        } else if (userRole === "ASM") {
          if (roleToFetch === "TEAM") {
            endpoint = "/user/getManagerUnderUserList";
            queryParams = `?page=1&limit=100&supervisorId=${user._id}`;
          }
        }
    
        if (!endpoint) {
          setError(`No endpoint configured for ${roleToFetch} assignment from ${userRole}`);
          return;
        }
    
        console.log(`Calling API: ${endpoint}${queryParams}`);
    
        const response = await fetchAPI(`${endpoint}${queryParams}`);
        console.log(`API Response for ${roleToFetch}:`, response);
    
        if (response?.success) {
          let usersData = [];
          
          // Handle different response structures
          if (response.result?.users) {
            usersData = response.result.users;
          } else if (Array.isArray(response.result)) {
            usersData = response.result;
          } else if (response.result?.data) {
            usersData = response.result.data;
          } else if (response.result) {
            // If it's a single user object
            usersData = [response.result];
          }
    
          console.log(`Raw ${roleToFetch} users data:`, usersData);
    
          // Filter users based on target role
          const filteredUsers = usersData.filter(userData => {
            // First check if user has the target role
            const hasCorrectRole = userData.role === roleToFetch;
            
            // Check if user is active
            const isActive = userData.status === "active";
            
            // For ASM fetching TEAM members - check supervisor
            let isUnderSupervision = true;
            
            if (userRole === "ASM" && roleToFetch === "TEAM") {
              // Check if TEAM member is under current ASM
              isUnderSupervision = userData.supervisor?._id === user._id || 
                                  userData.supervisorId === user._id ||
                                  userData.supervisor === user._id;
            }
    
            return hasCorrectRole && isActive && isUnderSupervision;
          });
    
          console.log(`Filtered ${roleToFetch} users (${filteredUsers.length}):`, filteredUsers);
    
          if (roleToFetch === "ASM") {
            setAsmUsers(filteredUsers);
          } else if (roleToFetch === "TEAM") {
            setTeamUsers(filteredUsers);
          }
          
          if (filteredUsers.length === 0) {
            // Provide more specific error message
            if (roleToFetch === "ASM") {
              setError("No active Area Sales Managers available. Please check if ASM users exist in the system.");
            } else if (roleToFetch === "TEAM") {
              if (userRole === "ASM") {
                setError("No active team members under your supervision. Please assign team members to yourself first.");
              } else {
                setError("No active team members available for assignment.");
              }
            }
          } else {
            setError(null); // Clear any previous errors
          }
        } else {
          console.error("API Error:", response);
          setError(response?.message || `Failed to load ${roleToFetch} users. API response: ${JSON.stringify(response)}`);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error.message || "Failed to load users. Please try again.");
      } finally {
        setFetchingUsers(false);
      }
    };

    const handleRoleChange = async (event) => {
      const role = event.target.value;
      console.log(`Role changed to: ${role}`);
      
      setAssignToRole(role);
      setSelectedUserId(""); // Clear user selection when role changes
      
      // Reset user lists for the new role
      if (role === "ASM") {
        setAsmUsers([]);
      } else if (role === "TEAM") {
        setTeamUsers([]);
      }
      
      setError(null); // Clear any previous errors
      
      // Fetch users for the selected role
      await fetchUsers(role);
    };

    const handleSubmit = async () => {
      if (!selectedUserId) {
        setError("Please select a user to assign");
        return;
      }

      if (!assignToRole) {
        setError("Please select a role to assign to");
        return;
      }

      setLoading(true);
      try {
        if (isBulkAssign) {
          // Bulk assign multiple leads
          const assignData = {
            leadIds: bulkLeads.map((lead) => lead._id),
            targetId: selectedUserId,
            targetRole: assignToRole
          };

          const response = await fetchAPI("/lead/bulk-assign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(assignData),
          });

          if (response.success) {
            onAssign(response.result);
            onClose();
            if (showSnackbar) {
              showSnackbar(`${bulkLeads.length} leads assigned successfully`, "success");
            }
          } else {
            throw new Error(response.message || "Failed to bulk assign leads");
          }
        } else {
          // Single lead assignment
          const assignData = {
            leadId: lead._id,
            targetId: selectedUserId,
            targetRole: assignToRole
          };

          // Add additional fields based on role for backward compatibility
          if (assignToRole === "ASM") {
            assignData.managerId = selectedUserId;
          } else if (assignToRole === "TEAM") {
            assignData.userId = selectedUserId;
          }

          const response = await fetchAPI("/lead/assign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(assignData),
          });

          if (response.success) {
            onAssign(response.result);
            onClose();
            if (showSnackbar) {
              showSnackbar("Lead assigned successfully", "success");
            }
          } else {
            throw new Error(response.message || "Failed to assign lead");
          }
        }
      } catch (error) {
        setError(error.message);
        if (showSnackbar) {
          showSnackbar(error.message || "Failed to assign lead", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    // Get available users based on selected role
    const getAvailableUsers = () => {
      if (assignToRole === "ASM") return asmUsers;
      if (assignToRole === "TEAM") return teamUsers;
      return [];
    };

    // Get selected user details
    const getSelectedUser = () => {
      return getAvailableUsers().find(user => user._id === selectedUserId);
    };

    if (!canAssign) {
      return (
        <Dialog open={open} onClose={onClose}>
          <DialogTitle>Access Denied</DialogTitle>
          <DialogContent>
            <Alert severity="error" icon={<Security />}>
              <Typography variant="body1" fontWeight={600}>
                You do not have permission to assign leads
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Your role ({permissions.label}) does not have assignment privileges.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Close</Button>
          </DialogActions>
        </Dialog>
      );
    }

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            pb: 2,
            bgcolor: PRIMARY_COLOR,
            color: "white",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Assignment />
              <Typography variant="h6" fontWeight={600}>
                {isBulkAssign ? "Bulk Assign Leads" : "Assign Lead"}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.9, color: "white" }}>
            Assigning as: <RoleBadge role={userRole} />
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {isBulkAssign ? (
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bulk Assignment
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  You are about to assign {bulkLeads.length} leads to a user.
                </Typography>
                <Box sx={{ maxHeight: 150, overflow: "auto" }}>
                  <List dense>
                    {bulkLeads.slice(0, 5).map((lead, index) => (
                      <ListItem key={lead._id}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: PRIMARY_COLOR, fontSize: 14 }}>
                            {lead.firstName?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${lead.firstName} ${lead.lastName}`}
                          secondary={`${lead.email} • ${lead.status}`}
                        />
                      </ListItem>
                    ))}
                    {bulkLeads.length > 5 && (
                      <ListItem>
                        <ListItemText
                          primary={`...and ${bulkLeads.length - 5} more leads`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: PRIMARY_COLOR }}>
                    {lead?.firstName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {lead?.firstName} {lead?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lead?.email} • {lead?.phone}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={lead?.status}
                  sx={{
                    bgcolor: getStatusColor(lead?.status).bg,
                    color: getStatusColor(lead?.status).color,
                    fontWeight: 600,
                  }}
                />
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => fetchUsers(assignToRole)}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {fetchingUsers ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              py={4}
            >
              <CircularProgress size={32} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading available users...
              </Typography>
            </Box>
          ) : (
            <>
              {/* Role Selection for multiple role options */}
              {showRoleSelection && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Assign To Role</InputLabel>
                  <Select
                    value={assignToRole}
                    onChange={handleRoleChange}
                    label="Assign To Role"
                    disabled={fetchingUsers}
                  >
                    <MenuItem value="" disabled>
                      Select role type...
                    </MenuItem>
                    {availableRoles.includes("ASM") && (
                      <MenuItem value="ASM">
                        <Box display="flex" alignItems="center" gap={1}>
                          <SupervisorAccount />
                          <span>Area Sales Manager (ASM)</span>
                          {asmUsers.length > 0 && (
                            <Chip
                              label={`${asmUsers.length} available`}
                              size="small"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    )}
                    {availableRoles.includes("TEAM") && (
                      <MenuItem value="TEAM">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Groups />
                          <span>Team Member (TEAM)</span>
                          {teamUsers.length > 0 && (
                            <Chip
                              label={`${teamUsers.length} available`}
                              size="small"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    )}
                  </Select>
                  <FormHelperText>
                    {userRole === "ASM" 
                      ? "You can only assign to your team members"
                      : `Select whether to assign to ${availableRoles.join(" or ")}`}
                  </FormHelperText>
                </FormControl>
              )}

              {/* User Selection - Show only if role is selected and not showing role selection */}
              {(assignToRole || !showRoleSelection) && (
                <FormControl fullWidth sx={{ mb: 3 }} error={!!error}>
                  <InputLabel>
                    Select {assignToRole === "TEAM" ? "Team Member" : assignToRole}
                  </InputLabel>
                  <Select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    label={`Select ${assignToRole === "TEAM" ? "Team Member" : assignToRole}`}
                    disabled={fetchingUsers || getAvailableUsers().length === 0}
                  >
                    <MenuItem value="" disabled>
                      {assignToRole === "TEAM" 
                        ? "Select a Team Member..." 
                        : `Select an ${assignToRole}...`}
                    </MenuItem>
                    {getAvailableUsers().map((userData) => (
                      <MenuItem key={userData._id} value={userData._id}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: getRoleColor(userData.role).color,
                            }}
                          >
                            {userData.firstName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {userData.firstName} {userData.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {userData.email} • {userData.phoneNumber || "No phone"}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {getAvailableUsers().length === 0 && !fetchingUsers && assignToRole && (
                    <FormHelperText>
                      No {assignToRole === "TEAM" ? "team members" : "ASM users"} available for assignment
                    </FormHelperText>
                  )}
                </FormControl>
              )}

              {selectedUserId && assignToRole && (
                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  <Typography variant="body2">
                    {isBulkAssign
                      ? `${bulkLeads.length} lead(s) will be assigned to `
                      : "This lead will be assigned to "}
                    <strong>{getSelectedUser()?.firstName} {getSelectedUser()?.lastName}</strong> ({assignToRole}).
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{ p: 3, pt: 0, borderTop: 1, borderColor: "divider" }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading || fetchingUsers}
            sx={{ borderRadius: 2, mt: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              loading || 
              fetchingUsers || 
              !selectedUserId || 
              !assignToRole ||
              (showRoleSelection && !assignToRole) ||
              getAvailableUsers().length === 0
            }
            startIcon={
              loading ? <CircularProgress size={20} /> : <AssignmentInd />
            }
            sx={{
              bgcolor: PRIMARY_COLOR,
              color: "white",
              borderRadius: 2,
              mt: 2,
              "&:hover": { bgcolor: "#1565c0" },
            }}
          >
            {loading
              ? isBulkAssign
                ? "Assigning Bulk..."
                : "Assigning..."
              : isBulkAssign
              ? "Assign Leads"
              : "Assign Lead"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

AssignLeadModal.displayName = 'AssignLeadModal';

const DeleteConfirmationDialog = React.memo(
  ({ open, onClose, leadsToDelete, onDelete, userRole }) => {
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
    const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.TEAM;
    const canDelete = permissions.delete;

    if (!canDelete) {
      return (
        <Dialog open={open} onClose={onClose}>
          <DialogTitle>Access Denied</DialogTitle>
          <DialogContent>
            <Alert severity="error" icon={<Security />}>
              <Typography variant="body1" fontWeight={600}>
                Delete permission required
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Only Head Office administrators can delete leads. Your role (
                {permissions.label}) does not have delete privileges.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Close</Button>
          </DialogActions>
        </Dialog>
      );
    }

    return (
      <Dialog open={open} onClose={onClose} fullScreen={isMobile}>
        <DialogTitle sx={{ color: "#d32f2f", bgcolor: "#ffebee" }}>
          <Box display="flex" alignItems="center" gap={2}>
            <DeleteForever />
            <Typography variant="h6" fontWeight={600}>
              Confirm Delete
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Warning: This action cannot be undone
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              You are about to permanently delete {leadsToDelete.length}{" "}
              lead(s). All associated data will be lost.
            </Typography>
          </Alert>
          <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              Delete Summary
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Security color="action" />
              <Typography variant="body2" color="text.secondary">
                Action requires: Head Office permission
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Delete color="error" />
              <Typography variant="body2">
                {leadsToDelete.length} lead(s) will be permanently deleted
              </Typography>
            </Box>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            fullWidth={isMobile}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={onDelete}
            color="error"
            variant="contained"
            fullWidth={isMobile}
            sx={{ borderRadius: 2 }}
            startIcon={<DeleteForever />}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

DeleteConfirmationDialog.displayName = 'DeleteConfirmationDialog';

// ========== MAIN COMPONENT ==========

const LeadOverview = () => {
  const { fetchAPI, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const navigate = useNavigate();

  // State Management
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    isMobile ? 5 : isTablet ? 8 : 10
  );
  const [totalLeads, setTotalLeads] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadsToDelete, setLeadsToDelete] = useState([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [leadToAssign, setLeadToAssign] = useState(null);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [leadToView, setLeadToView] = useState(null);

  // Selection states
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Data states
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Memoized values
  const hasFilters = useMemo(
    () => searchTerm || statusFilter !== "all",
    [searchTerm, statusFilter]
  );
  const selectedCount = useMemo(() => selectedLeads.length, [selectedLeads]);
  const userRole = user?.role || "TEAM";
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.TEAM;
  const selectedLeadsData = useMemo(
    () => leads.filter((lead) => selectedLeads.includes(lead._id)),
    [leads, selectedLeads]
  );

 const addLeads = () => {
    navigate('/add-lead')
 }

  // Snackbar helper function
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch leads with error handling
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const pageNumber = page + 1;

      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: rowsPerPage.toString(),
        sortBy,
        sortOrder,
      });

      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const data = await fetchAPI(`/lead/getAll?${params.toString()}`);

      if (data.success) {
        setLeads(data.result.leads || []);
        setTotalLeads(data.result.pagination?.total || 0);
      } else {
        showSnackbar(data.message || "Failed to fetch leads", "error");
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      showSnackbar(error.message || "Failed to fetch leads", "error");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [
    fetchAPI,
    page,
    rowsPerPage,
    debouncedSearchTerm,
    statusFilter,
    sortBy,
    sortOrder,
    showSnackbar
  ]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // API Handlers
  const handleAssignLead = useCallback(
    async (assignData) => {
      try {
        showSnackbar("Lead assigned successfully", "success");
        await fetchLeads(); // Force refresh the leads list
        setSelectedLeads([]);
        setSelectAll(false);
      } catch (error) {
        console.error("Error assigning lead:", error);
        showSnackbar(error.message || "Failed to assign lead", "error");
      }
    }, [fetchLeads, showSnackbar]);

  const handleBulkAssign = useCallback(async (assignData) => {
    try {
      showSnackbar(
        `${assignData.leadIds?.length || 0} leads assigned successfully`,
        "success"
      );
      setSelectedLeads([]);
      setSelectAll(false);
      await fetchLeads(); // Force refresh
    } catch (error) {
      console.error("Error bulk assigning leads:", error);
      showSnackbar(error.message || "Failed to bulk assign leads", "error");
    }
  }, [fetchLeads, showSnackbar]);

  // FIXED: Delete handler with correct API endpoint and payload
  const handleDeleteLeads = useCallback(async () => {
    try {
      const response = await fetchAPI("/lead/deleteLead", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ids: leadsToDelete // Changed from leadIds to ids
        }),
      });

      if (response.success) {
        showSnackbar(
          `${leadsToDelete.length} lead(s) deleted successfully`,
          "success"
        );
        setDeleteDialogOpen(false);
        setLeadsToDelete([]);
        await fetchLeads(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to delete leads");
      }
    } catch (error) {
      console.error("Error deleting leads:", error);
      showSnackbar(error.message || "Failed to delete leads", "error");
    }
  }, [fetchAPI, showSnackbar, fetchLeads, leadsToDelete]);

  // Single lead delete handler for table actions
  const handleDeleteSingleLead = useCallback(async (leadId) => {
    try {
      const response = await fetchAPI("/lead/deleteLead", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ids: [leadId] // Wrap in array
        }),
      });

      if (response.success) {
        showSnackbar("Lead deleted successfully", "success");
        await fetchLeads(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to delete lead");
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      showSnackbar(error.message || "Failed to delete lead", "error");
    }
  }, [fetchAPI, showSnackbar, fetchLeads]);

  const handleUpdateLead = useCallback(
    async (updatedLead) => {
      try {
        showSnackbar("Lead updated successfully", "success");
        await fetchLeads(); // Refresh the list
      } catch (error) {
        console.error("Error updating lead:", error);
        showSnackbar("Failed to update lead", "error");
      }
    },
    [fetchLeads, showSnackbar]
  );

  // Selection handlers
  const handleSelectAll = useCallback((event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedLeads(leads.map((lead) => lead._id));
    } else {
      setSelectedLeads([]);
    }
  }, [leads]);

  const handleSelectLead = useCallback((leadId) => {
    setSelectedLeads((prev) => {
      if (prev.includes(leadId)) {
        return prev.filter((id) => id !== leadId);
      } else {
        return [...prev, leadId];
      }
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedLeads([]);
    setSelectAll(false);
  }, []);

  // Dialog open handlers
  const openAssignDialog = useCallback((lead) => {
    setLeadToAssign(lead);
    setAssignDialogOpen(true);
  }, []);

  const openBulkAssignDialog = useCallback(() => {
    setBulkAssignDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((lead) => {
    setLeadToEdit(lead);
    setEditModalOpen(true);
  }, []);

  const openViewDialog = useCallback((lead) => {
    setLeadToView(lead);
    setViewModalOpen(true);
  }, []);

  const openDeleteDialog = useCallback(() => {
    setLeadsToDelete(selectedLeads);
    setDeleteDialogOpen(true);
  }, [selectedLeads]);

  // Sort handler
  const handleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  }, [sortBy, sortOrder]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setPage(0);
    setSelectedLeads([]);
    setSelectAll(false);
  }, []);

  // Export handler
  const handleExport = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
      });

      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetchAPI(`/lead/export?${params.toString()}`);

      if (response.success && response.result?.url) {
        // Create download link
        const link = document.createElement('a');
        link.href = response.result.url;
        link.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSnackbar("Export completed successfully", "success");
      } else {
        throw new Error(response.message || "Failed to export leads");
      }
    } catch (error) {
      console.error("Error exporting leads:", error);
      showSnackbar(error.message || "Failed to export leads", "error");
    }
  }, [fetchAPI, showSnackbar, sortBy, sortOrder, debouncedSearchTerm, statusFilter]);

  // Render functions
  const renderTableRow = useCallback((lead) => {
    const isSelected = selectedLeads.includes(lead._id);
    const statusColor = getStatusColor(lead.status);

    return (
      <TableRow
        key={lead._id}
        hover
        selected={isSelected}
        sx={{
          "&:hover": { bgcolor: "#f9f9f9" },
          "&.Mui-selected": { bgcolor: "#e3f2fd" },
        }}
      >
        <TableCell padding="checkbox">
          {permissions.bulkActions && (
            <Checkbox
              checked={isSelected}
              onChange={() => handleSelectLead(lead._id)}
              color="primary"
            />
          )}
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: PRIMARY_COLOR }}>
              {lead.firstName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight={600}>
                {lead.firstName} {lead.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lead.email}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            <Phone fontSize="small" />
            <Typography variant="body2">{lead.phone || "Not set"}</Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Chip
            label={lead.status}
            icon={statusColor.icon}
            size="small"
            sx={{
              bgcolor: statusColor.bg,
              color: statusColor.color,
              fontWeight: 600,
            }}
          />
        </TableCell>
        <TableCell>
          {(lead.assignedUser || lead.assignedManager) ? (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                {(lead.assignedUser?.firstName || lead.assignedManager?.firstName)?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body2">
                  {lead.assignedUser?.firstName || lead.assignedManager?.firstName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {lead.assignedUser?.role || lead.assignedManager?.role}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Unassigned
            </Typography>
          )}
        </TableCell>
        <TableCell>
          <Typography variant="caption">
            {formatDate(lead.createdAt, "MMM dd, yyyy")}
          </Typography>
        </TableCell>
        <TableCell>
          <Box display="flex" gap={1}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => openViewDialog(lead)}
                sx={{
                  bgcolor: "#e3f2fd",
                  "&:hover": { bgcolor: "#bbdefb" },
                }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            
            {permissions.edit && (
              <Tooltip title="Edit Lead">
                <IconButton
                  size="small"
                  onClick={() => openEditDialog(lead)}
                  sx={{
                    bgcolor: "#e8f5e9",
                    "&:hover": { bgcolor: "#c8e6c9" },
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {permissions.assign && (
              <Tooltip title="Assign Lead">
                <IconButton
                  size="small"
                  onClick={() => openAssignDialog(lead)}
                  sx={{
                    bgcolor: "#fff3e0",
                    "&:hover": { bgcolor: "#ffe0b2" },
                  }}
                >
                  <AssignmentInd fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {permissions.delete && (
              <Tooltip title="Delete Lead">
                <IconButton
                  size="small"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${lead.firstName} ${lead.lastName}?`)) {
                      handleDeleteSingleLead(lead._id);
                    }
                  }}
                  sx={{
                    bgcolor: "#ffebee",
                    "&:hover": { bgcolor: "#ffcdd2" },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </TableRow>
    );
  }, [selectedLeads, permissions, handleSelectLead, handleDeleteSingleLead, openViewDialog, openEditDialog, openAssignDialog]);

  const renderCardView = useCallback(() => {
    if (loading) {
      return <LoadingSkeleton count={6} isMobile={isMobile} />;
    }

    if (leads.length === 0) {
      return (
        <EmptyState
          title={hasFilters ? "No matching leads found" : "No leads yet"}
          description={
            hasFilters
              ? "Try adjusting your filters to find what you're looking for"
              : "Get started by creating your first lead"
          }
          icon={hasFilters ? Search : Person}
          action={
            hasFilters && (
              <Button onClick={handleResetFilters} variant="outlined">
                Clear Filters
              </Button>
            )
          }
        />
      );
    }

    return (
      <Grid container spacing={2}>
        {leads.map((lead) => {
          const statusColor = getStatusColor(lead.status);
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={lead._id}>
              <Card
                sx={{
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  border: selectedLeads.includes(lead._id)
                    ? `2px solid ${PRIMARY_COLOR}`
                    : "1px solid #e0e0e0",
                  position: "relative",
                }}
              >
                {permissions.bulkActions && (
                  <Checkbox
                    checked={selectedLeads.includes(lead._id)}
                    onChange={() => handleSelectLead(lead._id)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  />
                )}

                <CardContent sx={{ flex: 1, pt: 6 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: PRIMARY_COLOR }}>
                      {lead.firstName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {lead.firstName} {lead.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {lead.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone fontSize="small" />
                      <Typography variant="body2">{lead.phone}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" />
                      <Typography variant="caption">
                        {formatDate(lead.createdAt, "MMM dd, yyyy")}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box mt={2}>
                    <Chip
                      label={lead.status}
                      icon={statusColor.icon}
                      size="small"
                      sx={{
                        bgcolor: statusColor.bg,
                        color: statusColor.color,
                        fontWeight: 600,
                        width: "100%",
                        justifyContent: "flex-start",
                      }}
                    />
                  </Box>

                  {(lead.assignedUser || lead.assignedManager) && (
                    <Box mt={2} display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {(lead.assignedUser?.firstName || lead.assignedManager?.firstName)?.[0]}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        Assigned to: {lead.assignedUser?.firstName || lead.assignedManager?.firstName}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <Divider />

                <Box p={2} display="flex" justifyContent="space-between">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => openViewDialog(lead)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {permissions.edit && (
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(lead)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {permissions.assign && (
                    <Tooltip title="Assign">
                      <IconButton
                        size="small"
                        onClick={() => openAssignDialog(lead)}
                      >
                        <AssignmentInd fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  }, [
    loading,
    leads,
    hasFilters,
    selectedLeads,
    permissions,
    handleSelectLead,
    openViewDialog,
    openEditDialog,
    openAssignDialog,
    isMobile,
    handleResetFilters,
  ]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: PRIMARY_COLOR }}>
              <Groups />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Lead Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total {totalLeads} leads • {permissions.label} view
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={addLeads}
            sx={{
              bgcolor: PRIMARY_COLOR,
              borderRadius: 2,
              px: 3,
              py: 1,
            }}
          >
            Add New Lead
          </Button>
        </Box>
      </Box>

      {/* Filters & Actions Section */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search leads by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  {LEAD_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusColor(status).icon}
                        {status}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* View Mode & Refresh */}
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Tooltip title="Grid View">
                  <IconButton
                    onClick={() => setViewMode("grid")}
                    color={viewMode === "grid" ? "primary" : "default"}
                  >
                    <GridView />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Table View">
                  <IconButton
                    onClick={() => setViewMode("table")}
                    color={viewMode === "table" ? "primary" : "default"}
                  >
                    <TableChart />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem />
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchLeads}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>

          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "#e3f2fd",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent:"space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body1" fontWeight={600}>
                  {selectedCount} lead(s) selected
                </Typography>
                <Button
                  size="small"
                  onClick={handleClearSelection}
                  startIcon={<Clear />}
                >
                  Clear
                </Button>
              </Box>

              <Box display="flex" gap={1} flexWrap="wrap">
                {permissions.assign && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AssignmentInd />}
                    onClick={openBulkAssignDialog}
                  >
                    Assign Selected
                  </Button>
                )}
                {permissions.export && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Send />}
                    onClick={handleExport}
                  >
                    Export Selected
                  </Button>
                )}
                {permissions.delete && (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<Delete />}
                    onClick={openDeleteDialog}
                  >
                    Delete Selected
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Info */}
      {showRoleInfo && (
        <Card sx={{ mb: 3, borderRadius: 2, bgcolor: "#f9f9f9" }}>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h6" fontWeight={600}>
                Your Permissions ({permissions.label})
              </Typography>
              <IconButton
                size="small"
                onClick={() => setShowRoleInfo(false)}
              >
                <Close />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <PermissionIndicator
                  permission={permissions.view}
                  label="View Leads"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PermissionIndicator
                  permission={permissions.edit}
                  label="Edit Leads"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PermissionIndicator
                  permission={permissions.assign}
                  label="Assign Leads"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <PermissionIndicator
                  permission={permissions.delete}
                  label="Delete Leads"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Content Section */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {viewMode === "table" ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell padding="checkbox">
                        {permissions.bulkActions && (
                          <Checkbox
                            indeterminate={
                              selectedCount > 0 && selectedCount < leads.length
                            }
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        )}
                      </TableCell>
                      {[
                        { label: "Lead", sortable: true, key: "firstName" },
                        { label: "Contact", sortable: false },
                        { label: "Status", sortable: true, key: "status" },
                        { label: "Assigned To", sortable: true, key: "assignedUser" },
                        { label: "Created Date", sortable: true, key: "createdAt" },
                        { label: "Actions", sortable: false },
                      ].map((column) => (
                        <TableCell key={column.label || column.key}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {column.label}
                            </Typography>
                            {column.sortable && (
                              <IconButton
                                size="small"
                                onClick={() => handleSort(column.key)}
                              >
                                <Sort
                                  color={
                                    sortBy === column.key
                                      ? "primary"
                                      : "inherit"
                                  }
                                />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <LoadingSkeleton count={rowsPerPage} />
                        </TableCell>
                      </TableRow>
                    ) : leads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <EmptyState
                            title={hasFilters ? "No matching leads found" : "No leads yet"}
                            description={
                              hasFilters
                                ? "Try adjusting your filters to find what you're looking for"
                                : "Get started by creating your first lead"
                            }
                            icon={hasFilters ? Search : Person}
                            action={
                              hasFilters && (
                                <Button
                                  onClick={handleResetFilters}
                                  variant="outlined"
                                >
                                  Clear Filters
                                </Button>
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      leads.map(renderTableRow)
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalLeads}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{ borderTop: 1, borderColor: "divider" }}
              />
            </>
          ) : (
            <Box sx={{ p: 3 }}>{renderCardView()}</Box>
          )}
        </CardContent>
      </Card>

      {/* Role Info Button */}
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Tooltip title="View Role Permissions">
          <Button
            variant="contained"
            onClick={() => setShowRoleInfo(true)}
            startIcon={<Security />}
            sx={{
              borderRadius: 3,
              bgcolor: getRoleColor(userRole).color,
              "&:hover": {
                bgcolor: getRoleColor(userRole).color,
                opacity: 0.9,
              },
            }}
          >
            {permissions.label}
          </Button>
        </Tooltip>
      </Box>

      {/* Modals */}
      <ViewLeadModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        lead={leadToView}
        userRole={userRole}
      />

      <EditLeadModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        lead={leadToEdit}
        onSave={handleUpdateLead}
        userRole={userRole}
      />

      <AssignLeadModal
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        lead={leadToAssign}
        onAssign={handleAssignLead}
        userRole={userRole}
        showSnackbar={showSnackbar}
      />

      <AssignLeadModal
        open={bulkAssignDialogOpen}
        onClose={() => setBulkAssignDialogOpen(false)}
        lead={null}
        onAssign={handleBulkAssign}
        userRole={userRole}
        isBulkAssign={true}
        bulkLeads={selectedLeadsData}
        showSnackbar={showSnackbar}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        leadsToDelete={leadsToDelete}
        onDelete={handleDeleteLeads}
        userRole={userRole}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 , color:"#fff" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeadOverview;