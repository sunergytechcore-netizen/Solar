// components/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Fade,
  Zoom,
  InputLabel,
  FormHelperText,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Security,
  ArrowBack,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ResetPassword = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { resetPassword, loading, error, success, clearMessages, hasResetToken, getResetTokenEmail, clearResetToken } = useAuth();
  
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  
  const [errors, setErrors] = useState({
    new_password: '',
    confirm_password: ''
  });
  
  const [touched, setTouched] = useState({
    new_password: false,
    confirm_password: false
  });
  
  const [showPassword, setShowPassword] = useState({
    new_password: false,
    confirm_password: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);
  const [tokenEmail, setTokenEmail] = useState('');

  // Check for reset token on mount
  useEffect(() => {
    clearMessages();
    
    if (!hasResetToken()) {
      // No token found
      setErrors(prev => ({
        ...prev,
        general: 'No reset token found. Please request a password reset first.'
      }));
    } else {
      // Get the email associated with the token
      const email = getResetTokenEmail();
      setTokenEmail(email || '');
    }
    
    return () => {
      clearMessages();
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [clearMessages, hasResetToken, getResetTokenEmail]);

  // Redirect to login after successful reset
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login', { 
          replace: true,
          state: { 
            message: 'Password reset successful! Please login with your new password.' 
          } 
        });
      }, 3000);
      
      setRedirectTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [success, navigate]);

  // Password validation
  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Must contain at least one number';
    if (password.length > 50) return 'Password is too long (max 50 characters)';
    return '';
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== formData.new_password) return 'Passwords do not match';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate the field on blur
    if (name === 'new_password') {
      setErrors(prev => ({
        ...prev,
        new_password: validatePassword(formData.new_password)
      }));
    } else if (name === 'confirm_password') {
      setErrors(prev => ({
        ...prev,
        confirm_password: validateConfirmPassword(formData.confirm_password)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if token exists
    if (!hasResetToken()) {
      setErrors(prev => ({
        ...prev,
        general: 'No reset token found. Please request a password reset first.'
      }));
      return;
    }

    // Mark all fields as touched
    setTouched({
      new_password: true,
      confirm_password: true
    });

    // Validate form
    const newPasswordError = validatePassword(formData.new_password);
    const confirmPasswordError = validateConfirmPassword(formData.confirm_password);
    
    setErrors({
      new_password: newPasswordError,
      confirm_password: confirmPasswordError
    });

    if (newPasswordError || confirmPasswordError) {
      // Focus on first error field
      if (newPasswordError) {
        document.getElementById('new_password').focus();
      } else if (confirmPasswordError) {
        document.getElementById('confirm_password').focus();
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await resetPassword(
        formData.new_password,
        formData.confirm_password
      );
      
      if (!result.success) {
        // Handle API error
        setErrors(prev => ({
          ...prev,
          general: result.error || 'Failed to reset password.'
        }));
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setErrors(prev => ({
        ...prev,
        general: err.message || 'An unexpected error occurred.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleRedirectNow = () => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
    }
    navigate('/login', { 
      replace: true,
      state: { 
        message: 'Password reset successful! Please login with your new password.' 
      } 
    });
  };

  const handleRequestNewToken = () => {
    clearResetToken();
    navigate('/forgot-password');
  };

  // No token found
  if (!hasResetToken() && !success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: isMobile 
            ? 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)'
            : 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 50%, #ff5500 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? 1 : 2,
        }}
      >
        <Container maxWidth="sm">
          <Zoom in={true}>
            <Paper
              sx={{
                p: isMobile ? 3 : 4,
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: '#fff',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <ErrorIcon sx={{ 
                fontSize: isMobile ? 50 : 60, 
                color: '#f44336', 
                mb: 2 
              }} />
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                color="error" 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                No Reset Token Found
              </Typography>
              <Typography 
                variant={isMobile ? "body2" : "body1"} 
                sx={{ mb: 3, color: '#666', lineHeight: 1.6 }}
              >
                You need to request a password reset first before setting a new password.
              </Typography>
              <Button
                variant="contained"
                onClick={handleRequestNewToken}
                sx={{
                  backgroundColor: '#ff8c00',
                  '&:hover': { backgroundColor: '#ff6b00' },
                  fontSize: isMobile ? '0.9rem' : 'inherit',
                  py: 1.5,
                  px: 3,
                  fontWeight: 600
                }}
              >
                Request Password Reset
              </Button>
            </Paper>
          </Zoom>
        </Container>
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: isMobile 
            ? 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)'
            : 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 50%, #ff5500 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? 1 : 2,
        }}
      >
        <Container maxWidth="sm">
          <Zoom in={true}>
            <Paper
              sx={{
                p: isMobile ? 3 : 4,
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: '#fff',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <CheckCircle sx={{ 
                fontSize: isMobile ? 60 : 80, 
                color: '#4caf50', 
                mb: 2 
              }} />
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                sx={{ 
                  color: '#2e7d32', 
                  fontWeight: 600, 
                  mb: 2 
                }}
              >
                Password Reset Successful!
              </Typography>
              <Typography 
                variant={isMobile ? "body2" : "body1"} 
                sx={{ mb: 3, color: '#666', lineHeight: 1.6 }}
              >
                Your password has been reset successfully. 
                You will be redirected to the login page in 3 seconds...
              </Typography>
              <Button
                variant="contained"
                onClick={handleRedirectNow}
                sx={{
                  backgroundColor: '#ff8c00',
                  '&:hover': { backgroundColor: '#ff6b00' },
                  fontSize: isMobile ? '0.9rem' : 'inherit',
                  py: 1.5,
                  px: 3,
                  fontWeight: 600
                }}
              >
                Go to Login Now
              </Button>
            </Paper>
          </Zoom>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isMobile 
          ? 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)'
          : 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 50%, #ff5500 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 1 : 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isMobile 
            ? 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }
      }}
    >
      <Container component="main" maxWidth="xs">
        <Zoom in={true} timeout={800}>
          <Paper
            elevation={isMobile ? 6 : 24}
            sx={{
              padding: isMobile ? 2.5 : 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 3,
              backgroundColor: '#fff',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #ff8c00, #ff6b00)',
              }
            }}
          >
            {/* Logo Section */}
            <Fade in={true} timeout={1000}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                marginBottom: 3 
              }}>
                <Box
                  sx={{
                    width: isMobile ? 60 : 70,
                    height: isMobile ? 60 : 70,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff8c00, #ff6b00)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 2,
                    boxShadow: '0 8px 24px rgba(255, 140, 0, 0.3)',
                  }}
                >
                  <Security sx={{ fontSize: isMobile ? 30 : 35, color: '#fff' }} />
                </Box>

                <Typography 
                  component="h1" 
                  variant={isMobile ? "h5" : "h4"}
                  sx={{ 
                    color: '#ff8c00', 
                    fontWeight: 'bold', 
                    mb: 0.5,
                    background: 'linear-gradient(45deg, #ff8c00 30%, #ff6b00 90%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textAlign: 'center'
                  }}
                >
                  Reset Password
                </Typography>
                <Typography 
                  variant={isMobile ? "caption" : "subtitle1"} 
                  sx={{ 
                    color: '#666', 
                    textAlign: 'center', 
                    fontWeight: 500,
                    fontSize: isMobile ? '0.9rem' : 'inherit'
                  }}
                >
                  {tokenEmail ? `Reset password for: ${tokenEmail}` : 'Create a new password'}
                </Typography>
              </Box>
            </Fade>

            {/* Error Messages */}
            {error && (
              <Fade in={true}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    width: '100%', 
                    mb: 2, 
                    borderRadius: 2,
                    fontSize: isMobile ? '0.85rem' : 'inherit'
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {errors.general && (
              <Fade in={true}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    width: '100%', 
                    mb: 2, 
                    borderRadius: 2,
                    fontSize: isMobile ? '0.85rem' : 'inherit'
                  }}
                >
                  {errors.general}
                </Alert>
              </Fade>
            )}

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ width: '100%' }}
            >
              {/* New Password Field */}
              <Box sx={{ mb: 2.5 }}>
                <InputLabel 
                  htmlFor="new_password" 
                  sx={{ 
                    mb: 1, 
                    color: '#333',
                    fontWeight: 500,
                    fontSize: isMobile ? '0.9rem' : 'inherit'
                  }}
                >
                  New Password
                </InputLabel>
                <TextField
                  fullWidth
                  id="new_password"
                  name="new_password"
                  type={showPassword.new_password ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.new_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.new_password && Boolean(errors.new_password)}
                  placeholder="Enter new password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ 
                          fontSize: isMobile ? '1rem' : '1.25rem',
                          color: errors.new_password ? 'error.main' : 'text.secondary',
                          mr: 1 
                        }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword('new_password')}
                          edge="end"
                          sx={{ 
                            color: errors.new_password ? 'error.main' : 'text.secondary',
                            padding: isMobile ? '6px' : '8px'
                          }}
                        >
                          {showPassword.new_password ? 
                            <VisibilityOff sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} /> : 
                            <Visibility sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
                          }
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: isMobile ? '48px' : '56px',
                      fontSize: isMobile ? '0.9rem' : 'inherit',
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff8c00',
                        borderWidth: 2
                      }
                    }
                  }}
                />
                {touched.new_password && errors.new_password && (
                  <FormHelperText error sx={{ 
                    mt: 0.5, 
                    fontSize: isMobile ? '0.75rem' : 'inherit',
                    lineHeight: 1.2
                  }}>
                    {errors.new_password}
                  </FormHelperText>
                )}
              </Box>

              {/* Confirm Password Field */}
              <Box sx={{ mb: 3 }}>
                <InputLabel 
                  htmlFor="confirm_password" 
                  sx={{ 
                    mb: 1, 
                    color: '#333',
                    fontWeight: 500,
                    fontSize: isMobile ? '0.9rem' : 'inherit'
                  }}
                >
                  Confirm New Password
                </InputLabel>
                <TextField
                  fullWidth
                  id="confirm_password"
                  name="confirm_password"
                  type={showPassword.confirm_password ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirm_password && Boolean(errors.confirm_password)}
                  placeholder="Confirm new password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ 
                          fontSize: isMobile ? '1rem' : '1.25rem',
                          color: errors.confirm_password ? 'error.main' : 'text.secondary',
                          mr: 1 
                        }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword('confirm_password')}
                          edge="end"
                          sx={{ 
                            color: errors.confirm_password ? 'error.main' : 'text.secondary',
                            padding: isMobile ? '6px' : '8px'
                          }}
                        >
                          {showPassword.confirm_password ? 
                            <VisibilityOff sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} /> : 
                            <Visibility sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
                          }
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: isMobile ? '48px' : '56px',
                      fontSize: isMobile ? '0.9rem' : 'inherit',
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff8c00',
                        borderWidth: 2
                      }
                    }
                  }}
                />
                {touched.confirm_password && errors.confirm_password && (
                  <FormHelperText error sx={{ 
                    mt: 0.5, 
                    fontSize: isMobile ? '0.75rem' : 'inherit',
                    lineHeight: 1.2
                  }}>
                    {errors.confirm_password}
                  </FormHelperText>
                )}
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || isSubmitting}
                sx={{
                  mb: 2,
                  py: isMobile ? 1.25 : 1.5,
                  backgroundColor: '#ff8c00',
                  background: 'linear-gradient(45deg, #ff8c00 30%, #ff6b00 90%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  borderRadius: 2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  minHeight: isMobile ? '44px' : '48px',
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #ff6b00 30%, #ff5500 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(255, 140, 0, 0.3)'
                  },
                  '&:disabled': {
                    background: '#ffb357',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {(loading || isSubmitting) ? (
                  <CircularProgress size={isMobile ? 20 : 24} sx={{ color: '#fff' }} />
                ) : (
                  'Reset Password'
                )}
              </Button>
            </Box>

            {/* Back to Login */}
            <Box sx={{ mt: 2, width: '100%' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleBackToLogin}
                startIcon={<ArrowBack sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />}
                sx={{
                  py: isMobile ? 1 : 1.25,
                  borderColor: '#ff8c00',
                  color: '#ff8c00',
                  fontWeight: 600,
                  fontSize: isMobile ? '0.9rem' : 'inherit',
                  borderRadius: 2,
                  minHeight: isMobile ? '40px' : '48px',
                  '&:hover': {
                    borderColor: '#ff6b00',
                    backgroundColor: 'rgba(255, 140, 0, 0.05)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Back to Login
              </Button>
            </Box>

            {/* Footer */}
            <Fade in={true}>
              <Typography
                variant="caption"
                sx={{
                  mt: 3,
                  color: '#888',
                  textAlign: 'center',
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  display: 'block'
                }}
              >
                © {new Date().getFullYear()} Saura Shakti. All rights reserved.
              </Typography>
            </Fade>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  );
};

export default ResetPassword;