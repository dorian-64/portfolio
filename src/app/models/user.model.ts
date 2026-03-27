export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  isProfileComplete: boolean;
}
