// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
const AuthContext = createContext({});

const API_BASE_URL = "http://13.201.173.28:9001/api/v1";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Validate user object has required fields
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.email) {
            setUser(parsedUser);
          } else {
            console.warn('Invalid user data in localStorage, logging out');
            logout();
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /** 🔹 MAIN API CALL HELPER - Optimized with useCallback */
  const fetchAPI = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    
    const config = {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      const isJSON = contentType?.includes("application/json");
      
      if (!response.ok) {
        // Get error text
        let errorText = `Request failed with status ${response.status}`;
        
        try {
          if (isJSON) {
            const errorData = await response.json();
            errorText = errorData?.message || errorData?.error || errorText;
          } else {
            errorText = await response.text() || errorText;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        // Create error object with status code
        const error = new Error(errorText);
        error.status = response.status;
        error.statusText = response.statusText;
        
        // Handle specific status codes
        if (response.status === 403) {
          error.type = 'PERMISSION_DENIED';
          error.message = errorText || "You don't have permission to perform this action";
        } else if (response.status === 401) {
          error.type = 'UNAUTHORIZED';
          error.message = errorText || "Session expired. Please login again.";
          // Auto-logout on 401
          setTimeout(() => logout(), 1000);
        } else if (response.status === 404) {
          error.type = 'NOT_FOUND';
          error.message = errorText || "Resource not found";
        } else if (response.status === 500) {
          error.type = 'SERVER_ERROR';
          error.message = errorText || "Server error. Please try again later.";
        }
        
        throw error;
      }

      return isJSON ? await response.json() : await response.text();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        const networkError = new Error("Network error. Please check your internet connection.");
        networkError.type = 'NETWORK_ERROR';
        throw networkError;
      }
      
      throw error;
    }
  }, []);

  /** 🔹 SAFE FETCH API - For operations that might fail due to permissions */
  const safeFetchAPI = useCallback(async (endpoint, options = {}) => {
    try {
      const result = await fetchAPI(endpoint, options);
      // If fetchAPI succeeds, return the result with success flag
      return {
        success: true,
        ...result
      };
    } catch (error) {
      // Handle permission errors gracefully
      if (error.type === 'PERMISSION_DENIED' || error.status === 403) {
        console.warn(`Permission denied for ${endpoint}:`, error.message);
        // Return a structure that indicates permission issue
        return {
          success: false,
          error: error.message,
          type: 'PERMISSION_DENIED',
          status: error.status,
          message: error.message
        };
      }
      
      // Handle other errors
      return {
        success: false,
        error: error.message,
        type: error.type || 'UNKNOWN_ERROR',
        status: error.status,
        message: error.message
      };
    }
  }, [fetchAPI]);

  /** 🔹 LOGIN - Fixed to not make unnecessary calls after login */
  const login = async (email, password) => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      console.log('Login attempt with email:', email);
      
      const response = await fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      console.log('Login API response:', response);

      // Validate response structure
      if (!response) {
        throw new Error("No response received from server");
      }

      // Extract token and user data from response
      let token, userData;
      
      // Handle different response structures
      if (response?.result) {
        // Structure: { success: true, result: { token: ..., user: {...} } }
        token = response.result.token;
        userData = response.result.user || response.result;
      } else if (response?.data) {
        // Structure: { success: true, data: { token: ..., ... } }
        token = response.data.token;
        userData = response.data;
      } else if (response?.token) {
        // Structure: { success: true, token: ..., ... }
        token = response.token;
        userData = response;
      } else {
        throw new Error("Invalid response format from server");
      }

      // Validate token
      if (!token) {
        throw new Error("No authentication token received");
      }

      // Clean user data
      const cleanUserData = { ...userData };
      delete cleanUserData.token;
      delete cleanUserData.refreshToken;

      // Ensure user has required fields
      if (!cleanUserData?.email || !cleanUserData?.role) {
        console.error('User data missing required fields:', cleanUserData);
        throw new Error("Incomplete user data received from server");
      }

      console.log('User data extracted:', cleanUserData);
      console.log('User role:', cleanUserData.role);

      // Save to storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(cleanUserData));

      // Update state
      setUser(cleanUserData);
      setSuccess("Login successful");
      
      // IMPORTANT: DO NOT make additional API calls here that might fail due to permissions
      // Just return the successful login data
      
      return { 
        success: true, 
        data: cleanUserData,
        token,
        role: cleanUserData.role 
      };
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific error types
      let errorMessage = err.message || "Login failed. Please check your credentials.";
      let errorType = 'LOGIN_ERROR';
      
      if (err.status === 403) {
        errorType = 'PERMISSION_DENIED';
        errorMessage = "You don't have permission to access the system. Please contact your administrator.";
      } else if (err.status === 401) {
        errorType = 'UNAUTHORIZED';
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.type === 'NETWORK_ERROR') {
        errorType = 'NETWORK_ERROR';
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      setError(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        errorType: errorType
      };
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 LOGOUT - Optimized */
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Use safeFetchAPI to avoid errors if logout fails
        await safeFetchAPI("/auth/logout", { method: "POST" });
      }
    } catch (err) {
      console.error('Logout API error:', err);
      // Continue with local logout even if API call fails
    } finally {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Reset state
      setUser(null);
      setError(null);
      setSuccess(null);
    }
  }, [safeFetchAPI]);


  /** 🔹 Clear reset token */
  const clearResetToken = useCallback(() => {
    sessionStorage.removeItem('resetToken');
    localStorage.removeItem('resetToken');
  }, []);

  /** 🔹 Get user role from stored data */
  const getUserRole = useCallback(() => {
    return user?.role || null;
  }, [user]);

  /** 🔹 Check if user has specific permission */
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.role === "Head_office") return true;
    return user.permissions?.includes(permission) || false;
  }, [user]);

  /** 🔹 Get dashboard path based on role */
  const getRoleDashboardPath = useCallback(() => {
    const role = getUserRole();
    console.log('Getting dashboard path for role:', role);
    
    // Since you have a unified dashboard, always return /dashboard
    return "/dashboard";
  }, [getUserRole]);

  /** 🔹 Check if user is authenticated */
  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (!token || !savedUser) return false;
    
    try {
      const parsedUser = JSON.parse(savedUser);
      return !!(parsedUser && parsedUser.email && parsedUser.role);
    } catch {
      return false;
    }
  }, []);

  /** 🔹 Clear messages */
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  /** 🔹 Refresh user data from localStorage */
  const refreshUserData = useCallback(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.email) {
          setUser(parsedUser);
          return parsedUser;
        }
      } catch (err) {
        console.error('Error refreshing user data:', err);
      }
    }
    return null;
  }, []);

  /** 🔹 Update user data */
  const updateUserData = useCallback((newUserData) => {
    if (newUserData && typeof newUserData === 'object') {
      const updatedUser = { ...user, ...newUserData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [user]);

  // Context value
  const contextValue = {
    user,
    loading,
    error,
    success,
    login,
    logout,
    fetchAPI,           // Regular fetch - throws errors
    safeFetchAPI,       // Safe fetch - handles permission errors gracefully
    hasPermission,
    isAuthenticated,
    getRoleDashboardPath,
    getUserRole,
    setError,
    setUser: updateUserData,
    clearMessages,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};