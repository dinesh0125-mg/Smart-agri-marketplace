import api from "./axios";

export const loginUser = async (
  email,
  password
) => {
  const response = await api.post(
    "/auth/login",
    {
      email,
      password,
    }
  );

  return response.data.data;
};

export const registerUser = async (
  userData
) => {
  const response = await api.post(
    "/auth/register",
    userData
  );

  return response.data.data;
};

export const getCurrentUser =
  async () => {
    const response = await api.get(
      "/auth/me"
    );

    return response.data.data;
  };

export const logoutUser =
  async () => {
    const response = await api.post(
      "/auth/logout"
    );

    return response.data;
  };

export const googleLogin = async (idToken) => {
  const response = await api.post("/auth/google", { idToken });
  return response.data.data;
};

export const phoneOtpRequest = async (phone) => {
  const response = await api.post("/auth/otp/send", { phone });
  return response.data.data;
};

export const phoneOtpVerify = async (phone, otp) => {
  const response = await api.post("/auth/otp/verify", { phone, otp });
  return response.data.data;
};

export const registrationOtpSend = async (email) => {
  const response = await api.post("/auth/register/otp/send", { email });
  return response.data.data;
};

export const registrationOtpVerify = async (email, otp) => {
  const response = await api.post("/auth/register/otp/verify", { email, otp });
  return response.data.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post("/auth/reset-password", { token, newPassword });
  return response.data;
};