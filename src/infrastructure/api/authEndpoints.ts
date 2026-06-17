import axiosClient from "./axiosClient";
import { AuthenticationResult } from "@/domain/auth/AuthenticationResult";
import { LoginCommand, RevokeTokenCommand } from "@/domain/auth/AuthCommands";
import { Result } from "@/domain/shared/Result";

export const login = async (
  command: LoginCommand,
): Promise<AuthenticationResult> => {
  try {
    const response = await axiosClient.post<Result<AuthenticationResult>>(
      "/auth/login",
      command,
    );
    if (response.data.succeeded) {
      return response.data.data!;
    }
    throw new Error(response.data.error || "Login failed");
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error || error?.message || "Login failed",
    );
  }
};

export const refreshToken = async (): Promise<AuthenticationResult> => {
  // The refresh token cookie is sent automatically
  const response = await axiosClient.post<Result<AuthenticationResult>>(
    "/auth/refresh-token",
  );
  if (response.data.succeeded) {
    return response.data.data!;
  }
  throw new Error(response.data.error || "Refresh failed");
};

export const logout = async (): Promise<void> => {
  // This endpoint revokes all refresh tokens for the current user
  await axiosClient.post("/auth/logout");
};

export const revokeToken = async (refreshToken: string): Promise<void> => {
  await axiosClient.post("/auth/revoke-token", {
    refreshToken,
  } as RevokeTokenCommand);
};
