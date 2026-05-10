import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";

const ADMIN_PHONES = (process.env.ADMIN_PHONE_NUMBERS || "").split(",").map(p => p.trim());

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Phone OTP",
      credentials: {
        phoneNumber: { label: "Phone Number", type: "text" },
        sessionToken: { label: "Session Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.sessionToken) return null;
        if (!ADMIN_PHONES.includes(credentials.phoneNumber)) {
          throw new Error("Access denied. Not an admin phone number.");
        }
        let user = await prisma.user.findUnique({ where: { phoneNumber: credentials.phoneNumber } });
        if (!user) {
          user = await prisma.user.create({
            data: { phoneNumber: credentials.phoneNumber, role: "ADMIN", isVerified: true, fullName: "Admin" },
          });
        }
        if (user.role !== "ADMIN") throw new Error("Access denied");
        if (!user.isActive) throw new Error("Account is deactivated");
        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          image: user.avatar,
          role: user.role,
          phoneNumber: user.phoneNumber,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.phoneNumber = (user as any).phoneNumber;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).phoneNumber = token.phoneNumber;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 2 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};
