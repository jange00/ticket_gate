import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [tempUser, setTempUser] = useState(null); // Temporary user from login response
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await authApi.getProfile();
      // Log the full response for debugging
      if (import.meta.env.DEV) {
        console.log('Profile API Response - Full:', {
          fullResponse: response,
          responseData: response.data,
          responseDataSuccess: response.data?.success,
          responseDataData: response.data?.data,
          responseDataDataKeys: response.data?.data ? Object.keys(response.data.data) : [],
          responseDataDataRole: response.data?.data?.role,
        });
      }
      return response.data;
    },
    enabled: isAuthenticated,
    retry: false,
  });

  // Extract user from profile data
  // API response structure: { success: true, data: { id, email, role, ... } }
  // profileData is response.data which is { success: true, data: {...} }
  let userFromProfile = null;
  if (profileData) {
    // Log for debugging
    if (import.meta.env.DEV) {
      console.log('Extracting user from profileData:', {
        profileData,
        profileDataSuccess: profileData.success,
        profileDataData: profileData.data,
        profileDataKeys: Object.keys(profileData),
        tempUser,
      });
    }

    // Check if profileData has the nested structure
    if (profileData.success && profileData.data) {
      userFromProfile = profileData.data;
    } else if (profileData.data && !profileData.success) {
      // Sometimes the data might be directly in profileData.data
      userFromProfile = profileData.data;
    } else if (!profileData.data && profileData.id) {
      // Or the data might be directly in profileData
      userFromProfile = profileData;
    } else if (profileData && typeof profileData === 'object' && !profileData.success) {
      // If profileData itself is the user object (no wrapper)
      userFromProfile = profileData;
    }

    // Validate that userFromProfile has actual data (not empty object)
    if (userFromProfile && Object.keys(userFromProfile).length === 0) {
      if (import.meta.env.DEV) {
        console.warn('userFromProfile is an empty object, ignoring it');
      }
      userFromProfile = null;
    }
  }

  // Use profile data if it has a role, otherwise use temp user from login
  // This prevents empty profile data from overwriting valid login user data
  // Priority: profile with role > tempUser > profile without role
  let user = null;
  if (userFromProfile && userFromProfile.role) {
    user = userFromProfile;
  } else if (tempUser && tempUser.role) {
    user = tempUser;
  } else if (userFromProfile) {
    user = userFromProfile; // Use even if no role, might be loading
  } else if (tempUser) {
    user = tempUser;
  }

  // Log final user selection
  if (import.meta.env.DEV && user) {
    console.log('Final user selected:', {
      user,
      role: user.role,
      source: user === userFromProfile ? 'profile' : user === tempUser ? 'tempUser' : 'unknown',
      hasRole: !!user.role,
    });
  }

  // Enhanced debug logging
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('User state debug:', {
        profileData,
        userFromProfile,
        tempUser,
        finalUser: user,
        userRole: user?.role,
        isAuthenticated,
        isLoadingProfile,
      });
    }
  }, [profileData, userFromProfile, tempUser, user, isAuthenticated, isLoadingProfile]);

  // Debug logging for user data
  useEffect(() => {
    if (import.meta.env.DEV && user) {
      console.log('User profile loaded:', {
        user,
        role: user.role,
        isAuthenticated,
      });
    }
  }, [user, isAuthenticated]);

  // Redirect user to appropriate portal based on role
  const redirectByRole = (role) => {
    const navigate = (path) => {
      window.location.href = path;
    };

    // Normalize role to lowercase
    const normalizedRole = role?.toLowerCase();

    switch (normalizedRole) {
      case 'admin':
        navigate('/admin');
        break;
      case 'organizer':
        navigate('/organizer/dashboard');
        break;
      case 'staff':
        navigate('/staff/dashboard');
        break;
      case 'user':
      default:
        navigate('/dashboard');
        break;
    }
  };

  // Get dashboard route based on role
  const getDashboardRoute = () => {
    if (!isAuthenticated || !user) {
      return '/login';
    }

    // Normalize role to lowercase
    const normalizedRole = user.role?.toLowerCase();

    switch (normalizedRole) {
      case 'admin':
        return '/admin';
      case 'organizer':
        return '/organizer/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'user':
      default:
        return '/dashboard';
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    // Admin has all roles
    if (user.role === 'admin') return true;
    return user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return roles.includes(user.role);
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      // Check if MFA (TOTP) is required
      if (data.mfaRequired) {
        return { mfaRequired: true, message: data.message };
      }

      // Check if 2FA (Email OTP) is required
      if (data.twoFactorRequired) {
        // We handle the redirect in the component or here
        // For now, return the status so the login form can navigate
        return { twoFactorRequired: true, email: data.email, message: data.message };
      }

      setIsAuthenticated(true);

      // If login response includes user data, use it immediately
      if (data?.data?.user) {
        const loginUser = data.data.user;

        // Log full login response for debugging
        if (import.meta.env.DEV) {
          console.log('Login Response - Full:', {
            fullData: data,
            dataData: data.data,
            user: loginUser,
            userKeys: loginUser ? Object.keys(loginUser) : [],
            role: loginUser?.role,
          });
        }

        setTempUser(loginUser);

        // Store user data in query cache with correct structure matching API response
        queryClient.setQueryData(['profile'], {
          success: true,
          data: loginUser  // Store user directly in data field
        });

        // Log for debugging
        if (import.meta.env.DEV) {
          console.log('Login user data stored in cache:', {
            user: loginUser,
            role: loginUser.role,
            cacheData: queryClient.getQueryData(['profile']),
          });
        }

        // Redirect immediately if we have user data
        if (loginUser.role) {
          setTimeout(() => {
            redirectByRole(loginUser.role);
          }, 100);
        } else {
          console.warn('Login user has no role:', loginUser);
        }
      } else {
        if (import.meta.env.DEV) {
          console.warn('Login response has no user data:', {
            data,
            dataData: data?.data,
            hasUser: !!data?.data?.user,
          });
        }
      }

      // Invalidate and refetch profile to ensure we have latest data
      await queryClient.invalidateQueries(['profile']);
      try {
        const profileResponse = await queryClient.fetchQuery(['profile']);

        // Log profile response for debugging
        if (import.meta.env.DEV) {
          console.log('Profile refetched after login:', {
            profileResponse,
            profileResponseSuccess: profileResponse?.success,
            profileResponseData: profileResponse?.data,
            profileResponseDataKeys: profileResponse?.data ? Object.keys(profileResponse.data) : [],
            profileResponseDataRole: profileResponse?.data?.role,
          });
        }

        // Update temp user with fresh profile data only if it has a role
        if (profileResponse?.success && profileResponse?.data && profileResponse.data.role) {
          setTempUser(null); // Clear temp user, use profile data
        } else if (profileResponse?.success && profileResponse?.data && !profileResponse.data.role) {
          // Profile returned but no role - keep temp user
          if (import.meta.env.DEV) {
            console.warn('Profile returned but no role, keeping temp user');
          }
        } else {
          // Profile fetch failed or returned empty - keep temp user
          if (import.meta.env.DEV) {
            console.warn('Profile fetch returned invalid data, keeping temp user');
          }
        }
      } catch (error) {
        console.error('Error fetching profile after login:', error);
        // Keep using temp user if profile fetch fails
      }

      return data;
    },
  });

  // 2FA Verification mutation
  const verify2FALoginMutation = useMutation({
    mutationFn: authService.verify2FALogin,
    onSuccess: async (data) => {
      setIsAuthenticated(true);
      if (data?.data?.user) {
        const loginUser = data.data.user;
        setTempUser(loginUser);
        queryClient.setQueryData(['profile'], {
          success: true,
          data: loginUser
        });
        if (loginUser.role) {
          setTimeout(() => {
            redirectByRole(loginUser.role);
          }, 100);
        }
      }
      await queryClient.invalidateQueries(['profile']);
      return data;
    }
  });

  // Google Login mutation
  const googleLoginMutation = useMutation({
    mutationFn: authService.googleLogin,
    onSuccess: async (data) => {
      setIsAuthenticated(true);

      if (data?.data?.user) {
        const loginUser = data.data.user;

        // Log debug info
        if (import.meta.env.DEV) {
          console.log('Google Login Response:', {
            data,
            user: loginUser
          });
        }

        setTempUser(loginUser);

        // Update cache
        queryClient.setQueryData(['profile'], {
          success: true,
          data: loginUser
        });

        // Redirect
        if (loginUser.role) {
          setTimeout(() => {
            redirectByRole(loginUser.role);
          }, 100);
        }
      }

      await queryClient.invalidateQueries(['profile']);
      return data;
    },
  });

  // Note: Redirect after login is now handled in loginMutation.onSuccess

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      setIsAuthenticated(false);
      queryClient.clear();
      // Clear all localStorage items
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
  });

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  // Ensure isLoading includes checking if user has role
  const isLoading = isLoadingProfile || (isAuthenticated && !user) || (user && !user.role && isAuthenticated);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    loginWithGoogle: googleLoginMutation.mutateAsync,
    verify2FALogin: verify2FALoginMutation.mutateAsync,
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    register: registerMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isVerifying2FA: verify2FALoginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
    hasRole,
    hasAnyRole,
    redirectByRole,
    getDashboardRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
