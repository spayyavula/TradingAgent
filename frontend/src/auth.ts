import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { UnstorageAdapter } from "@auth/unstorage-adapter";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import path from "node:path";
import authConfig from "./auth.config";

const storage = createStorage({
  driver: fsDriver({ base: path.join(process.cwd(), ".auth-data") }),
});

const emailEnabled = !!process.env.EMAIL_SERVER && !!process.env.EMAIL_FROM;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: UnstorageAdapter(storage),
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    ...(emailEnabled
      ? [
          Nodemailer({
            server: process.env.EMAIL_SERVER!,
            from: process.env.EMAIL_FROM!,
          }),
        ]
      : []),
  ],
});
