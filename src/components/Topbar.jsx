// components/Topbar.js
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ toggleDrawer, sidebarWidth = 280, isMobile = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State
  const [anchorEl, setAnchorEl] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Menu handlers
  const handleProfileMenu = useCallback((event) => setAnchorEl(event.currentTarget), []);
  
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true);
      handleClose();
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }, [logout, navigate, handleClose]);

  // Role information
  const roleInfo = useMemo(() => {
    if (!user) return { 
      label: 'User', 
      color: '#666', 
      bgGradient: 'linear-gradient(135deg, #666 0%, #888 100%)'
    };
    
    const roleMap = {
      Head_office: { 
        label: 'Head Office', 
        color: '#ff6d00', 
        bgGradient: 'linear-gradient(135deg, #ff6d00 0%, #ff9100 100%)'
      },
      ZSM: { 
        label: 'Zonal Manager', 
        color: '#1a237e', 
        bgGradient: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)'
      },
      ASM: { 
        label: 'Area Manager', 
        color: '#2e7d32', 
        bgGradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
      },
      TEAM: { 
        label: 'Field Executive', 
        color: '#6a1b9a', 
        bgGradient: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)'
      }
    };

    return roleMap[user.role] || { 
      label: 'User', 
      color: '#666', 
      bgGradient: 'linear-gradient(135deg, #666 0%, #888 100%)'
    };
  }, [user]);

  // User initials for avatar
  const userInitials = useMemo(() => {
    if (!user || !user.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n?.[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, [user]);

  // Display name
  const displayName = useMemo(() => {
    if (!user) return 'Guest User';
    return user.firstName || user.name?.split(' ')[0] || 'User';
  }, [user]);

  // AppBar styles
  const appBarStyles = useMemo(() => ({
    bgcolor: 'background.paper',
    color: 'text.primary',
    borderBottom: '1px solid',
    borderColor: 'divider',
    zIndex: theme.zIndex.drawer + 1,
    width: '100%',
    left: 0,
    '@media (min-width: 900px)': {
      width: `calc(100% - ${sidebarWidth}px)`,
      left: `${sidebarWidth}px`,
    }
  }), [theme, sidebarWidth]);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={appBarStyles}
      >
        <Toolbar sx={{
          justifyContent: 'space-between',
          height: 60,
          px: 2,
          minHeight: 'auto',
        }}>
          {/* Left Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center'
          }}>
            {/* Menu Button */}
            {isMobile && (
              <IconButton 
                onClick={toggleDrawer} 
                sx={{ 
                  color: 'text.primary',
                  mr: 1
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>

          {/* Right Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center'
          }}>
            {/* Profile */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 1,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
              onClick={handleProfileMenu}
              aria-label="Open user menu"
            >
              <Avatar
                sx={{
                  background: roleInfo.bgGradient,
                  width: 36,
                  height: 36,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                {userInitials}
              </Avatar>
              <Box sx={{ 
                display: { xs: 'none', sm: 'block' },
                maxWidth: 150,
                overflow: 'hidden',
              }}>
                <Typography 
                  fontWeight={600} 
                  fontSize="0.9rem"
                  sx={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {displayName}
                </Typography>
                <Typography 
                  fontSize="0.75rem" 
                  color="text.secondary"
                  sx={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {roleInfo.label}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{ 
            sx: { 
              width: 200,
              mt: 1,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            } 
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Info */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            background: roleInfo.bgGradient,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: roleInfo.color,
                  width: 40,
                  height: 40,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: `2px solid ${roleInfo.color}`
                }}
              >
                {userInitials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={600} fontSize="0.9rem" noWrap sx={{ color: 'white' }}>
                  {displayName}
                </Typography>
                <Typography variant="caption" noWrap sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  {roleInfo.label}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Logout Menu Item */}
          <MenuItem 
            onClick={handleLogout} 
            sx={{ 
              py: 1.5, 
              px: 2,
              color: 'error.main',
            }}
            disabled={loggingOut}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ 
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
          </MenuItem>
        </Menu>
      </AppBar>

      {/* Spacer for fixed AppBar */}
      <Box 
        sx={{ 
          height: 64,
        }} 
      />
    </>
  );
};

export default Topbar;