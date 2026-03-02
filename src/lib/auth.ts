import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "./prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { loginIpLimiter, loginEmailLimiter } from "./rate-limit";
import { headers } from "next/headers";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string | null;
      avatar?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    password?: string | null;
    role?: string | null;
    avatar?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email atau password salah");
        }

        const email = credentials.email.toLowerCase().trim();

        const headerList = await headers();

        const forwarded = headerList.get("x-forwarded-for");
        const ip = forwarded?.split(",")[0]?.trim() ?? "anonymous";
        const ipLimit = await loginIpLimiter.limit(ip);
        if (!ipLimit.success) {
          throw new Error("Terlalu banyak percobaan login. Coba lagi nanti.");
        }

        const emailLimit = await loginEmailLimiter.limit(`login-${email}`);
        if (!emailLimit.success) {
          throw new Error("Terlalu banyak percobaan login. Coba lagi nanti.");
        }

        const user = await db.user.findUnique({
          where: { email },
        });

        await new Promise((res) => setTimeout(res, 400));

        if (!user || !user.password) {
          throw new Error("Email atau password salah");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Email atau password salah");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "consent" } },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  jwt: {
    maxAge: 60 * 60 * 24 * 7,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role ?? "READER";
        token.avatar = user.avatar ?? "/profile-light.svg";
      }
      return token;
    },

    async signIn({ user, account }) {
      if (!account || !user.email) return false;

      const existingUser = await db.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser && account.provider !== "credentials") {
        const newUser = await db.user.create({
          data: {
            email: user.email,
            name: user.name,
            avatar: "/profile-light.svg",
            role: "READER",
          },
        });

        await db.account.create({
          data: {
            userId: newUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            token_type: account.token_type,
            id_token: account.id_token,
            scope: account.scope,
            expires_at: account.expires_at,
            refresh_token: account.refresh_token,
          },
        });

        return true;
      }
      if (existingUser && account.provider !== "credentials") {
        await db.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {},
          create: {
            userId: existingUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            token_type: account.token_type,
            id_token: account.id_token,
            scope: account.scope,
            expires_at: account.expires_at,
            refresh_token: account.refresh_token,
          },
        });
      }

      return true;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = (token.role as string) ?? "READER";
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
