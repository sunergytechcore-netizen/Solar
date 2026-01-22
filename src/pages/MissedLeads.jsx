// pages/MissedLeadsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
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
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Grid,
  Avatar,
  LinearProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Paper,
} from "@mui/material";
import { 
  Search, 
  Visibility, 
  Close, 
  Refresh,
  Warning,
  TrendingDown,
  AccessTime,
  Restore,
  PriorityHigh,
  Schedule,
  ArrowForward,
  CalendarToday,
  Phone,
  Email,
  Person,
  Timeline,
  FilterList,
  ArrowDropDown,
  ArrowDropUp,
  Info,
  CheckCircle,
  Error,
  Home,
  LocationOn,
  Description,
  AccountBalance,
  ReceiptLong,
  Build,
  ExpandMore,
  AttachFile,
  Note,
  Paid,
  LocalAtm,
  History,
  Download,
  OpenInNew,
  AccountBalanceWallet,
  Badge as BadgeIcon,
  CreditCard,
  PictureAsPdf,
  Image,
  FolderOpen,
  Money,
  Event,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { format, isValid, parseISO } from "date-fns";
import PendingActions from "@mui/icons-material/PendingActions";


const PRIMARY_COLOR = "#ff6d00";

export default function MissedLeadsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  
  const { fetchAPI } = useAuth();
  const [period, setPeriod] = useState("Today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [missedLeads, setMissedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDetails, setLeadDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    avgInactiveDays: 0,
    reopenable: 0
  });

  // Fetch missed leads
  const fetchMissedLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(priorityFilter && { priority: priorityFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(period !== "Today" && { period })
      });

      const response = await fetchAPI(`/lead/missed?${params}`);
      
      if (response?.success) {
        setMissedLeads(response.result.missedLeads || []);
        setPagination(response.result.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1
        });
        calculateSummaryStats(response.result.missedLeads || []);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching missed leads:", err);
      setError("Failed to load missed leads. Please try again.");
      setLoading(false);
    }
  }, [pagination.page, priorityFilter, searchTerm, period, fetchAPI]);

  // Calculate summary statistics
  const calculateSummaryStats = (leads) => {
    const high = leads.filter(lead => (lead.daysInactive || 0) >= 30).length;
    const medium = leads.filter(lead => (lead.daysInactive || 0) >= 15 && (lead.daysInactive || 0) < 30).length;
    const low = leads.filter(lead => (lead.daysInactive || 0) < 15).length;
    const avgDays = leads.length > 0 
      ? Math.round(leads.reduce((sum, lead) => sum + (lead.daysInactive || 0), 0) / leads.length)
      : 0;
    const reopenable = leads.filter(lead => lead.canReopen !== false).length;

    setSummaryStats({
      total: leads.length,
      highPriority: high,
      mediumPriority: medium,
      lowPriority: low,
      avgInactiveDays: avgDays,
      reopenable: reopenable
    });
  };

  // Handle view lead details
  const handleViewClick = useCallback(async (lead) => {
    setSelectedLead(lead);
    setDetailsLoading(true);
    setViewDialogOpen(true);
    
    try {
      const response = await fetchAPI(`/lead/getLeadById/${lead._id}`);
      if (response.success) {
        setLeadDetails(response.result);
      }
    } catch (err) {
      setError("Failed to load lead details: " + err.message);
    } finally {
      setDetailsLoading(false);
    }
  }, [fetchAPI]);

  // Handle reopen lead
  const handleReopenClick = useCallback(async (lead) => {
    try {
      const response = await fetchAPI(`/lead/updateLead/${lead._id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "New",
          lastContactedAt: new Date().toISOString(),
          notes: lead.notes ? `${lead.notes}\n[${new Date().toLocaleDateString()}] Lead reopened from Missed status` 
                           : `[${new Date().toLocaleDateString()}] Lead reopened from Missed status`
        })
      });

      if (response?.success) {
        setSuccess("Lead reopened successfully and marked as New!");
        
        const updatedLeads = missedLeads.filter(item => item._id !== lead._id);
        setMissedLeads(updatedLeads);
        calculateSummaryStats(updatedLeads);
        
        setTimeout(() => {
          fetchMissedLeads();
        }, 1000);
      } else {
        throw new Error(response?.message || "Failed to reopen lead");
      }
    } catch (err) {
      console.error("Error reopening lead:", err);
      setError("Failed to reopen lead: " + err.message);
    }
  }, [missedLeads, fetchAPI, fetchMissedLeads]);

  // Handle pagination change
  const handlePageChange = useCallback((event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Handle search
  const handleSearch = useCallback((e) => {
    if (e.key === 'Enter') {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchMissedLeads();
    }
  }, [fetchMissedLeads]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setPriorityFilter("");
    setPeriod("Today");
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Format date helper
  const formatDate = useCallback((dateString, formatStr = "dd MMM yyyy") => {
    if (!dateString) return "Not Available";
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return isValid(date) ? format(date, formatStr) : "Invalid Date";
    } catch (err) {
      return "Invalid Date";
    }
  }, []);

  // Get priority configuration
  const getPriorityConfig = useCallback((daysInactive) => {
    if (daysInactive >= 30) {
      return {
        label: "High",
        color: "#f44336",
        bgcolor: "#ffebee",
        icon: <PriorityHigh fontSize="small" />
      };
    } else if (daysInactive >= 15) {
      return {
        label: "Medium",
        color: "#ff9800",
        bgcolor: "#fff3e0",
        icon: <Warning fontSize="small" />
      };
    } else {
      return {
        label: "Low",
        color: "#4caf50",
        bgcolor: "#e8f5e9",
        icon: <CheckCircle fontSize="small" />
      };
    }
  }, []);

  // Priority Chip component
  const PriorityChip = useCallback(({ daysInactive }) => {
    const config = getPriorityConfig(daysInactive);
    return (
      <Chip
        label={config.label}
        size="small"
        icon={config.icon}
        sx={{
          bgcolor: config.bgcolor,
          color: config.color,
          fontWeight: 600,
          fontSize: "0.75rem",
          height: 28,
          '& .MuiChip-icon': {
            color: config.color,
            fontSize: 16,
          }
        }}
      />
    );
  }, [getPriorityConfig]);

  // Get stage from status
  const getStageFromStatus = useCallback((status) => {
    const stageMap = {
      "Installation Completion": "Installation",
      "Missed": "Missed Lead"
    };
    return stageMap[status] || status;
  }, []);

  // Stage Chip component
  const StageChip = useCallback(({ status }) => {
    const stage = getStageFromStatus(status);
    return (
      <Chip
        label={stage}
        size="small"
        sx={{
          bgcolor: "#e3f2fd",
          color: "#1976d2",
          fontWeight: 600,
          fontSize: "0.75rem",
          height: 28,
        }}
      />
    );
  }, [getStageFromStatus]);

  // Download document function
  const handleDownload = useCallback((url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMissedLeads();
  }, [fetchMissedLeads]);

  // Summary cards data
  const summaryCards = [
    {
      label: "Total Missed",
      value: summaryStats.total,
      icon: <TrendingDown sx={{ color: PRIMARY_COLOR }} />,
      color: PRIMARY_COLOR,
      subLabel: "Leads lost",
    },
    {
      label: "High Priority",
      value: summaryStats.highPriority,
      icon: <PriorityHigh sx={{ color: "#f44336" }} />,
      color: "#f44336",
      subLabel: "Immediate action needed",
    },
    {
      label: "Avg Inactive Days",
      value: summaryStats.avgInactiveDays,
      icon: <AccessTime sx={{ color: "#ff9800" }} />,
      color: "#ff9800",
      subLabel: "Days without contact",
    },
    {
      label: "Can Reopen",
      value: summaryStats.reopenable,
      icon: <Restore sx={{ color: "#4caf50" }} />,
      color: "#4caf50",
      subLabel: "Ready for recovery",
    },
  ];

  // Mobile view component
  const MobileLeadCard = useCallback(({ lead }) => {
    return (
      <Card sx={{ mb: 2, p: 2.5, borderRadius: 3, boxShadow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: PRIMARY_COLOR + '20',
                color: PRIMARY_COLOR,
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {lead.firstName?.charAt(0)}{lead.lastName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography fontWeight="bold" fontSize="1rem">
                {`${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unnamed Lead'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lead.phone || 'No phone'}
              </Typography>
            </Box>
          </Box>
          <PriorityChip daysInactive={lead.daysInactive || 0} />
        </Box>

        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>
            </Box>
            <Typography variant="body2">
              {formatDate(lead.createdAt)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Timeline sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Stage
              </Typography>
            </Box>
            <StageChip status={lead.status} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {lead.daysInactive || 0} days inactive
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => handleViewClick(lead)}
                sx={{
                  bgcolor: 'grey.100',
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'grey.200',
                  }
                }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            {(lead.canReopen !== false) && (
              <Tooltip title="Reopen Lead">
                <IconButton
                  size="small"
                  onClick={() => handleReopenClick(lead)}
                  sx={{
                    bgcolor: '#4caf50' + '20',
                    color: '#4caf50',
                    '&:hover': {
                      bgcolor: '#4caf50',
                      color: 'white',
                    }
                  }}
                >
                  <Restore fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Card>
    );
  }, [handleViewClick, handleReopenClick, formatDate, PriorityChip, StageChip]);

  // Loading state
  if (loading && missedLeads.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2, color: PRIMARY_COLOR }} />
          <Typography color="text.secondary">Loading missed leads...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              fontWeight="bold"
              sx={{ 
                color: "#1a1a1a",
                mb: 0.5
              }}
            >
              Missed Leads Recovery
            </Typography>
            <Typography color="text.secondary" fontSize={isMobile ? "0.8rem" : "0.9rem"}>
              Track and recover lost opportunities with action plans
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchMissedLeads}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Period Selector */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
          {["Today", "This Week", "This Month"].map((item) => (
            <Button
              key={item}
              variant={period === item ? "contained" : "outlined"}
              onClick={() => setPeriod(item)}
              size="small"
              sx={{
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                borderRadius: 2,
                bgcolor: period === item ? PRIMARY_COLOR : 'transparent',
                borderColor: period === item ? PRIMARY_COLOR : 'divider',
                '&:hover': {
                  bgcolor: period === item ? '#e65100' : PRIMARY_COLOR + '10',
                  borderColor: PRIMARY_COLOR,
                },
              }}
            >
              {item}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={isMobile ? 1.5 : 2.5} sx={{ mb: 4 }}>
        {summaryCards.map((stat, i) => (
          <Grid item xs={6} sm={6} md={3} key={i}>
            <Card
              sx={{
                p: isMobile ? 2 : 2.5,
                borderRadius: 3,
                bgcolor: "white",
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                height: "100%",
                width:"275px",
                minHeight: 120,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)`,
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '12px', 
                  bgcolor: stat.color + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {stat.icon}
                </Box>
              </Box>
              
              <Typography
                variant={isMobile ? "h4" : "h3"}
                fontWeight="bold"
                sx={{ color: stat.color, mb: 0.5 }}
              >
                {stat.value}
              </Typography>
              
              <Typography
                variant={isMobile ? "body2" : "body1"}
                fontWeight={600}
                sx={{ color: 'text.primary', mb: 1 }}
              >
                {stat.label}
              </Typography>
              
              {stat.subLabel && (
                <Typography variant="caption" color="text.secondary">
                  {stat.subLabel}
                </Typography>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Missed Leads List */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2.5, 
          borderBottom: 1, 
          borderColor: 'divider', 
          bgcolor: '#fffaf0'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Warning sx={{ color: PRIMARY_COLOR }} />
              <Typography variant="h6" fontWeight={700}>
                Missed Leads
              </Typography>
              <Chip 
                label={`${missedLeads.length} records`}
                size="small"
                sx={{ bgcolor: PRIMARY_COLOR + '20', color: PRIMARY_COLOR }}
              />
            </Box>
          </Box>

          {/* Search and Filters */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearch}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: PRIMARY_COLOR }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: PRIMARY_COLOR,
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1.5, 
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{ 
                    borderRadius: 2,
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: PRIMARY_COLOR,
                      bgcolor: PRIMARY_COLOR + '10',
                    }
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : missedLeads.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Box sx={{ 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              bgcolor: 'grey.50', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              <Info sx={{ fontSize: 48, color: 'text.disabled' }} />
            </Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              No missed leads found
            </Typography>
            <Typography color="text.secondary" paragraph sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
              {searchTerm || priorityFilter 
                ? "Try adjusting your search or filters"
                : "Great! You have no missed leads to recover."
              }
            </Typography>
          </Box>
        ) : isMobile ? (
          // Mobile View
          <Box sx={{ p: 2.5 }}>
            {missedLeads.map((lead) => (
              <MobileLeadCard
                key={lead._id}
                lead={lead}
              />
            ))}
          </Box>
        ) : (
          // Desktop Table View
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  bgcolor: '#fffaf0',
                  '& th': {
                    fontWeight: 700,
                    color: '#555',
                    fontSize: "0.9rem",
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    py: 2,
                  }
                }}>
                  {[
                    { label: "Customer", width: '25%' },
                    { label: "Created Date", width: '15%' },
                    { label: "Last Contact", width: '15%' },
                    { label: "Priority", width: '15%' },
                    { label: "Stage", width: '15%' },
                    { label: "Actions", width: '15%' },
                  ].map((header) => (
                    <TableCell
                      key={header.label}
                      sx={{ width: header.width }}
                    >
                      {header.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {missedLeads.map((lead) => (
                  <TableRow 
                    key={lead._id} 
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: '#fffaf0',
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar 
                          sx={{ 
                            width: 36, 
                            height: 36, 
                            bgcolor: PRIMARY_COLOR + '20',
                            color: PRIMARY_COLOR,
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}
                        >
                          {lead.firstName?.charAt(0)}{lead.lastName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>
                            {`${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unnamed Lead'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {lead.phone || 'No phone'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        p: 1.5,
                        bgcolor: 'grey.50',
                        borderRadius: 2
                      }}>
                        <Typography>
                          {formatDate(lead.createdAt)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {formatDate(lead.lastContactedAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {lead.daysInactive || 0} days ago
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PriorityChip daysInactive={lead.daysInactive || 0} />
                    </TableCell>
                    <TableCell>
                      <StageChip status={lead.status} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewClick(lead)}
                            sx={{
                              bgcolor: PRIMARY_COLOR + '20',
                              color: PRIMARY_COLOR,
                              '&:hover': {
                                bgcolor: PRIMARY_COLOR,
                                color: 'white',
                              }
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {(lead.canReopen !== false) && (
                          <Tooltip title="Reopen Lead">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<Restore fontSize="small" />}
                              onClick={() => handleReopenClick(lead)}
                              sx={{
                                bgcolor: '#4caf50',
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                px: 1.5,
                                py: 0.5,
                                '&:hover': {
                                  bgcolor: '#388e3c',
                                }
                              }}
                            >
                              Reopen
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {!loading && missedLeads.length > 0 && (
          <Box sx={{ 
            p: 2.5, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'grey.50',
            display: 'flex', 
            justifyContent: 'center',
          }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 500,
                },
                '& .MuiPaginationItem-root.Mui-selected': {
                  bgcolor: PRIMARY_COLOR,
                  color: '#fff',
                  '&:hover': {
                    bgcolor: '#e65100',
                  }
                }
              }}
            />
          </Box>
        )}
      </Card>

      {/* View Details Dialog - UPDATED TO SHOW ALL DATA */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { 
            borderRadius: isMobile ? 0 : 3,
            overflow: 'hidden',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: PRIMARY_COLOR + '10',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          pr: 8,
          py: 2.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Person sx={{ color: PRIMARY_COLOR }} />
            <Typography variant="h6" fontWeight={600}>
              Lead Details - Complete Information
            </Typography>
          </Box>
          <IconButton
            onClick={() => setViewDialogOpen(false)}
            sx={{ position: 'absolute', right: 12, top: 12 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 0 }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress />
            </Box>
          ) : selectedLead && (
            <Box sx={{ p: 3 }}>
              {/* Basic Information */}
              <Accordion defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Person sx={{ color: PRIMARY_COLOR }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Basic Information
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Person />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Full Name" 
                            secondary={`${selectedLead.firstName || ''} ${selectedLead.lastName || ''}`.trim() || 'Not Available'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Email />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Email" 
                            secondary={selectedLead.email || 'Not Available'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Phone />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Phone" 
                            secondary={selectedLead.phone || 'Not Available'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Home />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Address" 
                            secondary={selectedLead.address || 'Not Available'} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <LocationOn />
                          </ListItemIcon>
                          <ListItemText 
                            primary="City" 
                            secondary={selectedLead.city || 'Not Available'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <LocationOn />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Pincode" 
                            secondary={selectedLead.pincode || 'Not Available'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Build />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Solar Requirement" 
                            secondary={selectedLead.solarRequirement || 'Not Available'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarToday />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Created Date" 
                            secondary={formatDate(selectedLead.createdAt, "dd MMM yyyy, HH:mm:ss")} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Visit Information */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarToday sx={{ color: "#1976d2" }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Visit Information
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Event />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Visit Date" 
                            secondary={formatDate(selectedLead.visitDate)} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AccessTime />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Visit Time" 
                            secondary={selectedLead.visitTime || 'Not Available'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Home />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Visit Location" 
                            secondary={selectedLead.visitLocation || 'Not Available'} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ListItem>
                        <ListItemIcon>
                          <Note />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Visit Status" 
                          secondary={
                            <Chip 
                              label={selectedLead.visitStatus || 'Not Scheduled'} 
                              size="small"
                              sx={{ 
                                bgcolor: selectedLead.visitStatus === 'Scheduled' ? '#e3f2fd' : '#f5f5f5',
                                color: selectedLead.visitStatus === 'Scheduled' ? '#1976d2' : '#757575'
                              }}
                            />
                          } 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Visit Notes" 
                          secondary={selectedLead.visitNotes || 'No notes available'} 
                          sx={{ whiteSpace: 'pre-line' }}
                        />
                      </ListItem>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Registration Information */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Description sx={{ color: "#388e3c" }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Registration Information
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Event />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Registration Date" 
                            secondary={formatDate(selectedLead.dateOfRegistration)} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Registration Status" 
                            secondary={
                              <Chip 
                                label={selectedLead.registrationStatus || 'Pending'} 
                                size="small"
                                sx={{ 
                                  bgcolor: selectedLead.registrationStatus === 'completed' ? '#e8f5e9' : '#fff3e0',
                                  color: selectedLead.registrationStatus === 'completed' ? '#388e3c' : '#f57c00'
                                }}
                              />
                            } 
                          />
                        </ListItem>
                        {selectedLead.uploadDocument?.url && (
                          <ListItem>
                            <ListItemIcon>
                              <AttachFile />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Registration Document" 
                              secondary={
                                <Button
                                  size="small"
                                  startIcon={<OpenInNew />}
                                  onClick={() => handleDownload(selectedLead.uploadDocument.url, 'registration-document')}
                                  sx={{ textTransform: 'none' }}
                                >
                                  View Document
                                </Button>
                              } 
                            />
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ListItem>
                        <ListItemText 
                          primary="Registration Notes" 
                          secondary={selectedLead.registrationNotes || 'No notes available'} 
                          sx={{ whiteSpace: 'pre-line' }}
                        />
                      </ListItem>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Loan Information */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccountBalance sx={{ color: "#7b1fa2" }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Loan Information
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Money />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Loan Amount" 
                            secondary={selectedLead.loanAmount ? `₹${selectedLead.loanAmount.toLocaleString()}` : 'Not Available'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AccountBalance />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Bank" 
                            secondary={selectedLead.bank || 'Not Available'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AccountBalanceWallet />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Branch Name" 
                            secondary={selectedLead.branchName || 'Not Available'} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Loan Status" 
                            secondary={
                              <Chip 
                                label={selectedLead.loanStatus || 'Not Applied'} 
                                size="small"
                                sx={{ 
                                  bgcolor: selectedLead.loanStatus === 'submitted' ? '#e3f2fd' : '#f5f5f5',
                                  color: selectedLead.loanStatus === 'submitted' ? '#1976d2' : '#757575'
                                }}
                              />
                            } 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Event />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Loan Approval Date" 
                            secondary={formatDate(selectedLead.loanApprovalDate)} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Loan Notes" 
                            secondary={selectedLead.loanNotes || 'No notes available'} 
                            sx={{ whiteSpace: 'pre-line' }}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Document Submission */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FolderOpen sx={{ color: "#d32f2f" }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Document Submission
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                        Uploaded Documents
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedLead.aadhaar?.url && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <BadgeIcon sx={{ color: '#f57c00' }} />
                                <Typography variant="body2" fontWeight={600}>
                                  Aadhaar Card
                                </Typography>
                              </Box>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<OpenInNew />}
                                onClick={() => handleDownload(selectedLead.aadhaar.url, 'aadhaar-card')}
                              >
                                View Document
                              </Button>
                            </Card>
                          </Grid>
                        )}
                        {selectedLead.panCard?.url && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <CreditCard sx={{ color: '#1976d2' }} />
                                <Typography variant="body2" fontWeight={600}>
                                  PAN Card
                                </Typography>
                              </Box>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<OpenInNew />}
                                onClick={() => handleDownload(selectedLead.panCard.url, 'pan-card')}
                              >
                                View Document
                              </Button>
                            </Card>
                          </Grid>
                        )}
                        {selectedLead.passbook?.url && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <ReceiptLong sx={{ color: '#388e3c' }} />
                                <Typography variant="body2" fontWeight={600}>
                                  Bank Passbook
                                </Typography>
                              </Box>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<OpenInNew />}
                                onClick={() => handleDownload(selectedLead.passbook.url, 'passbook')}
                              >
                                View Document
                              </Button>
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Event />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Document Submission Date" 
                            secondary={formatDate(selectedLead.documentSubmissionDate, "dd MMM yyyy, HH:mm:ss")} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Document Status" 
                            secondary={
                              <Chip 
                                label={selectedLead.documentStatus || 'Pending'} 
                                size="small"
                                sx={{ 
                                  bgcolor: selectedLead.documentStatus === 'submitted' ? '#e3f2fd' : '#f5f5f5',
                                  color: selectedLead.documentStatus === 'submitted' ? '#1976d2' : '#757575'
                                }}
                              />
                            } 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Document Notes" 
                            secondary={selectedLead.documentNotes || 'No notes available'} 
                            sx={{ whiteSpace: 'pre-line' }}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    {/* Other Documents */}
                    {selectedLead.otherDocuments && selectedLead.otherDocuments.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                          Other Documents ({selectedLead.otherDocuments.length})
                        </Typography>
                        <Grid container spacing={2}>
                          {selectedLead.otherDocuments.map((doc, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                  <PictureAsPdf sx={{ color: '#d32f2f' }} />
                                  <Typography variant="body2" fontWeight={600} noWrap>
                                    {doc.name || `Document ${index + 1}`}
                                  </Typography>
                                </Box>
                                <Button
                                  fullWidth
                                  size="small"
                                  variant="outlined"
                                  startIcon={<OpenInNew />}
                                  onClick={() => handleDownload(doc.url, doc.name || 'document')}
                                >
                                  View Document
                                </Button>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Bank at Pending */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PendingActions sx={{ color: "#f57c00" }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Bank at Pending
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Status" 
                            secondary={
                              <Chip 
                                label={selectedLead.bankAtPendingStatus || 'Pending'} 
                                size="small"
                                sx={{ 
                                  bgcolor: selectedLead.bankAtPendingStatus === 'approved' ? '#e8f5e9' : '#fff3e0',
                                  color: selectedLead.bankAtPendingStatus === 'approved' ? '#388e3c' : '#f57c00'
                                }}
                              />
                            } 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Event />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Date" 
                            secondary={formatDate(selectedLead.bankAtPendingDate)} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Reason" 
                            secondary={selectedLead.reason || 'No reason provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Notes" 
                            secondary={selectedLead.bankAtPendingNotes || 'No notes available'} 
                            sx={{ whiteSpace: 'pre-line' }}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Disbursement Information */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocalAtm sx={{ color: "#388e3c" }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Disbursement Information
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Money />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Disbursement Amount" 
                            secondary={selectedLead.disbursementAmount ? `₹${selectedLead.disbursementAmount.toLocaleString()}` : 'Not Available'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Event />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Disbursement Date" 
                            secondary={formatDate(selectedLead.disbursementDate)} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Disbursement Status" 
                            secondary={
                              <Chip 
                                label={selectedLead.disbursementStatus || 'Pending'} 
                                size="small"
                                sx={{ 
                                  bgcolor: selectedLead.disbursementStatus === 'completed' ? '#e8f5e9' : '#fff3e0',
                                  color: selectedLead.disbursementStatus === 'completed' ? '#388e3c' : '#f57c00'
                                }}
                              />
                            } 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {selectedLead.disbursementBankDetails && (
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <AccountBalance />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Disbursement Bank" 
                              secondary={selectedLead.disbursementBankDetails.bank || 'Not Available'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <AccountBalanceWallet />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Disbursement Branch" 
                              secondary={selectedLead.disbursementBankDetails.branchName || 'Not Available'} 
                            />
                          </ListItem>
                        </List>
                      )}
                      <ListItem>
                        <ListItemText 
                          primary="Disbursement Notes" 
                          secondary={selectedLead.disbursementNotes || 'No notes available'} 
                          sx={{ whiteSpace: 'pre-line' }}
                        />
                      </ListItem>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Installation Information */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Build sx={{ color: PRIMARY_COLOR }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Installation Information
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Event />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Installation Date" 
                            secondary={formatDate(selectedLead.installationDate)} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Installation Status" 
                            secondary={
                              <Chip 
                                label={selectedLead.installationStatus || 'pending'} 
                                size="small"
                                sx={{ 
                                  bgcolor: selectedLead.installationStatus === 'final-payment' ? '#e8f5e9' : 
                                          selectedLead.installationStatus === 'meter-charge' ? '#fff3e0' : '#e3f2fd',
                                  color: selectedLead.installationStatus === 'final-payment' ? '#388e3c' :
                                        selectedLead.installationStatus === 'meter-charge' ? '#f57c00' : '#1976d2'
                                }}
                              />
                            } 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ListItem>
                        <ListItemText 
                          primary="Installation Notes" 
                          secondary={selectedLead.installationNotes || 'No notes available'} 
                          sx={{ whiteSpace: 'pre-line' }}
                        />
                      </ListItem>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Current Status */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Timeline sx={{ color: "#7b1fa2" }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Current Status & Timeline
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Current Status
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <StageChip status={selectedLead.status} />
                          <PriorityChip daysInactive={selectedLead.daysInactive || 0} />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Last Contacted: {formatDate(selectedLead.lastContactedAt, "dd MMM yyyy, HH:mm:ss")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Days Inactive: {selectedLead.daysInactive || 0} days
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {leadDetails?.stageTimeline && leadDetails.stageTimeline.length > 0 && (
                        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Timeline ({leadDetails.stageTimeline.length} updates)
                          </Typography>
                          <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                            {leadDetails.stageTimeline.slice().reverse().map((timeline, index) => (
                              <ListItem key={index} sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }}>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="body2" fontWeight={600}>
                                        {timeline.stage}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatDate(timeline.updatedAt, "dd MMM, HH:mm")}
                                      </Typography>
                                    </Box>
                                  }
                                  secondary={
                                    <>
                                      <Typography variant="caption" display="block" color="text.secondary">
                                        {timeline.notes}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Updated by: {timeline.updatedRole}
                                      </Typography>
                                    </>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Card>
                      )}
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* System Information */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Info sx={{ color: "#757575" }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      System Information
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Person />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Assigned Manager" 
                            secondary={selectedLead.assignedManager || 'Not Assigned'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Person />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Assigned User" 
                            secondary={selectedLead.assignedUser || 'Not Assigned'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Event />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Updated At" 
                            secondary={formatDate(selectedLead.updatedAt, "dd MMM yyyy, HH:mm:ss")} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Info />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Lead ID" 
                            secondary={selectedLead._id} 
                            secondaryTypographyProps={{ 
                              sx: { 
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                wordBreak: 'break-all'
                              }
                            }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Is Deleted" 
                            secondary={
                              <Chip 
                                label={selectedLead.isDeleted ? 'Yes' : 'No'} 
                                size="small"
                                sx={{ 
                                  bgcolor: selectedLead.isDeleted ? '#ffebee' : '#e8f5e9',
                                  color: selectedLead.isDeleted ? '#f44336' : '#388e3c'
                                }}
                              />
                            } 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1, bgcolor: 'grey.50' }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Close
          </Button>
          {(selectedLead?.canReopen !== false) && (
            <Button
              variant="contained"
              startIcon={<Restore />}
              onClick={() => {
                handleReopenClick(selectedLead);
                setViewDialogOpen(false);
              }}
              sx={{ 
                bgcolor: '#4caf50',
                borderRadius: 2,
                px: 4,
                fontWeight: 600,
                '&:hover': { 
                  bgcolor: '#388e3c',
                },
              }}
            >
              Reopen Lead
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
          variant="filled"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Error />
            <Typography fontWeight={600}>{error}</Typography>
          </Box>
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccess(null)}
          severity="success"
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color:"#fff"
          }}
          variant="filled"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle />
            <Typography fontWeight={600}>{success}</Typography>
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
}