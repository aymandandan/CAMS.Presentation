export interface LoginCommand {
  email: string;
  password: string;
}

export interface RefreshTokenCommand {
  refreshToken: string;
  ipAddress?: string;
}

export interface RevokeTokenCommand {
  refreshToken: string;
}

export interface RevokeAllUserTokensCommand {
  userId: string;
}