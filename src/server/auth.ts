import { PrismaAdapter } from "@auth/prisma-adapter";
import { type UserRole } from "@prisma/client";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";

import { env } from "@/env.mjs";
import { db } from "@/server/db";
import bcrypt from "bcrypt";
import { decode, encode } from "next-auth/jwt";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User;
  }

  interface User {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    joinedAt: Date;
    enabled: boolean;

    role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session }) => {
      if (!session.user.email) {
        throw new Error("Session token is invalid");
      }
      const user = await db.user.findUnique({
        where: {
          email: session.user.email,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }

      return {
        expires: session.expires,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        },
      };
    },
  },
  secret: env.NEXTAUTH_SECRET,
  debug: env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  jwt: { encode, decode },
  pages: {
    signIn: "/auth/login",
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        // autorize user usnig prisma
        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash ?? "",
        );

        if (!passwordMatch) {
          return null;
        }

        if (!user.enabled) {
          // throw a 401 error if the user is not enabled
          throw new Error("BannedError");
        }

        return user;
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Github provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
