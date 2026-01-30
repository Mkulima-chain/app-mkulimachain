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
    // Wallet Authentication Provider
    CredentialsProvider({
      id: "wallet",
      name: "Cardano Wallet",
      credentials: {
        address: { label: "Wallet Address", type: "text" },
        walletName: { label: "Wallet Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address) {
          return null;
        }

        // Generate a deterministic UUID from wallet address
        // This creates a consistent UUID for the same address using a proper hash
        const generateWalletUUID = (address: string): string => {
          // Create a simple hash from the address
          const hashCode = (str: string): number => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
              const char = str.charCodeAt(i);
              hash = (hash << 5) - hash + char;
              hash = hash & hash;
            }
            return Math.abs(hash);
          };

          // Generate multiple hash values for different parts of UUID
          const h1 = hashCode(address)
            .toString(16)
            .padStart(8, "0")
            .slice(0, 8);
          const h2 = hashCode(address + "p2")
            .toString(16)
            .padStart(4, "0")
            .slice(0, 4);
          const h3 = hashCode(address + "p3")
            .toString(16)
            .padStart(3, "0")
            .slice(0, 3);
          const h4 = hashCode(address + "p4")
            .toString(16)
            .padStart(3, "0")
            .slice(0, 3);
          const h5 = hashCode(address + "p5")
            .toString(16)
            .padStart(12, "0")
            .slice(0, 12);

          // Format as UUID v4: xxxxxxxx-xxxx-4xxx-axxx-xxxxxxxxxxxx
          return `${h1}-${h2}-4${h3}-a${h4}-${h5}`;
        };

        const walletUUID = generateWalletUUID(credentials.address);

        try {
          // Call the API to create/get user by wallet address
          const response = await fetch(`${API_BASE_URL}/auth/wallet`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              walletAddress: credentials.address,
              walletName: credentials.walletName || "Unknown",
            }),
          });

          if (!response.ok) {
            // If API fails, create a basic user object for wallet-only auth
            console.warn(
              "Wallet API not available, using local auth with generated UUID"
            );
            return {
              id: walletUUID,
              name: `Wallet ${credentials.address.slice(0, 8)}...${credentials.address.slice(-4)}`,
              email: null,
              walletAddress: credentials.address,
              walletName: credentials.walletName,
            };
          }

          const data = await response.json();

          return {
            id: data.user?.id || walletUUID,
            name:
              data.user?.name ||
              `Wallet ${credentials.address.slice(0, 8)}...${credentials.address.slice(-4)}`,
            email: data.user?.email || null,
            image: data.user?.image,
            accessToken: data.accessToken,
            walletAddress: credentials.address,
            walletName: credentials.walletName,
          };
        } catch (error) {
          console.error("Wallet auth error:", error);
          // Fallback to local wallet auth if API is not available
          return {
            id: walletUUID,
            name: `Wallet ${credentials.address.slice(0, 8)}...${credentials.address.slice(-4)}`,
            email: null,
            walletAddress: credentials.address,
            walletName: credentials.walletName,
          };
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
        // Add wallet info if available
        if ((user as any).walletAddress) {
          token.walletAddress = (user as any).walletAddress;
          token.walletName = (user as any).walletName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        // Add wallet info to session
        if (token.walletAddress) {
          (session.user as any).walletAddress = token.walletAddress;
          (session.user as any).walletName = token.walletName;
        }
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
