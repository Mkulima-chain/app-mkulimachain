// import { apiClient } from "@/lib/api-client";
// import { Session } from "next-auth";

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   image?: string;
//   emailVerified?: Date;
// }

// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export interface RegisterData {
//   name: string;
//   email: string;
//   password: string;
// }

// export interface AuthResponse {
//   user: User;
//   accessToken: string;
// }

// export class AuthService {
//   private readonly apiClient = apiClient;

//   async login(credentials: LoginCredentials): Promise<AuthResponse> {
//     return await apiClient.post('/auth/login', credentials);
//   }

//   async register(data: RegisterData): Promise<AuthResponse> {
//     return await apiClient.post('/auth/register', data);
//   }

//   async logout(): Promise<void> {
//     await apiClient.post('/auth/logout');
//   }

//   async getCurrentUser(): Promise<User> {
//     return await apiClient.get('/auth/me');
//   }

//   async getSession(): Promise<Session> {
//     return await apiClient.get('/auth/session');
//   }
// }