import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string | undefined;
      address: string | undefined;
    } & DefaultSession["user"];
  }
}
