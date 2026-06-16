export interface AuthenticationResult {
  userId: string;
  email: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;       // only received in login body (not stored by frontend)
  accessTokenExpires: string; // ISO date string
  roles: string[];
  permissions: string[];
}