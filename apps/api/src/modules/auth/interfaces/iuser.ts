export enum UserRole {
  ADMIN = 'admin',
  FARMER = 'farmer',
  BUYER = 'buyer',
  COOPERATIVE = 'cooperative',
  SCHOOL = 'school',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  WALLET = 'wallet',
}

export interface IUser {
  id: string;
  email: string;
  phone?: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  authProvider: AuthProvider;
  googleId?: string;
  walletAddress?: string;
  lastLogin?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
