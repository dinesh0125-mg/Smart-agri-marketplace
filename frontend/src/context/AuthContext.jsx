import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
  googleLogin as googleLoginApi,
  phoneOtpVerify,
  logoutUser,
} from "../api/authService";

const AuthContext = createContext();

const authReducer = (
  state,
  action
) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    default:
      return state;
  }
};

export const AuthProvider = ({
  children,
}) => {
  const [state, dispatch] =
    useReducer(authReducer, {
      user: null,
      isAuthenticated: false,
      loading: true,
    });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token =
      localStorage.getItem(
        "accessToken"
      );

    if (!token) {
      dispatch({
        type: "SET_LOADING",
        payload: false,
      });
      return;
    }

    try {
      const user =
        await getCurrentUser();

      dispatch({
        type: "LOGIN",
        payload: user,
      });
    } catch (error) {
      console.error(
        "Failed to load user",
        error
      );

      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "refreshToken"
      );

      dispatch({
        type: "LOGOUT",
      });
    }
  };

  const login = async (
    email,
    password
  ) => {
    try {
      dispatch({
        type: "SET_LOADING",
        payload: true,
      });

      const authData =
        await loginUser(
          email,
          password
        );

      localStorage.setItem(
        "accessToken",
        authData.accessToken
      );

      if (
        authData.refreshToken
      ) {
        localStorage.setItem(
          "refreshToken",
          authData.refreshToken
        );
      }

      dispatch({
        type: "LOGIN",
        payload:
          authData.user,
      });

      return {
        success: true,
        user:
          authData.user,
      };
    } catch (error) {
      console.error(error);

      dispatch({
        type: "SET_LOADING",
        payload: false,
      });

      return {
        success: false,
        error:
          error.response?.data
            ?.message ||
          "Login Failed",
      };
    }
  };

  const googleLogin = async (idToken) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const authData = await googleLoginApi(idToken);

      localStorage.setItem("accessToken", authData.accessToken);
      if (authData.refreshToken) {
        localStorage.setItem("refreshToken", authData.refreshToken);
      }

      dispatch({ type: "LOGIN", payload: authData.user });

      return { success: true, user: authData.user };
    } catch (error) {
      console.error(error);
      dispatch({ type: "SET_LOADING", payload: false });
      return {
        success: false,
        error: error.response?.data?.message || "Google login failed",
      };
    }
  };

  const phoneOtpLogin = async (phone, otp) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const authData = await phoneOtpVerify(phone, otp);

      localStorage.setItem("accessToken", authData.accessToken);
      if (authData.refreshToken) {
        localStorage.setItem("refreshToken", authData.refreshToken);
      }

      dispatch({ type: "LOGIN", payload: authData.user });

      return { success: true, user: authData.user };
    } catch (error) {
      console.error(error);
      dispatch({ type: "SET_LOADING", payload: false });
      return {
        success: false,
        error: error.response?.data?.message || "OTP verification failed",
      };
    }
  };

  const register = async (
    userData
  ) => {
    try {
      dispatch({
        type: "SET_LOADING",
        payload: true,
      });

      const authData =
        await registerUser(
          userData
        );

      localStorage.setItem(
        "accessToken",
        authData.accessToken
      );

      if (
        authData.refreshToken
      ) {
        localStorage.setItem(
          "refreshToken",
          authData.refreshToken
        );
      }

      dispatch({
        type: "LOGIN",
        payload:
          authData.user,
      });

      return {
        success: true,
        user:
          authData.user,
      };
    } catch (error) {
      console.error(error);

      dispatch({
        type: "SET_LOADING",
        payload: false,
      });

      return {
        success: false,
        error:
          error.response?.data
            ?.message ||
          "Registration Failed",
      };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Ignore logout API errors
    }

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );

    dispatch({
      type: "LOGOUT",
    });
  };

  const isAdmin = () =>
    state.user?.role ===
    "ADMIN";

  const isFarmer = () =>
    state.user?.role ===
    "FARMER";

  const isBuyer = () =>
    state.user?.role ===
    "BUYER";

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        googleLogin,
        phoneOtpLogin,
        register,
        logout,
        isAdmin,
        isFarmer,
        isBuyer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);