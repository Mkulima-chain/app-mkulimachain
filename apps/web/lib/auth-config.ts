import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5600/api";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            image: data.user.image,
            accessToken: data.accessToken,
          };
        } catch (error) {
          console.error("Erreur de connexion:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken as string;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          console.log(
            "Google Auth data:",
            {
              name: user.name,
              email: user.email,
              image: user.image,
              providerId: account.providerAccountId,
            },
            "Google Auth data here",
            {
              user,
              account,
              profile,
            }
          );

          console.log("API URL:", API_BASE_URL);

          // Use direct fetch instead of apiClient to avoid SSR issues
          // Déterminer si l'inscription vient de la page register (BUYER)
          // On utilise sessionStorage pour stocker l'origine de la connexion
          let role: string | undefined;
          if (typeof window !== "undefined") {
            const fromRegister = sessionStorage.getItem(
              "googleSignUpFromRegister"
            );
            if (fromRegister === "true") {
              role = "BUYER";
              sessionStorage.removeItem("googleSignUpFromRegister");
            }
          }

          const response = await fetch(`${API_BASE_URL}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              image: user.image,
              providerId: account.providerAccountId,
              role: role,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log("Google Auth response:", data);

            if (data) {
              user.id = data.user.id;
              user.accessToken = data.accessToken;
              return true;
            }
          } else {
            console.error(
              "Google Auth API error:",
              response.status,
              response.statusText
            );
          }
        } catch (error) {
          console.error("Erreur Google Auth:", error);
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Si l'URL de callback est fournie et valide, l'utiliser
      if (url.startsWith(baseUrl)) return url;
      // Sinon, rediriger vers le dashboard par défaut
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
