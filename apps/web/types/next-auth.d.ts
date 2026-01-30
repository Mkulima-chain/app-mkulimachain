import { DefaultSession, DefaultUser } from "next-auth";

// Extend NextAuth session and user types to include isAdmin

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      provider?: string;
      accessToken?: string;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id?: string;
    provider?: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    provider?: string;
    accessToken?: string;
    id?: string;
  }
}