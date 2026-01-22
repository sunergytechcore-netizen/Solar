// components/auth/ForgotPassword.jsx
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
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Email,
  ArrowBack,
  Key,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { forgotPassword, loading, error, success, clearMessages, hasResetToken, getResetTokenEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [existingTokenEmail, setExistingTokenEmail] = useState(null);
  const [tokenGenerated, setTokenGenerated] = useState(false);

  // Check if there's already a reset token
  useEffect(() => {
    clearMessages();
    
    if (hasResetToken()) {
      const savedEmail = getResetTokenEmail();
      setExistingTokenEmail(savedEmail);
      setTokenGenerated(true);
    }
  }, [clearMessages, hasResetToken, getResetTokenEmail]);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    
    const validationError = validateEmail(email);
    setEmailError(validationError);
    
    if (validationError) {
      document.getElementById('email').focus();
      return;
    }

    if (countdown > 0) {
      setEmailError(`Please wait ${countdown} seconds before requesting again`);
      return;
    }

    setIsSubmitting(true);
    clearMessages();
    
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setTokenGenerated(true);
        setExistingTokenEmail(email);
        // Start 30-second countdown for resend
        setCountdown(30);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleRequestNewToken = () => {
    setTokenGenerated(false);
    setExistingTokenEmail(null);
    setEmail('');
    clearMessages();
  };

  // Show success state
  if (tokenGenerated && success) {
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
                Reset Token Sent!
              </Typography>
              <Typography 
                variant={isMobile ? "body2" : "body1"} 
                sx={{ mb: 3, color: '#666', lineHeight: 1.6 }}
              >
                A password reset token has been sent to <strong>{existingTokenEmail}</strong>.
                You can now reset your password.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={handleResetPassword}
                  sx={{
                    backgroundColor: '#ff8c00',
                    '&:hover': { backgroundColor: '#ff6b00' },
                    fontSize: isMobile ? '0.9rem' : 'inherit',
                    py: 1.5,
                    px: 3,
                    fontWeight: 600
                  }}
                >
                  Reset Password Now
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleBackToLogin}
                  sx={{
                    borderColor: '#ff8c00',
                    color: '#ff8c00',
                    fontSize: isMobile ? '0.9rem' : 'inherit',
                    py: 1.5,
                    px: 3,
                    fontWeight: 600
                  }}
                >
                  Back to Login
                </Button>
              </Box>
              
              {countdown > 0 && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 3, 
                    color: '#666', 
                    display: 'block',
                    fontStyle: 'italic'
                  }}
                >
                  You can request a new token in {countdown} seconds
                </Typography>
              )}
              
              {countdown === 0 && (
                <Button
                  onClick={handleRequestNewToken}
                  sx={{
                    mt: 3,
                    color: '#666',
                    textTransform: 'none',
                    fontSize: '0.85rem'
                  }}
                >
                  Didn't receive token? Request again
                </Button>
              )}
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
                  <Key sx={{ fontSize: isMobile ? 30 : 35, color: '#fff' }} />
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
                  Forgot Password
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
                  Enter your email to reset password
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

            {/* Existing Token Notice */}
            {existingTokenEmail && (
              <Alert 
                severity="info" 
                sx={{ 
                  width: '100%', 
                  mb: 2, 
                  borderRadius: 2,
                  fontSize: isMobile ? '0.85rem' : 'inherit'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  You already have a reset token for: <strong>{existingTokenEmail}</strong>
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleResetPassword}
                    sx={{
                      backgroundColor: '#ff8c00',
                      '&:hover': { backgroundColor: '#ff6b00' },
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 2
                    }}
                  >
                    Use Existing Token
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleRequestNewToken}
                    sx={{
                      borderColor: '#ff8c00',
                      color: '#ff8c00',
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 2
                    }}
                  >
                    Request New Token
                  </Button>
                </Box>
              </Alert>
            )}

            {/* Instructions */}
            {!existingTokenEmail && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666', 
                  textAlign: 'center', 
                  mb: 3,
                  fontSize: isMobile ? '0.85rem' : 'inherit',
                  px: isMobile ? 1 : 0
                }}
              >
                Enter your email address to receive a password reset token.
              </Typography>
            )}

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ width: '100%' }}
            >
              {/* Email Field */}
              <Box sx={{ mb: 3 }}>
                <InputLabel 
                  htmlFor="email" 
                  sx={{ 
                    mb: 1, 
                    color: '#333',
                    fontWeight: 500,
                    fontSize: isMobile ? '0.9rem' : 'inherit'
                  }}
                >
                  Email Address
                </InputLabel>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched) {
                      setEmailError(validateEmail(e.target.value));
                    }
                  }}
                  onBlur={() => {
                    setTouched(true);
                    setEmailError(validateEmail(email));
                  }}
                  error={touched && Boolean(emailError)}
                  placeholder="headoffice@saurashakti.com"
                  disabled={!!existingTokenEmail}
                  InputProps={{
                    startAdornment: (
                      <Email sx={{ 
                        fontSize: isMobile ? '1rem' : '1.25rem',
                        color: emailError ? 'error.main' : 'text.secondary',
                        mr: 1 
                      }} />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: isMobile ? '48px' : '56px',
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff8c00',
                        borderWidth: 2
                      }
                    }
                  }}
                />
                {touched && emailError && (
                  <FormHelperText error sx={{ mt: 0.5, fontSize: isMobile ? '0.75rem' : 'inherit' }}>
                    {emailError}
                  </FormHelperText>
                )}
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || isSubmitting || countdown > 0 || !!existingTokenEmail}
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
                ) : countdown > 0 ? (
                  `Request Again in ${countdown}s`
                ) : (
                  'Send Reset Token'
                )}
              </Button>
            </Box>

            {/* Back to Login */}
            <Box sx={{ mt: 3, width: '100%' }}>
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

export default ForgotPassword;